"""Animate one cabin of the deplaning reel from the model's timeline and
render it as a frame sequence.

Run: Blender -b --factory-startup -P scripts/blender/deplane/animate.py -- \
       <timeline.json> <stand|sit> <out_dir> [first last scale]

The timeline comes from export.mjs. Every passenger blends between five
poses on NLA tracks: seated, standing up, standing, reaching into the bin,
and walking. Walking is timed by distance covered, so feet do not slide.
Positions follow the model's aisle row each frame; walking out through the
door and up the jet bridge is paced in screen time.
"""
import json
import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scene as S  # noqa: E402

RISE = 18
STEP_MIN = 8
REACH_MIN = 12
BLEND = 5
EXIT_SPEED = 0.11
WALK_STRIDE = 1.0
SEATED_Z = -0.24
STAND_DY = 0.3


def heading(dx, dy):
    """Rotation about Z that points a pack character along (dx, dy)."""
    return math.atan2(dx, -dy)


def door_path():
    door_y = S.row_y(0) + 1.4
    return [
        (0.0, S.row_y(0)),
        (0.0, door_y),
        (-S.CABIN_HALF, door_y),
        (-S.CABIN_HALF - 4.0, door_y),
    ]


def along(path, d):
    """Point and heading at distance d along a polyline."""
    for (x0, y0), (x1, y1) in zip(path, path[1:]):
        seg = math.hypot(x1 - x0, y1 - y0)
        if d <= seg:
            u = d / seg
            return x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, heading(x1 - x0, y1 - y0), False
        d -= seg
    (x0, y0), (x1, y1) = path[-2], path[-1]
    return x1, y1, heading(x1 - x0, y1 - y0), True


def smoothstep(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def plan(p, frames, rule, stagger):
    """Per frame: position, heading, pose weights, walk distance, visible."""
    sx = S.seat_x(p["col"])
    sy = S.row_y(p["row"])
    if rule == "stand":
        rise0 = p["up"] + stagger
    else:
        rise0 = min(p["up"], p["enter"] - RISE)
    rise1 = rise0 + RISE
    step0 = max(p["enter"], rise1 - 2)
    step1 = step0 + max(STEP_MIN, p["stepEnd"] - p["enter"])
    reach0 = p["bagFrom"]
    reach1 = None if reach0 is None else max(p["bagTo"], reach0 + REACH_MIN)
    path = door_path()
    out = []
    walked = 0.0
    prev = None
    side = -1 if p["col"] < 3 else 1
    for f in range(frames):
        cell = p["cell"][f]
        visible = True
        if f < rise0:
            x, y, z, h = sx, sy + 0.05, SEATED_Z, math.pi
            state = "sit"
        elif f < step0 or cell is None and f < p["off"]:
            u = smoothstep((f - rise0) / RISE)
            x, y, z, h = sx, sy + 0.05 + STAND_DY * u, SEATED_Z * (1 - u), math.pi
            state = "rise" if f < rise1 else "stand"
        elif f < p["off"]:
            # Into the aisle sideways, then up and down it with the queue.
            u = smoothstep((f - step0) / (step1 - step0))
            ay = S.row_y(cell)
            x = sx * (1 - u)
            y = (sy + 0.05 + STAND_DY) * (1 - u) + ay * u
            z = 0.0
            h = heading(-side, 0.0) if u < 0.7 else math.pi
            state = "stand"
        else:
            d = (f - p["off"]) * EXIT_SPEED
            x, y, h, done = along(path, d)
            z = 0.0
            state = "walk"
            visible = not done
        if prev is not None:
            dist = math.hypot(x - prev[0], y - prev[1])
            walked += dist
            if state == "stand" and dist > 0.012:
                state = "walk"
        reaching = reach0 is not None and reach0 <= f < reach1 and f >= rise1
        out.append(
            {
                "x": x, "y": y, "z": z, "h": h, "state": state,
                "reach": reaching, "walked": walked, "visible": visible,
                "bag": p["bag"] and p["bagTo"] is not None and f >= (reach1 or 0),
            }
        )
        prev = (x, y)
    return out, rise0


def strip(arm, name, action, start=0, end=None):
    track = arm.animation_data.nla_tracks.new()
    track.name = name
    s = track.strips.new(name, int(action.frame_range[0]), action)
    s.frame_start = start
    if end is not None:
        s.frame_end = end
    s.blend_in = 0
    s.blend_out = 0
    s.extrapolation = "HOLD"
    return s


def key(obj, path, frame, value, index=-1, constant=False):
    if index >= 0:
        getattr(obj, path)[index] = value
        obj.keyframe_insert(path, index=index, frame=frame)
    else:
        setattr(obj, path, value)
        obj.keyframe_insert(path, frame=frame)


def animate(arm, frames, steps, rise0, bag_obj):
    ad = arm.animation_data
    ad.action = None
    for t in list(ad.nla_tracks):
        ad.nla_tracks.remove(t)
    acts = bpy.data.actions
    sit = strip(arm, "sit", acts["SitDown"])
    sit.action_frame_start = acts["SitDown"].frame_range[1]
    sit.action_frame_end = acts["SitDown"].frame_range[1] + 0.01
    sit.frame_start, sit.frame_end = 0, frames
    rise = strip(arm, "rise", acts["StandUp"])
    rise.frame_start, rise.frame_end = 0, frames
    idle = strip(arm, "idle", acts["Idle"])
    idle.frame_start, idle.frame_end = 0, frames
    walk = strip(arm, "walk", acts["Walk"])
    walk.frame_start, walk.frame_end = 0, frames
    reach = strip(arm, "reach", acts["Victory"])
    reach.action_frame_start = 12
    reach.action_frame_end = 12.01
    reach.frame_start, reach.frame_end = 0, frames
    for s in (rise, idle, walk, reach):
        s.use_animated_influence = True
        s.use_animated_time = True
    up_len = acts["StandUp"].frame_range[1]
    idle_len = acts["Idle"].frame_range[1]
    walk_len = acts["Walk"].frame_range[1]
    weights = {"rise": 0.0, "idle": 0.0, "walk": 0.0, "reach": 0.0}
    last = None
    for f, st in enumerate(steps):
        aim = {
            "rise": 1.0 if st["state"] == "rise" else 0.0,
            "idle": 1.0 if st["state"] in ("stand", "rise") and st["state"] != "rise" else 0.0,
            "walk": 1.0 if st["state"] == "walk" else 0.0,
            "reach": 1.0 if st["reach"] else 0.0,
        }
        # Once up, the rise pose hands over to standing; walking and
        # reaching sit on top.
        if st["state"] == "walk":
            aim["idle"] = 1.0
        for k in weights:
            weights[k] += (aim[k] - weights[k]) * (1.0 / BLEND * 2.2)
            weights[k] = max(0.0, min(1.0, weights[k]))
        snapshot = (round(st["x"], 4), round(st["y"], 4), round(st["z"], 4), round(st["h"], 3),
                    tuple(round(v, 3) for v in weights.values()), st["visible"], st["bag"])
        if snapshot != last or f == len(steps) - 1:
            arm.location = (st["x"], st["y"], st["z"])
            arm.keyframe_insert("location", frame=f)
            arm.rotation_euler = (0, 0, st["h"])
            arm.keyframe_insert("rotation_euler", index=2, frame=f)
            rise.influence = weights["rise"]
            rise.keyframe_insert("influence", frame=f)
            idle.influence = weights["idle"]
            idle.keyframe_insert("influence", frame=f)
            walk.influence = weights["walk"]
            walk.keyframe_insert("influence", frame=f)
            reach.influence = weights["reach"]
            reach.keyframe_insert("influence", frame=f)
            for o in [arm] + list(arm.children_recursive):
                o.hide_render = not st["visible"]
                o.keyframe_insert("hide_render", frame=f)
            if bag_obj is not None:
                bag_obj.hide_render = not (st["bag"] and st["visible"])
                bag_obj.keyframe_insert("hide_render", frame=f)
            last = snapshot
        # Clip times every frame: standing up, idling, walking by distance.
        rise.strip_time = max(0.0, min(up_len, (f - rise0) / RISE * up_len))
        rise.keyframe_insert("strip_time", frame=f)
        idle.strip_time = (f * 0.8 + arm["phase"]) % idle_len
        idle.keyframe_insert("strip_time", frame=f)
        walk.strip_time = (st["walked"] / WALK_STRIDE * walk_len) % walk_len
        walk.keyframe_insert("strip_time", frame=f)
    # No easing between frames on the clock values, or loops run backwards.
    for s in (rise, idle, walk):
        for fc in s.fcurves:
            if fc.data_path == "strip_time":
                for kp in fc.keyframe_points:
                    kp.interpolation = "CONSTANT"
    for o in [arm] + list(arm.children_recursive) + ([bag_obj] if bag_obj else []):
        ad2 = o.animation_data
        if ad2 and ad2.action:
            for fc in getattr(ad2.action, "fcurves", []):
                if fc.data_path == "hide_render":
                    for kp in fc.keyframe_points:
                        kp.interpolation = "CONSTANT"


def add_bag(arm, i):
    mat = bpy.data.materials.get("bag") or S.material("bag", S.hexrgb("#2A2C33"), rough=0.5)
    bag = S.box(f"bag-{i}", (0.9, 0.5, 1.2), (0, 0, 0), mat, bevel=0.08)
    bag.parent = arm
    bag.parent_type = "BONE"
    bag.parent_bone = "Fist.R"
    bag.location = (0.0, -0.35, 0.0)
    bag.hide_render = True
    return bag


def build_bins():
    bin_mat = S.material("bin", S.hexrgb("#D9D5CC"), rough=0.5)
    for side in (-1, 1):
        x = side * (S.CABIN_HALF - 0.32)
        length = S.ROWS * S.PITCH + 0.6
        y = S.FIRST_ROW_Y + (S.ROWS - 1) * S.PITCH / 2
        S.box(f"bins-{side + 1}", (0.62, length, 0.42), (x, y, 1.62), bin_mat, bevel=0.06)


def camera_path(cam, aim, mid):
    S_key = [
        (0, (34.0, mid + 46.0, 22.0), (0.0, mid - 2.0, 0.5)),
        (52, (6.4, mid + 9.6, 6.0), (-0.2, mid - 0.4, 0.4)),
        (200, (6.0, mid + 9.2, 5.6), (-0.4, mid + 0.2, 0.4)),
        (419, (5.4, mid + 9.4, 5.0), (-0.8, mid + 1.2, 0.4)),
    ]
    con = cam.constraints.new("TRACK_TO")
    con.target = aim
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"
    for f, loc, target in S_key:
        cam.location = loc
        aim.location = target
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
    bpy.ops.wm.read_factory_settings(use_empty=True)
    S.setup_render(int(1560 * scale), int(760 * scale))
    scene = bpy.context.scene
    scene.render.use_motion_blur = True
    if hasattr(scene.render, "motion_blur_shutter"):
        scene.render.motion_blur_shutter = 0.4
    S.build_world()
    S.build_apron()
    S.build_fuselage()
    S.build_seats()
    base = S.load_models()
    people = S.place_passengers(base, you_index=data["you"])
    mid = S.FIRST_ROW_Y + (S.ROWS - 1) * S.PITCH / 2
    cam = S.camera((9.0, mid + 13.0, 8.0), (-0.3, mid - 0.5, 0.4), lens=40)
    aim = bpy.data.objects.new("aim", None)
    scene.collection.objects.link(aim)
    camera_path(cam, aim, mid)
    roof = bpy.data.objects["roof"]
    roof.keyframe_insert("location", frame=16)
    roof.keyframe_insert("rotation_euler", frame=16)
    roof.location.z += 14.0
    roof.location.x += 2.0
    roof.rotation_euler.y = math.radians(-12)
    roof.keyframe_insert("location", frame=44)
    roof.keyframe_insert("rotation_euler", frame=44)
    people_by_id = {int(a.name[1:]): a for a in people}
    for p in data[rule]:
        arm = people_by_id[p["id"]]
        arm["phase"] = (p["id"] * 17) % 60
        stagger = (p["id"] * 7) % 14
        steps, rise0 = plan(p, frames, rule, stagger)
        bag = add_bag(arm, p["id"]) if p["bag"] else None
        animate(arm, frames, steps, rise0, bag)
    scene.frame_start = first
    scene.frame_end = last_f if last_f is not None else frames - 1
    if out.endswith(".json"):
        # Where your head is on screen each frame, for the YOU label.
        from bpy_extras.object_utils import world_to_camera_view
        from mathutils import Vector

        you = people_by_id[data["you"]]
        track = []
        for f in range(frames):
            scene.frame_set(f)
            head = you.matrix_world @ Vector((0, 0, 2.6))
            v = world_to_camera_view(scene, scene.camera, head)
            track.append([round(v.x, 4), round(1 - v.y, 4), 0 if you.hide_render else 1])
        json.dump(track, open(out, "w"))
        return
    scene.render.filepath = os.path.join(out, "f")
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(animation=True)


if __name__ == "__main__":
    main()
