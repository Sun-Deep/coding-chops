"""Animate one lobby of the lift-door reel from the model's timeline and
render it as a frame sequence, or write where your head is on screen.

Run: Blender -b --factory-startup -P scripts/blender/elevator/animate.py -- \
       <timeline.json> <hold|close> <out_dir|track.json> [first last scale]

The timeline comes from export.mjs. People come in from the street, walking
or, if they are running for the lift, running; they reach the lift on the
frame the model says. Anyone the car is not there for waits beside the
doors, and when it is, files in to their place. When the doors are about to
close and are held, whoever got in last steps to the doorway and puts an arm
out while the doors start to close and open again. The floor display above
the doors follows the car. Walking and running are timed by distance, so
feet do not slide.
"""
import json
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lobby as L  # noqa: E402

WALK_V = 0.1
RUN_V = 0.16
BOARD_V = 0.1
STEP_V = 0.06
# Metres covered by one cycle of the pack's Walk and Run at this scale.
WALK_STRIDE = 1.35
RUN_STRIDE = 2.2
TURN = 0.2
BLEND = 5
OPEN_F = 10
CLOSE_F = 14
DIP = 0.3
THRESH = (0.0, -0.45)
# Two people can step in side by side.
LANES = (-0.36, 0.36)
HOLD_SPOT = (-0.12, 0.42)
HOLD_TURN = math.radians(25)
GONE = (0.0, -60.0)


def smooth(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def dist(a, b):
    return math.hypot(b[0] - a[0], b[1] - a[1])


def along(path, d):
    """Point at distance d along a polyline, and the direction there."""
    for a, b in zip(path, path[1:]):
        seg = dist(a, b)
        if seg > 1e-9 and d <= seg:
            u = d / seg
            return (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u), (b[0] - a[0], b[1] - a[1])
        d -= seg
    a, b = path[-2], path[-1]
    return b, (b[0] - a[0], b[1] - a[1])


def length(path):
    return sum(dist(a, b) for a, b in zip(path, path[1:]))


def doors_at(trips, f):
    """How open the doors are at frame f, 0 to 1."""
    best = 0.0
    for t in trips:
        if f < t["open"] or f > t["close"] + CLOSE_F:
            continue
        if f < t["open"] + OPEN_F:
            o = smooth((f - t["open"]) / OPEN_F)
        elif f < t["close"]:
            o = 1.0
            for h in t["holds"]:
                if h <= f < h + 7:
                    o -= DIP * smooth((f - h) / 7)
                elif h + 7 <= f < h + 17:
                    o -= DIP * (1 - smooth((f - h - 7) / 10))
        else:
            o = 1 - smooth((f - t["close"]) / CLOSE_F)
        best = max(best, o)
    return best


def entrance(pid):
    """From the street through the glass doors to the lift, each person in
    a lane of their own so that runners pass walkers instead of through
    them. The same route in both lobbies; people who wait peel off at the
    end of it."""
    lane = ((pid * 3) % 5 - 2) * 1.2
    return [(L.GLASS_X - 3.2, -6.4 + lane), (L.GLASS_X + 0.5, -6.3 + lane), (-3.6 + lane * 0.4, -3.4 + lane * 0.35), (-0.9 + lane * 0.15, -2.2)]


class Plan:
    """Per frame for one person: where, which way, moving how, and whether
    they are holding the doors or visible at all."""

    def __init__(self, frames):
        self.frames = frames
        self.pos = [GONE] * frames
        self.face = [None] * frames
        self.gait = ["idle"] * frames
        self.hold = [0.0] * frames
        self.visible = [False] * frames

    def put(self, f, p, face=None, gait="idle", hold=0.0):
        if 0 <= f < self.frames:
            self.pos[f] = p
            self.face[f] = face
            self.gait[f] = gait
            self.hold[f] = hold
            self.visible[f] = True

    def move(self, f0, path, speed, gait, end):
        """Walk `path` from frame f0 at `speed`, standing at the end until
        frame `end`."""
        total = length(path)
        f = int(math.floor(f0))
        while f < end:
            d = (f - f0) * speed
            if d < 0:
                f += 1
                continue
            if d >= total:
                break
            p, direction = along(path, d)
            self.put(f, p, face=direction, gait=gait)
            f += 1
        return f


def plan_lobby(data, rule):
    frames = data["frames"]
    lobby = data[rule]
    trips = {t["k"]: t for t in lobby["trips"]}
    people = sorted(lobby["people"], key=lambda p: p["at"])
    plans = {}
    spots_free = list(range(len(L.SPOTS)))
    taken = {}  # spot index -> frame it frees
    holders = {}  # (trip, hold frame) -> person id
    for t in trips.values():
        for h in t["holds"]:
            before = [(b, rid) for b, rid in zip(t["boarded"], t["riders"]) if b <= h + 0.5]
            if before:
                holders[(t["k"], h)] = max(before)[1]
    for p in people:
        plan = Plan(frames)
        plans[p["id"]] = plan
        t = trips.get(p["trip"])
        speed = RUN_V if p["runner"] else WALK_V
        gait = "run" if p["runner"] else "walk"
        slot = L.SLOTS[p["slot"] % len(L.SLOTS)]
        straight_in = t is not None and t["open"] <= p["at"] <= t["close"] and p["boarded"] - p["at"] < 10
        if t is None:
            # Not boarding on screen: walk in and wait.
            straight_in = False
        route = entrance(p["id"])
        # Timed as if everyone walked to the doors, so the route is the
        # same frame for frame in both lobbies.
        f0 = p["at"] - (length(route) + dist(route[-1], THRESH)) / speed
        board_no = t["riders"].index(p["id"]) if t is not None else 0
        door = (LANES[board_no % 2], THRESH[1])
        if straight_in:
            path = route + [door]
            plan.move(f0, path, speed, gait, p["at"] + 30)
            inside_from = f0 + length(path) / speed
            board_path = [door, slot]
        else:
            # Take the nearest free place beside the doors.
            for s, free_at in list(taken.items()):
                if free_at <= p["at"]:
                    spots_free.append(s)
                    del taken[s]
            spots_free.sort()
            s = spots_free.pop(0) if spots_free else len(L.SPOTS) - 1
            spot = L.SPOTS[s]
            path = route + [spot]
            reach = f0 + length(path) / speed
            plan.move(f0, path, speed, gait, reach + 1)
            if t is None:
                board0 = frames + 100
            else:
                board0 = max(t["open"] + 3, p["boarded"] - dist(spot, door) / BOARD_V)
                board0 = max(board0, reach + 2)
            taken[s] = board0
            for f in range(max(0, int(math.ceil(reach))), min(frames, int(math.ceil(board0)))):
                plan.put(f, spot, face=(-spot[0], -spot[1]))
            inside_from = board0
            board_path = [spot, door, slot]
        if t is None:
            continue
        end = t["close"] + CLOSE_F + 1
        f = plan.move(inside_from, board_path, BOARD_V, "walk", end)
        # In the car, facing out; the last one in before a hold steps to
        # the doorway and holds the doors until the next person is in.
        mine = sorted(h for h in t["holds"] if holders.get((t["k"], h)) == p["id"])
        windows = []
        for h in mine:
            nxt = [b for b in t["boarded"] if b > h + 0.5]
            until = min(nxt) if nxt else t["close"]
            windows.append((h - 12, h - 2, until - 4, until + 8))
        for f in range(max(0, f), min(frames, int(math.ceil(end)))):
            p_at = slot
            hold = 0.0
            face = (0.0, -1.0)
            for a, b, c, d in windows:
                if a <= f < d:
                    if f < b:
                        u = smooth((f - a) / (b - a))
                    elif f < c:
                        u = 1.0
                        hold = 1.0
                    else:
                        u = 1 - smooth((f - c) / (d - c))
                        hold = max(0.0, 1 - (f - c) / 4)
                    p_at = (slot[0] + (HOLD_SPOT[0] - slot[0]) * u, slot[1] + (HOLD_SPOT[1] - slot[1]) * u)
                    face = "hold" if u > 0.5 else (0.0, -1.0)
            plan.put(f, p_at, face=face, hold=hold, gait="idle")
        # Moving between the slot and the doorway is a step, not standing.
        for f in range(1, frames):
            if plan.visible[f] and plan.visible[f - 1] and plan.gait[f] == "idle":
                if dist(plan.pos[f], plan.pos[f - 1]) > 0.01:
                    plan.gait[f] = "walk"
    return plans


def headings(plan, start):
    """Turn toward where each frame faces, at most TURN radians a frame."""
    out = []
    h = start
    for f in range(plan.frames):
        face = plan.face[f]
        if face == "hold":
            target = HOLD_TURN
        elif face is None or (abs(face[0]) < 1e-6 and abs(face[1]) < 1e-6):
            target = h
        else:
            target = L.heading(face[0], face[1])
        d = (target - h + math.pi) % (2 * math.pi) - math.pi
        if not plan.visible[f] or (f > 0 and not plan.visible[f - 1]):
            h = target
        else:
            h += max(-TURN, min(TURN, d))
        out.append(h)
    return out


def key_frames(states):
    """The frames to key so that a value held still stays still: both ends
    of every run of equal values. Keying only where a value changes would
    let Blender ease it across the whole run before the change."""
    n = len(states)
    out = []
    for f in range(n):
        if f in (0, n - 1) or states[f] != states[f - 1] or states[f] != states[f + 1]:
            out.append(f)
    return out


def strip(arm, name, action):
    track = arm.animation_data.nla_tracks.new()
    track.name = name
    s = track.strips.new(name, int(action.frame_range[0]), action)
    s.blend_in = 0
    s.blend_out = 0
    s.extrapolation = "HOLD"
    s.use_animated_influence = True
    s.use_animated_time = True
    return s


def hold_constraints(arm):
    out = []
    for bn in ("UpperArm.R", "LowerArm.R", "Fist.R"):
        c = arm.pose.bones[bn].constraints.new("LIMIT_ROTATION")
        c.use_limit_x = c.use_limit_y = c.use_limit_z = True
        c.owner_space = "LOCAL"
        c.influence = 0.0
        out.append((arm.pose.bones[bn], c))
    return out


def footfalls(plan, walks):
    """Frames a foot lands: every half stride walked or run, while seen.
    `walks` already carries this person's own stride phase."""
    out = []
    last = None
    for f in range(plan.frames):
        g = plan.gait[f]
        if not plan.visible[f] or g == "idle":
            last = None
            continue
        half = (RUN_STRIDE if g == "run" else WALK_STRIDE) / 2
        n = int(walks[f] / half)
        if last is not None and n > last:
            out.append([f, g])
        last = n
    return out


def animate(arm, plan, phase):
    ad = arm.animation_data
    ad.action = None
    for t in list(ad.nla_tracks):
        ad.nla_tracks.remove(t)
    acts = bpy.data.actions
    idle = strip(arm, "idle", acts["Idle"])
    walk = strip(arm, "walk", acts["Walk"])
    run = strip(arm, "run", acts["Run"])
    idle.use_animated_influence = False
    idle.influence = 1.0
    holds = hold_constraints(arm)
    idle_len = acts["Idle"].frame_range[1]
    walk_len = acts["Walk"].frame_range[1]
    run_len = acts["Run"].frame_range[1]
    hs = headings(plan, 0.0)
    w = {"walk": 0.0, "run": 0.0}
    # Each person starts mid-stride somewhere of their own, so a group
    # setting off together does not march in step.
    walked = (phase / 60.0) * WALK_STRIDE
    prev = None
    states = []
    walks = []
    for f in range(plan.frames):
        pos = plan.pos[f]
        if prev is not None and plan.visible[f] and plan.visible[f - 1]:
            walked += dist(prev, pos)
        prev = pos
        walks.append(walked)
        g = plan.gait[f]
        for k in w:
            aim = 1.0 if g == k else 0.0
            if not plan.visible[f]:
                w[k] = aim
            else:
                w[k] += (aim - w[k]) * (2.2 / BLEND)
        states.append((round(pos[0], 4), round(pos[1], 4), round(hs[f], 3), round(w["walk"], 3), round(w["run"], 3), round(plan.hold[f], 3), plan.visible[f]))
    for f in key_frames(states):
        x, y, h, ww, wr, hold, vis = states[f]
        arm.location = (x, y, 0.0)
        arm.keyframe_insert("location", frame=f)
        arm.rotation_euler = (0, 0, h)
        arm.keyframe_insert("rotation_euler", index=2, frame=f)
        walk.influence = ww
        walk.keyframe_insert("influence", frame=f)
        run.influence = wr
        run.keyframe_insert("influence", frame=f)
        for _, c in holds:
            c.influence = hold
            c.keyframe_insert("influence", frame=f)
        for o in [arm] + list(arm.children_recursive):
            o.hide_render = not vis
            o.keyframe_insert("hide_render", frame=f)
    for f in range(plan.frames):
        idle.strip_time = (f * 0.8 + phase) % idle_len
        idle.keyframe_insert("strip_time", frame=f)
        walk.strip_time = (walks[f] / WALK_STRIDE * walk_len) % walk_len
        walk.keyframe_insert("strip_time", frame=f)
        run.strip_time = (walks[f] / RUN_STRIDE * run_len) % run_len
        run.keyframe_insert("strip_time", frame=f)
    arm["steps"] = json.dumps(footfalls(plan, walks))
    for s in (idle, walk, run):
        for fc in s.fcurves:
            if fc.data_path == "strip_time":
                for kp in fc.keyframe_points:
                    kp.interpolation = "CONSTANT"
    for o in [arm] + list(arm.children_recursive):
        ad2 = o.animation_data
        if ad2 and ad2.action:
            for fc in getattr(ad2.action, "fcurves", []):
                if fc.data_path == "hide_render":
                    for kp in fc.keyframe_points:
                        kp.interpolation = "CONSTANT"


def constant(obj):
    ad = obj.animation_data
    if ad and ad.action:
        for fc in getattr(ad.action, "fcurves", []):
            for kp in fc.keyframe_points:
                kp.interpolation = "CONSTANT"


def animate_set(data, rule, doors, ind):
    frames = data["frames"]
    lobby = data[rule]
    trips = lobby["trips"]
    a, b = doors
    opens = [round(doors_at(trips, f), 4) for f in range(frames)]
    for f in key_frames(opens):
        L.set_doors(a, b, opens[f])
        a.keyframe_insert("location", index=0, frame=f)
        b.keyframe_insert("location", index=0, frame=f)
    # The car is only there while its doors are open at the lobby.
    away = [o <= 0.0 for o in opens]
    parts = [bpy.data.objects[n] for n in L.CAR_PARTS]
    shaft = bpy.data.objects["shaft"]
    for f in key_frames(away):
        for o in parts:
            o.hide_render = away[f]
            o.keyframe_insert("hide_render", frame=f)
        shaft.hide_render = not away[f]
        shaft.keyframe_insert("hide_render", frame=f)
    floor = lobby["floor"]
    shown = None
    for f in range(frames):
        v = floor[f]
        name = "L" if round(v) == 0 else str(int(round(v)))
        nxt = floor[min(frames - 1, f + 1)]
        prv = floor[max(0, f - 1)]
        if nxt > v + 1e-4 or (v > prv + 1e-4 and nxt >= v):
            arrow = "up"
        elif nxt < v - 1e-4 or (v < prv - 1e-4 and nxt <= v):
            arrow = "down"
        elif round(v) == 0 and doors_at(trips, f) > 0.5:
            arrow = "up"
        else:
            arrow = None
        state = (name, arrow)
        if state != shown:
            for key, obj in ind.items():
                obj.hide_render = not (key == name or key == arrow)
                obj.keyframe_insert("hide_render", frame=f)
            shown = state
    for obj in ind.values():
        constant(obj)


def camera_move(cam, frames):
    """A slow drift in through the lobby, then in on the doors and the
    floor display from frame 240, tracking a moving aim point."""
    scene = bpy.context.scene
    aim = bpy.data.objects.new("aim", None)
    scene.collection.objects.link(aim)
    con = cam.constraints.new("TRACK_TO")
    con.target = aim
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"
    start = Vector(L.CAM_FROM)
    start_at = Vector(L.CAM_AT)
    drift = start + (start_at - start) * 0.08
    for f, loc, at in (
        (0, start, start_at),
        (240, drift, start_at),
        (frames - 1, Vector(L.CAM_END), Vector(L.CAM_END_AT)),
    ):
        cam.location = loc
        aim.location = at
        cam.keyframe_insert("location", frame=f)
        aim.keyframe_insert("location", frame=f)


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :]
    timeline, rule, out = argv[0], argv[1], argv[2]
    first = int(argv[3]) if len(argv) > 3 else 0
    last_f = int(argv[4]) if len(argv) > 4 else None
    scale = float(argv[5]) if len(argv) > 5 else 1.0
    data = json.load(open(timeline))
    frames = data["frames"]
    doors, ind = L.setup(scale)
    scene = bpy.context.scene
    scene.render.use_motion_blur = True
    if hasattr(scene.render, "motion_blur_shutter"):
        scene.render.motion_blur_shutter = 0.4
    animate_set(data, rule, doors, ind)
    models = L.base.load_models()
    ids = [p["id"] for p in data[rule]["people"]]
    people = L.place(models, ids, data["you"])
    plans = plan_lobby(data, rule)
    for pid, arm in people.items():
        animate(arm, plans[pid], (pid * 17) % 60)
    cam = L.camera()
    camera_move(cam, frames)
    scene.frame_start = first
    scene.frame_end = last_f if last_f is not None else frames - 1
    if out.endswith(".json"):
        from bpy_extras.object_utils import world_to_camera_view

        you = people[data["you"]]
        sign = Vector((0.0, -L.WALL_T / 2 - 0.06, L.DOOR_H + 0.62))
        track = []
        for f in range(frames):
            scene.frame_set(f)
            head = you.matrix_world @ Vector((0, 0, 2.55))
            v = world_to_camera_view(scene, scene.camera, head)
            s = world_to_camera_view(scene, scene.camera, sign)
            track.append([round(v.x, 4), round(1 - v.y, 4), 0 if you.hide_render else 1, round(s.x, 4), round(1 - s.y, 4)])
        json.dump(track, open(out, "w"))
        # Every footfall in this lobby, for the sound.
        steps = sorted(
            [f, g, pid]
            for pid, arm in people.items()
            for f, g in json.loads(arm["steps"])
        )
        json.dump(steps, open(out.replace("track-", "steps-"), "w"))
        return
    scene.render.image_settings.file_format = "PNG"
    if os.environ.get("FRAMES"):
        # Spot checks: render only these frames, as stills.
        for f in [int(x) for x in os.environ["FRAMES"].split(",")]:
            scene.frame_set(f)
            scene.render.filepath = os.path.join(out, f"f{f:04d}.png")
            bpy.ops.render.render(write_still=True)
        return
    scene.render.filepath = os.path.join(out, "f")
    bpy.ops.render.render(animation=True)


if __name__ == "__main__":
    main()
