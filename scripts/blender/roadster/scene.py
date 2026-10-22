"""The Roadster reel's set and car: a concrete test pad at sunset, a steel
ramp that curls over into an overhang, and a low two-seat car built from
lofted sections so the repository owns it. Nothing here is Tesla's design
or mark.

Run: Blender -b --factory-startup -P scripts/blender/roadster/scene.py -- \
       <timeline.json> <off|on> <out> [first last] [scale]

`out` is a directory for frames, or a .json path for the screen positions
Remotion lays its labels on. FRAMES=a,b,c renders only those frames.

Units are metres, Z up. The ramp's overhang ends at x = 0 and the car
drives along its underside toward -x, upside down. The camera looks from
-y. Timeline poses come from src/vertical/39-roadster-roll/simulation.ts
through export.mjs: centre x and height, roll about the long axis (pi upside
down, 0 the right way up), which thrusters fire, and the phase.
"""
import json
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "deplane"))
import scene as base  # noqa: E402

hexrgb = base.hexrgb
material = base.material

WHEEL_R = 0.34
AXLE_X = 1.36
TRACK_Y = 0.84
DECK_W = 3.4
DECK_T = 0.32
DECK_END = 7.6


# ------------------------------------------------------------------ helpers


def link(o):
    bpy.context.scene.collection.objects.link(o)
    return o


def mesh_object(name, bm, mat, smooth=True):
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me))
    o.data.materials.append(mat)
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    return o


def cube(name, size, loc, mat, parent=None, bevel=0.0):
    """A box built where it stands: location stays a location, so it can be
    animated or parented without anything baked into the mesh."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    o = mesh_object(name, bm, mat, smooth=False)
    o.location = loc
    if bevel > 0:
        m = o.modifiers.new("bevel", "BEVEL")
        m.width = bevel
        m.segments = 2
    if parent is not None:
        o.parent = parent
    return o


def cylinder(name, r, depth, loc, mat, axis="Y", parent=None, segs=40, bevel=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r, depth=depth)
    if axis == "Y":
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=__import__("mathutils").Matrix.Rotation(math.pi / 2, 3, "X"))
    elif axis == "X":
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=__import__("mathutils").Matrix.Rotation(math.pi / 2, 3, "Y"))
    o = mesh_object(name, bm, mat)
    o.location = loc
    if bevel > 0:
        m = o.modifiers.new("bevel", "BEVEL")
        m.width = bevel
        m.segments = 2
        m.limit_method = "ANGLE"
    if parent is not None:
        o.parent = parent
    return o


def loft(name, stations, mat, n=3.0, ring=24, tumble=0.12, ground=0.0):
    """A smooth closed body through cross-sections (x, z bottom, z top, half
    width), each a rounded rectangle, narrowing toward the top."""
    bm = bmesh.new()
    rings = []
    for x, zb, zt, hw in stations:
        zc, hz = (zb + zt) / 2 - ground, (zt - zb) / 2
        r = []
        for i in range(ring):
            a = 2 * math.pi * i / ring
            c, s = math.cos(a), math.sin(a)
            y = hw * math.copysign(abs(c) ** (2 / n), c)
            z = hz * math.copysign(abs(s) ** (2 / n), s)
            if s > 0:
                y *= 1 - tumble * s
            r.append(bm.verts.new((x, y, zc + z)))
        rings.append(r)
    for a, b in zip(rings, rings[1:]):
        for i in range(ring):
            j = (i + 1) % ring
            bm.faces.new((a[i], a[j], b[j], b[i]))
    for r, flip in ((rings[0], True), (rings[-1], False)):
        c = bm.verts.new(sum((v.co for v in r), Vector()) / len(r))
        for i in range(ring):
            j = (i + 1) % ring
            f = (r[j], r[i], c) if not flip else (r[i], r[j], c)
            bm.faces.new(f)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = mesh_object(name, bm, mat)
    sub = o.modifiers.new("sub", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2
    return o


def apply_all(o):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


# --------------------------------------------------------------------- car

# Sections from the tail (x = -2.2) to the nose (x = 2.2): ground is z = 0
# under the tyres. The box the model uses is 4.4 x 2.0 x 1.15.
BODY = [
    (-2.20, 0.36, 0.78, 0.84),
    (-2.08, 0.25, 0.88, 0.95),
    (-1.70, 0.17, 0.92, 1.00),
    (-0.95, 0.15, 0.86, 1.00),
    (-0.15, 0.15, 0.79, 0.98),
    (0.65, 0.15, 0.73, 0.97),
    (1.35, 0.16, 0.66, 0.99),
    (1.85, 0.20, 0.55, 0.96),
    (2.12, 0.27, 0.44, 0.88),
    (2.20, 0.32, 0.39, 0.78),
]
CANOPY = [
    (1.15, 0.58, 0.66, 0.60),
    (0.75, 0.57, 0.93, 0.69),
    (0.20, 0.59, 1.11, 0.72),
    (-0.40, 0.62, 1.15, 0.72),
    (-0.95, 0.66, 1.06, 0.69),
    (-1.45, 0.72, 0.93, 0.60),
    (-1.78, 0.80, 0.85, 0.46),
]


def build_car(name):
    """The car, parented to an empty at the model's box centre (z 0.575 over
    the ground when it stands on its wheels). Returns the root, the four
    wheel spinners, the canopy and the thruster plumes by group."""
    paint = material(f"{name}-paint", hexrgb("#E9E9E6"), rough=0.22)
    bsdf = paint.node_tree.nodes["Principled BSDF"]
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = 0.8
        bsdf.inputs["Coat Roughness"].default_value = 0.05
    glass = material(f"{name}-glass", hexrgb("#101318"), rough=0.04)
    belly = material(f"{name}-belly", hexrgb("#1A1C20"), rough=0.75)
    trim = material(f"{name}-trim", hexrgb("#2A2D33"), rough=0.5)
    rubber = material(f"{name}-tyre", hexrgb("#141416"), rough=0.85)
    rim = material(f"{name}-rim", hexrgb("#9EA3AA"), rough=0.25, metal=1.0)
    lamp = material(f"{name}-lamp", hexrgb("#FFFFFF"), emit=hexrgb("#FFF4E6"), strength=6.0)
    tail = material(f"{name}-tail", hexrgb("#3A3434"), rough=0.3)
    nozzle = material(f"{name}-nozzle", hexrgb("#6C7077"), rough=0.3, metal=1.0)

    h2 = 0.575
    root = link(bpy.data.objects.new(name, None))
    root.rotation_mode = "XYZ"

    body = loft(f"{name}-body", BODY, paint, ground=h2)
    apply_all(body)
    # Wheel arches, cut out of the finished surface.
    for i, x in enumerate((-AXLE_X, AXLE_X)):
        cut = cylinder(f"{name}-arch{i}", WHEEL_R + 0.07, 2.6, (x, 0, WHEEL_R - h2 + 0.02), trim, axis="Y", segs=48)
        b = body.modifiers.new(f"arch{i}", "BOOLEAN")
        b.operation = "DIFFERENCE"
        b.solver = "EXACT"
        b.object = cut
        apply_all(body)
        bpy.data.objects.remove(cut, do_unlink=True)
    body.parent = root

    canopy = loft(f"{name}-canopy", CANOPY, glass, n=2.6, tumble=0.2, ground=h2)
    canopy.parent = root

    # The dark underside the camera sees while it is upside down: floor pan,
    # the fan's intake and the four thruster nozzles underneath.
    cube(f"{name}-floor", (3.9, 1.78, 0.05), (0, 0, 0.13 - h2), belly, parent=root, bevel=0.02)
    for k, r in enumerate((0.42, 0.33, 0.24)):
        cylinder(f"{name}-fan{k}", r, 0.03 + 0.01 * k, (-0.35, 0, 0.1 - h2 - 0.005 * k), trim if k % 2 == 0 else belly, axis="Z", parent=root)
    cube(f"{name}-sill-l", (2.2, 0.05, 0.12), (0, 0.99, 0.32 - h2), trim, parent=root)
    cube(f"{name}-sill-r", (2.2, 0.05, 0.12), (0, -0.99, 0.32 - h2), trim, parent=root)
    for y in (0.58, -0.58):
        cube(f"{name}-lamp{y}", (0.04, 0.42, 0.035), (2.17, y, 0.42 - h2), lamp, parent=root)
        cube(f"{name}-tail{y}", (0.04, 0.5, 0.05), (-2.19, y, 0.66 - h2), tail, parent=root)

    wheels = []
    for x in (-AXLE_X, AXLE_X):
        for side in (1, -1):
            hub = link(bpy.data.objects.new(f"{name}-wheel", None))
            hub.parent = root
            hub.location = (x, side * TRACK_Y, WHEEL_R - h2)
            hub.rotation_mode = "XYZ"
            cylinder(f"{name}-tyre", WHEEL_R, 0.3, (0, 0, 0), rubber, axis="Y", parent=hub, bevel=0.06)
            cylinder(f"{name}-rim", 0.24, 0.31, (0, 0, 0), rim, axis="Y", parent=hub, segs=32)
            for s in range(5):
                a = 2 * math.pi * s / 5
                sp = cube(f"{name}-spoke", (0.06, 0.03, 0.42), (0, side * 0.16, 0), trim, parent=hub)
                sp.rotation_euler = (0, a, 0)
            wheels.append(hub)

    # Thruster ports. Corner ports point up out of the top of each fender;
    # ports underneath point down. A roll fires the ports pointing up on one
    # side and down on the other, so the pair twists the car without lifting
    # it. Plumes are white condensation, scaled from nothing when a port fires.
    plumes = {"up-l": [], "up-r": [], "down-l": [], "down-r": []}
    plume_mat = plume_material(name)
    for x in (-1.75, 1.75):
        for side, tag in ((1, "l"), (-1, "r")):
            top = 0.86 if x < 0 else 0.62
            cylinder(f"{name}-port", 0.07, 0.04, (x, side * 0.78, top - h2 + 0.01), nozzle, axis="Z", parent=root, segs=20)
            cylinder(f"{name}-port", 0.08, 0.05, (x, side * 0.78, 0.11 - h2), nozzle, axis="Z", parent=root, segs=20)
            plumes[f"up-{tag}"].append(plume(f"{name}-pu", (x, side * 0.78, top - h2 + 0.03), 1, plume_mat, root))
            plumes[f"down-{tag}"].append(plume(f"{name}-pd", (x, side * 0.78, 0.09 - h2), -1, plume_mat, root))
    return root, wheels, canopy, plumes


def plume_material(name):
    """White, soft, thinning out toward the far end of the cone."""
    m = bpy.data.materials.new(f"{name}-plume")
    m.use_nodes = True
    if hasattr(m, "surface_render_method"):
        m.surface_render_method = "BLENDED"
    if hasattr(m, "blend_method"):
        m.blend_method = "BLEND"
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    mix = nt.nodes.new("ShaderNodeMixShader")
    clear = nt.nodes.new("ShaderNodeBsdfTransparent")
    white = nt.nodes.new("ShaderNodeBsdfDiffuse")
    white.inputs["Color"].default_value = (0.95, 0.96, 0.98, 1)
    emit = nt.nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = (0.9, 0.93, 1.0, 1)
    emit.inputs["Strength"].default_value = 0.15
    add = nt.nodes.new("ShaderNodeAddShader")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0.85, 0.85, 0.85, 1)
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color = (0, 0, 0, 1)
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3.0
    noise.inputs["Detail"].default_value = 8.0
    noise.inputs["Distortion"].default_value = 1.5
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    nt.links.new(coord.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], ramp.inputs[0])
    nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(ramp.outputs[0], mul.inputs[0])
    nt.links.new(noise.outputs["Fac"], mul.inputs[1])
    nt.links.new(white.outputs[0], add.inputs[0])
    nt.links.new(emit.outputs[0], add.inputs[1])
    # Gas is thin where the eye looks through its edge.
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.35
    inv = nt.nodes.new("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    nt.links.new(lw.outputs["Facing"], inv.inputs[1])
    soft = nt.nodes.new("ShaderNodeMath")
    soft.operation = "MULTIPLY"
    nt.links.new(mul.outputs[0], soft.inputs[0])
    nt.links.new(inv.outputs[0], soft.inputs[1])
    thin = nt.nodes.new("ShaderNodeMath")
    thin.operation = "MULTIPLY"
    thin.inputs[1].default_value = 0.8
    nt.links.new(soft.outputs[0], thin.inputs[0])
    nt.links.new(thin.outputs[0], mix.inputs["Fac"])
    nt.links.new(clear.outputs[0], mix.inputs[1])
    nt.links.new(add.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    return m


def plume(name, loc, direction, mat, parent):
    """A cone from the port outward along local z (direction 1 up, -1 down),
    its scale keyed from 0 to 1 when the port fires."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=False, segments=24, radius1=0.05, radius2=0.95, depth=2.0)
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, 1.0))
    o = mesh_object(name, bm, mat)
    o.parent = parent
    o.location = loc
    o.rotation_euler = (0 if direction > 0 else math.pi, 0, 0)
    o.scale = (0, 0, 0)
    return o


# --------------------------------------------------------------------- set


def build_world():
    scene = bpy.context.scene
    world = bpy.data.worlds.new("sunset")
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
    els[0].color = hexrgb("#F0A465")
    els[1].position = 0.36
    els[1].color = hexrgb("#1B2C4C")
    mid = els.new(0.09)
    mid.color = hexrgb("#B88D86")
    bg.inputs[1].default_value = 1.0
    scene.world = world

    sun = link(bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")))
    sun.data.energy = 4.2
    sun.data.color = (1.0, 0.8, 0.6)
    sun.data.angle = math.radians(2)
    sun.rotation_euler = (math.radians(68), 0, math.radians(-38))
    fill = link(bpy.data.objects.new("fill", bpy.data.lights.new("fill", "SUN")))
    fill.data.energy = 0.9
    fill.data.color = (0.6, 0.72, 1.0)
    fill.rotation_euler = (math.radians(35), 0, math.radians(150))


def ground_material():
    """Poured concrete with faint variation, so the pad reads as a surface."""
    m = material("pad", hexrgb("#8E8A83"), rough=0.88)
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 0.35
    noise.inputs["Detail"].default_value = 6.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = hexrgb("#7C7871")
    ramp.color_ramp.elements[1].color = hexrgb("#A29D94")
    nt.links.new(noise.outputs["Fac"], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], bsdf.inputs["Base Color"])
    return m


def build_ground():
    sand = material("desert", hexrgb("#9C8466"), rough=0.95)
    bpy.ops.mesh.primitive_plane_add(size=900, location=(0, 0, -0.02))
    bpy.context.active_object.data.materials.append(sand)
    pad = cube("pad", (60, 34, 0.04), (-4, 4, 0.0), ground_material())
    pad.location.z = -0.02
    joint = material("joint", hexrgb("#6E6A64"), rough=0.9)
    for i in range(-5, 6):
        cube(f"joint-x{i}", (0.03, 34, 0.004), (-4 + i * 5.5, 4, 0.002), joint)
    for j in range(-3, 4):
        cube(f"joint-y{j}", (60, 0.03, 0.004), (-4, 4 + j * 5.5, 0.002), joint)
    # Far off: low hills and a hangar, dark against the sky.
    hill = material("hills", hexrgb("#5A4E48"), rough=1.0)
    for i, (x, y, sx, sz) in enumerate(((-160, 330, 140, 22), (40, 380, 180, 30), (230, 300, 120, 18), (-330, 260, 110, 15))):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(x, y, -2))
        o = bpy.context.active_object
        o.scale = (sx, 40, sz)
        o.data.materials.append(hill)
    shed = material("hangar", hexrgb("#4D4C4F"), rough=0.7)
    cube("hangar", (28, 18, 9), (-38, 70, 4.5), shed)
    cube("hangar2", (16, 12, 6), (26, 82, 3.0), shed)
    pole = material("pole", hexrgb("#3A3B3F"), rough=0.6)
    lit = material("lit", hexrgb("#FFE8C4"), emit=hexrgb("#FFD9A0"), strength=8.0)
    for x, y in ((-22, 22), (14, 26), (-30, -2)):
        cylinder("pole", 0.12, 11, (x, y, 5.5), pole, axis="Z", segs=12)
        cube("lamp-head", (0.9, 0.5, 0.25), (x, y, 11.1), lit)


def arc_strip(name, centre, r, a0, a1, width, mat, segs=48):
    """The inside running surface of a curve whose axis runs along y."""
    cx, cz = centre
    bm = bmesh.new()
    rows = []
    for end in (-1, 1):
        row = []
        for i in range(segs + 1):
            a = a0 + (a1 - a0) * i / segs
            row.append(bm.verts.new((cx + r * math.cos(a), end * width / 2, cz + r * math.sin(a))))
        rows.append(row)
    for i in range(segs):
        bm.faces.new((rows[0][i], rows[0][i + 1], rows[1][i + 1], rows[1][i]))
    o = mesh_object(name, bm, mat)
    sol = o.modifiers.new("solid", "SOLIDIFY")
    sol.thickness = DECK_T
    sol.offset = 1
    return o


def build_ramp(top):
    """An overhang whose underside is `top` above the ground, from x = 0 to
    DECK_END, curling down to the ground beyond it. Columns stand on the far
    side so the camera sees the whole underside."""
    steel = material("ramp-steel", hexrgb("#55585E"), rough=0.45, metal=0.6)
    surface = material("ramp-surface", hexrgb("#9A9A97"), rough=0.7)
    edge = material("ramp-edge", hexrgb("#E7E5E0"), rough=0.5)
    cube("deck", (DECK_END, DECK_W, DECK_T), (DECK_END / 2, 0, top + DECK_T / 2), steel)
    cube("deck-face", (DECK_END, DECK_W - 0.1, 0.02), (DECK_END / 2, 0, top - 0.012), surface)
    for y in (DECK_W / 2 - 0.05, -DECK_W / 2 + 0.05):
        cube("deck-edge", (DECK_END, 0.1, 0.06), (DECK_END / 2, y, top - 0.02), edge)
    cube("deck-lip", (0.08, DECK_W, DECK_T + 0.04), (0.0, 0, top + DECK_T / 2), edge)
    r = top / 2
    arc_strip("curl", (DECK_END, r), r, -math.pi / 2, math.pi / 2, DECK_W, surface)
    # The curl's outer frame: ribs every 20 degrees.
    for k in range(10):
        a = -math.pi / 2 + math.pi * k / 9
        rib = cube(f"rib{k}", (0.22, DECK_W + 0.2, 0.5), (DECK_END + (r + DECK_T + 0.2) * math.cos(a), 0, r + (r + DECK_T + 0.2) * math.sin(a)), steel)
        rib.rotation_euler = (0, -a, 0)
    # Columns on the far side and beams across the top of the deck.
    for x in (1.2, 4.8, 8.4):
        cube(f"col{x}", (0.36, 0.36, top + DECK_T + 0.6), (x, DECK_W / 2 + 0.45, (top + DECK_T + 0.6) / 2), steel)
        cube(f"beam{x}", (0.3, DECK_W + 0.9, 0.42), (x, 0.22, top + DECK_T + 0.21), steel)
        cube(f"foot{x}", (1.0, 1.0, 0.12), (x, DECK_W / 2 + 0.45, 0.06), steel)
    cube("spine", (DECK_END, 0.32, 0.5), (DECK_END / 2, DECK_W / 2 + 0.45, top + DECK_T + 0.35), steel)


def dust(name, loc, frames, size, strength, puffs=14):
    """Dust thrown out along the ground from frame frames[0]: a ring of soft
    puffs that roll outward, rise a little, grow and thin out."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    if hasattr(m, "surface_render_method"):
        m.surface_render_method = "BLENDED"
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    mix = nt.nodes.new("ShaderNodeMixShader")
    clear = nt.nodes.new("ShaderNodeBsdfTransparent")
    col = nt.nodes.new("ShaderNodeBsdfDiffuse")
    col.inputs["Color"].default_value = hexrgb("#B9A890")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3.0
    noise.inputs["Detail"].default_value = 6.0
    noise.inputs["Distortion"].default_value = 0.8
    coord = nt.nodes.new("ShaderNodeTexCoord")
    # Thick where the eye looks into the middle of a puff, nothing at its rim.
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.5
    rim = nt.nodes.new("ShaderNodeMath")
    rim.operation = "SUBTRACT"
    rim.inputs[0].default_value = 1.0
    nt.links.new(lw.outputs["Facing"], rim.inputs[1])
    core = nt.nodes.new("ShaderNodeMath")
    core.operation = "POWER"
    core.inputs[1].default_value = 2.2
    nt.links.new(rim.outputs[0], core.inputs[0])
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    fade = nt.nodes.new("ShaderNodeMath")
    fade.operation = "MULTIPLY"
    fade.inputs[1].default_value = 0.0
    nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], mul.inputs[0])
    nt.links.new(core.outputs[0], mul.inputs[1])
    nt.links.new(mul.outputs[0], fade.inputs[0])
    nt.links.new(fade.outputs[0], mix.inputs["Fac"])
    nt.links.new(clear.outputs[0], mix.inputs[1])
    nt.links.new(col.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    f0, f1 = frames
    sock = fade.inputs[1]
    for f in range(int(f0) - 1, int(f1) + 1):
        u = max(0.0, min(1.0, (f - f0) / (f1 - f0)))
        sock.default_value = 0.0 if f < f0 else strength * (1 - u) ** 1.6 * min(1.0, (f - f0 + 1) / 3)
        sock.keyframe_insert("default_value", frame=f)
    cx, cy, cz = loc
    for i in range(puffs):
        j = math.sin(i * 12.9898) * 0.5 + 0.5
        k = math.sin(i * 78.233) * 0.5 + 0.5
        a = 2 * math.pi * (i + 0.6 * j) / puffs
        r0 = size * (0.15 + 0.1 * k)
        r1 = size * (0.65 + 0.35 * j)
        s1 = size * (0.28 + 0.14 * k)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=loc, segments=32, ring_count=16)
        o = bpy.context.active_object
        o.name = f"{name}-{i}"
        bpy.ops.object.shade_smooth()
        o.data.materials.append(m)
        for f in range(int(f0) - 1, int(f1) + 1):
            u = max(0.0, min(1.0, (f - f0) / (f1 - f0)))
            e = 1 - (1 - u) ** 3
            r = r0 + (r1 - r0) * e
            o.location = (cx + r * math.cos(a), cy + r * math.sin(a), cz + 0.12 + size * 0.12 * e * (0.6 + 0.4 * k))
            sc = 0.0 if f < f0 else 0.25 + s1 * e
            o.scale = (sc, sc, sc * 0.7)
            o.keyframe_insert("location", frame=f)
            o.keyframe_insert("scale", frame=f)


# --------------------------------------------------------------- animation


def key_every_frame(obj, path, values, first=0):
    for f, v in enumerate(values, start=first):
        setattr(obj, path, v)
        obj.keyframe_insert(path, frame=f)


def linear(obj):
    ad = obj.animation_data
    if not ad or not ad.action:
        return
    curves = []
    for layer in getattr(ad.action, "layers", []):
        for strip in layer.strips:
            for bag in strip.channelbags:
                curves.extend(bag.fcurves)
    curves.extend(getattr(ad.action, "fcurves", []))
    for c in curves:
        for k in c.keyframe_points:
            k.interpolation = "LINEAR"


def animate(data, rule, root, wheels, canopy, plumes):
    frames = data["frames"]
    track = data[rule]
    roof_down = data["roofDown"]
    wheels_down = data["wheelsDown"]
    # Heights come from the model, crush and suspension included. How far
    # the centre sits below its ride height once down is the roof crushing
    # (off) or the springs giving (on).
    h2 = data["car"]["height"] / 2
    sink = [max(0.0, h2 - track[f][1]) if track[f][5] == 2 else 0.0 for f in range(frames + 1)]
    locs, rots = [], []
    for f in range(frames + 1):
        x, z, roll, rolling, braking, phase = track[f]
        if rule == "off" and f >= roof_down:
            # The crushed car rocks once on its roof.
            k = f - roof_down
            roll = roll + 0.05 * math.exp(-k / 14) * math.sin(k / 5.0)
        locs.append((x, 0.0, z))
        rots.append((roll, 0.0, math.pi))
    key_every_frame(root, "location", locs)
    key_every_frame(root, "rotation_euler", rots)
    linear(root)

    if rule == "off":
        # The roof flattens by exactly as much as the car sinks.
        for f in range(frames + 1):
            c = sink[f]
            canopy.scale = (1.0, 1.0 + 0.2 * c, 1.0 - c / h2)
            canopy.keyframe_insert("scale", frame=f)
        linear(canopy)
    else:
        # The body sinks on its springs; the wheels stay on the ground.
        for w in wheels:
            base_z = w.location.z
            for f in range(frames + 1):
                w.location.z = base_z + sink[f]
                w.keyframe_insert("location", frame=f)
            w.location.z = base_z

    # Wheels turn with the distance driven, keep turning in the air, and on
    # the roof slow down to a stop on their own.
    angle, spin = 0.0, 0.0
    spins = []
    for f in range(frames + 1):
        x, z, roll, rolling, braking, phase = track[f]
        if f > 0:
            dx = abs(track[f][0] - track[f - 1][0])
            if phase == 1:
                pass
            elif rule == "off" and phase == 2:
                spin *= 0.985
            else:
                spin = dx / WHEEL_R
            angle += spin
        spins.append((0.0, angle, 0.0))
    for w in wheels:
        key_every_frame(w, "rotation_euler", spins)
        linear(w)

    # Plumes. The roll: ports pointing up on the left and down on the right
    # spin the car over, then the opposite pair stops the spin with the car
    # the right way up. Then the four underneath brake the fall. A port takes
    # a couple of frames to open.
    def level(pred):
        raw = [1.0 if pred(track[f]) else 0.0 for f in range(frames + 1)]
        out = []
        for f in range(frames + 1):
            if raw[f]:
                win = raw[max(0, f - 2) : f + 1]
                out.append(sum(win) / len(win))
            else:
                out.append(0.35 if f > 0 and raw[f - 1] else 0.0)
        return out

    def fire(group, lvl):
        for n, o in enumerate(plumes[group]):
            seed = 7 * n + len(group)
            for f in range(frames + 1):
                flick = 1 + 0.08 * math.sin(f * 1.7 + seed) + 0.05 * math.sin(f * 4.1 + seed * 0.3)
                # A plume pointing at the ground stops there; the dust takes over.
                # Attitude jets are short puffs; the braking jets are long.
                reach = 0.45 if track[f][3] else 1.0
                if group.startswith("down") and track[f][4] == 1:
                    reach = max(0.15, min(1.0, (track[f][1] - 0.485) / 2.2))
                o.scale = (lvl[f] * flick, lvl[f] * flick, lvl[f] * reach * (0.9 + 0.1 * flick))
                o.keyframe_insert("scale", frame=f)
            linear(o)

    if rule == "on":
        fire("up-l", level(lambda r: r[3] == 1))
        fire("down-r", level(lambda r: r[3] == 1 or r[4] == 1))
        fire("down-l", level(lambda r: r[3] == 2 or r[4] == 1))
        fire("up-r", level(lambda r: r[3] == 2))


# The camera: (frame, position, aim). It opens close on the car hanging
# under the ramp, pulls back as it lets go, follows it down as it falls, and eases in on where it ends up.
CAM_KEYS = (
    (0, (-6.0, -8.6, 3.6), (3.4, 0.3, 5.0)),
    (78, (-14.4, -11.8, 2.4), (0.0, 0.4, 3.9)),
    (240, (-14.8, -11.2, 1.9), (-3.6, 0.0, 2.0)),
    (419, (-14.6, -10.2, 1.7), (-5.4, 0.0, 1.3)),
)
CAM_LENS = 38


def camera():
    scene = bpy.context.scene
    cam = base.camera(CAM_KEYS[0][1], CAM_KEYS[0][2], lens=CAM_LENS)
    aim = link(bpy.data.objects.new("aim", None))
    con = cam.constraints.new("TRACK_TO")
    con.target = aim
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"
    for f, loc, at in CAM_KEYS:
        cam.location = loc
        aim.location = at
        cam.keyframe_insert("location", frame=f)
        aim.keyframe_insert("location", frame=f)
    scene.camera = cam
    return cam


def setup(data, rule, scale):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(int(1560 * scale), int(760 * scale))
    scene = bpy.context.scene
    scene.render.use_motion_blur = True
    if hasattr(scene.render, "motion_blur_shutter"):
        scene.render.motion_blur_shutter = 0.5
    build_world()
    build_ground()
    top = data["drop"] + data["car"]["height"]
    build_ramp(top)
    root, wheels, canopy, plumes = build_car("car")
    animate(data, rule, root, wheels, canopy, plumes)
    track = data[rule]
    if rule == "off":
        f = data["roofDown"]
        dust("dust-roof", (track[f][0], 0, 0.0), (f, f + 80), 3.6, 1.3)
    else:
        # Thrust reaching the ground kicks up dust under the car as it comes
        # down, then a smaller puff as the tyres land.
        f = data["wheelsDown"]
        first = next(i for i, r in enumerate(track) if r[4] == 1 and r[1] < 2.6)
        dust("dust-thrust", (track[first][0] - 0.6, 0, 0.05), (first, f + 40), 3.0, 1.0)
        dust("dust-land", (track[f][0], 0, 0.05), (f, f + 45), 2.2, 0.9)
    return camera()


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :]
    timeline, rule, out = argv[0], argv[1], argv[2]
    first = int(argv[3]) if len(argv) > 3 else 0
    last = int(argv[4]) if len(argv) > 4 else None
    scale = float(argv[5]) if len(argv) > 5 else 1.0
    data = json.load(open(timeline))
    cam = setup(data, rule, scale)
    scene = bpy.context.scene
    scene.frame_start = first
    scene.frame_end = last if last is not None else data["frames"] - 1
    if out.endswith(".json"):
        from bpy_extras.object_utils import world_to_camera_view

        def at(p):
            v = world_to_camera_view(scene, cam, Vector(p))
            return [round(v.x, 4), round(1 - v.y, 4)]

        # Per frame: the drop, at the end of the ramp on its near edge, from
        # the ground to the roof's height as the car lets go; and the car.
        marks = []
        for f in range(data["frames"] + 1):
            scene.frame_set(f)
            car = bpy.data.objects["car"].matrix_world.translation
            marks.append(
                at((0.0, -DECK_W / 2, 0.0))
                + at((0.0, -DECK_W / 2, data["drop"]))
                + at(tuple(car))
            )
        json.dump(marks, open(out, "w"))
        return
    scene.render.image_settings.file_format = "PNG"
    if os.environ.get("FRAMES"):
        for f in [int(x) for x in os.environ["FRAMES"].split(",")]:
            scene.frame_set(f)
            scene.render.filepath = os.path.join(out, f"f{f:04d}.png")
            bpy.ops.render.render(write_still=True)
        return
    scene.render.filepath = os.path.join(out, "f")
    bpy.ops.render.render(animation=True)


if __name__ == "__main__":
    main()
