"""The PHP2Shell reel's server, rendered in Blender.

Run headless:
  Blender -b --factory-startup -P scripts/blender/php/server.py -- \
      public/vr46/timeline.json <frames dir | track.json>

The news first: a field of servers, four named government sites among
them switching off as a precaution. The camera dives into one server.
Close up: Its front is a rack of memory slots with a lit
line above them: the memory limit. Beside it stands a smaller cabinet, the
site's own code, waiting its turn. An upload request arrives as a stack of
parts. PHP unpacks the parts into memory, one slot each, faster and faster,
until it runs out with the last part only half in. It stops. Cleanup sweeps
up the rack, clearing each slot, and trusts the half-built one: orange,
the attacker's code, spreads through the machine. The site's own code
never ran.

Then the camera pulls back to the field, and a patch passes over it from
the front and brings every site back.

Orange is one thing here: the attacker's code.

Given a directory, renders every frame into it (or only FRAMES=a,b,c).
Given a .json path, writes where Remotion's labels go on every frame
instead, without rendering.
"""

import json
import math
import os
import random
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "deplane"))
import scene as base  # noqa: E402

args = sys.argv[sys.argv.index("--") + 1 :]
T = json.load(open(args[0]))
OUT = args[1]

W, H = 1620, 850
LENS = 32
SENSOR = 36

CAB = (1.25, 0.8, 2.0)  # width, depth, height of a server
GCOLS, GROWS = 6, 8  # memory slots on its front
SLOT = (0.15, 0.17)
SLOT_GAP = 0.03
NSLOTS = GCOLS * GROWS
FIELD_COLS, FIELD_ROWS = 18, 12
FX, FY = 2.2, 2.4

CHALK = base.hexrgb("#E8E6E1")
ORANGE = base.hexrgb("#FF7A33")
C = lambda rgba, k: (rgba[0] * k, rgba[1] * k, rgba[2] * k, 1)  # noqa: E731

OFF, DIVE, ARRIVE, UNPACK = T["off"], T["dive"], T["arrive"], T["unpack"]
OOM, CLEAN, HOLD, TAKEOVER = T["oom"], T["clean"], T["hold"], T["takeover"]
PULL, PATCH = T["pull"], T["patch"]


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ramp(f, a, b):
    return ease((f - a) / (b - a)) if b > a else float(f >= a)


def slot_pos(k):
    """The centre of memory slot `k` on the hero's front, filled bottom row
    first, left to right."""
    r, c = divmod(k, GCOLS)
    x = (c - (GCOLS - 1) / 2) * (SLOT[0] + SLOT_GAP)
    z = 0.32 + r * (SLOT[1] + SLOT_GAP) + SLOT[1] / 2
    return Vector((x, -CAB[1] / 2 - 0.03, z))


TOP_Z = slot_pos(NSLOTS - 1).z + SLOT[1] / 2 + 0.06
PARCEL = Vector((-1.1, -1.05, 0.55))

# When each part lands, from beats.ts: the gap shrinks as PHP speeds
# through them, and the last one only half lands, as memory runs out.
LAND = T["lands"]
assert len(LAND) == NSLOTS
HALF = NSLOTS - 1

# The field, the hero at the front centre and the rest around and behind.
CELLS = sorted(
    ((c, r) for r in range(FIELD_ROWS) for c in range(FIELD_COLS)),
    key=lambda cr: (cr[1], abs(cr[0] - (FIELD_COLS - 1) / 2), cr[0]),
)
HERO_X = (CELLS[0][0] - (FIELD_COLS - 1) / 2) * FX


def server_pos(i):
    c, r = CELLS[i]
    return Vector(((c - (FIELD_COLS - 1) / 2) * FX - HERO_X, r * FY, 0.0))


# Four named sites from the reporting, each a small cluster in the field.
COUNTRIES = [(4, 7), (14, 8), (6, 3), (12, 3)]
INDEX = {cr: i for i, cr in enumerate(CELLS)}
CLUSTER = {}
for n, (cc, rr) in enumerate(COUNTRIES):
    for dc in (-1, 0, 1):
        for dr in (-1, 0, 1):
            if (cc + dc, rr + dr) in INDEX:
                CLUSTER[INDEX[(cc + dc, rr + dr)]] = n


# ---------------------------------------------------------------- scene


def material(name, color, rough, metal=0.0, emit=None, strength=0.0, objcolor=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = color
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    if objcolor:
        info = nt.nodes.new("ShaderNodeObjectInfo")
        nt.links.new(info.outputs["Color"], p.inputs["Emission Color"])
        p.inputs["Emission Strength"].default_value = strength
    elif emit:
        p.inputs["Emission Color"].default_value = emit
        p.inputs["Emission Strength"].default_value = strength
    return m


def cube(size, loc, mat, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
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


def join(parts, name):
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


def cabinet_mesh(metal, recess, lit):
    """A rack server: a dark cabinet, a recessed front with the slot grid's
    cells, vents, and a strip along the top that takes the object's colour."""
    w, d, h = CAB
    parts = [cube((w, d, h), (0, 0, h / 2), metal, bevel=0.025)]
    # The recessed memory panel and the empty cells.
    gw = GCOLS * (SLOT[0] + SLOT_GAP) + 0.06
    gh = GROWS * (SLOT[1] + SLOT_GAP) + 0.06
    parts.append(cube((gw, 0.02, gh), (0, -d / 2 - 0.004, 0.32 + gh / 2 - 0.03), recess))
    for k in range(NSLOTS):
        p = slot_pos(k)
        parts.append(cube((SLOT[0], 0.008, SLOT[1]), (p.x, -d / 2 - 0.012, p.z), lit))
    # Vents under the panel.
    for i in range(5):
        parts.append(cube((w * 0.7, 0.01, 0.012), (0, -d / 2 - 0.005, 0.1 + i * 0.035), recess))
    # Status strip, coloured per object.
    parts.append(cube((w * 0.86, 0.012, 0.035), (0, -d / 2 - 0.008, h - 0.09), lit))
    return join(parts, "cabinet")


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(W, H)
    scene = bpy.context.scene
    scene.frame_start = 0
    scene.frame_end = T["duration"] - 1

    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0018, 0.0019, 0.0024, 1)
    scene.world = world

    floor = material("floor", base.hexrgb("#08090B"), 0.16)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 10, 0))
    bpy.context.object.scale = (400, 400, 1)
    bpy.context.object.data.materials.append(floor)

    metal = material("metal", base.hexrgb("#17191D"), 0.35, metal=0.6)
    recess = material("recess", base.hexrgb("#0B0C0E"), 0.6)
    lit = material("lit", base.hexrgb("#000000"), 0.4, objcolor=True, strength=1.0)
    part = material("part", base.hexrgb("#101113"), 0.4, objcolor=True, strength=1.0)
    limit = material("limit", base.hexrgb("#000000"), 0.4, objcolor=True, strength=1.0)

    cab = cabinet_mesh(metal, recess, lit)

    # The field: the hero at the front centre, the rest around and behind.
    servers = []
    col = bpy.data.collections.new("servers")
    scene.collection.children.link(col)
    for i in range(len(CELLS)):
        o = bpy.data.objects.new(f"s{i:03d}", cab)
        o.location = server_pos(i)
        col.objects.link(o)
        servers.append(o)

    # The site's own code: a smaller cabinet beside the hero, dim, waiting.
    site = bpy.data.objects.new("site", join([cube((0.7, 0.6, 1.3), (0, 0, 0.65), metal, bevel=0.02),
                                              cube((0.5, 0.012, 0.7), (0, -0.306, 0.8), lit)], "site"))
    site.location = (1.15, -0.2, 0)
    scene.collection.objects.link(site)

    # The parts of the request: one thin plate per memory slot, stacked.
    plate = join([cube((SLOT[0] * 0.9, 0.012, SLOT[1] * 0.86), (0, 0, 0), part)], "plate")
    parts = []
    for k in range(NSLOTS):
        o = bpy.data.objects.new(f"p{k:02d}", plate)
        scene.collection.objects.link(o)
        parts.append(o)

    # The memory limit: a thin lit line above the slots.
    line = bpy.data.objects.new("limit", join([cube((GCOLS * (SLOT[0] + SLOT_GAP), 0.012, 0.016), (0, 0, 0), limit)], "limitline"))
    line.location = (0, -CAB[1] / 2 - 0.02, TOP_Z)
    scene.collection.objects.link(line)

    # Cleanup: a thin bar that sweeps up the rack.
    sweep = bpy.data.objects.new("sweep", join([cube((GCOLS * (SLOT[0] + SLOT_GAP) + 0.08, 0.02, 0.02), (0, 0, 0), limit)], "sweepbar"))
    scene.collection.objects.link(sweep)

    for name, kind, loc, power, size in (
        ("key", "AREA", (-3, -9, 9), 900, 10),
        ("fill", "AREA", (8, -6, 4), 220, 12),
        ("top", "AREA", (0, 14, 24), 2600, 40),
    ):
        light = bpy.data.objects.new(name, bpy.data.lights.new(name, kind))
        light.data.energy = power
        light.data.size = size
        light.location = loc
        scene.collection.objects.link(light)
        light.rotation_euler = (Vector((0, 4, 0.8)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()

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
    glare.inputs["Strength"].default_value = 0.6
    glare.inputs["Size"].default_value = 0.6
    outn = ng.nodes.new("NodeGroupOutput")
    ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
    ng.links.new(glare.outputs["Image"], outn.inputs[0])
    scene.compositing_node_group = ng
    scene.render.use_compositing = True
    return scene, servers, site, parts, line, sweep, cam


# ---------------------------------------------------------------- states

RNG = random.Random(46)
NSERVERS = FIELD_COLS * FIELD_ROWS
# The named clusters go dark one after another; others follow at random.
# Which others is an illustration, not data.
DOWN = [i in CLUSTER or (i != 0 and RNG.random() < 0.35) for i in range(NSERVERS)]
DOWN_AT = [
    OFF + 12 * CLUSTER[i] + RNG.random() * 6 if i in CLUSTER else OFF + 24 + RNG.random() * 40
    for i in range(NSERVERS)
]


def sweep_z(f):
    """Cleanup climbs the rack and stops at the half-built part's row."""
    stop = slot_pos(HALF).z - SLOT[1] / 2 - 0.025
    return 0.28 + (stop - 0.28) * ramp(f, CLEAN, HOLD)


def part_state(k, f):
    """Where part `k` is, its colour and how much of it is in."""
    p = slot_pos(k)
    stack = PARCEL + Vector((0, 0, k * 0.008))
    arrive = ramp(f, ARRIVE, ARRIVE + 34)
    start = PARCEL + Vector((-6, 0, 2.4)) + Vector((0, 0, k * 0.008))
    home = start.lerp(stack, arrive)
    a = LAND[k]
    t = ramp(f, a - 8, a)
    loc = home.lerp(p, t) + Vector((0, 0, 0.35 * math.sin(math.pi * t)))
    fill = 0.5 * t if k == HALF else t
    colour = C(CHALK, 1.6)
    if k == HALF and f >= a:
        # Half in, flickering: the part memory ran out on.
        colour = C(CHALK, 0.6 + 1.6 * (0.5 + 0.5 * math.sin(f * 1.3)))
    # Cleanup clears each part as the sweep passes it; the half-built one
    # it trusts, and that is where the attacker's code starts.
    if f >= CLEAN and k != HALF:
        reach = CLEAN + (HOLD - CLEAN) * (p.z - 0.28) / max(0.01, slot_pos(HALF).z - 0.28)
        cleared = ramp(f, reach, reach + 4)
        colour = C(CHALK, 1.6 * (1 - cleared) + 0.02)
    if k == HALF and HOLD <= f < TAKEOVER:
        # Cleanup has stopped on it, and reads it: it flares.
        colour = C(CHALK, 3.0 + 4.0 * (0.5 + 0.5 * math.sin((f - HOLD) * 1.1)))
    if f >= TAKEOVER:
        d = (p - slot_pos(HALF)).length
        t = ramp(f, TAKEOVER + d * 22, TAKEOVER + d * 22 + 8)
        colour = tuple(colour[i] * (1 - t) + ORANGE[i] * 3.2 * t for i in range(3)) + (1,)
        fill = max(fill, t) if k != HALF else 0.5 + 0.5 * t
    if f >= PATCH:
        # Patched: the memory is cleared, like every other server's.
        t = ramp(f, PATCH, PATCH + 10)
        colour = tuple(colour[i] * (1 - t) + CHALK[i] * 0.04 * t for i in range(3)) + (1,)
    # Lying flat in the stack, standing up as it goes into its slot.
    tilt = math.radians(90) * (1 - t)
    return loc, fill, colour, tilt


def server_state(i, f):
    """The colour of server `i`'s panel."""
    patched = ramp(f, PATCH + 40 * (i / NSERVERS), PATCH + 40 * (i / NSERVERS) + 8)
    healthy = C(CHALK, 1.3)
    if i == 0:
        out = C(CHALK, 0.35 * (1 - ramp(f, DIVE + 20, DIVE + 40)) + 0.04)
        if f >= TAKEOVER:
            k = ramp(f, TAKEOVER + 6, TAKEOVER + 16)
            out = tuple(out[j] * (1 - k) + ORANGE[j] * 2.5 * k for j in range(3)) + (1,)
        p = ramp(f, PATCH, PATCH + 10)
        return tuple(out[j] * (1 - p) + healthy[j] * p for j in range(3)) + (1,)
    # Dim beside the hero in the close-up, back up as the camera pulls out.
    level = 0.35 - 0.25 * ramp(f, DIVE + 10, DIVE + 40) + 0.25 * ramp(f, PULL, PULL + 30)
    out = C(CHALK, level)
    if i in CLUSTER and f < DIVE + 30:
        # The named sites flash once as they go.
        out = C(CHALK, level + 1.5 * ramp(f, DOWN_AT[i] - 4, DOWN_AT[i]))
    if DOWN[i]:
        k = ramp(f, DOWN_AT[i], DOWN_AT[i] + 6)
        out = tuple(out[j] * (1 - k) for j in range(3)) + (1,)
    return tuple(out[j] * (1 - patched) + healthy[j] * patched for j in range(3)) + (1,)


# ---------------------------------------------------------------- camera

HERO = (-1.4, 1.95, -0.9, 0.4, 2.1, 0.1)


def field_box():
    xs = [((c - (FIELD_COLS - 1) / 2) * FX) for c in range(FIELD_COLS)]
    shift = ((0 - (FIELD_COLS - 1) / 2) * FX)  # hero recentring, matched in build
    del shift
    return (min(xs) - 0.8, max(xs) + 0.8, 0.0, (FIELD_ROWS - 1) * FY + 0.6, CAB[2])


def box_at(f, field):
    keys = [
        (0, field),
        (DIVE, field),
        (DIVE + 44, HERO_WIDE),
        (ARRIVE + 34, HERO),
        (OOM - 4, HERO_TIGHT),
        (HOLD - 6, HERO_TIGHT),
        (HOLD + 6, HALF_BOX),
        (TAKEOVER + 4, HALF_BOX),
        (TAKEOVER + 24, HERO_TIGHT),
        (PULL, HERO),
        (PULL + 40, field),
        (T["duration"] - 1, field),
    ]
    if f <= keys[0][0]:
        return keys[0][1]
    for (fa, a), (fb, b) in zip(keys, keys[1:]):
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
            out.append(a[5] + (b[5] - a[5]) * t)
            return tuple(out)
    return keys[-1][1]


# Boxes: x0, x1, y0, y1, top, bottom.
HERO_WIDE = (-3.2, 2.2, -1.2, 0.5, 2.2, 0.1)
HERO_TIGHT = (-0.62, 0.62, -0.6, -0.3, 1.9, 0.1)
# Close on the half-built part and the rows under it.
_h = slot_pos(NSLOTS - 1)
HALF_BOX = (_h.x - 0.46, _h.x + 0.16, -0.6, -0.35, _h.z + 0.16, _h.z - 0.42)


TAN_H = (SENSOR / 2) / LENS
TAN_V = TAN_H * H / W


def project(p, cam_pos, target):
    w = (target - cam_pos).normalized()
    r = w.cross(Vector((0, 0, 1))).normalized()
    v = r.cross(w)
    d = p - cam_pos
    z = d.dot(w)
    return (d.dot(r) / z) / TAN_H, (d.dot(v) / z) / TAN_V, z


def frame_camera(f, field):
    x0, x1, y0, y1, top, bottom = box_at(f, field)
    size = max(x1 - x0, y1 - y0)
    s = max(0.0, min(1.0, math.log(max(size, 1.4) / 1.4) / math.log((field[1] - field[0]) / 1.4)))
    size = max(size, top - bottom)
    target = Vector(((x0 + x1) / 2, (y0 + y1) / 2, bottom + (top - bottom) * (0.5 - 0.3 * s)))
    az = math.radians(-10 + 14 * f / T["duration"])
    el = math.radians(8 + 34 * math.sqrt(s))
    u = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
    fx, fy = 0.62 + 0.18 * s, 0.6 + 0.22 * s
    pts = [Vector((x, y, z)) for x in (x0, x1) for y in (y0, y1) for z in (bottom, top)]
    a, b = 0.5, 400.0
    for _ in range(50):
        m = (a + b) / 2
        c = target + u * m
        if all(abs(x) <= fx and abs(y) <= fy and z > 0.2 for x, y, z in (project(p, c, target) for p in pts)):
            b = m
        else:
            a = m
    return target + u * b, target, b


def place_camera(cam, f, field):
    pos, target, dist = frame_camera(f, field)
    cam.location = pos
    cam.rotation_euler = (target - pos).to_track_quat("-Z", "Y").to_euler()
    cam.data.dof.focus_distance = dist
    cam.data.dof.aperture_fstop = max(2.4, dist * 0.35)


# ---------------------------------------------------------------- output


def field_extent():
    xs = [((c - (FIELD_COLS - 1) / 2) * FX) for c in range(FIELD_COLS)]
    cells = sorted(
        ((c, r) for r in range(FIELD_ROWS) for c in range(FIELD_COLS)),
        key=lambda cr: (cr[1], abs(cr[0] - (FIELD_COLS - 1) / 2), cr[0]),
    )
    hero_x = (cells[0][0] - (FIELD_COLS - 1) / 2) * FX
    return (min(xs) - hero_x - 0.8, max(xs) - hero_x + 0.8, 0.0, (FIELD_ROWS - 1) * FY + 0.6, CAB[2], 0.1)


def track():
    """The parcel, the half-built slot, the site's own code, the hero's top
    and the four named clusters, every frame."""
    field = field_extent()
    rows = []
    for f in range(T["duration"]):
        pos, target = frame_camera(f, field)[:2]
        parcel = part_state(NSLOTS - 1, f)[0] + Vector((0, 0, 0.18))
        half = slot_pos(HALF) + Vector((0, 0, SLOT[1] / 2 + 0.03))
        site = Vector((1.15, -0.2, 1.42))
        hero = Vector((0, 0, CAB[2] + 0.12))
        flags = [server_pos(INDEX[cr]) + Vector((0, 0, CAB[2] + 0.3)) for cr in COUNTRIES]
        row = []
        for p in (parcel, half, site, hero, *flags):
            x, y, z = project(p, pos, target)
            row.append([round(x * 0.5 + 0.5, 4), round(0.5 - y * 0.5, 4),
                        1 if z > 0 and abs(x) < 1 and abs(y) < 1 else 0])
        rows.append(row)
    json.dump(rows, open(OUT, "w"))
    print(f"wrote {OUT}")


def render():
    scene, servers, site, parts, line, sweep, cam = build()
    field = field_extent()
    os.makedirs(OUT, exist_ok=True)
    frames = (
        [int(x) for x in os.environ["FRAMES"].split(",")]
        if os.environ.get("FRAMES")
        else range(T["duration"])
    )
    scene.render.filepath = os.path.join(OUT, "warmup.png")
    bpy.ops.render.render(write_still=True)
    os.remove(scene.render.filepath)
    for f in frames:
        scene.frame_set(f)
        for k, o in enumerate(parts):
            loc, fill, colour, tilt = part_state(k, f)
            o.location = loc
            o.rotation_euler.x = tilt
            o.scale = (1, 1, max(fill, 0.02) if f >= LAND[k] - 8 else 1)
            o.color = colour
        for i, o in enumerate(servers):
            o.color = server_state(i, f)
        # The site's own code: dim and waiting the whole time.
        site.color = C(CHALK, 0.07)
        # The limit line: chalk, then orange as memory runs out.
        full = ramp(f, OOM - 6, OOM)
        line.color = tuple(CHALK[j] * 1.4 * (1 - full) + ORANGE[j] * 4 * full for j in range(3)) + (1,)
        if f >= TAKEOVER + 10:
            line.color = C(ORANGE, 3)
        # The sweep is only there while cleanup runs.
        on = ramp(f, CLEAN - 2, CLEAN + 3) * (1 - ramp(f, TAKEOVER + 2, TAKEOVER + 8))
        sweep.location = (0, -CAB[1] / 2 - 0.03, sweep_z(f))
        sweep.color = C(CHALK, 3 * on)
        sweep.hide_render = on <= 0.01
        place_camera(cam, f, field)
        scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
        bpy.ops.render.render(write_still=True)


if OUT.endswith(".json"):
    track()
else:
    render()
