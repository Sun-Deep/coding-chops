"""The Gangnam Style reel's video: a dancer in a blue suit and round
sunglasses doing the horse-riding dance, rendered in Blender for the
player in the middle of the reel's video page.

Run headless:
  Blender -b --factory-startup -P scripts/blender/gangnam/dancer.py -- \
      public/vr51/timeline.json <frames dir>

Not footage from the music video, which is PSY's: a Quaternius CC0
character (Suit_Male) dancing on a sunny set, so the player reads as
Gangnam Style without a frame of the real video in it.

The dance: the pack's Run_Carry legs in place, one stride a beat at 132
beats a minute, a hop on every beat, and both arms posed here, wrists
crossed in front at chest height as if holding reins, bouncing with the
hop. Beats come from timeline.json (`src/vertical/51-gangnam-counter/beats.ts`):

  dancing      from the first frame, facing the viewer, while the count
               climbs to 2,147,483,647 and the carry runs through the
               bits: the reins, pumped on every beat;
  the slump    when the count reads -2,147,483,648 he stops and slumps
               (the pack's Defeat);
  dancing      once the counter is 64 bits and reads 2,147,483,648, he
               dances again; through the race to 6 billion the right arm
               whirls the lasso overhead.

Given a directory, renders every frame into it (or only FRAMES=a,b,c).
"""

import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Quaternion, Vector

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

W, H = 1280, 720
BEAT = 30 * 60 / 132  # frames a beat
# When he stops, and when he dances again: as the readout turns negative,
# and as it reads positive in 64 bits (`count.ts`).
STOP = B["SIGN_AT"] + 6
RESUME = B["LONG_FROM"] + 18


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def dancing(f):
    """1 while dancing, 0 while slumped, eased over a few frames."""
    return 1 - ease((f - STOP) / 6) + ease((f - RESUME) / 8) if f >= STOP else 1.0


def hop(f):
    """Height off the floor: a hop on every beat."""
    return 0.09 * abs(math.sin(math.pi * f / BEAT))


# ---------------------------------------------------------------- arms


def aim(rest_dir, target_dir):
    return rest_dir.normalized().rotation_difference(target_dir.normalized())


LASSO_FROM = B["RACE_FROM"] - 6


def arm_targets(side, f):
    """Where the elbow and the hand go on frame f, in armature space.

    The reins: elbows forward at chest height, forearms crossed at the
    wrists in front, the right one in front (his arms are short, so the
    elbows sit well forward for the wrists to meet), pumped down hard as the
    feet land on every beat and lifted between. From LASSO_FROM, through the race to 6 billion, the right arm
    goes up and whirls the lasso overhead, a turn every two beats, while
    the left hand keeps the reins."""
    s = 1 if side == "L" else -1
    pump = math.cos(math.pi * f / BEAT) ** 2  # 1 as the feet land
    elbow = Vector((s * 0.36, -0.42, 1.64 - 0.12 * pump))
    hand = Vector((-s * 0.06, -0.66 - (0.04 if side == "R" else 0.0), 1.80 - 0.30 * pump))
    lasso = ease((f - LASSO_FROM) / 8) if side == "R" else 0.0
    if lasso > 0:
        turn = 2 * math.pi * (f - LASSO_FROM) / (2 * BEAT)
        up_elbow = Vector((-0.66, -0.12, 2.40))
        up_hand = Vector((-0.70 + 0.26 * math.cos(turn), -0.10 + 0.26 * math.sin(turn), 2.95))
        elbow = elbow.lerp(up_elbow, lasso)
        hand = hand.lerp(up_hand, lasso)
    return elbow, hand


def arm_pose(arm, side, f, torso):
    """Local rotations for the upper and lower arm that put the elbow and
    the hand where `arm_targets` says, given the torso's pose on this frame
    (the run cycle leans it), with the shoulder held at rest under it."""
    bones = arm.data.bones
    t_rest = bones["Torso"].matrix_local
    sh_rest = bones[f"Shoulder.{side}"].matrix_local
    up_rest = bones[f"UpperArm.{side}"].matrix_local
    low_rest = bones[f"LowerArm.{side}"].matrix_local
    y = Vector((0, 1, 0))

    shoulder = torso @ t_rest.inverted() @ sh_rest
    o_up = shoulder @ sh_rest.inverted() @ up_rest
    head = o_up.translation
    elbow, hand = arm_targets(side, f)
    # The targets move with the shoulder, so a lean carries the arms.
    shift = head - up_rest.translation
    elbow, hand = elbow + shift, hand + shift

    q0_up = o_up.to_quaternion()
    r_up = (q0_up @ y).rotation_difference(elbow - head)
    q_up = q0_up.inverted() @ r_up @ q0_up
    q_up_posed = r_up @ q0_up
    length = bones[f"UpperArm.{side}"].length
    elbow_at = head + (q_up_posed @ y) * length

    q0_low = q_up_posed @ up_rest.to_quaternion().inverted() @ low_rest.to_quaternion()
    r_low = (q0_low @ y).rotation_difference(hand - elbow_at)
    q_low = q0_low.inverted() @ r_low @ q0_low
    return q_up, q_low


# ---------------------------------------------------------------- scene


def mat(name, color, rough=0.5, metal=0.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = color
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    return m


def load(name):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(CHARS, f"{name}.gltf"))
    new = [o for o in bpy.data.objects if o not in before]
    arm = next(o for o in new if o.type == "ARMATURE")
    arm.rotation_mode = "XYZ"
    ad = arm.animation_data or arm.animation_data_create()
    ad.action = None
    for tr in list(ad.nla_tracks):
        ad.nla_tracks.remove(tr)
    return arm


def dress(arm):
    colours = {
        "Black": "#6FA8DC",  # the suit, powder blue
        "Skin": "#E3B58E",
        "Hair": "#151313",
        "Shirt": "#F2EFE8",
        "Details": "#141414",  # tie and lapels
        "Belt": "#141414",
        "Face": "#1B1512",
    }
    for child in arm.children_recursive:
        if child.type != "MESH":
            continue
        for slot in child.material_slots:
            src = slot.material
            n = src.name.split(".")[0]
            m = src.copy()
            slot.link = "OBJECT"
            b = m.node_tree.nodes.get("Principled BSDF")
            if b is not None and n in colours:
                b.inputs["Base Color"].default_value = base.hexrgb(colours[n])
                b.inputs["Roughness"].default_value = 0.55
            slot.material = m


def face_front(arm):
    """The front of the face, from the mesh: the most forward point of the
    head, and its height at the eyes."""
    body = next(o for o in arm.children_recursive if o.type == "MESH")
    dg = bpy.context.evaluated_depsgraph_get()
    me = body.evaluated_get(dg).to_mesh()
    head = [body.matrix_world @ v.co for v in me.vertices if (body.matrix_world @ v.co).z > 2.1]
    front = min(p.y for p in head)
    top = max(p.z for p in head)
    bottom = min(p.z for p in head)
    body.evaluated_get(dg).to_mesh_clear()
    return front, bottom + (top - bottom) * 0.42


def sunglasses(arm):
    """Round lenses in a tortoiseshell frame, on the head bone."""
    front, eye_z = face_front(arm)
    frame_m = mat("frame", base.hexrgb("#C9A24E"), 0.35)
    lens_m = mat("lens", base.hexrgb("#2A1A12"), 0.08, metal=0.3)
    parts = []
    for s in (-1, 1):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.13, minor_radius=0.022, location=(s * 0.17, front - 0.03, eye_z), rotation=(math.pi / 2, 0, 0))
        t = bpy.context.object
        t.data.materials.append(frame_m)
        parts.append(t)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.012, location=(s * 0.17, front - 0.03, eye_z), rotation=(math.pi / 2, 0, 0))
        c = bpy.context.object
        c.data.materials.append(lens_m)
        parts.append(c)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.12, location=(0, front - 0.035, eye_z + 0.02), rotation=(0, math.pi / 2, 0))
    bpy.context.object.data.materials.append(frame_m)
    parts.append(bpy.context.object)
    for p in parts:
        world = p.matrix_world.copy()
        p.parent = arm
        p.parent_type = "BONE"
        p.parent_bone = "Head"
        p.matrix_world = world


def strip(arm, action, start, end, track=None, blend=6):
    tr = track or arm.animation_data.nla_tracks.new()
    a = bpy.data.actions[action] if isinstance(action, str) else action
    s = tr.strips.new(a.name, int(start), a)
    length = a.frame_range[1] - a.frame_range[0]
    s.repeat = max(0.01, (end - start) / length)
    s.extrapolation = "NOTHING"
    s.blend_in = blend if start > 0 else 0
    s.blend_out = blend
    return s


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(W, H)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 0, D - 1
    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    sky = world.node_tree.nodes["Background"]
    sky.inputs["Color"].default_value = (*base.hexrgb("#5FB0EE")[:3], 1)
    sky.inputs["Strength"].default_value = 0.9
    scene.world = world

    ground = mat("ground", base.hexrgb("#E9DCC0"), 0.8)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 6, 0))
    bpy.context.object.scale = (60, 40, 1)
    bpy.context.object.data.materials.append(ground)
    # A low white wall behind, with blue bands: a sunny set, not a room.
    wall = mat("wall", base.hexrgb("#F4F1EA"), 0.7)
    band = mat("band", base.hexrgb("#3E8FD8"), 0.6)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 4.2, 0.9))
    bpy.context.object.scale = (24, 0.2, 1.8)
    bpy.context.object.data.materials.append(wall)
    for k, z in enumerate((0.55, 1.05)):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 4.08, z))
        bpy.context.object.scale = (24, 0.05, 0.16 if k == 0 else 0.08)
        bpy.context.object.data.materials.append(band)

    dancer = load("Suit_Male")
    dress(dancer)
    sunglasses(dancer)
    # Square on to the camera, to the viewer.
    dancer.rotation_euler.z = 0.0

    # The legs: Run_Carry in place, a stride a beat; the slump in between.
    run = bpy.data.actions["Run_Carry"]
    run_len = run.frame_range[1] - run.frame_range[0]
    legs = dancer.animation_data.nla_tracks.new()
    for a, b in ((0, STOP + 6), (RESUME - 4, D)):
        s = legs.strips.new("Run_Carry", int(a), run)
        s.scale = 2 * BEAT / run_len
        s.repeat = max(0.01, (b - a) / (2 * BEAT))
        s.extrapolation = "NOTHING"
        s.blend_in = 0 if a == 0 else 6
        s.blend_out = 6
    slump = bpy.data.actions["Defeat"]
    strip(dancer, slump, STOP, RESUME + 2)

    # The arms: reins, keyed on every frame, on a track above the legs.
    # The torso's pose on every frame, from the legs and the slump alone.
    torsos = {}
    for f in range(D):
        if dancing(f) > 0.001:
            scene.frame_set(f)
            torsos[f] = dancer.pose.bones["Torso"].matrix.copy()
    reins = bpy.data.actions.new("Reins")
    dancer.animation_data.action = reins
    for f in sorted(torsos):
        for side in ("L", "R"):
            # The run cycle swings the shoulders; hold them still, so the
            # arm rotations below are relative to where they rest.
            sh = dancer.pose.bones[f"Shoulder.{side}"]
            sh.rotation_mode = "QUATERNION"
            sh.rotation_quaternion = Quaternion()
            sh.keyframe_insert("rotation_quaternion", frame=f)
            q_up, q_low = arm_pose(dancer, side, f, torsos[f])
            for name, q in ((f"UpperArm.{side}", q_up), (f"LowerArm.{side}", q_low)):
                pb = dancer.pose.bones[name]
                pb.rotation_mode = "QUATERNION"
                pb.rotation_quaternion = q
                pb.keyframe_insert("rotation_quaternion", frame=f)
    dancer.animation_data.action = None
    arms = dancer.animation_data.nla_tracks.new()
    for a, b in ((0, STOP + 2), (RESUME, D)):
        s = arms.strips.new("Reins", int(a), reins)
        s.action_frame_start, s.action_frame_end = a, b
        s.frame_end = b
        s.extrapolation = "NOTHING"
        s.blend_in = 0 if a == 0 else 6
        s.blend_out = 4

    # The hop.
    for f in range(D):
        dancer.location.z = hop(f) * dancing(f)
        dancer.keyframe_insert("location", index=2, frame=f)

    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    sun.data.energy = 4.2
    sun.data.angle = math.radians(4)
    sun.rotation_euler = (math.radians(48), 0, math.radians(-28))
    scene.collection.objects.link(sun)
    fill = bpy.data.objects.new("fill", bpy.data.lights.new("fill", "AREA"))
    fill.data.energy = 400
    fill.data.size = 6
    fill.location = (-3, -6, 3)
    fill.rotation_euler = (Vector((0, 0, 1.2)) - fill.location).to_track_quat("-Z", "Y").to_euler()
    scene.collection.objects.link(fill)

    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    cam.data.lens = 42
    scene.camera = cam
    for f in range(D):
        t = f / (D - 1)
        cam.location = (0.0, -8.6 + 0.6 * t, 1.6)
        cam.rotation_euler = (Vector((0.0, 0.0, 1.32)) - cam.location).to_track_quat("-Z", "Y").to_euler()
        cam.keyframe_insert("location", frame=f)
        cam.keyframe_insert("rotation_euler", frame=f)
    return scene


def render():
    scene = build()
    os.makedirs(OUT, exist_ok=True)
    frames = [int(x) for x in os.environ["FRAMES"].split(",")] if os.environ.get("FRAMES") else range(D)
    for f in frames:
        scene.frame_set(f)
        scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
        bpy.ops.render.render(write_still=True)


render()
