"""The bisect reel's history: 1,000 commits as a row of cards, rendered in Blender.

Run headless:
  Blender -b --factory-startup -P scripts/blender/bisect/history.py -- \
      public/vr43/timeline.json <frames dir | track.json>

Each commit is a glass card standing on a dark floor, joined to the one
before it by a thin strip: the history, oldest on the left, HEAD nearest.
Colour means one thing per card. Chalk is a commit nobody has tested, bright
chalk one the test passed on, orange one it failed on (the bug is in it).
A card git has ruled out goes dark. The one being tested lifts.

The camera frames whatever range git still has to search, so as each check
halves it the camera moves in on what is left, from all 1,000 down to the
one card that broke the build.

Given a directory, renders every frame into it (or only FRAMES=a,b,c).
Given a .json path, writes where the cards Remotion labels are on screen
on every frame instead, without rendering.
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
TIMELINE = json.load(open(args[0]))
OUT = args[1]

W, H = 1620, 850
COLS = 50  # commits to a row
SP = 0.34  # metres between commits along a row
ROW = 0.72  # metres between rows
CARD = (0.26, 0.05, 0.5)  # width, thickness, height
LIFT = 0.32
LENS = 28
SENSOR = 36
FIT_X, FIT_Y = 0.8, 0.84

N = TIMELINE["commits"]
FOUND = TIMELINE["found"]
FOUND_AT = TIMELINE["foundAt"]
CHECKS = TIMELINE["checks"]
KEYS = TIMELINE["camera"]

CHALK = Vector(base.hexrgb("#E8E6E1")[:3])
ORANGE = Vector(base.hexrgb("#FF7A33")[:3])
SLATE = Vector(base.hexrgb("#2B2E33")[:3])

UNKNOWN = CHALK * 1.4
GOOD = CHALK * 5.0
BAD = ORANGE * 6.0
OFF = CHALK * 0.07


def pos_of(n):
    """Where commit `n` stands. The history snakes through 20 rows of 50,
    oldest at the back, so every commit stands next to its parent; HEAD is
    at the front left, nearest the camera."""
    row, k = divmod(n - 1, COLS)
    rows = (N - 1) // COLS
    col = COLS - 1 - k if (rows - row) % 2 == 0 else k
    return Vector(((col - (COLS - 1) / 2) * SP, (rows - row) * ROW, 0.0))


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ramp(f, a, b):
    return ease((f - a) / (b - a)) if b > a else float(f >= a)


# ---------------------------------------------------------------- scene


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(W, H)
    scene = bpy.context.scene
    scene.frame_start = 0
    scene.frame_end = TIMELINE["duration"] - 1
    scene.render.film_transparent = False

    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.0016, 0.0017, 0.002, 1)
    bg.inputs["Strength"].default_value = 1
    scene.world = world

    # A dark floor polished enough to carry the cards' reflections.
    floor = bpy.data.materials.new("floor")
    floor.use_nodes = True
    p = floor.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = base.hexrgb("#08090B")
    p.inputs["Roughness"].default_value = 0.12
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 10, 0))
    plane = bpy.context.object
    plane.scale = (400, 400, 1)
    plane.data.materials.append(floor)

    # The cards: dark glass, its code lines glowing in the object's own
    # colour, and a faint wash of that colour through the glass.
    def glow_material(name, base_hex, rough, strength):
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

    glass = glow_material("glass", "#0C0D10", 0.16, 0.025)
    lines = glow_material("lines", "#000000", 0.5, 1.0)

    # Four layouts of code, so the field does not read as one stamp.
    PATTERNS = [
        [0.17, 0.12, 0.19, 0.08, 0.14],
        [0.12, 0.19, 0.15, 0.18, 0.06],
        [0.19, 0.09, 0.13, 0.17, 0.11],
        [0.10, 0.16, 0.19, 0.07, 0.15],
    ]

    def card_mesh(name, link, pattern):
        bpy.ops.mesh.primitive_cube_add(size=1)
        c = bpy.context.object
        c.scale = CARD
        c.location = (0, 0, CARD[2] / 2)
        bpy.ops.object.transform_apply(location=True, scale=True)
        bev = c.modifiers.new("bevel", "BEVEL")
        bev.width = 0.012
        bev.segments = 3
        bpy.ops.object.modifier_apply(modifier="bevel")
        c.data.materials.append(glass)
        c.data.materials.append(lines)
        parts = []
        left = -CARD[0] / 2 + 0.04
        for k, width in enumerate(PATTERNS[pattern]):
            bpy.ops.mesh.primitive_cube_add(size=1)
            b = bpy.context.object
            indent = 0.03 if k in (1, 2) else 0.0
            b.scale = (width - indent, 0.006, 0.026)
            b.location = (
                left + indent + (width - indent) / 2,
                -CARD[1] / 2 - 0.002,
                CARD[2] - 0.09 - k * 0.07,
            )
            bpy.ops.object.transform_apply(location=True, scale=True)
            b.data.materials.append(lines)
            parts.append(b)
        if link is not None:
            # The link to the parent commit, along the floor.
            dx, dy = link
            length = abs(dx) - CARD[0] if dx else abs(dy) - CARD[1]
            bpy.ops.mesh.primitive_cube_add(size=1)
            s = bpy.context.object
            s.scale = (length, 0.025, 0.01) if dx else (0.025, length, 0.01)
            s.location = (dx / 2, dy / 2, 0.005)
            bpy.ops.object.transform_apply(location=True, scale=True)
            s.data.materials.append(lines)
            parts.append(s)
        bpy.ops.object.select_all(action="DESELECT")
        for o in parts:
            o.select_set(True)
        c.select_set(True)
        bpy.context.view_layer.objects.active = c
        bpy.ops.object.join()
        c.data.name = name
        mesh = c.data
        bpy.data.objects.remove(c)
        return mesh

    meshes = {}
    cards = {}
    col = bpy.data.collections.new("history")
    scene.collection.children.link(col)
    for n in range(1, N + 1):
        link = None
        if n > 1:
            d = pos_of(n - 1) - pos_of(n)
            link = (round(d.x, 3), round(d.y, 3))
        key = (link, n * 7 % 4)
        if key not in meshes:
            meshes[key] = card_mesh(f"card {key}", *key)
        o = bpy.data.objects.new(f"c{n:04d}", meshes[key])
        o.location = pos_of(n)
        col.objects.link(o)
        cards[n] = o

    # A soft key from above and behind, so the glass has edges, and a low
    # fill from the camera's side.
    for name, loc, power, size in (
        ("key", (-10, 40, 40), 220, 30),
        ("fill", (10, -40, 25), 40, 50),
    ):
        light = bpy.data.objects.new(name, bpy.data.lights.new(name, "AREA"))
        light.data.energy = power
        light.data.size = size
        light.location = loc
        scene.collection.objects.link(light)
        light.rotation_euler = (
            (Vector((0, 11, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        )

    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    cam.data.lens = LENS
    cam.data.sensor_width = SENSOR
    cam.data.sensor_fit = "HORIZONTAL"
    cam.data.clip_start = 0.05
    cam.data.clip_end = 5000
    cam.data.dof.use_dof = True
    scene.camera = cam

    bloom(scene)
    return scene, cards, cam


def bloom(scene):
    ng = bpy.data.node_groups.new("comp", "CompositorNodeTree")
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    rl = ng.nodes.new("CompositorNodeRLayers")
    glare = ng.nodes.new("CompositorNodeGlare")
    glare.inputs["Type"].default_value = "Bloom"
    glare.inputs["Quality"].default_value = "High"
    glare.inputs["Threshold"].default_value = 0.9
    glare.inputs["Strength"].default_value = 0.7
    glare.inputs["Size"].default_value = 0.6
    out = ng.nodes.new("NodeGroupOutput")
    ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
    ng.links.new(glare.outputs["Image"], out.inputs[0])
    scene.compositing_node_group = ng
    scene.render.use_compositing = True


# ---------------------------------------------------------------- states


def selected_from(c):
    """The frame git checks this commit out, from beats.ts."""
    return c["pickAt"]


SELECT = {c["n"]: c for c in CHECKS}


def ruled_out(n):
    """The check that first leaves `n` outside the range, if any."""
    for c in CHECKS:
        if n < c["good"] or n > c["bad"]:
            return c
    return None


OUT_BY = {n: ruled_out(n) for n in range(1, N + 1)}


def prev_span(c):
    k = c["k"]
    if k == 1:
        return N - 1
    p = CHECKS[k - 2]
    return max(1, p["bad"] - p["good"])


def state(n, f):
    """Emission colour, lift and fall of commit `n` on frame `f`."""
    colour = UNKNOWN
    lift = 0.0
    fall = 0.0
    if n == N:
        colour = BAD
    if n == 1:
        colour = GOOD
    c = SELECT.get(n)
    if c:
        s = selected_from(c)
        r = c["resultAt"]
        up = ramp(f, s, s + 7) * (1 - ramp(f, r + 8, r + 18))
        lift = LIFT * up
        if f >= s:
            colour = UNKNOWN.lerp(CHALK * 4.5, ramp(f, s, s + 5))
        if f >= r:
            turned = GOOD if c["result"] == "good" else BAD
            colour = (CHALK * 4.5).lerp(turned, ramp(f, r, r + 4))
    o = OUT_BY[n]
    if o:
        # Git has ruled this half out: it goes over like a row of dominoes,
        # in a wave running out from the commit that was just tested.
        delay = 14 * abs(n - o["n"]) / prev_span(o)
        t = ramp(f, o["cutAt"] + delay, o["cutAt"] + delay + 12)
        colour = colour.lerp(OFF, min(1.0, t * 1.6))
        fall = t
    if n == FOUND:
        rise = ramp(f, FOUND_AT, FOUND_AT + 16)
        colour = colour.lerp(ORANGE * 9.0, rise)
        lift = max(lift, 0.3 * rise)
    return colour, lift, fall


# ---------------------------------------------------------------- camera


def box(lo, hi):
    ps = [pos_of(n) for n in range(lo, hi + 1)]
    return (
        min(p.x for p in ps) - CARD[0] / 2,
        max(p.x for p in ps) + CARD[0] / 2,
        min(p.y for p in ps),
        max(p.y for p in ps),
    )


BOXES = [(k[0], box(k[1], k[2])) for k in KEYS]
FIELD = max(BOXES[1][1][1] - BOXES[1][1][0], BOXES[1][1][3] - BOXES[1][1][2])


def box_at(f):
    """The commits the camera frames, eased between keys: the centre moves
    straight, the size shrinks evenly in log, so every halving takes the
    same visual step."""
    if f <= BOXES[0][0]:
        return BOXES[0][1]
    for (fa, a), (fb, b) in zip(BOXES, BOXES[1:]):
        if fa <= f <= fb:
            t = ease((f - fa) / (fb - fa))
            out = []
            for lo, hi in ((0, 1), (2, 3)):
                ca, cb = (a[lo] + a[hi]) / 2, (b[lo] + b[hi]) / 2
                sa, sb = a[hi] - a[lo] + 0.3, b[hi] - b[lo] + 0.3
                c = ca + (cb - ca) * t
                size = math.exp(math.log(sa) + (math.log(sb) - math.log(sa)) * t)
                out += [c - size / 2, c + size / 2]
            return tuple(out)
    return BOXES[-1][1]


def closeness(size):
    """0 on a few cards, 1 on the whole field, even in log."""
    return max(0.0, min(1.0, math.log(max(size, 0.4) / 0.4) / math.log(FIELD / 0.4)))


def offset_at(f, size):
    """From the front and above, steeper over the whole field so the rows
    behind show over the rows in front, lower and closer on a few cards.
    It drifts a few degrees over the reel so nothing is ever still."""
    s = closeness(size)
    az = math.radians(16 - 14 * f / TIMELINE["duration"])
    el = math.radians(16 + 22 * s)
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
    x0, x1, y0, y1 = box_at(f)
    target = Vector(((x0 + x1) / 2, (y0 + y1) / 2, CARD[2] * 0.5))
    size = max(x1 - x0, y1 - y0)
    u = offset_at(f, size)
    # The whole field fills the frame; a few cards get room around them for
    # their labels.
    s = closeness(size)
    fit_x = 0.5 + (FIT_X - 0.5) * s
    fit_y = 0.5 + (FIT_Y - 0.5) * s
    pts = [
        Vector((x, y, z))
        for x in (x0, x1)
        for y in (y0, y1)
        for z in (0, CARD[2] + LIFT)
    ]
    a, b = 0.6, 400.0
    for _ in range(50):
        m = (a + b) / 2
        c = target + u * m
        fits = all(
            abs(x) <= fit_x and abs(y) <= fit_y and z > 0.2
            for x, y, z in (project(p, c, target) for p in pts)
        )
        if fits:
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
    return pos, target


# ---------------------------------------------------------------- output


def subject(f):
    """The commit being tested, from when git picks it to the next pick."""
    cur = None
    for c in CHECKS:
        if f >= selected_from(c):
            cur = c
    return cur["n"] if cur else None


def track():
    rows = []
    for f in range(TIMELINE["duration"]):
        pos, target = frame_camera(f)[:2]
        row = {}
        for key, n in (("h", N), ("b", 1), ("s", subject(f)), ("c", FOUND)):
            if n is None:
                row[key] = None
                continue
            lift = state(n, f)[1]
            p = pos_of(n) + Vector((0, 0, CARD[2] + lift))
            x, y, z = project(p, pos, target)
            row[key] = [
                round((x * 0.5 + 0.5), 4),
                round((0.5 - y * 0.5), 4),
                1 if z > 0 and abs(x) < 1 and abs(y) < 1 else 0,
            ]
        rows.append(row)
    json.dump(rows, open(OUT, "w"))
    print(f"wrote {OUT}")


def render():
    scene, cards, cam = build()
    os.makedirs(OUT, exist_ok=True)
    frames = (
        [int(x) for x in os.environ["FRAMES"].split(",")]
        if os.environ.get("FRAMES")
        else range(TIMELINE["duration"])
    )
    # The first render of a session comes out black while the shaders
    # compile, so make one and throw it away.
    scene.render.filepath = os.path.join(OUT, "warmup.png")
    bpy.ops.render.render(write_still=True)
    os.remove(scene.render.filepath)
    for f in frames:
        scene.frame_set(f)
        for n, o in cards.items():
            colour, lift, fall = state(n, f)
            o.color = (*colour, 1)
            o.location.z = lift
            o.rotation_euler.x = -math.radians(84) * fall
        place_camera(cam, f)
        scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
        bpy.ops.render.render(write_still=True)


if OUT.endswith(".json"):
    track()
else:
    render()
