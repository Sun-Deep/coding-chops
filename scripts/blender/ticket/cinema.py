"""The last-ticket reel's cinema, rendered in Blender.

Run headless:
  Blender -b --factory-startup -P scripts/blender/ticket/cinema.py -- \
      public/vr47/timeline.json <frames dir | track.json>

Eye level, at the front of a dark cinema, looking back at the rows. One
seat is left, F12, front and centre under a spotlight. Two people stand in
front of the first row with their phones and tap Buy in the same frame.

Take 1, a plain SELECT: both celebrate, both walk to F12. A gets there
first and sits; B arrives with a ticket for a seat that is taken.

Take 2, the same taps with SELECT ... FOR UPDATE: an orange lock drops on
F12 for A. B waits. When A's purchase commits the lock lifts, and B's read
goes through and finds nothing left: B is told sold out instead of being
sold a seat that is gone.

Orange is the lock and nothing else. Characters are Quaternius's CC0 pack
(third_party/quaternius-characters, not in Git).

Given a directory, renders every frame into it (or only FRAMES=a,b,c).
Given a .json path, writes where Remotion's labels go on every frame.
"""

import json
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "deplane"))
import scene as base  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CHARS = os.path.join(ROOT, "third_party", "quaternius-characters")

args = sys.argv[sys.argv.index("--") + 1 :]
T = json.load(open(args[0]))
OUT = args[1]
D = T["DURATION"]

W, H = 1620, 850
SCALE = 0.82  # the pack's people are 2.2 units tall: about 1.8 m
ROWS, COLS = 6, 11
PITCH, SEAT_W = 1.0, 0.62
RISE = 0.22  # each row stands this much higher than the one in front
FRONT_Y = 1.5
SEAT = Vector((0.0, FRONT_Y, 0.0))  # F12: front row, centre
START = {"A": Vector((-1.05, 0.15, 0.0)), "B": Vector((1.05, 0.15, 0.0))}
SIT_Z = 0.36
ORANGE = base.hexrgb("#FF7A33")
CHALK = base.hexrgb("#E8E6E1")


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ramp(f, a, b):
    return ease((f - a) / (b - a)) if b > a else float(f >= a)


def mat(name, color, rough=0.6, emit=None, strength=0.0, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = color
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    if emit:
        p.inputs["Emission Color"].default_value = emit
        p.inputs["Emission Strength"].default_value = strength
    return m


def cube(name, size, loc, material, bevel=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        b = o.modifiers.new("b", "BEVEL")
        b.width = bevel
        b.segments = 3
    o.data.materials.append(material)
    return o


# ---------------------------------------------------------------- set


def seat_mesh(fabric, frame):
    """A cinema seat facing -Y: cushion, back, two armrests, a stand."""
    parts = [
        cube("cushion", (0.5, 0.48, 0.12), (0, 0.02, 0.42), fabric, 0.03),
        cube("back", (0.52, 0.12, 0.62), (0, 0.27, 0.78), fabric, 0.04, rot=(math.radians(-8), 0, 0)),
        cube("armL", (0.06, 0.46, 0.06), (-0.29, 0.06, 0.62), frame, 0.015),
        cube("armR", (0.06, 0.46, 0.06), (0.29, 0.06, 0.62), frame, 0.015),
        cube("stand", (0.08, 0.3, 0.36), (0, 0.15, 0.18), frame, 0.01),
    ]
    for o in parts:
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        for m in o.modifiers:
            bpy.ops.object.modifier_apply(modifier=m.name)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    o = bpy.context.object
    mesh = o.data
    bpy.data.objects.remove(o)
    return mesh


def build_set():
    scene = bpy.context.scene
    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.002, 0.0018, 0.0016, 1)
    scene.world = world

    floor = mat("floor", base.hexrgb("#141012"), 0.75)
    riser = mat("riser", base.hexrgb("#0E0B0C"), 0.8)
    fabric = mat("fabric", base.hexrgb("#3A1E22"), 0.85)
    lit_fabric = mat("litfabric", base.hexrgb("#5A2A30"), 0.8)
    metal = mat("seatframe", base.hexrgb("#1A1A1C"), 0.4, metal=0.6)
    stair = mat("stairlight", CHALK, 0.5, emit=CHALK, strength=1.2)

    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 4, 0))
    bpy.context.object.scale = (60, 60, 1)
    bpy.context.object.data.materials.append(floor)

    # Stepped rows, rising away from the camera.
    for r in range(ROWS):
        y = FRONT_Y + r * PITCH
        if r:
            cube(f"riser{r}", (COLS * SEAT_W + 3, PITCH, r * RISE), (0, y - 0.1, r * RISE / 2), riser)
        # A faint step light along each riser edge.
        cube(f"step{r}", (COLS * SEAT_W + 3, 0.02, 0.012), (0, y - PITCH / 2 - 0.08, r * RISE + 0.008), stair)

    plain = seat_mesh(fabric, metal)
    hero = seat_mesh(lit_fabric, metal)
    seats = {}
    for r in range(ROWS):
        for c in range(COLS):
            x = (c - (COLS - 1) / 2) * SEAT_W
            o = bpy.data.objects.new(f"seat{r}{c}", hero if (r == 0 and x == 0) else plain)
            o.location = (x, FRONT_Y + r * PITCH, r * RISE)
            scene.collection.objects.link(o)
            seats[(r, c)] = o

    # F12 on the back of the empty seat, facing the camera.
    label = mat("label", CHALK, 0.5, emit=CHALK, strength=2.5)
    bpy.ops.object.text_add(location=(0, FRONT_Y + 0.19, 0.98))
    t = bpy.context.object
    t.data.body = "F12"
    t.data.align_x = "CENTER"
    t.data.size = 0.13
    t.data.extrude = 0.004
    t.rotation_euler = (math.radians(82), 0, 0)
    t.data.materials.append(label)

    # The lock: an orange padlock that drops onto F12's back in take 2.
    lockm = mat("lock", ORANGE, 0.3, emit=ORANGE, strength=6.0, metal=0.3)
    body = cube("lockbody", (0.2, 0.08, 0.16), (0, 0, 0), lockm, 0.02)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.07, minor_radius=0.016, location=(0, 0, 0.1), rotation=(math.radians(90), 0, 0))
    shackle = bpy.context.object
    shackle.name = "shackle"
    shackle.data.materials.append(lockm)
    lock = bpy.data.objects.new("lock", None)
    scene.collection.objects.link(lock)
    body.parent = lock
    shackle.parent = lock
    return seats, lock, shackle


# ---------------------------------------------------------------- people


def load(name):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(CHARS, f"{name}.gltf"))
    new = [o for o in bpy.data.objects if o not in before]
    arm = next(o for o in new if o.type == "ARMATURE")
    arm.scale = (SCALE,) * 3
    arm.rotation_mode = "XYZ"
    ad = arm.animation_data or arm.animation_data_create()
    ad.action = None
    for tr in list(ad.nla_tracks):
        ad.nla_tracks.remove(tr)
    return arm


def dress(arm, shirt, skin, hair):
    for child in arm.children_recursive:
        if child.type != "MESH":
            continue
        for slot in child.material_slots:
            src = slot.material
            if src is None:
                continue
            m = src.copy()
            slot.link = "OBJECT"
            bsdf = m.node_tree.nodes.get("Principled BSDF")
            n = src.name.split(".")[0]
            if bsdf is not None:
                if n == "Shirt":
                    bsdf.inputs["Base Color"].default_value = base.hexrgb(shirt)
                elif n == "Skin":
                    bsdf.inputs["Base Color"].default_value = base.hexrgb(skin)
                elif n == "Hair":
                    bsdf.inputs["Base Color"].default_value = base.hexrgb(hair)
                elif n == "Face":
                    bsdf.inputs["Base Color"].default_value = base.hexrgb("#1B1512")
                if n != "Face":
                    bsdf.inputs["Roughness"].default_value = 0.7
            slot.material = m


def PEAK(action):
    """The frame of a Defeat that reads best when held: its middle."""
    a, b = action.frame_range
    return a + 0.5 * (b - a)


def act(name):
    return bpy.data.actions[name]


def strip(arm, action, start, end, hold=False, loop=False, rate=1.0, upto=1.0):
    """One NLA track playing `action` from `start` to `end`. Later tracks
    sit above earlier ones and replace them while they play."""
    ad = arm.animation_data
    tr = ad.nla_tracks.new()
    a = bpy.data.actions[action]
    s = tr.strips.new(action, int(start), a)
    length = (a.frame_range[1] - a.frame_range[0]) * upto
    if upto < 1.0:
        s.action_frame_end = a.frame_range[0] + length
    if loop:
        s.repeat = max(0.01, (end - start) / (length / rate))
        s.scale = 1 / rate
    elif hold:
        s.scale = 1 / rate
    else:
        s.scale = max(0.05, (end - start) / length)
    s.extrapolation = "HOLD_FORWARD" if hold else "NOTHING"
    s.blend_in = 3 if start > 0 else 0
    return s


def phone(arm, screen):
    """A phone in the right hand, its screen lit."""
    p = cube("phone", (0.07, 0.012, 0.14), (0, 0, 0), screen)
    p.parent = arm
    p.parent_type = "BONE"
    p.parent_bone = "Fist.R"
    p.location = (0.0, 0.06, 0.02)
    return p


# Where each person is, keyed by frame: (frame, x, y, sitting).
def path(who):
    a, b = START["A"], START["B"]
    seat = SEAT + Vector((0, 0, 0))
    side = SEAT + Vector((1.0 if who == "B" else -1.0, -0.5, 0))
    keys = {
        "A": [(0, a), (T["WALK_1"], a), (T["SIT_1"] - 6, seat - Vector((0, 0.32, 0))), (T["SIT_1"], seat),
              (T["TAKE_2"] - 1, seat), (T["TAKE_2"], a), (T["WALK_2"], a), (T["SIT_2"] - 6, seat - Vector((0, 0.32, 0))),
              (T["SIT_2"], seat), (D, seat)],
        "B": [(0, b), (T["WALK_1"], b), (T["SLUMP_1"] - 2, side), (T["TAKE_2"] - 1, side), (T["TAKE_2"], b), (D, b)],
    }[who]
    return keys


def position(who, f):
    keys = path(who)
    for (fa, pa), (fb, pb) in zip(keys, keys[1:]):
        if fa <= f <= fb:
            t = (f - fa) / (fb - fa) if fb > fa else 1.0
            return pa.lerp(pb, t), pb - pa if pb != pa else None
    return keys[-1][1], None


def heading(who, f):
    """Facing the camera (-Y) unless walking, then facing the way they go."""
    p, d = position(who, f)
    walking = d is not None and d.length > 0.01
    sitting = (T["SIT_1"] <= f < T["TAKE_2"] and who == "A") or (f >= T["SIT_2"] and who == "A")
    if walking and not sitting:
        if (who == "A" and (T["WALK_1"] <= f < T["SIT_1"] - 6 or T["WALK_2"] <= f < T["SIT_2"] - 6)) or (
            who == "B" and T["WALK_1"] <= f < T["SLUMP_1"] - 2
        ):
            return math.atan2(d.x, -d.y)
    return 0.0


def animate(people):
    A, B = people["A"], people["B"]
    for arm in (A, B):
        strip(arm, "Idle", 0, D, loop=True)
    # Take 1.
    for arm in (A, B):
        strip(arm, "Victory", T["TICKET_1"], T["WALK_1"])
        strip(arm, "Walk", T["WALK_1"], T["SIT_1"] - 6, loop=True, rate=1.15)
    strip(A, "SitDown", T["SIT_1"] - 6, T["SIT_1"] + 14)
    s = strip(A, "SitDown", T["SIT_1"] + 14, T["TAKE_2"] - 1, hold=True)
    s.action_frame_start = s.action.frame_range[1] - 0.5
    strip(B, "Walk", T["WALK_1"], T["SLUMP_1"] - 2, loop=True, rate=1.15)
    strip(B, "Defeat", T["SLUMP_1"], T["SLUMP_1"] + 15, upto=0.5)
    d = strip(B, "Defeat", T["SLUMP_1"] + 15, T["TAKE_2"] - 1, hold=True)
    d.action_frame_start = PEAK(d.action)
    # Take 2: a fresh Idle track restarts both, above everything from take 1.
    for arm in (A, B):
        s = strip(arm, "Idle", T["TAKE_2"], D, loop=True)
        s.blend_in = 0
    strip(A, "Victory", T["TICKET_2"], T["WALK_2"])
    strip(A, "Walk", T["WALK_2"], T["SIT_2"] - 6, loop=True, rate=1.15)
    strip(A, "SitDown", T["SIT_2"] - 6, T["SIT_2"] + 14)
    s = strip(A, "SitDown", T["SIT_2"] + 14, D, hold=True)
    s.action_frame_start = s.action.frame_range[1] - 0.5
    strip(B, "Defeat", T["SOLDOUT_2"] + 2, T["SOLDOUT_2"] + 17, upto=0.5)
    d = strip(B, "Defeat", T["SOLDOUT_2"] + 17, D, hold=True)
    d.action_frame_start = PEAK(d.action)
    # Take 1's tracks must not show through in take 2.
    for arm in (A, B):
        for tr in arm.animation_data.nla_tracks:
            for st in tr.strips:
                if st.frame_start < T["TAKE_2"] and st.extrapolation == "HOLD_FORWARD":
                    st.extrapolation = "NOTHING"
                    st.frame_end = T["TAKE_2"] - 0.01


# ---------------------------------------------------------------- camera

CAM_FROM = Vector((0.0, -6.4, 1.55))
CAM_AT = Vector((0.0, 1.0, 1.05))


def camera_at(f):
    """Eye level, a slow push in during each take."""
    take2 = f >= T["TAKE_2"]
    t = ((f - T["TAKE_2"]) / (D - T["TAKE_2"])) if take2 else f / T["TAKE_2"]
    push = 1.1 * ease(t)
    pos = CAM_FROM + Vector((0.18 * (1 - 2 * t) * (1 if take2 else -1), push, -0.05 * t))
    return pos, CAM_AT


LENS, SENSOR = 34, 36
TAN_H = (SENSOR / 2) / LENS
TAN_V = TAN_H * H / W


def project(p, cam_pos, target):
    w = (target - cam_pos).normalized()
    r = w.cross(Vector((0, 0, 1))).normalized()
    v = r.cross(w)
    d = p - cam_pos
    z = d.dot(w)
    return (d.dot(r) / z) / TAN_H, (d.dot(v) / z) / TAN_V, z


# ---------------------------------------------------------------- run


def head(who, f):
    p, _ = position(who, f)
    sitting = who == "A" and ((T["SIT_1"] <= f < T["TAKE_2"]) or f >= T["SIT_2"])
    return p + Vector((0, 0, (1.3 if sitting else 1.95)))


def track():
    rows = []
    for f in range(D):
        cam, at = camera_at(f)
        row = []
        for p in (head("A", f), head("B", f), SEAT + Vector((0, 0.25, 1.25))):
            x, y, z = project(p, cam, at)
            row.append([round(x * 0.5 + 0.5, 4), round(0.5 - y * 0.5, 4), 1 if z > 0 and abs(x) < 1 and abs(y) < 1 else 0])
        rows.append(row)
    json.dump(rows, open(OUT, "w"))
    print(f"wrote {OUT}")


def render():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(W, H)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 0, D - 1
    seats, lock, shackle = build_set()

    people = {"A": load("Casual_Female"), "B": load("Casual2_Male")}
    dress(people["A"], "#4E6A8A", "#C99272", "#5A3A26")
    dress(people["B"], "#8A7A5C", "#8D5B3E", "#1E1A18")
    screen = {k: mat(f"screen{k}", CHALK, 0.3, emit=CHALK, strength=0.0) for k in people}
    phones = {k: phone(people[k], screen[k]) for k in people}
    animate(people)

    # Light: a spot on F12, a soft wash on the two people, low house lights.
    def light(name, kind, loc, at, energy, size=1.0, spot=None, color=(1, 1, 1)):
        L = bpy.data.objects.new(name, bpy.data.lights.new(name, kind))
        L.data.energy = energy
        L.data.color = color
        if kind == "AREA":
            L.data.size = size
        if spot:
            L.data.spot_size = math.radians(spot)
            L.data.spot_blend = 0.5
        L.location = loc
        L.rotation_euler = (Vector(at) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        scene.collection.objects.link(L)
        return L

    light("seatspot", "SPOT", (0.0, 0.2, 4.6), (0, FRONT_Y, 0.4), 900, spot=26)
    light("key", "AREA", (-2.5, -3.2, 3.2), (0, 0.6, 1.0), 260, size=3, color=(1.0, 0.92, 0.84))
    light("rim", "AREA", (2.8, 3.5, 3.0), (0, 0.5, 1.2), 220, size=3, color=(0.8, 0.86, 1.0))
    light("house", "AREA", (0, 6, 5), (0, 4, 0), 160, size=12, color=(1.0, 0.85, 0.7))

    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    cam.data.lens = LENS
    cam.data.sensor_width = SENSOR
    cam.data.sensor_fit = "HORIZONTAL"
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 3.2
    scene.camera = cam

    ng = bpy.data.node_groups.new("comp", "CompositorNodeTree")
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    rl = ng.nodes.new("CompositorNodeRLayers")
    glare = ng.nodes.new("CompositorNodeGlare")
    glare.inputs["Type"].default_value = "Bloom"
    glare.inputs["Threshold"].default_value = 1.0
    glare.inputs["Strength"].default_value = 0.4
    glare.inputs["Size"].default_value = 0.5
    outn = ng.nodes.new("NodeGroupOutput")
    ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
    ng.links.new(glare.outputs["Image"], outn.inputs[0])
    scene.compositing_node_group = ng
    scene.render.use_compositing = True

    os.makedirs(OUT, exist_ok=True)
    frames = [int(x) for x in os.environ["FRAMES"].split(",")] if os.environ.get("FRAMES") else range(D)
    scene.render.filepath = os.path.join(OUT, "warmup.png")
    bpy.ops.render.render(write_still=True)
    os.remove(scene.render.filepath)
    lock_rest = SEAT + Vector((0, 0.3, 1.32))
    for f in frames:
        scene.frame_set(f)
        for who, arm in people.items():
            p, _ = position(who, f)
            sitting = who == "A" and ((T["SIT_1"] <= f < T["TAKE_2"]) or f >= T["SIT_2"])
            arm.location = p + Vector((0, 0.1 if sitting else 0, SIT_Z * ramp(f, (T["SIT_1"] if f < T["TAKE_2"] else T["SIT_2"]) - 6, (T["SIT_1"] if f < T["TAKE_2"] else T["SIT_2"]) + 4) if who == "A" else 0))
            arm.rotation_euler.z = heading(who, f)
        # Phones light up on the tap.
        for who in people:
            tap = T["TAP_1"] if f < T["TAKE_2"] else T["TAP_2"]
            k = ramp(f, tap - 2, tap) * (1 - ramp(f, tap + 30, tap + 40))
            screen[who].node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 0.4 + 6 * k
        # The lock: only in take 2, from A's locking read to A's commit.
        on = f >= T["LOCK_2"] and f < T["RELEASE_2"] + 14
        lock.hide_render = not on
        for c in lock.children:
            c.hide_render = not on
        drop = ramp(f, T["LOCK_2"], T["LOCK_2"] + 6)
        lock.location = lock_rest + Vector((0, 0, 0.5 * (1 - drop)))
        lift = ramp(f, T["RELEASE_2"], T["RELEASE_2"] + 6)
        shackle.location = (0, 0, 0.1 + 0.08 * lift)
        s = 1 - ramp(f, T["RELEASE_2"] + 6, T["RELEASE_2"] + 14)
        lock.scale = (max(2.2 * s, 0.001),) * 3
        pos, at = camera_at(f)
        cam.location = pos
        cam.rotation_euler = (at - pos).to_track_quat("-Z", "Y").to_euler()
        cam.data.dof.focus_distance = (Vector((0, 0.8, 1.0)) - pos).length
        scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
        bpy.ops.render.render(write_still=True)
    del phones, seats


if OUT.endswith(".json"):
    track()
else:
    render()
