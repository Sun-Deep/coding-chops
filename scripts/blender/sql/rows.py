"""The SQL reel's table: 1,000 orders as glowing rows, rendered in Blender.

Run headless:
  Blender -b --factory-startup -P scripts/blender/sql/rows.py -- \
      public/vr44/timeline.json <frames dir | track.json>

Every order is one row lying on a dark floor, three lit cells across it
(customer, status, amount), the table laid out like a printout. The query
then happens to it in the order Postgres runs it:

  WHERE     the unpaid rows sink and go dark, in scan order;
  GROUP BY  the paid rows fly into one stack per customer;
  HAVING    the stacks of fewer than 8 go dark;
  SELECT    each stack left becomes one row standing on end, its height the
            customer's total: it turns orange, because this is what SELECT
            makes;
  ORDER BY  the standing rows slide into a line, tallest first;
  LIMIT     all but the first 5 fall.

Given a directory, renders every frame into it (or only FRAMES=a,b,c).
Given a .json path, writes where the five result rows are on screen on
every frame instead, without rendering.
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
COLS = 20  # rows of the table side by side, like a printout's columns
ROW = (0.6, 0.2, 0.025)  # length, depth, thickness of one row
GAP_X, GAP_Y = 0.7, 0.27
PILE_COLS = 14
PILE_X, PILE_Y = 1.0, 1.55
BAR_X = 0.46
LAYER = 0.032
LENS = 30
SENSOR = 36
FIT_X, FIT_Y = 0.8, 0.82

S = T["stages"]
WHERE, GROUP, HAVING, SELECT, ORDER, LIMIT = (
    S["WHERE"], S["GROUP BY"], S["HAVING"], S["SELECT"], S["ORDER BY"], S["LIMIT"],
)
CARDS = T["cards"]
N = len(CARDS)
NPILES = T["piles"]
KEPT = T["kept"]
MAXT = T["maxTotal"]

CHALK = Vector(base.hexrgb("#E8E6E1")[:3])
ORANGE = Vector(base.hexrgb("#FF7A33")[:3])
LIVE = CHALK * 1.5
OFF = CHALK * 0.06
MADE = ORANGE * 5.0


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ramp(f, a, b):
    return ease((f - a) / (b - a)) if b > a else float(f >= a)


def grid(i):
    """Where order `i` (from 0) lies in the table: 20 columns of 50."""
    r, c = divmod(i, COLS)
    rows = N // COLS
    return Vector(((c - (COLS - 1) / 2) * GAP_X, (rows - 1 - r) * GAP_Y, 0.0))


def pile(p):
    """Where customer pile `p` stands, a grid of 14 by 7 over the table."""
    r, c = divmod(p, PILE_COLS)
    return Vector(((c - (PILE_COLS - 1) / 2) * PILE_X, 1.6 + r * PILE_Y, 0.0))


def bar(rank, n):
    """Where the result row of `rank` stands in the sorted line."""
    return Vector(((rank - (n - 1) / 2) * BAR_X, 5.6, 0.0))


def kept(rank):
    """Where the five that LIMIT keeps spread to, room between them for a
    name and room to their right for psql's answer."""
    return Vector((bar(0, NBARS).x + 0.4 + rank * 0.95, 5.6, 0.0))


NBARS = sum(1 for c in CARDS if c["rep"])


def height(total):
    return 0.45 + 2.0 * total / MAXT


# FROM: a band of light sweeps the table from the back row to the front
# as Postgres reads it, one row of the printout after another.
SCAN_FROM, SCAN_TO = 10, 58


def scan(i, f):
    """How bright row `i` is on frame `f` while FROM reads the table: dim
    until the band reaches it, a flash as it passes, then fully lit."""
    rows = N // COLS
    w = (f - SCAN_FROM) / (SCAN_TO - SCAN_FROM)
    r = (i // COLS) / (rows - 1)
    read = 0.1 + 0.9 * ease((w - r) / 0.04 + 0.5)
    return read * (1 + 5.0 * math.exp(-((r - w) ** 2) / 0.002))


# The paid rows in scan order, so they leave for their piles in the order
# the scan reaches them.
PAID_ORDER = {c["id"]: k for k, c in enumerate(x for x in CARDS if x["paid"])}
NPAID = len(PAID_ORDER)


# ---------------------------------------------------------------- scene


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(W, H)
    scene = bpy.context.scene
    scene.frame_start = 0
    scene.frame_end = T["duration"] - 1

    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.0016, 0.0017, 0.002, 1)
    scene.world = world

    floor = bpy.data.materials.new("floor")
    floor.use_nodes = True
    p = floor.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = base.hexrgb("#08090B")
    p.inputs["Roughness"].default_value = 0.14
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 6, 0))
    bpy.context.object.scale = (400, 400, 1)
    bpy.context.object.data.materials.append(floor)

    def glow(name, base_hex, rough, strength):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        nt = m.node_tree
        p = nt.nodes["Principled BSDF"]
        p.inputs["Base Color"].default_value = base.hexrgb(base_hex)
        p.inputs["Roughness"].default_value = rough
        p.inputs["Emission Strength"].default_value = strength
        info = nt.nodes.new("ShaderNodeObjectInfo")
        nt.links.new(info.outputs["Color"], p.inputs["Emission Color"])
        return m

    glass = glow("glass", "#0C0D10", 0.18, 0.04)
    cells = glow("cells", "#000000", 0.5, 1.0)

    # Three cells across a row: customer, status, amount. A few widths so
    # the table does not read as one stamp.
    WIDTHS = [
        (0.2, 0.1, 0.14),
        (0.16, 0.12, 0.12),
        (0.22, 0.09, 0.15),
        (0.18, 0.11, 0.1),
    ]

    def row_mesh(name, widths):
        bpy.ops.mesh.primitive_cube_add(size=1)
        r = bpy.context.object
        r.scale = ROW
        r.location = (0, ROW[1] / 2, ROW[2] / 2)
        bpy.ops.object.transform_apply(location=True, scale=True)
        bev = r.modifiers.new("bevel", "BEVEL")
        bev.width = 0.006
        bev.segments = 2
        bpy.ops.object.modifier_apply(modifier="bevel")
        r.data.materials.append(glass)
        r.data.materials.append(cells)
        parts = []
        x = -ROW[0] / 2 + 0.04
        for w in widths:
            bpy.ops.mesh.primitive_cube_add(size=1)
            b = bpy.context.object
            b.scale = (w, ROW[1] * 0.42, 0.006)
            b.location = (x + w / 2, ROW[1] / 2, ROW[2] + 0.002)
            bpy.ops.object.transform_apply(location=True, scale=True)
            b.data.materials.append(cells)
            parts.append(b)
            x += w + 0.035
        bpy.ops.object.select_all(action="DESELECT")
        for o in parts:
            o.select_set(True)
        r.select_set(True)
        bpy.context.view_layer.objects.active = r
        bpy.ops.object.join()
        r.data.name = name
        mesh = r.data
        bpy.data.objects.remove(r)
        return mesh

    meshes = [row_mesh(f"row {k}", w) for k, w in enumerate(WIDTHS)]
    objs = []
    col = bpy.data.collections.new("orders")
    scene.collection.children.link(col)
    for i, c in enumerate(CARDS):
        o = bpy.data.objects.new(f"o{c['id']:04d}", meshes[c["id"] * 7 % 4])
        o.location = grid(i)
        col.objects.link(o)
        objs.append(o)

    for name, loc, power, size in (
        ("key", (-8, 22, 26), 260, 24),
        ("fill", (8, -26, 18), 60, 40),
    ):
        light = bpy.data.objects.new(name, bpy.data.lights.new(name, "AREA"))
        light.data.energy = power
        light.data.size = size
        light.location = loc
        scene.collection.objects.link(light)
        light.rotation_euler = (
            (Vector((0, 6, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        )

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
    glare.inputs["Strength"].default_value = 0.65
    glare.inputs["Size"].default_value = 0.6
    out = ng.nodes.new("NodeGroupOutput")
    ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
    ng.links.new(glare.outputs["Image"], out.inputs[0])
    scene.compositing_node_group = ng
    scene.render.use_compositing = True
    return scene, objs, cam


# ---------------------------------------------------------------- states


def state(i, f):
    """Colour, location, tilt about x (radians), width, scale along the
    row's depth and overall scale of order `i` on frame `f`."""
    c = CARDS[i]
    colour = LIVE * scan(i, f)
    loc = grid(i)
    tilt = 0.0
    width = 1.0
    depth = 1.0
    size = 1.0

    if not c["paid"]:
        # WHERE: the scan reaches each unpaid row in turn and it sinks.
        t = ramp(f, WHERE + 18 * i / N, WHERE + 18 * i / N + 10)
        colour = LIVE.lerp(OFF, t)
        loc = loc + Vector((0, 0, -0.03 * t))
        return colour, loc, tilt, width, depth, size

    # GROUP BY: up off the table and onto the customer's stack.
    q = PAID_ORDER[c["id"]]
    a = GROUP + 30 * q / NPAID
    t = ramp(f, a, a + 18)
    top = pile(c["pile"]) + Vector((0, 0, c["slot"] * LAYER))
    loc = loc.lerp(top, t) + Vector((0, 0, 1.4 * math.sin(math.pi * t)))

    if not c["keeps"]:
        # HAVING: a stack of fewer than 8 goes dark and settles.
        d = HAVING + 14 * c["pile"] / NPILES
        t = ramp(f, d, d + 10)
        colour = LIVE.lerp(OFF, t)
        loc = loc.lerp(pile(c["pile"]) + Vector((0, 0, c["slot"] * LAYER * 0.35)), t)
        return colour, loc, tilt, width, depth, size

    if f < SELECT:
        return colour, loc, tilt, width, depth, size

    base_loc = pile(c["pile"])
    if not c["rep"]:
        # SELECT: the rest of the stack folds into its one result row.
        a = SELECT + c["slot"] * 0.9
        t = ramp(f, a, a + 10)
        loc = loc.lerp(base_loc + Vector((0, 0, 0.1)), t)
        size = 1 - t
        colour = LIVE.lerp(MADE, t)
        return colour, loc, tilt, width, depth, size

    # SELECT: the result row stands on end, as tall as the total.
    t = ramp(f, SELECT, SELECT + 20)
    loc = loc.lerp(base_loc, t)
    tilt = math.radians(90) * t
    depth = 1 + (height(c["total"]) / ROW[1] - 1) * t
    # Narrower on end, so the line of them reads as separate bars.
    width = 1 - 0.5 * t
    colour = LIVE.lerp(MADE, ramp(f, SELECT, SELECT + 8))

    # ORDER BY: into the line, tallest first.
    a = ORDER + c["rank"] * 0.7
    t = ramp(f, a, a + 20)
    loc = loc.lerp(bar(c["rank"], NBARS), t) + Vector((0, 0, 0.35 * math.sin(math.pi * t)))

    # LIMIT: everything after the fifth falls.
    if c["rank"] >= KEPT:
        a = LIMIT + (c["rank"] - KEPT) * 0.5
        t = ramp(f, a, a + 12)
        tilt = tilt * (1 - t) + math.radians(-4) * t
        colour = colour.lerp(OFF, t)
    else:
        colour = colour.lerp(ORANGE * 7.0, ramp(f, LIMIT, LIMIT + 10))
        t = ramp(f, LIMIT + 12 + c["rank"] * 1.5, LIMIT + 30 + c["rank"] * 1.5)
        loc = loc.lerp(kept(c["rank"]), t)
    return colour, loc, tilt, width, depth, size


# ---------------------------------------------------------------- camera


def box_of(points, z):
    xs = [p.x for p in points]
    ys = [p.y for p in points]
    return (min(xs) - 0.45, max(xs) + 0.45, min(ys) - 0.15, max(ys) + 0.35, z)


TABLE = box_of([grid(i) for i in range(N)], 0.05)
FRONT = box_of([grid(i) for i in range(N - 2 * COLS, N)], 0.05)
PILES = box_of([pile(p) for p in range(NPILES)], 0.5)
BARS = box_of([bar(r, NBARS) for r in range(NBARS)], height(MAXT))
TOP = box_of(
    [kept(r) for r in range(KEPT)] + [kept(KEPT - 1) + Vector((3.4, 0, 0))],
    height(MAXT),
)
KEYS = [
    (0, FRONT),
    (8, FRONT),
    (WHERE - 10, TABLE),
    (WHERE + 30, TABLE),
    (GROUP + 44, PILES),
    (SELECT + 26, PILES),
    (ORDER + 34, BARS),
    (LIMIT + 8, BARS),
    (LIMIT + 46, TOP),
    (T["duration"] - 1, TOP),
]
FIELD = max(TABLE[1] - TABLE[0], TABLE[3] - TABLE[2])


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
    return max(0.0, min(1.0, math.log(max(size, 0.5) / 0.5) / math.log(FIELD / 0.5)))


def offset_at(f, s):
    az = math.radians(-14 + 12 * f / T["duration"])
    el = math.radians(16 + 30 * s)
    return Vector(
        (math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el))
    )


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
    x0, x1, y0, y1, zt = box_at(f)
    target = Vector(((x0 + x1) / 2, (y0 + y1) / 2, zt * 0.45))
    s = closeness(max(x1 - x0, y1 - y0))
    u = offset_at(f, s)
    fx = 0.6 + (FIT_X - 0.6) * s
    fy = 0.55 + (FIT_Y - 0.55) * s
    pts = [Vector((x, y, z)) for x in (x0, x1) for y in (y0, y1) for z in (0, zt)]
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
    cam.data.dof.aperture_fstop = max(2.2, dist * 0.4)


# ---------------------------------------------------------------- output


def track():
    """The top of each of the five result rows, on screen, every frame."""
    reps = sorted((c for c in CARDS if c["rep"] and c["rank"] < KEPT), key=lambda c: c["rank"])
    idx = {c["id"]: i for i, c in enumerate(CARDS)}
    rows = []
    for f in range(T["duration"]):
        pos, target = frame_camera(f)[:2]
        row = []
        for c in reps:
            _, loc, tilt, _, depth, _ = state(idx[c["id"]], f)
            top = loc + Vector((0, 0, ROW[1] * depth * math.sin(tilt) + 0.05))
            x, y, z = project(top, pos, target)
            row.append([round(x * 0.5 + 0.5, 4), round(0.5 - y * 0.5, 4),
                        1 if z > 0 and abs(x) < 1 and abs(y) < 1 else 0])
        rows.append(row)
    json.dump(rows, open(OUT, "w"))
    print(f"wrote {OUT}")


def render():
    scene, objs, cam = build()
    os.makedirs(OUT, exist_ok=True)
    frames = (
        [int(x) for x in os.environ["FRAMES"].split(",")]
        if os.environ.get("FRAMES")
        else range(T["duration"])
    )
    # The first render of a session comes out black while the shaders
    # compile, so make one and throw it away.
    scene.render.filepath = os.path.join(OUT, "warmup.png")
    bpy.ops.render.render(write_still=True)
    os.remove(scene.render.filepath)
    for f in frames:
        scene.frame_set(f)
        for i, o in enumerate(objs):
            colour, loc, tilt, width, depth, size = state(i, f)
            o.color = (*colour, 1)
            o.location = loc
            o.rotation_euler.x = tilt
            o.scale = (width * size, depth * size, size)
        place_camera(cam, f)
        scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
        bpy.ops.render.render(write_still=True)


if OUT.endswith(".json"):
    track()
else:
    render()
