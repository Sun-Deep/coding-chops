"""The SQL reel's mailroom: 1,000 orders as parcels, rendered in Blender.

Run headless:
  Blender -b --factory-startup -P scripts/blender/sql/mailroom.py -- \
      public/vr44/timeline.json <frames dir | track.json>

Eye level, in a dark mailroom. A sorting table in front, a wall of 98
cubbies behind it, one per customer, and a worker at the end of the table.
Every order is one parcel; the paid ones carry a white label. The query
happens to them in the order Postgres runs it:

  FROM      1,000 parcels pour onto the table;
  WHERE     the unpaid ones slide off the end into the returns bin;
  GROUP BY  the paid ones fly into their customer's cubby;
  HAVING    a shutter rolls down on every cubby with fewer than 8;
  SELECT    sum(amount): each open cubby's parcels become one stack of
            coins, as tall as the customer's total, in orange, because
            this is what SELECT makes;
  ORDER BY  the stacks come out onto the table where the heap was, in a
            line, tallest first;
  LIMIT     all but the first 5 are swept off the back of the table.

The cubbies are in name order, the order GROUP BY's piles are listed in.

Given a directory, renders every frame into it (or only FRAMES=a,b,c).
Given a .json path, writes where Remotion's labels go on every frame:
the foot of each of the five stacks the query returns, and the end of the
table the unpaid parcels leave by.
"""

import json
import math
import os
import random
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

S = T["stages"]
WHERE, GROUP, HAVING, SELECT, ORDER, LIMIT = (
    S["WHERE"], S["GROUP BY"], S["HAVING"], S["SELECT"], S["ORDER BY"], S["LIMIT"],
)
CARDS = T["cards"]
N = len(CARDS)
NPILES = T["piles"]
KEPT = T["kept"]
MAXT = T["maxTotal"]

W, H = 1620, 850
SCALE = 0.8

BOX = (0.085, 0.065, 0.058)
TABLE = Vector((-0.15, -1.35, 0.86))  # centre of the table top
TABLE_W, TABLE_D = 2.7, 0.9
COLS, ROWS = 14, 7
CUB_W, CUB_H, CUB_D = 0.32, 0.34, 0.3
WALL_Y = 0.15
WALL_Z = 1.0
BIN = Vector((1.75, -1.35, 0.0))
COIN_R, COIN_T = 0.034, 0.0034
COINS_MAX = 80  # the biggest total's stack: about 0.3 m, a cubby high
FIVE_X = -0.75
FIVE_GROW = 1.6  # the five grow alike at the end, so their heights still compare
# Where the camera ends, relative to the five: x offset, y, height, and how
# far above the table it looks.
END = (0.5, -4.7, 1.75, 0.0)
PERSON = Vector((2.45, -0.38, 0.0))

ORANGE = base.hexrgb("#FF7A33")
CHALK = base.hexrgb("#E8E6E1")


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ramp(f, a, b):
    return ease((f - a) / (b - a)) if b > a else float(f >= a)


def clamp01(t):
    return max(0.0, min(1.0, t))


# ---------------------------------------------------------------- layout

rng = random.Random(44)

# The heap: each parcel lands on the table where the pile is, so the
# heap is a mound, highest in the middle.
CELL = 0.09
heights = {}
HEAP = []
for i in range(N):
    while True:
        x = rng.gauss(0, 0.6)
        y = rng.gauss(0, 0.22)
        if abs(x) < TABLE_W / 2 - 0.25 and abs(y) < TABLE_D / 2 - 0.08:
            break
    key = (round(x / CELL), round(y / CELL))
    z = heights.get(key, 0.0)
    heights[key] = z + BOX[2] * 0.92
    HEAP.append((Vector((TABLE.x + x, TABLE.y + y, TABLE.z + z)), rng.uniform(-0.7, 0.7)))
# Parcels land bottom first.
ORDER_IN = sorted(range(N), key=lambda i: HEAP[i][0].z + rng.random() * 0.02)
LAND = {i: 2 + 46 * k / N for k, i in enumerate(ORDER_IN)}


def cubby(p):
    """The bottom centre of cubby p, filled in name order, top row first."""
    r, c = divmod(p, COLS)
    x = (c - (COLS - 1) / 2) * CUB_W
    z = WALL_Z + (ROWS - 1 - r) * CUB_H
    return Vector((x, WALL_Y - CUB_D / 2, z))


def in_cubby(card):
    """Where a paid parcel rests in its customer's cubby: three a layer."""
    base_ = cubby(card["pile"])
    k = card["slot"]
    layer, col = divmod(k, 3)
    return base_ + Vector(((col - 1) * 0.092, 0.02 + (layer % 2) * 0.01, 0.006 + layer * BOX[2] * 0.95))


SURVIVES = {c["pile"]: c["keeps"] for c in CARDS if c["paid"]}
REPS = sorted((c for c in CARDS if c["rep"]), key=lambda c: c["rank"])  # one per pile kept
RANK_OF_PILE = {c["pile"]: c["rank"] for c in REPS}
TOTAL_OF_PILE = {c["pile"]: c["total"] for c in REPS}


def coins(total):
    """Coins in a stack: its height is the customer's total."""
    return max(1, round(COINS_MAX * total / MAXT))


def select_at(p):
    """When kept pile p's parcels turn into its stack."""
    return SELECT + 4 + 16 * RANK_OF_PILE[p] / len(RANK_OF_PILE)


# ---------------------------------------------------------------- motion


def parcel_state(i, f):
    """Location and yaw of parcel i on frame f, or None once it is gone."""
    c = CARDS[i]
    rest, yaw = HEAP[i]
    land = LAND[i]
    if f < land - 9:
        return None
    if f < land:
        t = (f - (land - 9)) / 9
        drop = Vector((rest.x * 0.6 - 0.05, rest.y, 3.9))
        return Vector((drop.x + (rest.x - drop.x) * t, rest.y, drop.z + (rest.z - drop.z) * t * t)), yaw + 2 * (1 - t), 1.0
    if not c["paid"]:
        # Slide along the table to its right end, then drop into the bin.
        a = WHERE + 4 + 24 * (rest.x - TABLE.x + TABLE_W / 2) / TABLE_W + rng_off(i, 5)
        t = clamp01((f - a) / 14)
        if t <= 0:
            return rest, yaw, 1.0
        edge = Vector((TABLE.x + TABLE_W / 2 + 0.05, rest.y * 0.5 + TABLE.y * 0.5, TABLE.z + 0.04))
        if t < 0.7:
            u = ease(t / 0.7)
            return rest.lerp(edge, u), yaw * (1 - u), 1.0
        u = (t - 0.7) / 0.3
        into = Vector((BIN.x, BIN.y + (rest.y - TABLE.y) * 0.4, 0.25))
        p = edge.lerp(into, u)
        p.z = edge.z + (into.z - edge.z) * u * u
        return (p, yaw, 1.0) if t < 1 else None
    # Paid: wait, then fly to the cubby in an arc.
    target = in_cubby(c)
    a = GROUP + 2 + 34 * ((c["pile"] % COLS) / COLS) + rng_off(i, 10)
    t = clamp01((f - a) / 16)
    if t <= 0:
        return rest, yaw, 1.0
    p = rest.lerp(target, ease(t))
    p.z += 0.7 * math.sin(math.pi * t)
    p.y -= 0.15 * math.sin(math.pi * t)
    # A kept pile's parcels shrink away as SELECT turns them into coins.
    size = 1.0 - ramp(f, select_at(c["pile"]), select_at(c["pile"]) + 6) if c["keeps"] else 1.0
    if size <= 0.001:
        return None
    return p, yaw * (1 - ease(t)), size


def rng_off(i, span):
    return ((i * 2654435761) % 1000) / 1000 * span


def shutter(p, f):
    """How far down cubby p's shutter is, 0 to 1."""
    if SURVIVES.get(p, False):
        return 0.0
    r, c = divmod(p, COLS)
    a = HAVING + 4 + 1.2 * c + 1.4 * r
    return ramp(f, a, a + 7)


def table_spot(rank):
    """Where a stack stands on the table after ORDER BY: tallest at the left."""
    span = TABLE_W - 0.28
    return Vector((TABLE.x - span / 2 + rank * span / (len(RANK_OF_PILE) - 1), TABLE.y + 0.1, TABLE.z))


def stack_state(p, f):
    """Where kept pile p's coin stack stands, how much of it is built, and
    its scale; None before SELECT makes it and after LIMIT drops it."""
    rank = RANK_OF_PILE[p]
    a = select_at(p)
    built = ramp(f, a + 3, a + 15)
    if built <= 0:
        return None
    home = cubby(p) + Vector((0, -0.01, 0.006))
    b = ORDER + 2 + rank * 0.9
    t = ramp(f, b, b + 14)
    pos = home.lerp(table_spot(rank), t)
    pos.z += 0.5 * math.sin(math.pi * t)
    pos.y -= 0.3 * math.sin(math.pi * t)
    if rank < KEPT:
        u = ramp(f, LIMIT + 10, LIMIT + 24)
        five = Vector((FIVE_X + (rank - (KEPT - 1) / 2) * 0.34, TABLE.y, TABLE.z))
        return pos.lerp(five, u), built, 1 + (FIVE_GROW - 1) * u
    # Swept off the back of the table, smallest last.
    c0 = LIMIT + 2 + (rank - KEPT) * 0.4
    g = clamp01((f - c0) / 12)
    if g >= 1:
        return None
    back = min(g / 0.6, 1.0)
    fall = max(0.0, (g - 0.6) / 0.4)
    return pos + Vector((0, 0.62 * ease(back), -1.2 * fall * fall)), built, 1.0


# ---------------------------------------------------------------- scene


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


def cube(size, loc, material, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
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


def as_mesh(parts, name):
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    o = bpy.context.object
    mesh = o.data
    mesh.name = name
    bpy.data.objects.remove(o)
    return mesh


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(W, H)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 0, D - 1
    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0022, 0.002, 0.0019, 1)
    scene.world = world

    floor = mat("floor", base.hexrgb("#121110"), 0.7)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
    bpy.context.object.scale = (40, 40, 1)
    bpy.context.object.data.materials.append(floor)
    back = mat("back", base.hexrgb("#121317"), 0.8)
    cube((14, 0.2, 7), (0, WALL_Y + CUB_D / 2 + 0.15, 3.5), back)

    # The cubby wall: dark shelving, a faint lit lip on every shelf.
    shelf = mat("shelf", base.hexrgb("#24262C"), 0.55, metal=0.2)
    lip = mat("lip", CHALK, 0.5, emit=CHALK, strength=0.5)
    inner = mat("inner", base.hexrgb("#17181C"), 0.8)
    wall_w = COLS * CUB_W
    cube((wall_w + 0.06, CUB_D, 0.04), (0, WALL_Y, WALL_Z + ROWS * CUB_H), shelf)
    cube((wall_w + 0.4, CUB_D + 0.1, WALL_Z), (0, WALL_Y, WALL_Z / 2), shelf)
    cube((wall_w, 0.02, ROWS * CUB_H), (0, WALL_Y + CUB_D / 2, WALL_Z + ROWS * CUB_H / 2), inner)
    for r in range(ROWS + 1):
        z = WALL_Z + r * CUB_H
        cube((wall_w + 0.06, CUB_D, 0.025), (0, WALL_Y, z), shelf)
        cube((wall_w + 0.06, 0.012, 0.008), (0, WALL_Y - CUB_D / 2 - 0.006, z + 0.014), lip)
    for c in range(COLS + 1):
        x = -wall_w / 2 + c * CUB_W
        cube((0.025, CUB_D, ROWS * CUB_H), (x, WALL_Y, WALL_Z + ROWS * CUB_H / 2), shelf)

    # The table, the returns bin and the line.
    wood = mat("table", base.hexrgb("#2A2520"), 0.6)
    leg = mat("leg", base.hexrgb("#1C1C1E"), 0.4, metal=0.5)
    cube((TABLE_W, TABLE_D, 0.05), (TABLE.x, TABLE.y, TABLE.z - 0.025), wood, bevel=0.01)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cube((0.05, 0.05, TABLE.z - 0.05), (TABLE.x + sx * (TABLE_W / 2 - 0.08), TABLE.y + sy * (TABLE_D / 2 - 0.08), (TABLE.z - 0.05) / 2), leg)
    binm = mat("bin", base.hexrgb("#2B2D33"), 0.5, metal=0.3)
    cube((0.55, 0.75, 0.62), (BIN.x + 0.05, BIN.y, 0.31), binm, bevel=0.02)
    cube((0.56, 0.012, 0.012), (BIN.x + 0.05, BIN.y - 0.38, 0.6), lip)

    # Parcels: brown card; the paid ones carry a white label.
    card = mat("card", base.hexrgb("#6E5E4C"), 0.85)
    card2 = mat("card2", base.hexrgb("#2C2723"), 0.9)
    label = mat("label", CHALK, 0.6, emit=CHALK, strength=0.6)
    paid_mesh = as_mesh([
        cube(BOX, (0, 0, BOX[2] / 2), card, bevel=0.004),
        cube((BOX[0] * 0.55, 0.002, BOX[2] * 0.5), (0, -BOX[1] / 2 - 0.001, BOX[2] / 2), label),
        cube((BOX[0] * 0.55, BOX[1] * 0.5, 0.002), (0, 0, BOX[2] + 0.001), label),
    ], "paid")
    unpaid_mesh = as_mesh([cube(BOX, (0, 0, BOX[2] / 2), card2, bevel=0.004)], "unpaid")
    parcels = []
    for c in CARDS:
        o = bpy.data.objects.new(f"o{c['id']:04d}", paid_mesh if c["paid"] else unpaid_mesh)
        scene.collection.objects.link(o)
        parcels.append(o)

    # Shutters, one per cubby, rolled up out of sight until HAVING.
    dark = mat("shutter", base.hexrgb("#0D0E11"), 0.6, metal=0.3)
    sh_mesh = as_mesh([cube((CUB_W - 0.03, 0.012, CUB_H - 0.03), (0, 0, -(CUB_H - 0.03) / 2), dark)], "shutter")
    shutters = []
    for p in range(NPILES):
        o = bpy.data.objects.new(f"s{p:02d}", sh_mesh)
        scene.collection.objects.link(o)
        shutters.append(o)

    # Coin stacks: one per kept pile, a coin repeated to the customer's total.
    gold = mat("coin", ORANGE, 0.35, emit=ORANGE, strength=0.35, metal=0.6)
    bpy.ops.mesh.primitive_cylinder_add(vertices=28, radius=COIN_R, depth=COIN_T, location=(0, 0, COIN_T / 2))
    coin = bpy.context.object
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    b = coin.modifiers.new("b", "BEVEL")
    b.width = COIN_T * 0.3
    b.segments = 2
    bpy.ops.object.modifier_apply(modifier="b")
    coin.data.materials.append(gold)
    coin_mesh = coin.data
    bpy.data.objects.remove(coin)
    stacks = {}
    for p in RANK_OF_PILE:
        o = bpy.data.objects.new(f"stack{p:02d}", coin_mesh)
        scene.collection.objects.link(o)
        arr = o.modifiers.new("coins", "ARRAY")
        arr.relative_offset_displace = (0, 0, 1.12)
        arr.count = coins(TOTAL_OF_PILE[p])
        o.hide_render = True
        stacks[p] = o

    # Light: warm lamps over the wall and the table, a cool rim.
    def light(name, kind, loc, at, energy, size=1.0, spot=None, color=(1, 1, 1)):
        L = bpy.data.objects.new(name, bpy.data.lights.new(name, kind))
        L.data.energy = energy
        L.data.color = color
        if kind == "AREA":
            L.data.size = size
        if spot:
            L.data.spot_size = math.radians(spot)
            L.data.spot_blend = 0.6
        L.location = loc
        L.rotation_euler = (Vector(at) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        scene.collection.objects.link(L)

    light("wall", "AREA", (0, -2.2, 4.4), (0, WALL_Y, 2.0), 700, size=5, color=(1.0, 0.9, 0.78))
    light("table", "SPOT", (TABLE.x, TABLE.y - 0.6, 3.4), TABLE, 900, spot=60, color=(1.0, 0.9, 0.8))
    light("fill", "AREA", (-3, -5, 2.5), (0, 0, 1.5), 160, size=4, color=(0.85, 0.9, 1.0))

    person = load("Worker_Male")
    skin(person, "#B9825F")
    person.location = PERSON
    person.rotation_euler.z = math.radians(-28)
    ad = person.animation_data
    strip(person, "Idle", 0, D, loop=True)
    strip(person, "PickUp", WHERE, WHERE + 30)
    strip(person, "Idle", WHERE + 30, D, loop=True)
    # Job done: he walks off to the right as the camera moves in.
    strip(person, "Walk", LIMIT, D, loop=True)
    del ad

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
    glare.inputs["Strength"].default_value = 0.3
    glare.inputs["Size"].default_value = 0.5
    outn = ng.nodes.new("NodeGroupOutput")
    ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
    ng.links.new(glare.outputs["Image"], outn.inputs[0])
    scene.compositing_node_group = ng
    scene.render.use_compositing = True
    return scene, parcels, shutters, stacks, person, cam


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


def skin(arm, color):
    """The pack's skin imports black here; give it a colour."""
    for child in arm.children_recursive:
        if child.type != "MESH":
            continue
        for slot in child.material_slots:
            src = slot.material
            if src is None or src.name.split(".")[0] != "Skin":
                continue
            m = src.copy()
            slot.link = "OBJECT"
            m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = base.hexrgb(color)
            slot.material = m


def strip(arm, action, start, end, loop=False):
    tr = arm.animation_data.nla_tracks.new()
    a = bpy.data.actions[action]
    s = tr.strips.new(action, int(start), a)
    length = a.frame_range[1] - a.frame_range[0]
    if loop:
        s.repeat = max(0.01, (end - start) / length)
    else:
        s.scale = max(0.05, (end - start) / length)
    s.extrapolation = "NOTHING"
    s.blend_in = 4 if start > 0 else 0
    return s


# ---------------------------------------------------------------- camera

LENS, SENSOR = 34, 36
TAN_H = (SENSOR / 2) / LENS
TAN_V = TAN_H * H / W


def camera_at(f):
    """Eye level across the room; at LIMIT, in towards the five stacks."""
    t = f / (D - 1)
    pos = Vector((0.2 - 0.4 * t, -6.1, 1.7))
    at = Vector((0.0, 0.0, 2.0))
    u = ramp(f, LIMIT + 6, LIMIT + 40)
    pos = pos.lerp(Vector((FIVE_X + END[0], END[1], END[2])), u)
    at = at.lerp(Vector((FIVE_X + END[0], TABLE.y, TABLE.z + END[3])), u)
    return pos, at


def project(p, cam_pos, target):
    w = (target - cam_pos).normalized()
    r = w.cross(Vector((0, 0, 1))).normalized()
    v = r.cross(w)
    d = p - cam_pos
    z = d.dot(w)
    return (d.dot(r) / z) / TAN_H, (d.dot(v) / z) / TAN_V, z


# ---------------------------------------------------------------- output


def track():
    five = [c["pile"] for c in REPS[:KEPT]]
    rows = []
    for f in range(D):
        cam, at = camera_at(f)
        row = []
        # The front of each stack's foot, on the table.
        points = []
        for p in five:
            st = stack_state(p, f)
            pos, _, k = st if st else (cubby(p), 0, 1)
            points.append(pos + Vector((0, -COIN_R * k - 0.02, 0)))
        # Just above the table's end, where the unpaid parcels leave it.
        points.append(Vector((TABLE.x + TABLE_W / 2 - 0.05, TABLE.y, TABLE.z + 0.4)))
        for p in points:
            x, y, z = project(p, cam, at)
            row.append([round(x * 0.5 + 0.5, 4), round(0.5 - y * 0.5, 4), 1 if z > 0 and abs(x) < 1 and abs(y) < 1 else 0])
        rows.append(row)
    json.dump(rows, open(OUT, "w"))
    print(f"wrote {OUT}")


def render():
    scene, parcels, shutters, stacks, person, cam = build()
    os.makedirs(OUT, exist_ok=True)
    frames = [int(x) for x in os.environ["FRAMES"].split(",")] if os.environ.get("FRAMES") else range(D)
    scene.render.filepath = os.path.join(OUT, "warmup.png")
    bpy.ops.render.render(write_still=True)
    os.remove(scene.render.filepath)
    for f in frames:
        scene.frame_set(f)
        for i, o in enumerate(parcels):
            st = parcel_state(i, f)
            o.hide_render = st is None
            if st is not None:
                o.location, yaw, size = st
                o.rotation_euler = (0, 0, yaw)
                o.scale = (size,) * 3
        for p, o in enumerate(shutters):
            down = shutter(p, f)
            o.hide_render = down <= 0.001
            top = cubby(p) + Vector((0, -0.012, CUB_H - 0.015))
            o.location = top
            o.scale = (1, 1, max(down, 0.001))
        go = ramp(f, LIMIT, LIMIT + 6)
        person.rotation_euler.z = math.radians(-28 + (90 + 28) * go)
        person.location = PERSON + Vector((1.6 * clamp01((f - LIMIT) / 34), 0, 0))
        for p, o in stacks.items():
            st = stack_state(p, f)
            o.hide_render = st is None
            if st is None:
                continue
            pos, built, k = st
            o.location = pos
            o.scale = (k,) * 3
            o.modifiers["coins"].count = max(1, round(coins(TOTAL_OF_PILE[p]) * built))
        pos, at = camera_at(f)
        cam.location = pos
        cam.rotation_euler = (at - pos).to_track_quat("-Z", "Y").to_euler()
        cam.data.dof.focus_distance = (Vector((at.x, WALL_Y - 0.4, at.z)) - pos).length
        scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
        bpy.ops.render.render(write_still=True)


if OUT.endswith(".json"):
    track()
else:
    render()
