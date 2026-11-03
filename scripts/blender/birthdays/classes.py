"""The birthday reel: 23 students, 253 strings, then 100 classrooms.

Run headless:
  Blender -b --factory-startup -P scripts/blender/birthdays/classes.py -- \
      public/vr60/timeline.json <frames dir | track.json>

A classroom seen from above and in front. Twenty-three students stand in a
ring facing the camera. A string is drawn on the floor between every pair
of them, 253 in all, faster and faster, until the floor is a web. One
string turns orange: the two students it joins share a birthday, and both
raise a hand. Then the camera rises out of the room and it is one of 100
classrooms, each with its own 23 and its own web; every room where two
share a birthday lights an orange border and its matching string, nearest
first.

Which pair matches, and which rooms have a match, come from
scripts/measure-birthdays.mjs (curriculum/vertical/60-birthdays/runs);
the frames come from src/vertical/60-birthdays/beats.ts (timeline.json).

Given a directory, renders every frame into it (or only FRAMES=a,b,c);
RES=50 renders a half-size proof. Given a .json path, writes where every
student's head is on screen, for the reel's date tags.
"""

import json
import math
import os
import sys

import bpy
import numpy as np
from bpy_extras.object_utils import world_to_camera_view
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
W, H = 1080, 1920

N = 23
SCALE = 0.82  # the pack's people are 2.2 units tall: about 1.8 m
RING = 4.2  # metres from the room's centre to each student
ROOM = 12.0
PITCH = 13.0
WALL_H = 0.8
HEAD_Z = 2.05  # where a date tag sits, just above a head
ORANGE = "#FF7A33"
CHALK = "#E9E4D8"
MODELS = [
    "Casual_Male", "Casual_Female", "Casual2_Male", "Casual2_Female",
    "Casual3_Male", "Casual3_Female", "Casual_Bald", "Suit_Male", "Suit_Female",
]
SKINS = ["#F1D3B6", "#E0B892", "#C99A72", "#A8774F", "#7D5638", "#5C3E2A"]
HAIRS = ["#1C1612", "#3B2A1E", "#5E4430", "#8A6A4A", "#2A2522", "#B89A72"]
SHIRTS = ["#3E4A5C", "#6E3540", "#4E5A3A", "#7A7E86", "#33504C", "#8A7458", "#4A3D52", "#2F3A52", "#B5B0A6", "#5A6F8A"]


def seat(i):
    """Student i's spot on the ring; student 0 nearest the camera."""
    a = math.radians(-90 + i * 360 / N)
    return Vector((RING * math.cos(a), RING * math.sin(a), 0.0))


def centre(cell):
    """A room's centre. The first room is at the origin, cell 44."""
    c, r = cell % T["cols"], cell // T["cols"]
    return Vector(((c - 4) * PITCH, (r - 4) * PITCH, 0.0))


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- materials


def frame_value(nt):
    v = nt.nodes.new("ShaderNodeValue")
    d = v.outputs[0].driver_add("default_value")
    d.driver.type = "SCRIPTED"
    d.driver.expression = "frame"
    return v.outputs[0]


def maths(nt, op, a, b=None):
    m = nt.nodes.new("ShaderNodeMath")
    m.operation = op
    for i, x in enumerate((a, b)):
        if x is None:
            continue
        if isinstance(x, (int, float)):
            m.inputs[i].default_value = x
        else:
            nt.links.new(x, m.inputs[i])
    return m.outputs[0]


def glow(name, color, steady, flash, tau):
    """Dark until the frame in the face's `lit` attribute, then a flash
    that settles to a steady glow."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = base.hexrgb(color)
    at = nt.nodes.new("ShaderNodeAttribute")
    at.attribute_type = "GEOMETRY"
    at.attribute_name = "lit"
    age = maths(nt, "SUBTRACT", frame_value(nt), at.outputs["Fac"])
    on = maths(nt, "GREATER_THAN", age, 0.0)
    ex = maths(nt, "EXPONENT", maths(nt, "MULTIPLY", maths(nt, "MAXIMUM", age, 0.0), -1.0 / tau))
    s = maths(nt, "ADD", maths(nt, "MULTIPLY", ex, flash), steady)
    nt.links.new(s, em.inputs["Strength"])
    # Not drawn yet means not there: transparent, not a black line.
    clear = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(on, mix.inputs["Fac"])
    nt.links.new(clear.outputs[0], mix.inputs[1])
    nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    return m


def solid(name, color, rough=0.6):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = base.hexrgb(color)
    p.inputs["Roughness"].default_value = rough
    return m


def shirts(name):
    """Muted shirt colours, one per pawn, picked by the object's random value."""
    m = solid(name, "#7A7E86", 0.7)
    nt = m.node_tree
    info = nt.nodes.new("ShaderNodeObjectInfo")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    els = ramp.color_ramp.elements
    ramp.color_ramp.interpolation = "CONSTANT"
    for k, c in enumerate(SHIRTS):
        e = els[0] if k == 0 else (els[1] if k == 1 else els.new(0))
        e.position = k / len(SHIRTS)
        e.color = base.hexrgb(c)
    nt.links.new(info.outputs["Random"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
    return m


# ---------------------------------------------------------------- meshes


def ribbons(name, segs, width, z, mat, lit):
    """Flat strips, one per (a, b) segment, `width` wide, each face carrying
    its segment's frame in `lit`."""
    A = np.array([s[0] for s in segs], dtype=np.float64)
    Bv = np.array([s[1] for s in segs], dtype=np.float64)
    d = Bv - A
    L = np.linalg.norm(d, axis=1)
    u = d / L[:, None]
    n = np.stack([-u[:, 1], u[:, 0]], 1) * (width / 2)
    quad = np.stack([A - n, Bv - n, Bv + n, A + n], 1).reshape(-1, 2)
    m = len(A)
    V = np.concatenate([quad, np.full((len(quad), 1), z)], 1).astype(np.float32)
    me = bpy.data.meshes.new(name)
    me.vertices.add(len(V))
    me.vertices.foreach_set("co", V.ravel())
    me.loops.add(m * 4)
    me.loops.foreach_set("vertex_index", np.arange(m * 4, dtype=np.int32))
    me.polygons.add(m)
    me.polygons.foreach_set("loop_start", np.arange(0, m * 4, 4, dtype=np.int32))
    me.update(calc_edges=True)
    at = me.attributes.new("lit", "FLOAT", "FACE")
    at.data.foreach_set("value", np.asarray(lit, dtype=np.float32))
    me.materials.append(mat)
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    return o


def cube(name, size, loc, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    o.data.materials.append(mat)
    return o


def build_rooms():
    wood = solid("floor", "#6A5643", 0.55)
    wall = solid("wall", "#B9B2A6", 0.8)
    for room in T["rooms"]:
        c = centre(room["cell"])
        cube(f"floor{room['cell']}", (ROOM, ROOM, 0.1), c + Vector((0, 0, -0.05)), wood)
        for sx, sy, w, h in ((0, 1, ROOM, 0.15), (0, -1, ROOM, 0.15), (1, 0, 0.15, ROOM), (-1, 0, 0.15, ROOM)):
            cube(
                f"wall{room['cell']}{sx}{sy}", (w, h, WALL_H),
                c + Vector((sx * ROOM / 2, sy * ROOM / 2, WALL_H / 2)), wall,
            )
    # Every room's border on top of its walls, orange from the frame that
    # room is counted. Rooms without a match never light.
    segs, lit = [], []
    for room in T["rooms"]:
        if room["lit"] is None:
            continue
        c = centre(room["cell"])
        h = ROOM / 2
        corners = [(-h, -h), (h, -h), (h, h), (-h, h)]
        for k in range(4):
            a, b = corners[k], corners[(k + 1) % 4]
            segs.append(((c.x + a[0], c.y + a[1]), (c.x + b[0], c.y + b[1])))
            lit.append(room["lit"])
    ribbons("borders", segs, 0.5, WALL_H + 0.01, glow("border", ORANGE, 3.0, 10.0, 6.0), lit)


def build_strings():
    pairs = T["pairs"]
    hero_pair = tuple(T["heroPair"])
    # The first room: drawn pair by pair.
    segs = [((seat(i).x, seat(i).y), (seat(j).x, seat(j).y)) for i, j in pairs]
    ribbons("strings", segs, 0.02, 0.012, glow("string", CHALK, 0.55, 4.0, 5.0), T["pairLit"])
    a, b = seat(hero_pair[0]), seat(hero_pair[1])
    ribbons("match", [((a.x, a.y), (b.x, b.y))], 0.11, 0.02, glow("match", ORANGE, 4.0, 14.0, 8.0), [B["MATCH"]])
    # The other 99: every string already there; their matches light orange
    # with the room's border.
    segs, lit, msegs, mlit = [], [], [], []
    for room in T["rooms"]:
        c = centre(room["cell"])
        if room["cell"] == 44:
            continue
        for i, j in pairs:
            p, q = seat(i) + c, seat(j) + c
            segs.append(((p.x, p.y), (q.x, q.y)))
            lit.append(B["RISE"] + 10)
        for i, j in room["pairs"]:
            p, q = seat(i) + c, seat(j) + c
            msegs.append(((p.x, p.y), (q.x, q.y)))
            mlit.append(room["lit"])
    ribbons("webs", segs, 0.04, 0.012, glow("web", CHALK, 0.45, 0.0, 1.0), lit)
    if msegs:
        ribbons("matches", msegs, 0.22, 0.02, glow("matches", ORANGE, 4.0, 12.0, 6.0), mlit)


def build_pawns():
    """The other rooms' students: a body and a head, one shared mesh."""
    bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=1.2, location=(0, 0, 0.6), vertices=12)
    body = bpy.context.active_object
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.2, location=(0, 0, 1.45), segments=12, ring_count=8)
    head = bpy.context.active_object
    body.select_set(True)
    head.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    pawn = bpy.context.active_object
    pawn.data.materials.append(shirts("pawn"))
    mesh = pawn.data
    bpy.data.objects.remove(pawn)
    col = bpy.context.scene.collection
    for room in T["rooms"]:
        if room["cell"] == 44:
            continue
        c = centre(room["cell"])
        for i in range(N):
            o = bpy.data.objects.new(f"p{room['cell']}_{i}", mesh)
            o.location = seat(i) + c
            col.objects.link(o)


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


def dress(arm, i):
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
                    bsdf.inputs["Base Color"].default_value = base.hexrgb(SHIRTS[(i * 7) % len(SHIRTS)])
                elif n == "Skin":
                    bsdf.inputs["Base Color"].default_value = base.hexrgb(SKINS[(i * 5) % len(SKINS)])
                elif n == "Hair":
                    bsdf.inputs["Base Color"].default_value = base.hexrgb(HAIRS[(i * 3) % len(HAIRS)])
                elif n == "Face":
                    bsdf.inputs["Base Color"].default_value = base.hexrgb("#1B1512")
                if n != "Face":
                    bsdf.inputs["Roughness"].default_value = 0.7
            slot.material = m


def strip(arm, action, start, end, hold=False, loop=False, rate=1.0, upto=1.0):
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


def students():
    people = []
    for i in range(N):
        arm = load(MODELS[i % len(MODELS)])
        arm.location = seat(i)
        dress(arm, i)
        people.append(arm)
    for i, arm in enumerate(people):
        strip(arm, "Idle", -((i * 11) % 37), D + 40, loop=True, rate=0.9 + (i % 5) * 0.04)
    for i in T["heroPair"]:
        arm = people[i]
        strip(arm, "Victory", B["MATCH"], B["MATCH"] + 12, upto=0.5)
        h = strip(arm, "Victory", B["MATCH"] + 12, D, hold=True)
        a, b = h.action.frame_range
        h.action_frame_start = a + 0.5 * (b - a)
    return people


# ---------------------------------------------------------------- camera
LENS = 24.0


def camera_at(f):
    """Above and in front of the first room, easing in a little, then
    rising out of it until all 100 rooms are in view, then drifting."""
    rise = ease((f - B["RISE"]) / (B["RISEN"] - B["RISE"]))
    after = max(0.0, (f - B["RISEN"]) / (D - B["RISEN"]))
    pitch = math.radians(50 + 16 * rise)
    dist = math.exp(math.log(16.6 - 0.8 * min(1.0, f / B["RISE"])) * (1 - rise) + math.log(186.0) * rise)
    dist *= 1 - 0.07 * after
    yaw = math.radians(-3 + 6 * f / D)
    at = Vector((0.0, 0.2 * (1 - rise) - 1.0 * rise, 0.7 * (1 - rise)))
    w = Vector((math.sin(yaw) * math.cos(pitch), math.cos(yaw) * math.cos(pitch), -math.sin(pitch)))
    return at - w * dist, at


def make_camera(scene):
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    cam.data.lens = LENS
    cam.data.sensor_fit = "VERTICAL"
    cam.data.sensor_height = 36
    cam.data.clip_start = 0.1
    cam.data.clip_end = 1000
    scene.camera = cam
    for f in range(D):
        pos, at = camera_at(f)
        cam.location = pos
        cam.rotation_euler = (at - pos).to_track_quat("-Z", "Y").to_euler()
        cam.keyframe_insert("location", frame=f)
        cam.keyframe_insert("rotation_euler", frame=f)
    return cam


# ---------------------------------------------------------------- scene


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(W, H)
    scene = bpy.context.scene
    scene.render.resolution_percentage = int(os.environ.get("RES", "100"))
    scene.frame_start, scene.frame_end = 0, D - 1

    world = bpy.data.worlds.new("dark")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = base.hexrgb("#06070A")
    bg.inputs["Strength"].default_value = 1.0
    scene.world = world

    # The other 99 rooms are in the dark until the camera rises; the sun
    # comes up with it.
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    for f, e in ((0, 0.0), (B["RISE"], 0.0), (B["RISE"] + 40, 3.0)):
        sun.data.energy = e
        sun.data.keyframe_insert("energy", frame=f)
    sun.data.color = (1.0, 0.95, 0.88)
    sun.data.angle = math.radians(6)
    sun.rotation_euler = (math.radians(35), 0, math.radians(20))
    scene.collection.objects.link(sun)
    # The first room under its own light, from above and in front.
    spot = bpy.data.objects.new("spot", bpy.data.lights.new("spot", "SPOT"))
    spot.data.energy = 9000
    spot.data.spot_size = math.radians(56)
    spot.data.spot_blend = 0.35
    spot.data.color = (1.0, 0.95, 0.88)
    spot.location = (0, -5, 13)
    spot.rotation_euler = (Vector((0, 0.4, 0)) - Vector((0, -5, 13))).to_track_quat("-Z", "Y").to_euler()
    scene.collection.objects.link(spot)

    build_rooms()
    build_strings()
    build_pawns()
    students()
    make_camera(scene)

    ng = bpy.data.node_groups.new("comp", "CompositorNodeTree")
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    rl = ng.nodes.new("CompositorNodeRLayers")
    glare = ng.nodes.new("CompositorNodeGlare")
    glare.inputs["Type"].default_value = "Bloom"
    glare.inputs["Threshold"].default_value = 0.8
    glare.inputs["Strength"].default_value = 0.4
    glare.inputs["Size"].default_value = 0.5
    outn = ng.nodes.new("NodeGroupOutput")
    ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
    ng.links.new(glare.outputs["Image"], outn.inputs[0])
    scene.compositing_node_group = ng
    scene.render.use_compositing = True
    return scene


def track():
    """Every student's tag point on screen, as fractions of the frame, every
    frame: 23 (x, y) pairs with y from the top."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = W, H
    cam = make_camera(scene)
    rows = []
    for f in range(D):
        scene.frame_set(f)
        row = []
        for i in range(N):
            q = world_to_camera_view(scene, cam, seat(i) + Vector((0, 0, HEAD_Z)))
            row += [round(q.x, 4), round(1 - q.y, 4)]
        rows.append(row)
    json.dump(rows, open(OUT, "w"))
    print(f"wrote {OUT}")


def render():
    scene = build()
    os.makedirs(OUT, exist_ok=True)
    frames = (
        [int(x) for x in os.environ["FRAMES"].split(",") if x.strip()]
        if os.environ.get("FRAMES")
        else range(D)
    )
    for f in frames:
        scene.frame_set(f)
        scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
        bpy.ops.render.render(write_still=True)


if OUT.endswith(".json"):
    track()
else:
    render()
