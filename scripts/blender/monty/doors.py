"""The Monty Hall reel's doors: one game close up, then 300, rendered in Blender.

Run headless:
  Blender -b --factory-startup -P scripts/blender/monty/doors.py -- \
      public/vr45/timeline.json <frames dir | track.json>

A game is three doors, numbered 1 to 3, on a dark stage. Behind one is a
car, orange because it is the prize; behind the others, goats. The first
game plays close up: the host opens a goat door, then yours and the other
open together. The camera pulls back as the next 299 games rise around it,
they all play out in a wave, and then they slide apart: on the left the
games where sticking with door 1 won, on the right the ones where
switching did.

Given a directory, renders every frame into it (or only FRAMES=a,b,c).
Given a .json path, writes where Remotion's labels go on every frame
instead, without rendering.
"""

import json
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "deplane"))
import scene as base  # noqa: E402

args = sys.argv[sys.argv.index("--") + 1 :]
T = json.load(open(args[0]))
OUT = args[1]

W, H = 1620, 850
DOOR = (0.6, 0.06, 1.7)  # width, thickness, height
GAP = 0.08
UNIT = 3 * DOOR[0] + 2 * GAP
COLS, ROWS = 20, 15
SX, SY = 2.7, 2.9
LENS = 32
SENSOR = 36

GAMES = T["games"]
N = len(GAMES)
HOST, REVEAL, PULL, WAVE, SORT = T["hostOpens"], T["reveal"], T["pull"], T["wave"], T["sort"]

CHALK = base.hexrgb("#E8E6E1")
ORANGE = base.hexrgb("#FF7A33")


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ramp(f, a, b):
    return ease((f - a) / (b - a)) if b > a else float(f >= a)


def slot_x(d):
    """The left edge (the hinge) of door `d` within a game."""
    return -UNIT / 2 + d * (DOOR[0] + GAP)


# Where each game stands: the first at the front centre, the rest filling
# outwards and back.
CELLS = sorted(
    ((c, r) for r in range(ROWS) for c in range(COLS)),
    key=lambda cr: (cr[1], abs(cr[0] - (COLS - 1) / 2), cr[0]),
)


def cell_pos(c, r):
    return Vector(((c - (COLS - 1) / 2) * SX, r * SY, 0.0))


HOME = [cell_pos(*CELLS[k]) for k in range(N)]
DIST = [((HOME[k] - HOME[0]).length) for k in range(N)]
FAR = max(DIST)

# After sorting: sticking won on the left, switching won on the right,
# both blocks the same depth, so the widths compare.
STICK = [k for k in range(N) if GAMES[k][0] == 0]
SWITCH = [k for k in range(N) if GAMES[k][0] != 0]
LEFT_COLS, RIGHT_COLS = 7, 14
TARGET = {}
for i, k in enumerate(STICK):
    r, c = divmod(i, LEFT_COLS)
    TARGET[k] = Vector(((c - LEFT_COLS - 1.0) * SX, r * SY, 0.0))
for i, k in enumerate(SWITCH):
    r, c = divmod(i, RIGHT_COLS)
    TARGET[k] = Vector(((c + 1.0) * SX, r * SY, 0.0))


# ---------------------------------------------------------------- scene


def material(name, color, rough, emit=None, strength=0.0, metal=0.0):
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


def join(parts, name):
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    o = bpy.context.object
    o.name = name
    mesh = o.data
    mesh.name = name
    bpy.data.objects.remove(o)
    return mesh


def cube(size, loc, mat, rot=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = size
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if bevel:
        b = o.modifiers.new("b", "BEVEL")
        b.width = bevel
        b.segments = 2
        bpy.ops.object.modifier_apply(modifier="b")
    o.data.materials.append(mat)
    return o


def door_mesh(number, wood, trim, digits):
    """A door hinged on its left edge, its number on the front."""
    w, t, h = DOOR
    parts = [
        cube((w, t, h), (w / 2, 0, h / 2), wood, bevel=0.012),
        # A raised panel and a handle, so it reads as a door at any size.
        cube((w * 0.74, 0.012, h * 0.34), (w / 2, -t / 2 - 0.004, h * 0.72), wood, bevel=0.006),
        cube((w * 0.74, 0.012, h * 0.34), (w / 2, -t / 2 - 0.004, h * 0.3), wood, bevel=0.006),
        cube((0.03, 0.04, 0.12), (w - 0.07, -t / 2 - 0.02, h * 0.5), trim),
    ]
    bpy.ops.object.text_add(location=(0, 0, 0))
    txt = bpy.context.object
    txt.data.body = str(number)
    txt.data.align_x = "CENTER"
    txt.data.align_y = "CENTER"
    txt.data.size = 0.42
    txt.data.extrude = 0.008
    txt.rotation_euler = (math.pi / 2, 0, 0)
    txt.location = (w / 2, -t / 2 - 0.02, h * 0.72)
    bpy.ops.object.convert(target="MESH")
    txt = bpy.context.object
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    txt.data.materials.clear()
    txt.data.materials.append(digits)
    parts.append(txt)
    return join(parts, f"door{number}")


def frame_mesh(trim):
    """The lit frame around the three openings, and the back wall."""
    w, t, h = DOOR
    parts = []
    for d in range(3):
        x0 = slot_x(d)
        parts += [
            cube((0.035, 0.08, h + 0.07), (x0 - 0.0175, -0.02, (h + 0.07) / 2), trim),
            cube((0.035, 0.08, h + 0.07), (x0 + w + 0.0175, 0.02, (h + 0.07) / 2), trim),
            cube((w + 0.07, 0.08, 0.035), (x0 + w / 2, 0.02, h + 0.0175), trim),
        ]
    return join(parts, "frames")


def back_mesh(wall):
    return join([cube((UNIT + 0.2, 0.05, DOOR[2] + 0.2), (0, 1.4, (DOOR[2] + 0.2) / 2), wall)], "back")


def car_mesh(paint, glass, tyre, lamp):
    """The prize: a small car, facing you, scaled to fit behind a door."""
    s = 0.26
    L, Wd, Ht = 4.4 * s, 1.8 * s, 1.42 * s
    parts = [
        cube((Wd, L, 0.62 * s), (0, 0.7, 0.34 * s + 0.31 * s), paint, bevel=0.1 * s),
        cube((Wd * 0.84, L * 0.52, Ht - 0.96 * s), (0, 0.7 + L * 0.04, 0.96 * s + (Ht - 0.96 * s) / 2), glass, bevel=0.08 * s),
        cube((Wd * 0.8, L * 0.45, 0.07 * s), (0, 0.7 + L * 0.04, Ht - 0.02 * s), paint, bevel=0.03 * s),
    ]
    for sx in (1, -1):
        for sy in (1, -1):
            bpy.ops.mesh.primitive_cylinder_add(
                vertices=16, radius=0.33 * s, depth=0.24 * s,
                location=(sx * (Wd / 2 - 0.08 * s), 0.7 + sy * L * 0.32, 0.33 * s),
                rotation=(0, math.pi / 2, 0),
            )
            wh = bpy.context.object
            bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
            wh.data.materials.append(tyre)
            parts.append(wh)
        parts.append(cube((0.38 * s, 0.06 * s, 0.12 * s), (sx * (Wd / 2 - 0.3 * s), 0.7 - L / 2, 0.78 * s), lamp))
    return join(parts, "car")


def goat_mesh(fur, dark):
    """A goat, low-poly, facing you: body, legs, neck, head, horns, beard."""
    parts = [
        cube((0.16, 0.36, 0.16), (0, 0.34, 0.27), fur, bevel=0.03),
        cube((0.07, 0.07, 0.14), (0, 0.18, 0.4), fur, rot=(math.radians(-25), 0, 0), bevel=0.012),
        cube((0.09, 0.13, 0.08), (0, 0.13, 0.48), fur, rot=(math.radians(20), 0, 0), bevel=0.02),
        cube((0.03, 0.03, 0.06), (0, 0.075, 0.425), fur),  # beard
        cube((0.05, 0.02, 0.025), (0.06, 0.15, 0.5), fur),  # ears
        cube((0.05, 0.02, 0.025), (-0.06, 0.15, 0.5), fur),
        cube((0.018, 0.018, 0.09), (0.025, 0.17, 0.56), dark, rot=(math.radians(35), 0, 0)),  # horns
        cube((0.018, 0.018, 0.09), (-0.025, 0.17, 0.56), dark, rot=(math.radians(35), 0, 0)),
        cube((0.03, 0.05, 0.03), (0, 0.53, 0.33), fur),  # tail
    ]
    for x in (-0.05, 0.05):
        for y in (0.22, 0.46):
            parts.append(cube((0.035, 0.035, 0.2), (x, y, 0.1), fur))
    return join(parts, "goat")


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(W, H)
    scene = bpy.context.scene
    scene.frame_start = 0
    scene.frame_end = T["duration"] - 1

    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.002, 0.002, 0.0025, 1)
    scene.world = world

    floor = material("floor", base.hexrgb("#0A0B0D"), 0.2)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 20, 0))
    bpy.context.object.scale = (400, 400, 1)
    bpy.context.object.data.materials.append(floor)

    wood = material("door", base.hexrgb("#1F2228"), 0.42)
    trim = material("trim", CHALK, 0.4, emit=CHALK, strength=2.2)
    digits = material("digits", CHALK, 0.4, emit=CHALK, strength=3.0)
    wall = material("wall", base.hexrgb("#121317"), 0.6)
    paint = material("paint", ORANGE, 0.3, emit=ORANGE, strength=1.6, metal=0.2)
    glass = material("glass", base.hexrgb("#1B2430"), 0.12, metal=0.2)
    tyre = material("tyre", base.hexrgb("#141414"), 0.8)
    lamp = material("lamp", base.hexrgb("#FFF3D6"), 0.2, emit=base.hexrgb("#FFF3D6"), strength=4)
    fur = material("fur", base.hexrgb("#D9D4C7"), 0.75)
    dark = material("horn", base.hexrgb("#3A342C"), 0.6)

    doors = [door_mesh(n, wood, trim, digits) for n in (1, 2, 3)]
    frames = frame_mesh(trim)
    back = back_mesh(wall)
    car = car_mesh(paint, glass, tyre, lamp)
    goat = goat_mesh(fur, dark)

    games = []
    col = bpy.data.collections.new("games")
    scene.collection.children.link(col)
    for k, (c, _) in enumerate(GAMES):
        root = bpy.data.objects.new(f"g{k:03d}", None)
        col.objects.link(root)
        parts = {"root": root, "doors": []}
        for name, mesh in (("frames", frames), ("back", back)):
            o = bpy.data.objects.new(f"g{k:03d}{name}", mesh)
            o.parent = root
            col.objects.link(o)
        for d in range(3):
            prize = bpy.data.objects.new(f"g{k:03d}p{d}", car if d == c else goat)
            prize.location = (slot_x(d) + DOOR[0] / 2, 0, 0)
            if d != c:
                prize.scale = (1.5, 1.5, 1.5)
            prize.parent = root
            col.objects.link(prize)
            door = bpy.data.objects.new(f"g{k:03d}d{d}", doors[d])
            door.location = (slot_x(d), -0.06, 0)
            door.parent = root
            col.objects.link(door)
            parts["doors"].append(door)
        games.append(parts)

    # Stage light: a soft key from above the front, a cool fill, and a
    # spot on the first game for the close-up.
    for name, kind, loc, power, size in (
        ("key", "AREA", (0, -14, 22), 2600, 30),
        ("fill", "AREA", (-20, -10, 8), 500, 30),
        ("spot", "SPOT", (0, -5, 6), 900, 0.2),
    ):
        light = bpy.data.objects.new(name, bpy.data.lights.new(name, kind))
        light.data.energy = power
        if kind == "AREA":
            light.data.size = size
        else:
            light.data.spot_size = math.radians(40)
            light.data.spot_blend = 0.6
        light.location = loc
        scene.collection.objects.link(light)
        light.rotation_euler = (Vector((0, 1.0, 0.8)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()

    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    cam.data.lens = LENS
    cam.data.sensor_width = SENSOR
    cam.data.sensor_fit = "HORIZONTAL"
    cam.data.clip_start = 0.05
    cam.data.clip_end = 2000
    cam.data.dof.use_dof = True
    scene.camera = cam

    ng = bpy.data.node_groups.new("comp", "CompositorNodeTree")
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    rl = ng.nodes.new("CompositorNodeRLayers")
    glare = ng.nodes.new("CompositorNodeGlare")
    glare.inputs["Type"].default_value = "Bloom"
    glare.inputs["Quality"].default_value = "High"
    glare.inputs["Threshold"].default_value = 0.9
    glare.inputs["Strength"].default_value = 0.5
    glare.inputs["Size"].default_value = 0.55
    outn = ng.nodes.new("NodeGroupOutput")
    ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
    ng.links.new(glare.outputs["Image"], outn.inputs[0])
    scene.compositing_node_group = ng
    scene.render.use_compositing = True
    return scene, games, cam


# ---------------------------------------------------------------- states


def times(k):
    """When game `k`'s host door opens, and when the other two open."""
    if k == 0:
        return HOST, REVEAL
    h = WAVE + 46 * DIST[k] / FAR
    return h, h + 12


def state(k, f):
    """Where game `k` stands, how big it is, and how far each door is open."""
    car, opened = GAMES[k]
    h, r = times(k)
    angles = []
    for d in range(3):
        t = ramp(f, h, h + 10) if d == opened else ramp(f, r, r + 12)
        angles.append(-math.radians(108) * t)
    rise = 1.0 if k == 0 else ramp(f, PULL + 2 + 20 * DIST[k] / FAR, PULL + 12 + 20 * DIST[k] / FAR)
    a = SORT + 26 * DIST[k] / FAR
    t = ramp(f, a, a + 26)
    loc = HOME[k].lerp(TARGET[k], t) + Vector((0, 0, 0.9 * math.sin(math.pi * t)))
    return loc, rise, angles


# ---------------------------------------------------------------- camera


def box(points, top):
    xs = [p.x for p in points]
    ys = [p.y for p in points]
    return (min(xs) - UNIT / 2 - 0.2, max(xs) + UNIT / 2 + 0.2, min(ys) - 0.1, max(ys) + 0.7, top)


FIRST = box([HOME[0]], DOOR[2] + 0.1)
FIELD = box(HOME, DOOR[2])
SORTED = box(list(TARGET.values()), DOOR[2])
KEYS = [
    (0, FIRST),
    (PULL - 4, FIRST),
    (WAVE + 20, FIELD),
    (SORT, FIELD),
    (SORT + 56, SORTED),
    (T["duration"] - 1, SORTED),
]
WIDEST = max(FIELD[1] - FIELD[0], FIELD[3] - FIELD[2])


def box_at(f):
    if f <= KEYS[0][0]:
        return KEYS[0][1]
    for (fa, a), (fb, b) in zip(KEYS, KEYS[1:]):
        if fa <= f <= fb:
            t = ease((f - fa) / (fb - fa))
            out = []
            for lo, hi in ((0, 1), (2, 3)):
                ca, cb = (a[lo] + a[hi]) / 2, (b[lo] + b[hi]) / 2
                sa, sb = a[hi] - a[lo], b[hi] - b[lo]
                c = ca + (cb - ca) * t
                s = math.exp(math.log(sa) + (math.log(sb) - math.log(sa)) * t)
                out += [c - s / 2, c + s / 2]
            out.append(a[4] + (b[4] - a[4]) * t)
            return tuple(out)
    return KEYS[-1][1]


def closeness(size):
    return max(0.0, min(1.0, math.log(max(size, 1.0) / 2.4) / math.log(WIDEST / 2.4)))


TAN_H = (SENSOR / 2) / LENS
TAN_V = TAN_H * H / W


def project(p, cam_pos, target):
    w = (target - cam_pos).normalized()
    r = w.cross(Vector((0, 0, 1))).normalized()
    v = r.cross(w)
    d = p - cam_pos
    z = d.dot(w)
    return (d.dot(r) / z) / TAN_H, (d.dot(v) / z) / TAN_V, z


def frame_camera(f):
    x0, x1, y0, y1, top = box_at(f)
    s = closeness(max(x1 - x0, y1 - y0))
    target = Vector(((x0 + x1) / 2, (y0 + y1) / 2, top * (0.5 - 0.25 * s)))
    az = math.radians(-8 + 10 * f / T["duration"])
    el = math.radians(6 + 36 * math.sqrt(s))
    u = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
    fx = 0.62 + 0.2 * s
    fy = 0.6 + 0.22 * s
    pts = [Vector((x, y, z)) for x in (x0, x1) for y in (y0, y1) for z in (0, top)]
    a, b = 0.6, 400.0
    for _ in range(50):
        m = (a + b) / 2
        c = target + u * m
        if all(abs(x) <= fx and abs(y) <= fy and z > 0.2 for x, y, z in (project(p, c, target) for p in pts)):
            b = m
        else:
            a = m
    return target + u * b, target, b


def place_camera(cam, f):
    pos, target, dist = frame_camera(f)
    cam.location = pos
    cam.rotation_euler = (target - pos).to_track_quat("-Z", "Y").to_euler()
    cam.data.dof.focus_distance = dist
    cam.data.dof.aperture_fstop = max(2.8, dist * 0.35)


# ---------------------------------------------------------------- output


def track():
    """Door 1 of the first game, and the top centre of each sorted block."""
    def above(ks):
        xs = [TARGET[k].x for k in ks]
        back = max(TARGET[k].y for k in ks)
        return Vector(((min(xs) + max(xs)) / 2, back, DOOR[2] + 0.9))

    stick_front = above(STICK)
    switch_front = above(SWITCH)
    rows = []
    for f in range(T["duration"]):
        pos, target = frame_camera(f)[:2]
        loc, _, _ = state(0, f)
        you = loc + Vector((slot_x(0) + DOOR[0] / 2, -0.1, DOOR[2] + 0.12))
        row = []
        for p in (you, stick_front, switch_front):
            x, y, z = project(p, pos, target)
            row.append([round(x * 0.5 + 0.5, 4), round(0.5 - y * 0.5, 4),
                        1 if z > 0 and abs(x) < 1 and abs(y) < 1 else 0])
        rows.append(row)
    json.dump(rows, open(OUT, "w"))
    print(f"wrote {OUT}")


def render():
    scene, games, cam = build()
    os.makedirs(OUT, exist_ok=True)
    frames = (
        [int(x) for x in os.environ["FRAMES"].split(",")]
        if os.environ.get("FRAMES")
        else range(T["duration"])
    )
    spot = bpy.data.objects["spot"]
    scene.render.filepath = os.path.join(OUT, "warmup.png")
    bpy.ops.render.render(write_still=True)
    os.remove(scene.render.filepath)
    for f in frames:
        scene.frame_set(f)
        for k, g in enumerate(games):
            loc, rise, angles = state(k, f)
            g["root"].location = loc
            g["root"].scale = (1, 1, max(rise, 0.001))
            g["root"].hide_render = rise <= 0.001
            for c in g["root"].children:
                c.hide_render = rise <= 0.001
            for d, door in enumerate(g["doors"]):
                door.rotation_euler.z = angles[d]
        spot.data.energy = 900 * (1 - ramp(f, PULL, PULL + 30))
        place_camera(cam, f)
        scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
        bpy.ops.render.render(write_still=True)


if OUT.endswith(".json"):
    track()
else:
    render()
