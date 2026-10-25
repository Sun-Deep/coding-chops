"""The Google interview reel's room, rendered in Blender.

Run headless:
  Blender -b --factory-startup -P scripts/blender/interview/room.py -- \
      public/vr50/timeline.json <frames dir>

Eye level, side on, in a dim office. A candidate sits at a laptop on the
left, an interviewer across the desk on the right. The laptop's screen
lights the candidate: plain while they read the code, orange when the AI's
fix fails its test (on "wrong"), and white again when the real fix passes
(on "understand the code").

The two act out what the voice says, keyed on its words: the candidate
reads, types the question to the AI, accepts its fix, leans in while the
tests run, shakes their head when one fails, types the real fix and sits
back; the interviewer watches, glances at the screen, writes a note when
the AI's fix fails and nods when the real one passes.

The code, the test and every word are drawn over this by Remotion.
Characters are Quaternius's CC0 pack (third_party/quaternius-characters,
not in Git).

Renders every frame into the directory, or only FRAMES=a,b,c.
"""

import json
import math
import os
import sys

import bpy
from mathutils import Quaternion, Vector

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

W, H = 1620, 516
SCALE = 0.6
SIT_Z = 0.26
DESK_Z = 0.6
CAND = Vector((-0.74, 0.0, 0.0))
INTV = Vector((0.74, 0.0, 0.0))
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


def box(name, size, loc, material, bevel=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        b = o.modifiers.new("b", "BEVEL")
        b.width = bevel
        b.segments = 2
    o.data.materials.append(material)
    return o


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


def dress(arm, colours):
    for child in arm.children_recursive:
        if child.type != "MESH":
            continue
        for slot in child.material_slots:
            src = slot.material
            if src is None:
                continue
            n = src.name.split(".")[0]
            m = src.copy()
            slot.link = "OBJECT"
            bsdf = m.node_tree.nodes.get("Principled BSDF")
            if bsdf is not None:
                if n in colours:
                    bsdf.inputs["Base Color"].default_value = base.hexrgb(colours[n])
                if n != "Face":
                    bsdf.inputs["Roughness"].default_value = 0.7
            slot.material = m


def seated(arm):
    """SitDown held at its last frame for the whole reel."""
    tr = arm.animation_data.nla_tracks.new()
    a = bpy.data.actions["SitDown"]
    s = tr.strips.new("SitDown", 0, a)
    s.action_frame_start = a.frame_range[1] - 0.5
    s.action_frame_end = a.frame_range[1]
    s.extrapolation = "HOLD_FORWARD"


# ---------------------------------------------------------------- acting
#
# Each person's motion is a set of small turns on top of the seated pose,
# keyed every frame from the voice's beats and laid over SitDown as a
# COMBINE strip. Axes from probing the rig: a positive turn about a bone's X
# nods the head or leans the torso forward and raises a forearm; Z turns the
# head to the side.

XA, ZA = Vector((1, 0, 0)), Vector((0, 0, 1))


def window(f, a, b, edge=5):
    """1 inside [a, b], easing in and out over `edge` frames."""
    return ramp(f, a - edge, a) * (1 - ramp(f, b, b + edge))


def pulse(f, at, length):
    """A single bump from 0 up to 1 and back over `length` frames."""
    t = (f - at) / length
    return math.sin(math.pi * t) if 0 <= t <= 1 else 0.0


TYPING = [
    (B["gemini"] - 8, B["gemini"] + 14),  # the question to the AI
    (B["grade"] - 2, B["grade"] + 8),  # accepting its fix
    (B["understand"] - 6, B["understand"] + 14),  # the real fix
]


def cand(f):
    breathe = 1.2 * math.sin(f * 0.11)
    typing = max(window(f, a, b, 4) for a, b in TYPING)
    lean = window(f, B["catchIt"] - 4, B["understand"] - 8, 10)
    back = ramp(f, B["understand"] + 16, B["understand"] + 28)
    shake = window(f, B["wrong"] + 2, B["wrong"] + 20, 3)
    up = ramp(f, B["pilot"], B["pilot"] + 20)
    torso = 5 + 7 * lean - 6 * back + breathe
    head = (14 + 4 * lean) * (1 - 0.7 * up) - 4 * back + 9 * pulse(f, B["understand"] + 22, 14)
    turn = 9 * math.sin((f - B["wrong"]) * 0.9) * shake
    tap = 6 * typing
    return {
        "Torso": [(XA, torso)],
        "Head": [(XA, head), (ZA, turn)],
        "LowerArm.R": [(XA, 14 + tap * math.sin(f * 1.9))],
        "LowerArm.L": [(XA, 14 + tap * math.sin(f * 1.9 + 1.7))],
    }


def intv(f):
    breathe = 1.0 * math.sin(f * 0.1 + 1.3)
    writes = window(f, B["wrong"] + 6, B["wrong"] + 44, 6)
    glance = window(f, B["gemini"] - 6, B["grade"] + 10, 8)
    head = 4 + 14 * writes + 6 * glance + 10 * pulse(f, B["understand"] + 26, 14)
    scribble = writes * (5 * math.sin(f * 2.3) + 3)
    return {
        "Torso": [(XA, 3 + 4 * writes + breathe)],
        "Head": [(XA, head), (ZA, -5 * glance)],
        "LowerArm.R": [(XA, 10 + scribble), (ZA, 2 * writes * math.sin(f * 1.7))],
        "LowerArm.L": [(XA, 6)],
    }


def act(arm, who):
    """Bake the motion into an action and lay it over the seated pose."""
    motion = cand if who == "cand" else intv
    action = bpy.data.actions.new(f"{who}-acting")
    arm.animation_data.action = action
    for f in range(D):
        for bone, turns in motion(f).items():
            q = Quaternion()
            for axis, deg in turns:
                q = q @ Quaternion(axis, math.radians(deg))
            pb = arm.pose.bones[bone]
            pb.rotation_quaternion = q
            pb.keyframe_insert("rotation_quaternion", frame=f)
    arm.animation_data.action = None
    tr = arm.animation_data.nla_tracks.new()
    s = tr.strips.new(action.name, 0, action)
    s.blend_type = "COMBINE"
    s.extrapolation = "HOLD"


def chair(name, at, facing, wood, fabric):
    parts = [
        box(f"{name}seat", (0.38, 0.36, 0.06), at + Vector((0, 0, 0.32)), fabric, 0.02),
        box(f"{name}leg", (0.05, 0.05, 0.3), at + Vector((0, 0, 0.15)), wood),
        box(f"{name}base", (0.3, 0.3, 0.025), at + Vector((0, 0, 0.015)), wood),
    ]
    back = at + Vector((-0.2 * facing, 0, 0.58))
    parts.append(box(f"{name}back", (0.05, 0.36, 0.46), back, fabric, 0.02))
    return parts


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(W, H)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 0, D - 1
    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.004, 0.0042, 0.005, 1)
    scene.world = world

    floor = mat("floor", base.hexrgb("#1E1916"), 0.55)
    wall = mat("wall", base.hexrgb("#1A1D22"), 0.85)
    wood = mat("wood", base.hexrgb("#3A2C22"), 0.5)
    dark = mat("dark", base.hexrgb("#16171A"), 0.5, metal=0.4)
    fabric = mat("fabric", base.hexrgb("#2A2D33"), 0.85)

    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
    bpy.context.object.scale = (20, 20, 1)
    bpy.context.object.data.materials.append(floor)
    box("wall", (12, 0.1, 4), (0, 1.6, 2), wall)
    # The desk.
    box("top", (1.1, 0.7, 0.04), (0, 0, DESK_Z), wood, 0.01)
    # Thin legs at the corners, so knees fit under the top.
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"leg{sx}{sy}", (0.035, 0.035, DESK_Z), (sx * 0.5, sy * 0.3, DESK_Z / 2), dark)
    chair("c", CAND, 1, dark, fabric)
    chair("i", INTV, -1, dark, fabric)
    # A notepad in front of the interviewer.
    box("pad", (0.16, 0.22, 0.01), (0.3, -0.05, DESK_Z + 0.025), mat("paper", CHALK, 0.8), rot=(0, 0, math.radians(-8)))

    # The laptop: base on the desk, screen turned to the candidate and a
    # little to the camera, so its light reads on their face.
    lap = bpy.data.objects.new("laptop", None)
    scene.collection.objects.link(lap)
    lap.location = (-0.33, -0.04, DESK_Z + 0.02)
    lap.rotation_euler = (0, 0, math.radians(35))
    lbase = box("lapbase", (0.22, 0.32, 0.015), (0, 0, 0.008), dark, 0.004)
    lbase.parent = lap
    lid = box("laplid", (0.012, 0.32, 0.21), (0.11, 0, 0.11), dark, 0.003, rot=(0, math.radians(-12), 0))
    lid.parent = lap
    screen_m = mat("screen", CHALK, 0.3, emit=CHALK, strength=1.0)
    screen = box("screen", (0.004, 0.29, 0.18), (0.102, 0, 0.11), screen_m, rot=(0, math.radians(-12), 0))
    screen.parent = lap

    cand = load("Casual2_Male")
    dress(cand, {"Shirt": "#4E6A8A", "Skin": "#C99272", "Hair": "#2B1E16", "Face": "#1B1512"})
    intv = load("Suit_Female")
    dress(intv, {"Skin": "#8D5B3E", "Hair": "#1E1A18", "Face": "#1B1512"})
    for arm, at, heading, who in ((cand, CAND, 90, "cand"), (intv, INTV, -90, "intv")):
        seated(arm)
        act(arm, who)
        arm.location = at + Vector((0, 0, SIT_Z))
        arm.rotation_euler.z = math.radians(heading)

    def light(name, kind, loc, at, energy, size=1.0, color=(1, 1, 1)):
        L = bpy.data.objects.new(name, bpy.data.lights.new(name, kind))
        L.data.energy = energy
        L.data.color = color
        if kind == "AREA":
            L.data.size = size
        L.location = loc
        L.rotation_euler = (Vector(at) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        scene.collection.objects.link(L)
        return L

    light("lamp", "AREA", (0.1, -0.6, 2.0), (0, 0, DESK_Z), 140, size=1.2, color=(1.0, 0.86, 0.7))
    light("fill", "AREA", (-1.5, -3.5, 1.8), (0, 0, 1.0), 90, size=3, color=(0.85, 0.9, 1.0))
    light("rim", "AREA", (0.5, 1.2, 2.2), (0, 0, 1.0), 120, size=2, color=(0.8, 0.86, 1.0))
    glow = light("glow", "POINT", (-0.5, -0.08, DESK_Z + 0.2), (0, 0, 0), 25)
    glow.data.shadow_soft_size = 0.2

    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    cam.data.lens = 32
    cam.data.sensor_width = 36
    cam.data.sensor_fit = "HORIZONTAL"
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 3.5
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
    return scene, cam, screen_m, glow


def screen_state(f):
    """Colour and strength of the screen: plain, orange on the failed test,
    then bright white when the fix passes."""
    fail = ramp(f, B["wrong"], B["wrong"] + 4) * (1 - ramp(f, B["understand"], B["understand"] + 10))
    ok = ramp(f, B["understand"] + 6, B["understand"] + 14) * (1 - 0.6 * ramp(f, B["pilot"], B["pilot"] + 20))
    c = Vector(CHALK[:3]).lerp(Vector(ORANGE[:3]), fail)
    return c, 1.0 + 2.5 * fail + 1.6 * ok


def camera_at(f):
    """Eye level across the desk, easing in on the candidate while the
    test runs, back out for the pilot."""
    t = f / (D - 1)
    near = ramp(f, B["grade"], B["catchIt"] + 10) * (1 - ramp(f, B["pilot"], B["pilot"] + 30))
    pos = Vector((0.05 - 0.15 * t, -5.6, 1.3)).lerp(Vector((-0.3, -4.6, 1.26)), near)
    at = Vector((0.0, 0.0, 1.02)).lerp(Vector((-0.36, 0.0, 1.0)), near)
    return pos, at


def render():
    scene, cam, screen_m, glow = build()
    os.makedirs(OUT, exist_ok=True)
    frames = [int(x) for x in os.environ["FRAMES"].split(",")] if os.environ.get("FRAMES") else range(D)
    scene.render.filepath = os.path.join(OUT, "warmup.png")
    bpy.ops.render.render(write_still=True)
    os.remove(scene.render.filepath)
    p = screen_m.node_tree.nodes["Principled BSDF"]
    for f in frames:
        scene.frame_set(f)
        c, s = screen_state(f)
        p.inputs["Emission Color"].default_value = (c.x, c.y, c.z, 1)
        p.inputs["Emission Strength"].default_value = s
        glow.data.color = (c.x, c.y, c.z)
        glow.data.energy = 18 * s
        pos, at = camera_at(f)
        cam.location = pos
        cam.rotation_euler = (at - pos).to_track_quat("-Z", "Y").to_euler()
        cam.data.dof.focus_distance = (Vector((-0.45, 0, 0.8)) - pos).length
        scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
        bpy.ops.render.render(write_still=True)


render()
