"""The OFFSET reel's stockroom: a wall of crates in id order, one fixed shot.

Run headless:
  Blender -b --factory-startup -P scripts/blender/offset/wall.py -- \
      public/vr52/timeline.json <frames dir | track.json>

The same building as the SQL reel's mailroom, another room, seen the same
way: eye level, the whole of the data in frame at once, so nothing has to
be remembered between shots. A wall of shelves holds the orders in crates
of 1,000, in id order the way you read a page, each crate labelled with
its first id and each row of shelves with a sign giving the row's first
id. The 101st crate holds the page asked for: its first 100 orders, an
orange folder standing up at its front. A belt runs along the foot of the
wall. The same worker stands in front, at the right.

Every beat is a frame in timeline.json, from `src/vertical/52-sql-offset/beats.ts`;
when each crate is read is in `wall.ts`.

  take 1   OFFSET: the 100 crates before the page come out one after
           another in id order, the first slowly, then faster: each slides
           out, its lid flips open on its orders, and it tips onto the belt,
           which carries it off. Then the page's crate opens and the folder
           flies to him.
  take 2   The wall winds back to full. Only the page's crate moves.

Given a directory, renders every frame into it (or only FRAMES=a,b,c).
Given a .json path, writes where the labels the reel draws over the scene
fall on screen on every frame instead.
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
B = T["beats"]
COLS, ROWS = T["cols"], T["rows"]
PAGE_CRATE = T["pageCrate"]
OPEN = T["open"]
READS = T["reads"]
DROPS = T["drops"]
SKIPPED = len(READS)

W, H = 1620, 960
SCALE = 0.62
CW, CD, CH = 0.44, 0.34, 0.3  # crate width, depth, height
SX, SZ = 0.52, 0.44  # slot pitch across and up
Z_BOT = 0.62  # the bottom shelf
BELT_Y, BELT_Z = -0.82, 0.24
BELT_V = 0.2  # metres a frame
GONE_X = -3.6  # off the left of the frame
ORANGE = base.hexrgb("#FF7A33")
CHALK = base.hexrgb("#E9E4D8")
LID_OPEN = math.radians(-110)

WORKER = Vector((6.3, -1.3, 0.0))
SIGN_W, SIGN_H, SIGN_GAP = 0.82, 0.26, 0.08
HAND = WORKER + Vector((-0.42, -0.2, 0.98))


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ramp(f, a, b):
    return ease((f - a) / (b - a)) if b > a else float(f >= a)


def arc(a, b, u, height):
    p = a.lerp(b, ease(u))
    p.z += height * math.sin(math.pi * max(0.0, min(1.0, u)))
    return p


def row_of(i):
    return i // COLS


def home(i):
    """Crate i's place: left to right, top to bottom, its bottom centre."""
    r, c = divmod(i, COLS)
    return Vector((c * SX, -CD / 2, Z_BOT + (ROWS - 1 - r) * SZ))


# ---------------------------------------------------------------- motion


def skipped_state(i, f):
    """Position, x rotation, lid angle and visibility of skipped crate i on
    take 1's frame f: out, open, tipped onto the belt, carried off."""
    t = READS[i]
    h = home(i)
    if f < t:
        return h, 0.0, 0.0, True
    out = h + Vector((0, -0.36, 0))
    lid = LID_OPEN * ramp(f, t + 1, t + OPEN)
    tip = t + OPEN + 1
    if f < tip:
        return h.lerp(out, ramp(f, t, t + 3)), 0.0, lid, True
    drop = DROPS[i]
    belt = Vector((h.x, BELT_Y, BELT_Z))
    if f < tip + drop:
        u = (f - tip) / drop
        return arc(out, belt, u, 0.15), math.radians(90) * ease(u), lid, True
    x = max(GONE_X - 1.0, h.x - BELT_V * (f - tip - drop))
    return Vector((x, BELT_Y, BELT_Z)), math.radians(90), lid, x > GONE_X


def page_state(f, start):
    """The page's crate and its folder, from `start` (PAGE_OUT of a take):
    the crate slides out and opens, the folder rises and flies to him."""
    h = home(PAGE_CRATE)
    out = h + Vector((0, -0.3, 0))
    l0 = start - B["PAGE_OUT"]
    crate = h.lerp(out, ramp(f, start, start + 4))
    lid = LID_OPEN * ramp(f, start + 2, B["PAGE_OPEN"] + l0)
    inside = crate + Vector((0, -0.08, 0.05))
    above = out + Vector((0, -0.08, 0.5))
    if f < B["PAGE_OPEN"] + l0:
        folder = inside
    elif f < B["FLY"] + l0:
        folder = inside.lerp(above, ramp(f, B["PAGE_OPEN"] + l0, B["FLY"] + l0 - 2))
    else:
        folder = arc(above, HAND, ramp(f, B["FLY"] + l0, B["CAUGHT"] + l0), 0.6)
    return crate, lid, folder


def take1(i, f):
    """Crate i on take 1's frame f: (position, rot x, lid, shown)."""
    if i < SKIPPED:
        return skipped_state(i, f)
    if i == PAGE_CRATE:
        crate, lid, _ = page_state(f, B["PAGE_OUT"])
        return crate, 0.0, lid, True
    return home(i), 0.0, 0.0, True


def take_time(f):
    """Take 2 starts by winding take 1 back: the take-1 frame shown on f."""
    if f < B["TAKE_2"]:
        return f
    if f < B["REWOUND"]:
        u = (f - B["TAKE_2"]) / (B["REWOUND"] - B["TAKE_2"])
        return (B["TAKE_2"] - 1) * (1 - ease(u))
    return 0


def crate_at(i, f):
    if f >= B["REWOUND"] and i == PAGE_CRATE:
        crate, lid, _ = page_state(f, B["PAGE_OUT_2"])
        return crate, 0.0, lid, True
    return take1(i, take_time(f))


def folder_at(f):
    if f >= B["REWOUND"]:
        return page_state(f, B["PAGE_OUT_2"])[2]
    return page_state(take_time(f), B["PAGE_OUT"])[2]


# ---------------------------------------------------------------- camera

LENS, SENSOR = 30, 36
TAN_H = (SENSOR / 2) / LENS
TAN_V = TAN_H * H / W


def camera_at(f):
    """Eye level, square on to the wall, easing in a little over the take."""
    t = ease(f / (D - 1))
    pos = Vector((2.95, -8.7 + 0.4 * t, 2.2))
    at = Vector((2.9, 0.0, 2.55))
    return pos, at


def project(p, cam_pos, target):
    w = (target - cam_pos).normalized()
    r = w.cross(Vector((0, 0, 1))).normalized()
    v = r.cross(w)
    d = p - cam_pos
    z = d.dot(w)
    return (d.dot(r) / z) / TAN_H, (d.dot(v) / z) / TAN_V, z


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


def text(body, size, loc, rot, material, font):
    bpy.ops.object.text_add(location=loc)
    t = bpy.context.object
    t.data.body = body
    t.data.font = font
    t.data.size = size
    t.data.align_x = "CENTER"
    t.data.align_y = "CENTER"
    t.rotation_euler = rot
    t.data.materials.append(material)
    return t


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


def strip(arm, action, start, end):
    tr = arm.animation_data.nla_tracks.new()
    a = bpy.data.actions[action]
    s = tr.strips.new(action, int(start), a)
    length = a.frame_range[1] - a.frame_range[0]
    s.scale = max(0.05, (end - start) / length)
    # From frame 0, hold the first pose before it too: motion blur samples
    # just before frame 0, and with nothing there the rig is in its T-pose.
    s.extrapolation = "HOLD" if start == 0 else "NOTHING"
    s.blend_in = 3 if start > 0 else 0
    s.blend_out = 3
    return s


def light(scene, name, kind, loc, at, energy, size=1.0, size_y=None, color=(1, 1, 1)):
    L = bpy.data.objects.new(name, bpy.data.lights.new(name, kind))
    L.data.energy = energy
    L.data.color = color
    if kind == "AREA":
        L.data.size = size
        if size_y:
            L.data.shape = "RECTANGLE"
            L.data.size_y = size_y
    L.location = loc
    L.rotation_euler = (Vector(at) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    scene.collection.objects.link(L)
    return L


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(W, H)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 0, D - 1
    scene.render.use_motion_blur = True
    scene.render.motion_blur_shutter = 0.3
    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0022, 0.002, 0.0019, 1)
    scene.world = world
    font = bpy.data.fonts.load("/System/Library/Fonts/SFNSMono.ttf")

    floor = mat("floor", base.hexrgb("#161514"), 0.55)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(3, -4, 0))
    bpy.context.object.scale = (40, 20, 1)
    bpy.context.object.data.materials.append(floor)
    back = mat("back", base.hexrgb("#121317"), 0.8)
    cube((40, 0.2, 9), (3, 0.3, 4.5), back)

    # The shelves: a board under each row, uprights every four crates.
    steel = mat("steel", base.hexrgb("#2A2D33"), 0.45, metal=0.5)
    lip = mat("lip", CHALK, 0.5, emit=CHALK, strength=0.35)
    left, right = -SX / 2 - 0.02, (COLS - 0.5) * SX + 0.02
    width = right - left
    top = Z_BOT + ROWS * SZ
    for r in range(ROWS + 1):
        z = Z_BOT + r * SZ
        cube((width, 0.42, 0.025), ((left + right) / 2, -0.2, z - 0.0125), steel)
        cube((width, 0.01, 0.006), ((left + right) / 2, -0.415, z - 0.004), lip)
    for k in range(0, COLS + 1, 4):
        x = -SX / 2 + k * SX
        cube((0.05, 0.42, top + 0.05), (x, -0.2, (top + 0.05) / 2), steel)

    # The row signs: each row's first id, the upper level of the index.
    sign_m = mat("sign", base.hexrgb("#1E2024"), 0.5)
    digit_m = mat("digits", CHALK, 0.4, emit=CHALK, strength=1.4)
    for r in range(ROWS):
        z = Z_BOT + (ROWS - 1 - r) * SZ + CH / 2
        cube((SIGN_W, 0.03, SIGN_H), (left - SIGN_GAP - SIGN_W / 2, -0.3, z), sign_m)
        text(f"{r * COLS * T['crateOrders'] + 1:,}", 0.14, (left - SIGN_GAP - SIGN_W / 2, -0.318, z), (math.pi / 2, 0, 0), digit_m, font)

    # The belt along the foot of the wall.
    belt_m = mat("belt", base.hexrgb("#1B1C1F"), 0.7, metal=0.2)
    cube((30, 0.5, 0.06), (0, BELT_Y, BELT_Z - 0.03), belt_m)
    cube((30, 0.03, 0.05), (0, BELT_Y - 0.26, BELT_Z + 0.01), steel)
    for x in range(-14, 16):
        cube((0.03, 0.5, 0.02), (x * 0.5, BELT_Y, BELT_Z + 0.005), steel)

    # Crates: open-topped, sheets of orders inside, a lid hinged at the
    # back, a label with the first id on the front.
    card = mat("card", base.hexrgb("#6E5E4C"), 0.85)
    inside = mat("inside", base.hexrgb("#2A241E"), 0.9)
    label = mat("label", CHALK, 0.6, emit=CHALK, strength=0.12)
    page_label = mat("pagelabel", ORANGE, 0.5, emit=ORANGE, strength=1.6)
    paper = mat("paper", CHALK, 0.7, emit=CHALK, strength=0.25)
    ink = mat("ink", base.hexrgb("#1B1512"), 0.6)

    def crate_mesh(lab, name):
        bits = [cube((CW, CD, CH), (0, 0, CH / 2), card, bevel=0.008),
                cube((CW * 0.78, 0.004, 0.12), (0, -CD / 2 - 0.002, CH * 0.55), lab),
                cube((CW - 0.04, CD - 0.04, 0.004), (0, 0, CH + 0.0005), inside)]
        for r in range(4):
            bits.append(cube((CW - 0.08, 0.012, 0.07), (0, -0.11 + r * 0.07, CH - 0.02), paper))
        return as_mesh(bits, name)

    plain = crate_mesh(label, "crate")
    page_mesh = crate_mesh(page_label, "page")
    lid_mesh = as_mesh([cube((CW + 0.006, CD + 0.006, 0.014), (0, -CD / 2 - 0.003, 0.007), card)], "lid")
    crates, lids = [], []
    for i in range(COLS * ROWS):
        o = bpy.data.objects.new(f"c{i:03d}", page_mesh if i == PAGE_CRATE else plain)
        o.rotation_mode = "XYZ"
        # In its slot from the start: motion blur reads a move from wherever
        # it was last, and the origin would smear it.
        o.location = home(i)
        scene.collection.objects.link(o)
        crates.append(o)
        lid = bpy.data.objects.new(f"lid{i:03d}", lid_mesh)
        lid.parent = o
        lid.location = (0, CD / 2, CH)
        lid.rotation_mode = "XYZ"
        scene.collection.objects.link(lid)
        lids.append(lid)
        t = text(f"{i * T['crateOrders'] + 1:,}", 0.075, (0, 0, 0), (math.pi / 2, 0, 0), ink, font)
        t.parent = o
        t.location = (0, -CD / 2 - 0.006, CH * 0.55)

    # The page: the first 100 orders of its crate, in front of the rest.
    folder_m = mat("folder", ORANGE, 0.45, emit=ORANGE, strength=1.2)
    folder = cube((CW - 0.07, 0.05, CH + 0.06), (0, 0, (CH + 0.06) / 2), folder_m, bevel=0.006)
    folder.name = "folder"
    folder.location = home(PAGE_CRATE) + Vector((0, -0.08, 0.05))

    person = load("Worker_Male")
    skin(person, "#B9825F")
    person.location = WORKER
    person.rotation_euler.z = math.radians(-35)
    strip(person, "Idle", 0, D)
    strip(person, "Punch", B["CAUGHT"] - 6, B["CAUGHT"] + 6)
    strip(person, "Punch", B["CAUGHT_2"] - 6, B["CAUGHT_2"] + 4)
    strip(person, "Victory", B["CAUGHT_2"] + 4, B["CAUGHT_2"] + 46)

    # A long light over the wall, a key from the front left, a warm rim.
    light(scene, "wall", "AREA", (3.0, -4.5, 4.6), (3.0, 0.0, 2.2), 1500, size=10, size_y=4.0, color=(1.0, 0.92, 0.82))
    light(scene, "key", "AREA", (-1.5, -6.0, 2.4), (3.0, 0.0, 1.4), 700, size=4, color=(1.0, 0.9, 0.8))
    light(scene, "rim", "AREA", (8.5, -3.0, 2.8), (6.5, -1.7, 1.0), 260, size=2, color=(1.0, 0.8, 0.6))

    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    cam.data.lens = LENS
    cam.data.sensor_width = SENSOR
    cam.data.sensor_fit = "HORIZONTAL"
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 8
    scene.camera = cam
    for f in range(D):
        pos, at = camera_at(f)
        cam.location = pos
        cam.rotation_euler = (at - pos).to_track_quat("-Z", "Y").to_euler()
        cam.data.dof.focus_distance = (Vector((at.x, -0.3, at.z)) - pos).length
        cam.keyframe_insert("location", frame=f)
        cam.keyframe_insert("rotation_euler", frame=f)
        cam.data.keyframe_insert("dof.focus_distance", frame=f)
        # The folder is keyed: it flies fast, and its blur has to follow
        # its keys, not where it was last rendered.
        folder.location = folder_at(f)
        folder.keyframe_insert("location", frame=f)

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
    return scene, crates, lids


def place(crates, lids, f):
    for i, o in enumerate(crates):
        p, rx, lid, shown = crate_at(i, f)
        o.location = p
        o.rotation_euler.x = rx
        o.hide_render = not shown
        lids[i].rotation_euler.x = lid


# ---------------------------------------------------------------- output


def track():
    """Where the reel's labels go, as fractions of the frame, every frame:
    the first crate's label, the page's crate's front, the page's row sign,
    and the folder."""
    left = -SX / 2 - 0.02
    sign_z = Z_BOT + (ROWS - 1 - row_of(PAGE_CRATE)) * SZ + CH / 2
    rows = []
    for f in range(D):
        cam, at = camera_at(f)

        def pt(p):
            x, y, _ = project(p, cam, at)
            return [round(x * 0.5 + 0.5, 4), round(0.5 - y * 0.5, 4)]

        def rect(lo, hi):
            a, b = pt(lo), pt(hi)
            return [min(a[0], b[0]), min(a[1], b[1]), max(a[0], b[0]), max(a[1], b[1])]

        c0 = crate_at(0, f)[0]
        pg = crate_at(PAGE_CRATE, f)[0]
        front = -CD / 2
        rows.append([
            *pt(c0 + Vector((0, -CD / 2, CH * 0.55))),
            *rect(pg + Vector((-CW / 2, front, 0)), pg + Vector((CW / 2, front, CH))),
            *rect(Vector((left - SIGN_GAP - SIGN_W, -0.32, sign_z - SIGN_H / 2)), Vector((left - SIGN_GAP, -0.32, sign_z + SIGN_H / 2))),
            *pt(folder_at(f) + Vector((0, 0, CH + 0.06))),
        ])
    json.dump(rows, open(OUT, "w"))
    print(f"wrote {OUT}")


def render():
    scene, crates, lids = build()
    os.makedirs(OUT, exist_ok=True)
    frames = [int(x) for x in os.environ["FRAMES"].split(",")] if os.environ.get("FRAMES") else range(D)
    for f in frames:
        scene.frame_set(f)
        place(crates, lids, f)
        scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
        bpy.ops.render.render(write_still=True)


if OUT.endswith(".json"):
    track()
else:
    render()
