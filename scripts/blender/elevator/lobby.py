"""The lift-door reel's set: an office lobby on a bright morning, one lift
in the back wall, glass doors to the street on the left.

Run: Blender -b --factory-startup -P scripts/blender/elevator/lobby.py -- <out.png>

Units are metres. The lift wall runs along X at y = 0 and faces -Y, toward
the camera; Z is up; the doorway is centred on x = 0. Behind it is the car,
lit inside, so people standing in it can be seen while the doors are open.
People come in from the street on the left and wait to the left of the
doors, which keeps the doorway in view. Characters are Quaternius's CC0
Ultimate Animated Character Pack, loaded and dressed by the deplaning reel's
set (scripts/blender/deplane/scene.py), which this file imports for its
helpers.
"""
import math
import os
import random
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "deplane"))
import scene as base  # noqa: E402

material = base.material
box = base.box
hexrgb = base.hexrgb

DOOR_W = 1.7
DOOR_H = 2.45
WALL_T = 0.3
ROOM_H = 4.0
CAR_W = 2.8
CAR_D = 2.4
CAR_H = 2.7
GLASS_X = -8.0
RIGHT_X = 4.6
# The pack's people are 2.2 units tall and mostly head: this makes them
# about 1.4 m, small enough that a crowd at the doors does not merge.
CHAR_SCALE = 0.64
ENTRANCE = (GLASS_X - 1.0, -6.4)

# Twelve places in the car, the order people fill them: back row first,
# middle out, so whoever got in last stands at the front by the doors.
SLOTS = [
    (-0.35, 2.05), (0.35, 2.05), (-1.0, 2.05), (1.0, 2.05),
    (-0.35, 1.4), (0.35, 1.4), (-1.0, 1.4), (1.0, 1.4),
    (-0.6, 0.8), (0.6, 0.8), (-1.1, 0.75), (1.1, 0.75),
]

# Where people wait: either side of the doors, nearest first, far enough
# apart that the pack's big heads do not touch.
SPOTS = [
    (-1.45, -1.15), (1.45, -1.15), (-2.55, -1.05), (2.55, -1.05),
    (-2.0, -2.2), (2.0, -2.2), (-3.1, -2.1), (-3.65, -1.0),
    (3.1, -2.1), (-2.6, -3.2), (-3.7, -3.1), (-4.6, -2.0),
]


def build_world():
    world = bpy.data.worlds.new("morning")
    world.use_nodes = True
    nt = world.node_tree
    bg = nt.nodes["Background"]
    bg.inputs["Color"].default_value = hexrgb("#BFD6EA")
    bg.inputs["Strength"].default_value = 0.8
    bpy.context.scene.world = world


def build_lights():
    scene = bpy.context.scene
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    scene.collection.objects.link(sun)
    sun.data.energy = 4.5
    sun.data.color = (1.0, 0.9, 0.76)
    sun.data.angle = math.radians(1.0)
    # Low morning sun through the street glass on the left, falling across
    # the floor toward the lift wall.
    sun.rotation_euler = Vector((0.78, 0.32, -0.54)).to_track_quat("-Z", "Y").to_euler()
    fill = bpy.data.objects.new("fill", bpy.data.lights.new("fill", "AREA"))
    scene.collection.objects.link(fill)
    fill.data.energy = 700
    fill.data.size = 12
    fill.data.color = (0.95, 0.97, 1.0)
    fill.location = (-3.0, -6.0, ROOM_H - 0.2)
    car = bpy.data.objects.new("car-light", bpy.data.lights.new("car-light", "AREA"))
    scene.collection.objects.link(car)
    car.data.energy = 220
    car.data.size = 2.0
    car.data.color = (1.0, 0.9, 0.75)
    car.location = (0, WALL_T / 2 + CAR_D / 2, CAR_H - 0.05)


def build_lobby():
    floor = material("floor", hexrgb("#D3CABD"), rough=0.14)
    seam = material("seam", hexrgb("#B0A697"), rough=0.4)
    walnut = material("walnut", hexrgb("#5C3F2C"), rough=0.55)
    slat = material("slat", hexrgb("#73513A"), rough=0.5)
    plaster = material("plaster", hexrgb("#E6E0D6"), rough=0.85)
    steel = material("steel", hexrgb("#B8BCC2"), rough=0.26, metal=0.9)
    dark = material("dark", hexrgb("#24262B"), rough=0.5)
    ceil = material("ceiling", hexrgb("#EEEAE3"), rough=0.9)
    panel = material("ceiling-light", hexrgb("#FFFFFF"), rough=0.5, emit=hexrgb("#FFF6EA"), strength=4.0)
    span_x = RIGHT_X - GLASS_X
    mid_x = (RIGHT_X + GLASS_X) / 2
    box("floor", (span_x + 30, 40, 0.1), (mid_x, -12, -0.05), floor)
    for k in range(int(GLASS_X), int(RIGHT_X) + 1, 2):
        box(f"seam-x{k}", (0.012, 16, 0.004), (k, -8, 0.001), seam)
    for k in range(0, 16, 2):
        box(f"seam-y{k}", (span_x, 0.012, 0.004), (mid_x, -k, 0.001), seam)
    box("ceiling", (span_x, 16, 0.1), (mid_x, -8, ROOM_H + 0.05), ceil)
    for i in range(5):
        for j in range(4):
            box(f"panel-{i}-{j}", (1.2, 1.2, 0.02), (GLASS_X + 1.8 + i * 2.8, -2.0 - j * 3.0, ROOM_H - 0.01), panel)
    # The lift wall: walnut cladding with a doorway cut in it.
    left = -DOOR_W / 2
    right = DOOR_W / 2
    box("wall-l", (left - GLASS_X, WALL_T, ROOM_H), ((left + GLASS_X) / 2, 0, ROOM_H / 2), walnut)
    box("wall-r", (RIGHT_X - right, WALL_T, ROOM_H), ((right + RIGHT_X) / 2, 0, ROOM_H / 2), walnut)
    box("wall-top", (DOOR_W, WALL_T, ROOM_H - DOOR_H), (0, 0, (ROOM_H + DOOR_H) / 2), walnut)
    x = GLASS_X + 0.3
    k = 0
    while x < RIGHT_X - 0.2:
        if not (left - 0.9 < x < right + 0.9):
            box(f"slat-{k}", (0.07, 0.04, ROOM_H), (x, -WALL_T / 2 - 0.02, ROOM_H / 2), slat)
            k += 1
        x += 0.26
    # Steel surround, the floor indicator and the call button.
    box("jamb-l", (0.14, 0.08, DOOR_H + 0.14), (left - 0.07, -WALL_T / 2 - 0.03, (DOOR_H + 0.14) / 2), steel)
    box("jamb-r", (0.14, 0.08, DOOR_H + 0.14), (right + 0.07, -WALL_T / 2 - 0.03, (DOOR_H + 0.14) / 2), steel)
    box("header", (DOOR_W + 0.28, 0.08, 0.14), (0, -WALL_T / 2 - 0.03, DOOR_H + 0.07), steel)
    box("sill", (DOOR_W + 0.1, WALL_T + 0.04, 0.02), (0, 0, 0.01), steel)
    box("indicator", (0.86, 0.06, 0.4), (0, -WALL_T / 2 - 0.03, DOOR_H + 0.5), dark, bevel=0.02)
    box("call-plate", (0.18, 0.03, 0.36), (right + 0.5, -WALL_T / 2 - 0.02, 1.15), steel)
    # The right wall and the street glass on the left, with a door in it.
    box("wall-right", (WALL_T, 16, ROOM_H), (RIGHT_X, -8, ROOM_H / 2), plaster)
    for k, y in enumerate((-0.6, -3.0, -5.0, -7.6, -10.0, -12.4)):
        box(f"mullion-{k}", (0.14, 0.14, ROOM_H), (GLASS_X, y, ROOM_H / 2), dark)
    box("transom", (0.16, 16, 0.16), (GLASS_X, -8, 2.9), dark)
    box("kick", (0.16, 16, 0.12), (GLASS_X, -8, 0.06), dark)
    # The street: a pavement and the building across the road, in sun.
    pave = material("pavement", hexrgb("#C9C4BC"), rough=0.7)
    facade = material("facade", hexrgb("#E9DCC6"), rough=0.8)
    win = material("window", hexrgb("#8FA8BF"), rough=0.1, metal=0.3)
    box("pavement", (12, 40, 0.12), (GLASS_X - 6.0, -10, -0.06), pave)
    box("facade", (1.0, 40, 16), (GLASS_X - 14.0, -10, 8), facade)
    for i in range(10):
        for j in range(4):
            box(f"win-{i}-{j}", (0.1, 1.6, 1.9), (GLASS_X - 13.45, 2.0 - i * 3.0, 1.6 + j * 3.2), win)
    # A reception desk at the back on the left, planters, a clock.
    oak = material("oak", hexrgb("#B48A5E"), rough=0.5)
    top = material("desk-top", hexrgb("#ECE7DE"), rough=0.3)
    box("desk", (2.4, 0.9, 1.05), (-6.2, -1.3, 0.525), oak, bevel=0.03)
    box("desk-top", (2.5, 1.0, 0.05), (-6.2, -1.3, 1.07), top, bevel=0.02)
    pot = material("pot", hexrgb("#3B3D42"), rough=0.6)
    leaf = material("leaf", hexrgb("#41703B"), rough=0.7)
    for k, x in enumerate((-4.3, 3.7)):
        box(f"pot-{k}", (0.6, 0.6, 0.7), (x, -0.7, 0.35), pot, bevel=0.03)
        for j, (dx, dz, r) in enumerate(((0, 1.15, 0.45), (0.2, 1.5, 0.33), (-0.18, 1.45, 0.3), (0.05, 1.82, 0.25))):
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=r, location=(x + dx, -0.7, dz))
            o = bpy.context.active_object
            o.name = f"leaf-{k}-{j}"
            o.data.materials.append(leaf)
    face = material("clock", hexrgb("#F4F1EA"), rough=0.4)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.32, depth=0.05, location=(-6.2, -WALL_T / 2 - 0.03, 2.9), rotation=(math.radians(90), 0, 0))
    bpy.context.active_object.data.materials.append(face)
    for k, (a, l) in enumerate(((math.radians(-60), 0.2), (math.radians(30), 0.26))):
        box(f"hand-{k}", (0.03, 0.01, l), (-6.2 + math.sin(a) * l / 2, -WALL_T / 2 - 0.06, 2.9 + math.cos(a) * l / 2), dark, rot=(0, a, 0))


def build_car():
    steel = material("car-wall", hexrgb("#A9ABAE"), rough=0.3, metal=0.85)
    floor = material("car-floor", hexrgb("#3A3330"), rough=0.6)
    ceiling = material("car-ceiling", hexrgb("#F2E6D2"), rough=0.4, emit=hexrgb("#FFE9C8"), strength=3.0)
    rail = material("rail", hexrgb("#D7D9DC"), rough=0.2, metal=1.0)
    y0 = WALL_T / 2
    box("car-floor", (CAR_W, CAR_D, 0.04), (0, y0 + CAR_D / 2, 0.0), floor)
    box("car-back", (CAR_W, 0.05, CAR_H), (0, y0 + CAR_D, CAR_H / 2), steel)
    box("car-l", (0.05, CAR_D, CAR_H), (-CAR_W / 2, y0 + CAR_D / 2, CAR_H / 2), steel)
    box("car-r", (0.05, CAR_D, CAR_H), (CAR_W / 2, y0 + CAR_D / 2, CAR_H / 2), steel)
    box("car-ceiling", (CAR_W, CAR_D, 0.04), (0, y0 + CAR_D / 2, CAR_H), ceiling)
    box("car-rail", (CAR_W - 0.2, 0.04, 0.04), (0, y0 + CAR_D - 0.08, 0.95), rail)
    # The empty shaft, seen through the seam while the car is away.
    shaft = material("shaft", hexrgb("#0E0F12"), rough=0.9)
    box("shaft", (DOOR_W, 0.02, DOOR_H), (0, 0.05, DOOR_H / 2), shaft).hide_render = True


CAR_PARTS = ("car-floor", "car-back", "car-l", "car-r", "car-ceiling", "car-rail", "car-light")


def build_doors():
    """Two panels that meet in the middle; `set_doors` slides them."""
    panel = material("door", hexrgb("#9AA1A8"), rough=0.4, metal=0.35)
    w = DOOR_W / 2 - 0.012
    a = box("door-l", (w, 0.04, DOOR_H), (-w / 2 - 0.007, 0.0, DOOR_H / 2), panel)
    b = box("door-r", (w, 0.04, DOOR_H), (w / 2 + 0.007, 0.0, DOOR_H / 2), panel)
    return a, b


def set_doors(a, b, openness):
    """Closed, the panels leave a thin dark seam between them."""
    # `box` bakes its position into the mesh, so the panels are built shut
    # and slide from there.
    w = DOOR_W / 2 - 0.012
    shift = openness * (w + 0.03)
    a.location.x = -shift
    b.location.x = shift


def build_indicator():
    """Floor numbers L and 1 to 10 above the doorway, one lit at a time,
    and up and down arrows. Returns name -> object."""
    lit = material("lcd", hexrgb("#EAF4FF"), rough=0.4, emit=hexrgb("#DDEEFF"), strength=6.0)
    out = {}
    z = DOOR_H + 0.4
    for name in ["L"] + [str(k) for k in range(1, 11)]:
        bpy.ops.object.text_add(location=(0.08, -WALL_T / 2 - 0.065, z), rotation=(math.radians(90), 0, 0))
        t = bpy.context.active_object
        t.name = f"floor-{name}"
        t.data.body = name
        t.data.size = 0.24
        t.data.align_x = "CENTER"
        t.data.extrude = 0.004
        t.data.materials.append(lit)
        t.hide_render = True
        out[name] = t
    for name, rot in (("up", 0), ("down", 180)):
        bpy.ops.mesh.primitive_cone_add(vertices=3, radius1=0.07, depth=0.01, location=(-0.24, -WALL_T / 2 - 0.065, z + 0.09), rotation=(math.radians(90), math.radians(rot), 0))
        a = bpy.context.active_object
        a.name = f"arrow-{name}"
        a.data.materials.append(lit)
        a.hide_render = True
        out[name] = a
    return out


def place(models, ids, you):
    """One dressed character per person id, parked out of sight."""
    rng = random.Random(11)
    people = {}
    for pid in ids:
        src = models[base.MODELS[(pid * 5 + 3) % len(base.MODELS)]]
        bpy.ops.object.select_all(action="DESELECT")
        for o in [src] + list(src.children_recursive):
            o.hide_viewport = False
            o.select_set(True)
        bpy.context.view_layer.objects.active = src
        bpy.ops.object.duplicate(linked=True)
        arm = bpy.context.view_layer.objects.active
        for o in [arm] + list(arm.children_recursive):
            o.hide_render = False
            o.hide_viewport = False
        for o in [src] + list(src.children_recursive):
            o.hide_viewport = True
        arm.name = f"p{pid}"
        arm.scale = (CHAR_SCALE,) * 3
        arm.location = (0, -40, 0)
        arm.rotation_mode = "XYZ"
        base.dress(arm, pid, rng, pid == you)
        arm.animation_data_create()
        people[pid] = arm
    return people


def heading(dx, dy):
    """Rotation about Z that points a pack character along (dx, dy)."""
    return math.atan2(dx, -dy)


CAM_FROM = (0.6, -9.2, 3.75)
CAM_AT = (-2.5, 0.0, 0.85)
# Where the camera ends up: in on the doors and the floor display, once the
# race is down to which car gets you to your floor first.
CAM_END = (0.7, -6.6, 2.9)
CAM_END_AT = (-1.1, 0.0, 1.45)


def camera():
    return base.camera(CAM_FROM, CAM_AT, lens=24)


def setup(scale=1.0):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(int(1560 * scale), int(760 * scale))
    build_world()
    build_lights()
    build_lobby()
    build_car()
    doors = build_doors()
    ind = build_indicator()
    return doors, ind


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    out = argv[0] if argv else "/tmp/lobby"
    doors, ind = setup()
    set_doors(*doors, 1.0)
    ind["L"].hide_render = False
    ind["up"].hide_render = False
    models = base.load_models()
    ids = list(range(14))
    people = place(models, ids, you=5)
    stand = bpy.data.actions["Idle"]
    for k, pid in enumerate(ids):
        arm = people[pid]
        if k < 7:
            x, y = SLOTS[k]
            arm.location = (x, y, 0)
            arm.rotation_euler = (0, 0, 0)
        elif k < 12:
            x, y = SPOTS[k - 7]
            arm.location = (x, y, 0)
            arm.rotation_euler = (0, 0, heading(-x, -y))
        else:
            arm.location = (-6.5 + (k - 12) * 1.5, -5.0 + (k - 12) * 0.8, 0)
            arm.rotation_euler = (0, 0, heading(1, 0.6))
        arm.animation_data.action = stand
    camera()
    bpy.context.scene.frame_set(10)
    bpy.context.scene.render.filepath = out
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main()
