"""The Monty Hall reel's second half: a game-show studio, rendered in Blender.

Run headless:
  Blender -b --factory-startup -P scripts/blender/monty/studio.py -- \
      public/vr45/timeline.json <frames dir | track.json>

Eye level, in a dark studio. Two contestants stand beside two glass cases:
on the left the one who always sticks with door 1, on the right the one who
always switches. As Python plays the 10,000 games, a toy car drops into a
case each time that choice reaches another 200 wins, so the cars land in
step with the score Remotion counts above. Each case holds 50 cars, all
10,000 games, and one line runs across both at half height: where each
would stop if it really were 50/50. The switch case fills past it; the
stick case stops a third of the way up. Then the switcher celebrates and
the sticker slumps.

Starts on the cut from the door close-up (doors.py) and renders only the
frames after it. Characters are Quaternius's CC0 pack
(third_party/quaternius-characters, not in Git).

Given a directory, renders every frame from the cut into it (or only
FRAMES=a,b,c). Given the .json path doors.py wrote its labels to, adds the
studio's labels from the cut on.
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
D = T["duration"]
CUT = T["pull"]

W, H = 1620, 850
SCALE = 0.74  # the pack's people are 2.2 units tall: about 1.6 m

# A case: 5 cars a layer, 10 layers, so 50 cars is every game.
PER_LAYER, LAYERS = 5, 10
CAR_L = 0.46
SLOT = 0.5
LAYER_H = 0.2
INNER_W = PER_LAYER * SLOT
INNER_H = LAYERS * LAYER_H + 0.05
DEPTH = 0.26
PLINTH = 0.28
CASE_X = {"stick": -1.6, "switch": 1.6}
PERSON_X = {"stick": -3.32, "switch": 3.32}

ORANGE = base.hexrgb("#FF7A33")
CHALK = base.hexrgb("#E8E6E1")


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ramp(f, a, b):
    return ease((f - a) / (b - a)) if b > a else float(f >= a)


# ---------------------------------------------------------------- the run


def shown(f):
    """The wins Remotion shows on frame f, the same rule as tallyAt."""
    run = T["running"]
    a, b = T["tallyFrom"], T["tallyTo"]
    if f < a:
        return 0, 1
    i = math.floor(min(1.0, (f - a) / (b - a)) * len(run))
    if i == 0:
        return 0, 1
    return run[i - 1]


def landings():
    """The frame each car lands: when its choice's count passes the next 200."""
    out = {"stick": [], "switch": []}
    for f in range(T["tallyFrom"], D):
        s, w = shown(f)
        for key, n in (("stick", s), ("switch", w)):
            while len(out[key]) < n // T["carWins"]:
                out[key].append(f)
    return out


LANDS = landings()
FALL = 8


def slot(key, j):
    """Where car j of a case comes to rest, with a little scatter."""
    layer, col = divmod(j, PER_LAYER)
    jitter = math.sin(j * 12.9898 + (7 if key == "switch" else 0)) * 0.025
    x = CASE_X[key] - INNER_W / 2 + SLOT / 2 + col * SLOT + jitter
    z = PLINTH + 0.02 + layer * LAYER_H
    flip = 1 if (j * 7 + layer) % 3 else -1
    tilt = math.sin(j * 4.1) * math.radians(3)
    return Vector((x, 0.0, z)), flip, tilt


def car_state(key, j, f):
    land = LANDS[key][j]
    rest, flip, tilt = slot(key, j)
    start = land - FALL
    if f < start:
        return None
    top = Vector((CASE_X[key], 0.0, PLINTH + INNER_H + 0.55))
    if f < land:
        t = (f - start) / FALL
        g = t * t
        pos = Vector((top.x + (rest.x - top.x) * ease(t), 0.0, top.z + (rest.z - top.z) * g))
        return pos, flip, tilt * t + math.radians(25) * (1 - t) * flip
    # A small bounce on landing.
    b = f - land
    hop = 0.035 * math.sin(math.pi * b / 4) if b < 4 else 0.0
    return rest + Vector((0, 0, hop)), flip, tilt


# ---------------------------------------------------------------- scene


def mat(name, color, rough=0.6, emit=None, strength=0.0, metal=0.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = color
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    if emit:
        p.inputs["Emission Color"].default_value = emit
        p.inputs["Emission Strength"].default_value = strength
    if alpha < 1.0:
        p.inputs["Alpha"].default_value = alpha
        if hasattr(m, "surface_render_method"):
            m.surface_render_method = "BLENDED"
    return m


def cube(size, loc, material, bevel=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = size
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if bevel:
        b = o.modifiers.new("b", "BEVEL")
        b.width = bevel
        b.segments = 2
        bpy.ops.object.modifier_apply(modifier="b")
    o.data.materials.append(material)
    return o


def join(parts, name):
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    o = bpy.context.object
    o.name = name
    return o


def car_mesh(paint, glass, tyre, lamp):
    """A toy car in profile, nose to +X, sitting on z = 0."""
    s = CAR_L / 4.4
    L, Wd, Ht = 4.4 * s, 1.8 * s, 1.42 * s
    # Toy proportions: a tall body, a big cabin, big wheels, so it reads as
    # a car at 60 pixels long.
    Ht = 1.75 * s
    parts = [
        cube((L, Wd, 0.72 * s), (0, 0, 0.78 * s), paint, bevel=0.14 * s),
        cube((L * 0.52, Wd * 0.9, 0.62 * s), (-L * 0.05, 0, 1.38 * s), paint, bevel=0.16 * s),
        cube((L * 0.2, Wd * 0.94, 0.42 * s), (-L * 0.16, 0, 1.38 * s), glass, bevel=0.06 * s),
        cube((L * 0.2, Wd * 0.94, 0.42 * s), (L * 0.08, 0, 1.38 * s), glass, bevel=0.06 * s),
        cube((0.06 * s, Wd * 0.7, 0.14 * s), (L / 2, 0, 0.92 * s), lamp),
    ]
    for sx in (1, -1):
        for sy in (1, -1):
            bpy.ops.mesh.primitive_cylinder_add(
                vertices=20, radius=0.42 * s, depth=0.24 * s,
                location=(sx * L * 0.3, sy * (Wd / 2 - 0.04 * s), 0.42 * s),
                rotation=(math.pi / 2, 0, 0),
            )
            wh = bpy.context.object
            bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
            wh.data.materials.append(tyre)
            parts.append(wh)
    o = join(parts, "car")
    mesh = o.data
    bpy.data.objects.remove(o)
    return mesh


def build_case(key, glassm, edge, plinth, half):
    """A plinth, a glass case on it, lit edges, and a chute above."""
    x = CASE_X[key]
    w, d, h = INNER_W + 0.06, DEPTH, INNER_H
    cube((w + 0.3, d + 0.4, PLINTH), (x, 0, PLINTH / 2), plinth, bevel=0.02)
    # Glass in front, barely there, so the cars stay clear behind it.
    cube((w, 0.012, h), (x, -d / 2, PLINTH + h / 2), glassm)
    # A dark back so the cars stand out against it.
    cube((w, 0.02, h), (x, d / 2 + 0.02, PLINTH + h / 2), plinth)
    # The lit edges that draw the case.
    e = 0.018
    for sx in (-1, 1):
        for sy in (-1, 1):
            cube((e, e, h), (x + sx * w / 2, sy * d / 2, PLINTH + h / 2), edge)
        cube((e, d, e), (x + sx * w / 2, 0, PLINTH + h), edge)
    for sy in (-1, 1):
        cube((w, e, e), (x, sy * d / 2, PLINTH + h), edge)
        cube((w, e, e), (x, sy * d / 2, PLINTH + 0.01), edge)
    # The chute the cars drop from.
    cube((0.56, d + 0.1, 0.34), (x, 0, PLINTH + h + 0.55), plinth, bevel=0.03)
    cube((0.58, 0.02, 0.02), (x, -(d + 0.1) / 2 - 0.01, PLINTH + h + 0.39), edge)
    cube((0.05, 0.05, 2.0), (x, 0, PLINTH + h + 1.7), plinth)
    # The 50/50 mark: 25 cars, half of every game.
    zh = PLINTH + 0.02 + (LAYERS / 2) * LAYER_H
    cube((w + 0.12, 0.01, 0.012), (x, -d / 2 - 0.02, zh), half)


def build_set():
    scene = bpy.context.scene
    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0025, 0.0024, 0.0026, 1)
    scene.world = world

    floor = mat("floor", base.hexrgb("#0C0D10"), 0.22)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 4, 0))
    bpy.context.object.scale = (60, 60, 1)
    bpy.context.object.data.materials.append(floor)

    # The back of the set: a dark wall with tall, dim light panels.
    wall = mat("wall", base.hexrgb("#101116"), 0.7)
    cube((16, 0.2, 6), (0, 3.2, 3), wall)
    panel = mat("panel", CHALK, 0.5, emit=CHALK, strength=0.07)
    for i in range(-6, 7):
        if abs(i) in (0,):
            continue
        cube((0.06, 0.04, 3.4), (i * 0.95, 3.08, 1.9), panel)
    # A low riser the whole set stands on.
    riser = mat("riser", base.hexrgb("#15161B"), 0.5)
    cube((9.2, 2.4, 0.08), (0, 0.4, 0.04), riser, bevel=0.01)
    lip = mat("lip", CHALK, 0.5, emit=CHALK, strength=1.4)
    cube((9.2, 0.015, 0.012), (0, -0.8, 0.08), lip)

    glassm = mat("glass", base.hexrgb("#9FB4C8"), 0.02, alpha=0.025)
    edge = mat("edge", CHALK, 0.4, emit=CHALK, strength=2.4)
    plinth = mat("plinth", base.hexrgb("#1A1C22"), 0.45, metal=0.3)
    half = mat("half", CHALK, 0.4, emit=CHALK, strength=1.2)
    for key in CASE_X:
        build_case(key, glassm, edge, plinth, half)
    # The half line carries on across the gap between the cases.
    zh = PLINTH + 0.02 + (LAYERS / 2) * LAYER_H
    gap = CASE_X["switch"] - CASE_X["stick"] - INNER_W - 0.18
    for i in range(5):
        cube((gap / 9, 0.01, 0.01), (-gap / 2 + gap / 9 * (2 * i + 0.5), -DEPTH / 2 - 0.02, zh), half)

    paint = mat("paint", ORANGE, 0.32, emit=ORANGE, strength=0.3, metal=0.1)
    glass = mat("carglass", base.hexrgb("#1B2430"), 0.12, metal=0.2)
    tyre = mat("tyre", base.hexrgb("#141414"), 0.8)
    lamp = mat("lamp", base.hexrgb("#FFF3D6"), 0.2, emit=base.hexrgb("#FFF3D6"), strength=3)
    car = car_mesh(paint, glass, tyre, lamp)
    cars = {}
    for key in CASE_X:
        cars[key] = []
        for j in range(len(LANDS[key])):
            o = bpy.data.objects.new(f"{key}{j:02d}", car)
            scene.collection.objects.link(o)
            o.hide_render = True
            cars[key].append(o)
    return cars


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
        for s in child.material_slots:
            src = s.material
            if src is None:
                continue
            m = src.copy()
            s.link = "OBJECT"
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
            s.material = m


def strip(arm, action, start, end, hold=False, loop=False, upto=1.0, at=None):
    ad = arm.animation_data
    tr = ad.nla_tracks.new()
    a = bpy.data.actions[action]
    s = tr.strips.new(action, int(start), a)
    length = (a.frame_range[1] - a.frame_range[0]) * upto
    if upto < 1.0:
        s.action_frame_end = a.frame_range[0] + length
    if loop:
        s.repeat = max(0.01, (end - start) / length)
    elif not hold:
        s.scale = max(0.05, (end - start) / length)
    if at is not None:
        # Hold one pose: the strip is a sliver of the action at `at`.
        s.action_frame_start = at
        s.action_frame_end = at + 0.25
    s.extrapolation = "HOLD_FORWARD" if hold else "NOTHING"
    s.blend_in = 4 if start > CUT else 0
    return s


def animate(people):
    stick, switch = people["stick"], people["switch"]
    for arm in (stick, switch):
        strip(arm, "Idle", CUT - 40, D, loop=True)
    r = T["react"]
    strip(switch, "Victory", r, r + 56)
    strip(switch, "Idle", r + 56, D, loop=True)
    # The slump, played to its lowest point and held there.
    strip(stick, "Defeat", r, r + 16, upto=0.44)
    a = bpy.data.actions["Defeat"]
    low = a.frame_range[0] + 0.44 * (a.frame_range[1] - a.frame_range[0])
    strip(stick, "Defeat", r + 16, D, hold=True, at=low)


# ---------------------------------------------------------------- camera

LENS, SENSOR = 34, 36
TAN_H = (SENSOR / 2) / LENS
TAN_V = TAN_H * H / W


def camera_at(f):
    """Eye level, a slow push in from the cut to the end."""
    t = ease((f - CUT) / (D - 1 - CUT))
    pos = Vector((0.08 * (1 - 2 * t), -8.2 + 0.3 * t, 1.55 - 0.04 * t))
    at = Vector((0.0, 0.0, 1.42))
    return pos, at


def project(p, cam_pos, target):
    w = (target - cam_pos).normalized()
    r = w.cross(Vector((0, 0, 1))).normalized()
    v = r.cross(w)
    d = p - cam_pos
    z = d.dot(w)
    return (d.dot(r) / z) / TAN_H, (d.dot(v) / z) / TAN_V, z


# ---------------------------------------------------------------- run


def track():
    """Each plinth's front, for its name, and the gap on the half line."""
    zh = PLINTH + 0.02 + (LAYERS / 2) * LAYER_H
    front = -(DEPTH + 0.4) / 2
    points = (
        Vector((CASE_X["stick"], front, -0.1)),
        Vector((CASE_X["switch"], front, -0.1)),
        Vector((0, -DEPTH / 2, zh + 0.12)),
    )
    rows = {}
    for f in range(CUT, D):
        cam, at = camera_at(f)
        row = []
        for p in points:
            x, y, z = project(p, cam, at)
            row.append([round(x * 0.5 + 0.5, 4), round(0.5 - y * 0.5, 4), 1 if z > 0 and abs(x) < 1 and abs(y) < 1 else 0])
        rows[f] = row
    # doors.py has written the close-up's labels here already: keep YOU
    # from those until the cut, and the studio's labels after it.
    off = [0.0, 0.0, 0]
    doors = json.load(open(OUT))
    merged = [[doors[f][0], off, off, off] if f < CUT else [off] + rows[f] for f in range(D)]
    json.dump(merged, open(OUT, "w"))
    print(f"wrote {OUT}: close-up to {CUT - 1}, studio from {CUT}; cars {len(LANDS['stick'])} and {len(LANDS['switch'])}")


def render():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(W, H)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = CUT, D - 1
    cars = build_set()

    people = {"stick": load("Casual_Male"), "switch": load("Casual2_Female")}
    dress(people["stick"], "#5D6B7E", "#C99272", "#3A2A20")
    dress(people["switch"], "#6E7A5A", "#8D5B3E", "#1E1A18")
    for key, arm in people.items():
        arm.location = (PERSON_X[key], -0.15, 0.08)
        # Turned a little towards their own case.
        arm.rotation_euler.z = math.radians(18 if key == "stick" else -18)
    animate(people)

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

    for key in CASE_X:
        sx = 1 if key == "switch" else -1
        light(f"spot-{key}", "SPOT", (CASE_X[key] + sx * 0.6, -2.6, 5.2), (CASE_X[key] + sx * 0.7, 0, 0.8), 1100, spot=38, color=(1.0, 0.95, 0.88))
    light("key", "AREA", (0, -5.5, 3.4), (0, 0, 1.1), 420, size=6, color=(1.0, 0.93, 0.86))
    light("rim", "AREA", (0, 2.6, 4.2), (0, 0, 1.0), 260, size=8, color=(0.8, 0.86, 1.0))

    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    cam.data.lens = LENS
    cam.data.sensor_width = SENSOR
    cam.data.sensor_fit = "HORIZONTAL"
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 4.0
    scene.camera = cam

    ng = bpy.data.node_groups.new("comp", "CompositorNodeTree")
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    rl = ng.nodes.new("CompositorNodeRLayers")
    glare = ng.nodes.new("CompositorNodeGlare")
    glare.inputs["Type"].default_value = "Bloom"
    glare.inputs["Threshold"].default_value = 1.0
    glare.inputs["Strength"].default_value = 0.35
    glare.inputs["Size"].default_value = 0.5
    outn = ng.nodes.new("NodeGroupOutput")
    ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
    ng.links.new(glare.outputs["Image"], outn.inputs[0])
    scene.compositing_node_group = ng
    scene.render.use_compositing = True

    os.makedirs(OUT, exist_ok=True)
    frames = [int(x) for x in os.environ["FRAMES"].split(",")] if os.environ.get("FRAMES") else range(CUT, D)
    scene.render.filepath = os.path.join(OUT, "warmup.png")
    bpy.ops.render.render(write_still=True)
    os.remove(scene.render.filepath)
    for f in frames:
        scene.frame_set(f)
        for key, objs in cars.items():
            for j, o in enumerate(objs):
                st = car_state(key, j, f)
                o.hide_render = st is None
                if st is None:
                    continue
                pos, flip, tilt = st
                o.location = pos
                o.rotation_euler = (0.0, tilt, 0.0 if flip > 0 else math.pi)
        pos, at = camera_at(f)
        cam.location = pos
        cam.rotation_euler = (at - pos).to_track_quat("-Z", "Y").to_euler()
        cam.data.dof.focus_distance = (Vector((0, 0, 1.0)) - pos).length
        scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
        bpy.ops.render.render(write_still=True)


if OUT.endswith(".json"):
    track()
else:
    render()
