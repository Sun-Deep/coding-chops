"""The deplaning reel's set: a cutaway airliner at the gate at dusk, its
cabin full of passengers, built from primitives so the repository owns it.

Run: Blender -b -P scripts/blender/deplane/scene.py -- <out.png> [frame]

Units are metres. The aircraft's nose points along +Y; Z is up. The roof of
the fuselage is cut away above the window line so the camera can look into
the cabin from above. Characters are Quaternius's CC0 Ultimate Animated
Character Pack (third_party/quaternius-characters, not in Git).
"""
import math
import os
import random
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CHARS = os.path.join(ROOT, "third_party", "quaternius-characters")

ROWS = 12
PITCH = 1.05
SEAT_W = 0.62
AISLE = 0.9
FIRST_ROW_Y = 2.0
# Character scale: the pack's people are 2.2 units tall and wide-shouldered.
CHAR_SCALE = 0.46
CABIN_HALF = 3 * SEAT_W + AISLE / 2 + 0.35
FLOOR_Z = 0.0
WALL_TOP = 0.7
ACCENT = (1.0, 0.478, 0.2)  # #FF7A33 in sRGB


def srgb(c):
    """sRGB 0-1 to linear for Blender colour inputs."""
    def ch(v):
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return (ch(c[0]), ch(c[1]), ch(c[2]), 1.0)


def hexrgb(h):
    h = h.lstrip("#")
    return srgb(tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)))


def material(name, color, rough=0.6, emit=None, strength=0.0, metal=0.0):
    m = bpy.data.materials.new(name)
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if emit is not None:
        bsdf.inputs["Emission Color"].default_value = emit
        bsdf.inputs["Emission Strength"].default_value = strength
    return m


def box(name, size, loc, mat, rot=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        mod = o.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
    o.data.materials.append(mat)
    return o


def shell(name, r, length, centre, cut_z, below, mat, segs=72, thick=0.12):
    """The part of a tube along Y below (or above) the height cut_z, as a
    thin shell with no booleans: clean edges at the cut."""
    import bmesh

    cx, cy, cz = centre
    h = max(-0.999, min(0.999, (cut_z - cz) / r))
    a_cut = math.asin(h)
    # Angles from +X, counter-clockwise in the XZ plane.
    if below:
        a0, a1 = math.pi - a_cut, 2 * math.pi + a_cut
    else:
        a0, a1 = a_cut, math.pi - a_cut
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    rings = []
    for end in (-1, 1):
        ring = []
        for i in range(segs + 1):
            a = a0 + (a1 - a0) * i / segs
            ring.append(bm.verts.new((cx + r * math.cos(a), cy + end * length / 2, cz + r * math.sin(a))))
        rings.append(ring)
    for i in range(segs):
        bm.faces.new((rings[0][i], rings[0][i + 1], rings[1][i + 1], rings[1][i]))
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat)
    sol = o.modifiers.new("solid", "SOLIDIFY")
    sol.thickness = thick
    sol.offset = 0
    for poly in me.polygons:
        poly.use_smooth = True
    return o


def row_y(r):
    """Row 0 is the front row, nearest the nose."""
    return FIRST_ROW_Y + (ROWS - 1 - r) * PITCH


def seat_x(col):
    side = -1 if col < 3 else 1
    depth = (2 - col) if col < 3 else (col - 3)
    return side * (AISLE / 2 + SEAT_W / 2 + depth * SEAT_W)


# ----------------------------------------------------------------- the set


def build_world():
    scene = bpy.context.scene
    world = bpy.data.worlds.new("dusk")
    world.use_nodes = True
    nt = world.node_tree
    bg = nt.nodes["Background"]
    coord = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    nt.links.new(coord.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], bg.inputs[0])
    els = ramp.color_ramp.elements
    els[0].position = 0.0
    els[0].color = hexrgb("#F2A66B")
    els[1].position = 0.35
    els[1].color = hexrgb("#1D2A4A")
    mid_el = els.new(0.08)
    mid_el.color = hexrgb("#C9787A")
    bg.inputs[1].default_value = 1.0
    scene.world = world

    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    sun.data.energy = 3.2
    sun.data.color = (1.0, 0.78, 0.55)
    sun.data.angle = math.radians(3)
    sun.rotation_euler = (math.radians(70), 0, math.radians(-120))
    scene.collection.objects.link(sun)
    fill = bpy.data.objects.new("fill", bpy.data.lights.new("fill", "SUN"))
    fill.data.energy = 0.7
    fill.data.color = (0.55, 0.7, 1.0)
    fill.rotation_euler = (math.radians(40), 0, math.radians(60))
    scene.collection.objects.link(fill)
    # Cabin lights: a soft warm panel over the open cabin.
    mid = FIRST_ROW_Y + (ROWS - 1) * PITCH / 2
    cabin = bpy.data.objects.new("cabin-light", bpy.data.lights.new("cabin-light", "AREA"))
    cabin.data.shape = "RECTANGLE"
    cabin.data.size = CABIN_HALF * 2
    cabin.data.size_y = ROWS * PITCH + 2
    cabin.data.energy = 900
    cabin.data.color = (1.0, 0.93, 0.82)
    cabin.location = (0, mid, 4.2)
    scene.collection.objects.link(cabin)


def build_apron():
    tarmac = material("tarmac", hexrgb("#2B2D31"), rough=0.85)
    bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, -1.9))
    bpy.context.active_object.data.materials.append(tarmac)
    line = material("paint", hexrgb("#D9B64A"), rough=0.7)
    box("guide", (0.25, 60, 0.01), (0, 0, -1.89), line)
    # Terminal with lit windows off to the left.
    term = material("terminal", hexrgb("#3A3E46"), rough=0.6)
    glow = material("glass", hexrgb("#FFD9A6"), emit=hexrgb("#FFC982"), strength=2.5)
    box("terminal", (8, 70, 9), (-24, 0, 2.6), term)
    for i in range(14):
        box(f"twin-{i}", (0.1, 3.6, 2.2), (-19.95, -26 + i * 4, 2.4), glow)
    # Jet bridge to the front left door.
    bridge = material("bridge", hexrgb("#B8BCC4"), rough=0.5)
    door_y = row_y(0) + 1.4
    box("bridge", (14, 2.6, 2.7), (-CABIN_HALF - 7.6, door_y, 0.5), bridge, bevel=0.05)
    box("bridge-hood", (1.4, 3.0, 3.0), (-CABIN_HALF - 0.9, door_y, 0.55), bridge, bevel=0.05)


def build_fuselage():
    hull = material("hull", hexrgb("#ECEDEF"), rough=0.35)
    belly = material("belly", hexrgb("#9AA3AE"), rough=0.45)
    stripe = material("stripe", hexrgb("#2E4B78"), rough=0.4)
    inner = material("cabin-wall", hexrgb("#E9E4D9"), rough=0.7)
    floor = material("carpet", hexrgb("#3D4656"), rough=0.95)
    aisle = material("aisle", hexrgb("#5A4A3F"), rough=0.95)
    glass = material("window", hexrgb("#9FC4E8"), emit=hexrgb("#BFD9F2"), strength=0.6, rough=0.1)

    length = ROWS * PITCH + 4.5
    mid_y = FIRST_ROW_Y + (ROWS - 1) * PITCH / 2 + 0.2
    r = CABIN_HALF + 0.15
    # Lower fuselage: the tube below the cut, built as an open shell, and the
    # roof above it as its own piece so it can lift away.
    cut_z = 0.6 + WALL_TOP
    shell("fuselage", r, length, (0, mid_y, 0.6), cut_z, below=True, mat=hull)
    shell("roof", r, length, (0, mid_y, 0.6), cut_z, below=False, mat=hull)
    cutter_mat = material("cut", (0, 0, 0, 1))
    # Inside wall lining and the cabin floor.
    box("floor", (r * 2 - 0.35, length - 0.7, 0.1), (0, mid_y, FLOOR_Z - 0.05), floor)
    box("aisle", (AISLE, length - 0.8, 0.02), (0, mid_y, FLOOR_Z + 0.01), aisle)
    # A cheat line along the outside and the windows.
    for side in (-1, 1):
        box(f"stripe-{side + 1}", (0.02, length - 0.4, 0.12), (side * (r * math.cos(math.asin(-0.05 / r)) + 0.07), mid_y, 0.55), stripe)
        for i in range(ROWS + 2):
            y = row_y(ROWS - 1) - 0.6 + i * PITCH
            box(f"win-{side + 1}-{i}", (0.03, 0.34, 0.4), (side * (r * math.cos(math.asin(0.3 / r)) + 0.07), y, 0.9), glass, bevel=0.12)
    # Nose and tail, closed, so the shape says aeroplane.
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=r, location=(0, mid_y + length / 2, 0.6))
    nose = bpy.context.active_object
    nose.scale = (1, 2.2, 1)
    nose.name = "nose"
    nose.data.materials.append(hull)
    cutn = box("nose-cut", (r * 3, r * 3, r * 3), (0, mid_y + length / 2 - r * 1.5, 0.6), cutter_mat)
    m = nose.modifiers.new("cut", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.object = cutn
    cutn.hide_render = cutn.hide_viewport = True
    cockpit = material("cockpit", hexrgb("#1D2A3A"), rough=0.1)
    box("cockpit", (r * 1.1, 0.5, 0.35), (0, mid_y + length / 2 + r * 1.55, 1.15), cockpit, rot=(math.radians(-35), 0, 0), bevel=0.1)
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=r, radius2=0.35, depth=7.5, location=(0, mid_y - length / 2 - 3.75, 1.0), rotation=(math.radians(-90), 0, 0))
    tail = bpy.context.active_object
    tail.name = "tail"
    tail.data.materials.append(hull)
    box("fin", (0.25, 4.2, 5.2), (0, mid_y - length / 2 - 5.2, 4.2), hull, rot=(math.radians(-25), 0, 0), bevel=0.08)
    box("fin-logo", (0.27, 2.2, 1.6), (0, mid_y - length / 2 - 5.6, 4.6), stripe, rot=(math.radians(-25), 0, 0), bevel=0.05)
    for side in (-1, 1):
        box(f"stab-{side + 1}", (5.5, 2.4, 0.18), (side * 3.0, mid_y - length / 2 - 6.0, 1.3), hull, rot=(0, 0, side * math.radians(20)), bevel=0.05)
    # Wings with engines, low on the body.
    for side in (-1, 1):
        w = box(f"wing-{side + 1}", (15, 4.6, 0.3), (side * (r + 7.0), mid_y - 1.5, -0.6), hull, rot=(0, side * math.radians(-6), side * math.radians(-24)), bevel=0.08)
        bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=1.0, depth=3.6, location=(side * (r + 4.5), mid_y + 1.0, -1.35), rotation=(math.radians(90), 0, 0))
        eng = bpy.context.active_object
        eng.name = f"engine-{side + 1}"
        eng.data.materials.append(belly)
        bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.82, depth=0.1, location=(side * (r + 4.5), mid_y + 2.82, -1.35), rotation=(math.radians(90), 0, 0))
        bpy.context.active_object.data.materials.append(material(f"intake-{side + 1}", hexrgb("#1A1C20"), rough=0.5))
        _ = w
    # Gear, so it stands on the apron.
    tyre = material("tyre", hexrgb("#141416"), rough=0.9)
    for k, (x, y) in enumerate(((0, mid_y + length / 2 + 2.0), (-2.2, mid_y - 1.5), (2.2, mid_y - 1.5))):
        box(f"gear-{k}", (0.2, 0.2, 1.4), (x, y, -1.2), belly)
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.45, depth=0.35, location=(x, y, -1.45), rotation=(0, math.radians(90), 0))
        bpy.context.active_object.data.materials.append(tyre)


def build_seats():
    cloth = material("seat", hexrgb("#2F3E63"), rough=0.85)
    cover = material("headrest", hexrgb("#E2DCCD"), rough=0.8)
    frame = material("seat-frame", hexrgb("#6B7280"), rough=0.4, metal=0.5)
    for r in range(ROWS):
        y = row_y(r)
        for col in range(6):
            x = seat_x(col)
            box(f"cushion-{r}-{col}", (SEAT_W - 0.06, 0.55, 0.12), (x, y + 0.02, 0.34), cloth, bevel=0.04)
            box(f"back-{r}-{col}", (SEAT_W - 0.06, 0.12, 0.72), (x, y - 0.3, 0.72), cloth, rot=(math.radians(-8), 0, 0), bevel=0.05)
            box(f"rest-{r}-{col}", (SEAT_W - 0.16, 0.14, 0.16), (x, y - 0.33, 1.06), cover, rot=(math.radians(-8), 0, 0), bevel=0.05)
        for k, x in enumerate((-AISLE / 2 - 3 * SEAT_W, -AISLE / 2, AISLE / 2, AISLE / 2 + 3 * SEAT_W)):
            box(f"arm-{r}-{k}", (0.06, 0.5, 0.06), (x, y, 0.5), frame)


# -------------------------------------------------------------- passengers

# Everyday travellers only: no top hats or hard hats.
MODELS = [
    "Casual_Male", "Casual_Female", "Casual2_Male", "Casual2_Female",
    "Casual3_Male", "Casual3_Female", "Casual_Bald", "Suit_Male", "Suit_Female",
]
SKINS = ["#F1D3B6", "#E0B892", "#C99A72", "#A8774F", "#7D5638", "#5C3E2A"]
HAIRS = ["#1C1612", "#3B2A1E", "#5E4430", "#8A6A4A", "#2A2522", "#B89A72", "#6E6E6E"]
SHIRTS = ["#3E4A5C", "#6E3540", "#4E5A3A", "#7A7E86", "#33504C", "#8A7458", "#4A3D52", "#2F3A52", "#B5B0A6", "#5A6F8A"]
PANTS = ["#23262D", "#3A3F4A", "#4B4237", "#2D3A52", "#55504A"]


def load_models():
    base = {}
    for name in MODELS:
        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=os.path.join(CHARS, f"{name}.gltf"))
        new = [o for o in bpy.data.objects if o not in before]
        arm = next(o for o in new if o.type == "ARMATURE")
        for o in new:
            o.hide_render = True
            o.hide_viewport = True
        base[name] = arm
    return base


def dress(obj, key, rng, you):
    """Give one passenger's meshes their own materials: skin, hair, clothes."""
    for child in obj.children_recursive:
        if child.type != "MESH":
            continue
        for slot in child.material_slots:
            src = slot.material
            if src is None:
                continue
            slot.link = "OBJECT"
            m = src.copy()
            bsdf = m.node_tree.nodes.get("Principled BSDF")
            n = src.name.split(".")[0]
            if bsdf is not None:
                if n == "Skin":
                    bsdf.inputs["Base Color"].default_value = hexrgb(SKINS[key % len(SKINS)])
                elif n == "Hair":
                    bsdf.inputs["Base Color"].default_value = hexrgb(HAIRS[(key * 3) % len(HAIRS)])
                elif n == "Shirt":
                    bsdf.inputs["Base Color"].default_value = srgb(ACCENT) if you else hexrgb(SHIRTS[(key * 7) % len(SHIRTS)])
                elif n == "Face":
                    # The pack draws eyes as white slits; dark eyes read as a face.
                    bsdf.inputs["Base Color"].default_value = hexrgb("#1B1512")
                    bsdf.inputs["Roughness"].default_value = 0.25
                elif n in ("Pants",):
                    bsdf.inputs["Base Color"].default_value = hexrgb(PANTS[(key * 5) % len(PANTS)])
                if n != "Face":
                    bsdf.inputs["Roughness"].default_value = 0.7
            slot.material = m


def place_passengers(base, you_index=None):
    rng = random.Random(7)
    people = []
    for r in range(ROWS):
        for col in range(6):
            i = r * 6 + col
            src = base[MODELS[(i * 5 + 3) % len(MODELS)]]
            # Duplicate the armature and its meshes, sharing mesh data.
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
            arm.name = f"p{i}"
            arm.scale = (CHAR_SCALE,) * 3
            arm.location = (seat_x(col), row_y(r) + 0.05, 0.3)
            # The importer leaves quaternions; the pack's people face -Y, so
            # turn them round to face the nose.
            arm.rotation_mode = "XYZ"
            arm.rotation_euler = (0, 0, math.radians(180))
            dress(arm, i, rng, i == you_index)
            arm.animation_data_create()
            sit = bpy.data.actions.get("SitDown")
            arm.animation_data.action = sit
            people.append(arm)
    return people


def hold_seated(people, frame_end):
    """Pin every passenger at the last frame of SitDown: seated."""
    for arm in people:
        act = arm.animation_data.action
        arm.animation_data.action = None
        track = arm.animation_data.nla_tracks.new()
        f = act.frame_range[1]
        s = track.strips.new("sit", 0, act)
        s.action_frame_start = f
        s.action_frame_end = f + 0.01
        s.frame_end = frame_end
        s.extrapolation = "HOLD"


# --------------------------------------------------------------------- run


def setup_render(w, h):
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = w
    scene.render.resolution_y = h
    scene.render.fps = 30
    ee = scene.eevee
    for attr, val in (("use_shadows", True), ("use_raytracing", True), ("taa_render_samples", 32)):
        if hasattr(ee, attr):
            setattr(ee, attr, val)
    scene.view_settings.view_transform = "AgX"
    try:
        scene.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass


def camera(loc, target, lens=35, dof=None):
    scene = bpy.context.scene
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    cam.location = loc
    direction = Vector(target) - Vector(loc)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    cam.data.lens = lens
    if dof:
        cam.data.dof.use_dof = True
        cam.data.dof.focus_distance = dof[0]
        cam.data.dof.aperture_fstop = dof[1]
    scene.camera = cam
    return cam


def nla_stand_up(people, sign_frame, end):
    """Seated until the sign goes off, then each stands, a beat apart."""
    sit = bpy.data.actions["SitDown"]
    up = bpy.data.actions["StandUp"]
    idle = bpy.data.actions["Idle"]
    for i, arm in enumerate(people):
        ad = arm.animation_data
        ad.action = None
        for t in list(ad.nla_tracks):
            ad.nla_tracks.remove(t)
        f = sign_frame + (i * 7) % 18
        t1 = ad.nla_tracks.new()
        s1 = t1.strips.new("sit", 0, sit)
        s1.action_frame_start = sit.frame_range[1]
        s1.action_frame_end = sit.frame_range[1] + 0.01
        s1.frame_end = f
        t2 = ad.nla_tracks.new()
        s2 = t2.strips.new("up", f, up)
        s2.scale = 0.8
        s2.blend_in = 3
        t3 = ad.nla_tracks.new()
        s3 = t3.strips.new("idle", int(s2.frame_end) - 4, idle)
        s3.repeat = (end - s3.frame_start) / (idle.frame_range[1] - idle.frame_range[0])
        s3.blend_in = 6
        s3.action_frame_start = (i * 13) % 60
        for st in (s1, s2, s3):
            st.extrapolation = "NOTHING"
        s1.extrapolation = "HOLD_FORWARD"


def key_camera(cam, target, keys):
    """keys: (frame, location, aim). The camera tracks an empty that moves."""
    con = cam.constraints.new("TRACK_TO")
    con.target = target
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"
    for f, loc, aim in keys:
        cam.location = loc
        target.location = aim
        cam.keyframe_insert("location", frame=f)
        target.keyframe_insert("location", frame=f)


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    mode = argv[0] if argv else "still"
    out = argv[1] if len(argv) > 1 else "/tmp/deplane"
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scale = 0.75 if mode == "opening" else 1.0
    setup_render(int(1560 * scale), int(760 * scale))
    build_world()
    build_apron()
    build_fuselage()
    build_seats()
    base = load_models()
    people = place_passengers(base, you_index=5 * 6 + 2)
    mid = FIRST_ROW_Y + (ROWS - 1) * PITCH / 2
    scene = bpy.context.scene
    cam = camera((9.0, mid + 13.0, 8.0), (-0.3, mid - 0.5, 0.4), lens=40, dof=(17.0, 8))
    if mode in ("still", "face"):
        bpy.data.objects["roof"].hide_render = True
        if mode == "face":
            # A close look at the front rows' faces, from inside the nose.
            bpy.data.objects["nose"].hide_render = True
            cam.location = (0.4, row_y(0) + 2.6, 1.25)
            look = Vector((-0.2, row_y(0), 0.95)) - cam.location
            cam.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()
            cam.data.lens = 45
            cam.data.dof.use_dof = False
        hold_seated(people, 500)
        scene.frame_set(1)
        scene.render.filepath = out
        bpy.ops.render.render(write_still=True)
        return
    # The opening: the plane at the gate, push in, the roof lifts, people stand.
    aim = bpy.data.objects.new("aim", None)
    scene.collection.objects.link(aim)
    cam.data.dof.use_dof = False
    key_camera(cam, aim, [
        (0, (34.0, mid + 46.0, 22.0), (0.0, mid - 2.0, 0.5)),
        (52, (9.0, mid + 13.0, 8.0), (-0.3, mid - 0.5, 0.4)),
        (90, (8.0, mid + 11.5, 7.2), (-0.3, mid - 0.8, 0.5)),
    ])
    roof = bpy.data.objects["roof"]
    roof.keyframe_insert("location", frame=16)
    roof.keyframe_insert("rotation_euler", frame=16)
    roof.location.z += 14.0
    roof.location.x += 2.0
    roof.rotation_euler.y = math.radians(-12)
    roof.keyframe_insert("location", frame=44)
    roof.keyframe_insert("rotation_euler", frame=44)
    nla_stand_up(people, 50, 200)
    scene.frame_start = 0
    scene.frame_end = 89
    scene.render.filepath = out + "/f"
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(animation=True)


if __name__ == "__main__":
    main()
