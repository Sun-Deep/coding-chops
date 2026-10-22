"""The rain reel's street: a shopping street at night in heavy rain, a shop
awning on the left, a bus shelter 14 m along, and one person going from one
to the other, walking in one render and running in the other.

Run: Blender -b --factory-startup -P scripts/blender/rain/street.py -- \
       <timeline.json> <walk|run> <out_dir|steps.json> [first last]

The timeline comes from export.mjs: where you are along the street on every
frame, how fast you are going, and how wet your top and your front are by
then, from the reel's model. Your shirt, trousers and hair darken where the
drops have landed: on your head and shoulders by the top count, on your
chest and legs by the front count. The camera follows you from the street
side. The rain streaks lean by the camera's own speed, which is how rain
looks from something moving through it.

With FRAMES=a,b,c in the environment, only those frames are rendered, as
stills. With a .json output, the footfalls are written instead, for the
sound.

Units are metres. The street runs along +X; you go left to right. The shop
fronts are at y = FACADE_Y, the kerb at y = KERB_Y, and the camera stands in
the road at negative y looking at them. Characters are Quaternius's CC0
Ultimate Animated Character Pack (third_party/quaternius-characters, not in
Git); helpers come from the deplaning reel's set.
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

material = base.material
box = base.box
hexrgb = base.hexrgb

GAP = 14.0
PATH_Y = 0.25
FACADE_Y = 2.4
KERB_Y = -1.45
AWNING_X = (-4.4, 0.0)
SHELTER_X = (GAP, GAP + 4.8)
SHELTER_Y = (-0.85, 1.55)
ROOF_Z = 2.6
AWNING_LOW = (-0.75, 2.45)
AWNING_HIGH = (FACADE_Y, 3.1)
# The pack's people are 2.2 units tall: this makes you about 1.7 m.
CHAR_SCALE = 0.77
# Metres covered by one cycle of the pack's Walk and Run at this scale.
WALK_STRIDE = 1.35 * CHAR_SCALE / 0.64
RUN_STRIDE = 2.2 * CHAR_SCALE / 0.64
FALL = 6.54
RAIN_BOX = ((-12.0, 34.0), (-3.4, FACADE_Y - 0.05), (0.0, 6.0))
MODEL = "Casual2_Male"


def smooth(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


# ----------------------------------------------------------------- the set


def build_world():
    world = bpy.data.worlds.new("night")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = hexrgb("#1A2433")
    bg.inputs["Strength"].default_value = 0.35
    bpy.context.scene.world = world


def wet_surface(name, color, rough=(0.06, 0.42), scale=0.55, slabs=False, puddle=0.5):
    """A wet ground: mostly glossy, matt in patches, darker and mirror-like
    where water stands."""
    m = bpy.data.materials.new(name)
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    coord = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 6.0
    noise.inputs["Roughness"].default_value = 0.6
    nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
    r = nt.nodes.new("ShaderNodeMapRange")
    r.inputs[1].default_value = puddle - 0.08
    r.inputs[2].default_value = puddle + 0.08
    r.inputs[3].default_value = rough[1]
    r.inputs[4].default_value = rough[0]
    nt.links.new(noise.outputs["Fac"], r.inputs[0])
    nt.links.new(r.outputs[0], bsdf.inputs["Roughness"])
    dark = nt.nodes.new("ShaderNodeMapRange")
    dark.inputs[1].default_value = puddle - 0.08
    dark.inputs[2].default_value = puddle + 0.08
    dark.inputs[3].default_value = 1.0
    dark.inputs[4].default_value = 0.78
    nt.links.new(noise.outputs["Fac"], dark.inputs[0])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 1.0
    mix.inputs["A"].default_value = color
    if slabs:
        brick = nt.nodes.new("ShaderNodeTexBrick")
        brick.inputs["Scale"].default_value = 1.6
        brick.inputs["Mortar Size"].default_value = 0.012
        brick.inputs["Brick Width"].default_value = 0.9
        brick.inputs["Row Height"].default_value = 0.9
        brick.offset = 0.0
        brick.inputs["Color1"].default_value = (1, 1, 1, 1)
        brick.inputs["Color2"].default_value = (0.86, 0.86, 0.86, 1)
        brick.inputs["Mortar"].default_value = (0.45, 0.45, 0.45, 1)
        nt.links.new(coord.outputs["Object"], brick.inputs["Vector"])
        both = nt.nodes.new("ShaderNodeMath")
        both.operation = "MULTIPLY"
        nt.links.new(brick.outputs["Fac"], both.inputs[0])
        nt.links.new(dark.outputs[0], both.inputs[1])
        nt.links.new(brick.outputs["Color"], mix.inputs["B"])
        tint = nt.nodes.new("ShaderNodeMix")
        tint.data_type = "RGBA"
        tint.blend_type = "MULTIPLY"
        tint.inputs["Factor"].default_value = 1.0
        nt.links.new(mix.outputs["Result"], tint.inputs["A"])
        nt.links.new(dark.outputs[0], tint.inputs["B"])
        nt.links.new(tint.outputs["Result"], bsdf.inputs["Base Color"])
    else:
        nt.links.new(dark.outputs[0], mix.inputs["B"])
        nt.links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    return m


def plane(name, x, y, z, mat):
    bpy.ops.mesh.primitive_plane_add(size=1, location=((x[0] + x[1]) / 2, (y[0] + y[1]) / 2, z))
    o = bpy.context.active_object
    o.name = name
    o.scale = (x[1] - x[0], y[1] - y[0], 1)
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(mat)
    return o


def build_street():
    road = wet_surface("road", hexrgb("#17181B"), rough=(0.03, 0.26), scale=1.6, puddle=0.52)
    walk = wet_surface("pavement", hexrgb("#3A3B3E"), rough=(0.05, 0.28), scale=2.4, slabs=True, puddle=0.56)
    kerb = material("kerb", hexrgb("#5A5A5C"), rough=0.3)
    plane("road", (-40, 60), (-30, KERB_Y), 0.0, road)
    plane("pavement", (-40, 60), (KERB_Y, FACADE_Y), 0.12, walk)
    box("kerb", (100, 0.18, 0.14), (10, KERB_Y, 0.06), kerb)
    # A painted line on the road, broken, the only thing that is not grey.
    line = material("line", hexrgb("#8C8A80"), rough=0.35)
    for k in range(-6, 12):
        box(f"line{k + 6}", (2.2, 0.12, 0.004), (k * 5.0, -5.4, 0.002), line)


def build_facade():
    """Shop fronts along the back of the pavement: a wall with a window and
    a door cut out, a lit shop behind each window with shelves in it, and
    flats above with some windows lit."""
    rng = random.Random(4)
    wall_cols = ["#3A2F2B", "#33302E", "#2E3236", "#3D3530", "#2B2B2E"]
    lights = ["#FFE2B0", "#FFF0D6", "#F4F1EA", "#FFD9A0"]
    goods = ["#6B5D4F", "#4F5B66", "#7A6F62", "#5E5048", "#8A8378", "#46505A"]
    frame_m = material("shopframe", hexrgb("#17181B"), rough=0.35, metal=0.6)
    band_m = material("signband", hexrgb("#141519"), rough=0.5)
    shelf_m = material("shelf", hexrgb("#2A2724"), rough=0.6)
    floor_m = material("shopfloor", hexrgb("#4A4640"), rough=0.3)
    sill = material("sill", hexrgb("#4A4844"), rough=0.5)
    T = 0.35
    DEEP = 2.4
    x = -16.0
    k = 0
    while x < 40.0:
        w = rng.choice((5.0, 6.0, 4.6))
        wall = material(f"wall{k}", hexrgb(wall_cols[k % len(wall_cols)]), rough=0.75)
        wy = FACADE_Y + T / 2
        win0, win1 = x + 0.35, x + w - 1.55
        door0, door1 = x + w - 1.3, x + w - 0.3
        top = 2.45
        box(f"upper{k}", (w, T, 9.0 - top), (x + w / 2, wy, top + (9.0 - top) / 2), wall)
        box(f"pierl{k}", (0.35, T, top), (x + 0.175, wy, top / 2), wall)
        box(f"pierm{k}", (door0 - win1, T, top), ((win1 + door0) / 2, wy, top / 2), wall)
        box(f"pierr{k}", (0.3, T, top), (x + w - 0.15, wy, top / 2), wall)
        box(f"sill{k}", (win1 - win0, T, 0.5), ((win0 + win1) / 2, wy, 0.25), sill)
        box(f"frame{k}", (win1 - win0, 0.08, 0.06), ((win0 + win1) / 2, FACADE_Y + 0.04, top - 0.03), frame_m)
        box(f"mull{k}", (0.05, 0.08, top - 0.5), ((win0 + win1) / 2, FACADE_Y + 0.04, 0.5 + (top - 0.5) / 2), frame_m)
        # The shop: a lit room behind the window.
        glow = hexrgb(lights[k % len(lights)])
        back = material(f"back{k}", hexrgb(rng.choice(("#7A6C5C", "#6A6F72", "#857560", "#5E625F"))), rough=0.7)
        box(f"back{k}", (w - 0.1, 0.05, 3.0), (x + w / 2, FACADE_Y + DEEP, 1.5), back)
        box(f"floor{k}", (w - 0.1, DEEP, 0.05), (x + w / 2, FACADE_Y + DEEP / 2, 0.12), floor_m)
        box(f"side{k}", (0.05, DEEP, 3.0), (x + 0.05, FACADE_Y + DEEP / 2, 1.5), shelf_m)
        tube = material(f"tube{k}", glow, emit=glow, strength=6.0)
        box(f"tube{k}", (w - 1.2, 0.08, 0.04), (x + w / 2, FACADE_Y + DEEP * 0.5, 2.6), tube)
        inside = bpy.data.objects.new(f"in{k}", bpy.data.lights.new(f"in{k}", "AREA"))
        bpy.context.scene.collection.objects.link(inside)
        inside.data.energy = rng.uniform(140, 220)
        inside.data.size = w - 1.0
        inside.data.color = glow[:3]
        inside.location = (x + w / 2, FACADE_Y + DEEP * 0.5, 2.55)
        for j in range(int((win1 - win0) // 1.3)):
            sx = win0 + 0.7 + j * 1.3
            sy = FACADE_Y + rng.uniform(0.7, 1.6)
            box(f"shelf{k}-{j}", (0.9, 0.4, 1.7), (sx, sy, 0.95), shelf_m)
            for row in range(3):
                for q in range(3):
                    gm = material(f"good{k}-{j}-{row}-{q}", hexrgb(rng.choice(goods)), rough=0.5)
                    h = rng.uniform(0.15, 0.32)
                    box(f"good{k}-{j}-{row}-{q}", (0.24, 0.2, h), (sx - 0.3 + q * 0.3, sy - 0.12, 0.45 + row * 0.5 + h / 2), gm)
        door = material(f"door{k}", hexrgb("#1D1B19"), rough=0.25, emit=glow, strength=0.04)
        box(f"door{k}", (door1 - door0, 0.06, 2.2), ((door0 + door1) / 2, FACADE_Y + 0.25, 1.22), door)
        box(f"band{k}", (w, 0.12, 0.6), (x + w / 2, FACADE_Y - 0.04, 2.8), band_m)
        strip = material(f"strip{k}", glow, emit=glow, strength=1.2)
        box(f"strip{k}", (w - 0.8, 0.03, 0.04), (x + w / 2, FACADE_Y - 0.11, 2.58), strip)
        # Light from the shop falling out across the wet pavement.
        lamp = bpy.data.objects.new(f"shop{k}", bpy.data.lights.new(f"shop{k}", "AREA"))
        bpy.context.scene.collection.objects.link(lamp)
        lamp.data.energy = 70
        lamp.data.size = w - 2.0
        lamp.data.color = glow[:3]
        lamp.location = (x + w / 2, FACADE_Y + 0.4, 1.8)
        lamp.rotation_euler = (math.radians(-75), 0, 0)
        # Flats above: two rows of windows.
        for row, z in enumerate((4.4, 6.4)):
            for j in range(int(w // 1.6)):
                lit = rng.random() < 0.4
                c = hexrgb(rng.choice(lights)) if lit else hexrgb("#0E1014")
                wm = material(f"up{k}-{row}-{j}", c, rough=0.1, emit=c if lit else None, strength=rng.uniform(0.25, 0.6) if lit else 0.0)
                box(f"up{k}-{row}-{j}", (0.9, 0.05, 1.3), (x + 0.8 + j * 1.6 + 0.45, FACADE_Y + 0.03, z), wm)
                box(f"upsill{k}-{row}-{j}", (1.0, 0.12, 0.06), (x + 0.8 + j * 1.6 + 0.45, FACADE_Y - 0.02, z - 0.68), sill)
        x += w
        k += 1


def build_awning():
    """The shop you set out from: a fabric awning out over the pavement."""
    cloth = material("awning", hexrgb("#2F3E3C"), rough=0.55)
    trim = material("awningtrim", hexrgb("#243130"), rough=0.6)
    (y0, z0), (y1, z1) = AWNING_LOW, AWNING_HIGH
    length = math.hypot(y1 - y0, z1 - z0)
    tilt = math.atan2(z1 - z0, y1 - y0)
    w = AWNING_X[1] - AWNING_X[0]
    cx = (AWNING_X[0] + AWNING_X[1]) / 2
    box("awning", (w, length, 0.03), (cx, (y0 + y1) / 2, (z0 + z1) / 2), cloth, rot=(tilt, 0, 0))
    box("valance", (w, 0.03, 0.28), (cx, y0, z0 - 0.12), trim)


def build_shelter():
    """The bus shelter you are making for: posts, a roof, glass on the back
    and the far end, a lit advertising panel and a bench."""
    metal = material("shelter", hexrgb("#2A2D31"), rough=0.35, metal=0.7)
    glass = bpy.data.materials.new("glass")
    if hasattr(glass, "surface_render_method"):
        glass.surface_render_method = "BLENDED"
    g = glass.node_tree.nodes["Principled BSDF"]
    g.inputs["Base Color"].default_value = (0.6, 0.66, 0.7, 1)
    g.inputs["Roughness"].default_value = 0.05
    g.inputs["Alpha"].default_value = 0.12
    x0, x1 = SHELTER_X
    y0, y1 = SHELTER_Y
    # Posts at the back only, the roof cantilevered over the pavement, so
    # nothing stands between the camera and you as you come in.
    for x in (x0 + 0.05, x1 - 0.05):
        box(f"post{int(x)}", (0.08, 0.08, ROOF_Z), (x, y1 - 0.05, ROOF_Z / 2 + 0.12), metal)
    box("roof", (x1 - x0 + 0.2, y1 - y0 + 0.2, 0.1), ((x0 + x1) / 2, (y0 + y1) / 2, ROOF_Z + 0.17), metal)
    box("roofedge", (x1 - x0 + 0.24, 0.06, 0.18), ((x0 + x1) / 2, y0 - 0.1, ROOF_Z + 0.14), metal)
    box("back", (x1 - x0 - 0.2, 0.02, ROOF_Z - 0.3), ((x0 + x1) / 2, y1 - 0.05, ROOF_Z / 2 + 0.28), glass)
    box("end", (0.02, y1 - y0 - 0.2, ROOF_Z - 0.3), (x1 - 0.05, (y0 + y1) / 2, ROOF_Z / 2 + 0.28), glass)
    ad_c = hexrgb("#DCE6F0")
    ad = material("ad", ad_c, rough=0.2, emit=ad_c, strength=0.55)
    box("ad", (0.04, 1.3, 1.85), (x1 - 0.12, (y0 + y1) / 2 + 0.2, 1.25), ad)
    box("adframe", (0.08, 1.42, 1.97), (x1 - 0.09, (y0 + y1) / 2 + 0.2, 1.25), metal)
    light = bpy.data.objects.new("adlight", bpy.data.lights.new("adlight", "AREA"))
    bpy.context.scene.collection.objects.link(light)
    light.data.energy = 40
    light.data.size = 1.3
    light.data.color = (0.86, 0.92, 1.0)
    light.location = (x1 - 0.3, (y0 + y1) / 2 + 0.2, 1.3)
    light.rotation_euler = (0, math.radians(-90), 0)
    roof_light = bpy.data.objects.new("rooflight", bpy.data.lights.new("rooflight", "AREA"))
    bpy.context.scene.collection.objects.link(roof_light)
    roof_light.data.energy = 45
    roof_light.data.size = 3.5
    roof_light.data.color = (0.92, 0.95, 1.0)
    roof_light.location = ((x0 + x1) / 2, (y0 + y1) / 2, ROOF_Z + 0.05)
    box("bench", (2.2, 0.38, 0.06), ((x0 + x1) / 2 + 0.3, y1 - 0.3, 0.58), metal)
    for dx in (-0.9, 0.9):
        box(f"benchleg{int(dx * 10)}", (0.05, 0.3, 0.45), ((x0 + x1) / 2 + 0.3 + dx, y1 - 0.3, 0.35), metal)
    # The bus stop flag on its pole at the kerb end.
    box("flagpole", (0.06, 0.06, 2.9), (x1 + 0.6, y0 - 0.25, 1.55), metal)
    sign = material("flag", hexrgb("#8E9398"), rough=0.4)
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.28, depth=0.03, location=(x1 + 0.6, y0 - 0.28, 2.75), rotation=(math.radians(90), 0, 0))
    o = bpy.context.active_object
    o.name = "flagdisc"
    o.data.materials.append(sign)


def build_lamps():
    """Street lamps on the far side of the road, behind the camera, so no
    pole ever stands between you and the lens: only their light reaches the
    pavement."""
    warm = (1.0, 0.8, 0.58)
    for k, x in enumerate((-10.0, 2.0, 14.0, 26.0, 38.0)):
        lamp = bpy.data.objects.new(f"lamp{k}", bpy.data.lights.new(f"lamp{k}", "SPOT"))
        bpy.context.scene.collection.objects.link(lamp)
        lamp.data.energy = 1500
        lamp.data.color = warm
        lamp.data.spot_size = math.radians(110)
        lamp.data.spot_blend = 0.7
        lamp.data.shadow_soft_size = 0.3
        lamp.location = (x, -9.0, 6.0)
        lamp.rotation_euler = Vector((0.0, 9.5, -5.6)).to_track_quat("-Z", "Y").to_euler()
    moon = bpy.data.objects.new("moon", bpy.data.lights.new("moon", "SUN"))
    bpy.context.scene.collection.objects.link(moon)
    moon.data.energy = 0.25
    moon.data.color = (0.7, 0.8, 1.0)
    moon.rotation_euler = (math.radians(50), 0, math.radians(-30))


# ------------------------------------------------------------------- rain


def node(nt, kind, **inputs):
    n = nt.nodes.new(kind)
    for k, v in inputs.items():
        n.inputs[k].default_value = v
    return n


def math_node(nt, op, a=None, b=None, c=None):
    n = nt.nodes.new("ShaderNodeMath")
    n.operation = op
    for i, v in enumerate((a, b, c)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            n.inputs[i].default_value = v
        else:
            nt.links.new(v, n.inputs[i])
    return n.outputs[0]


def under_roofs(nt, x, y, z):
    """1 where a point is under the awning or the shelter roof, else 0."""
    def inside(xr, yr, top):
        a = math_node(nt, "GREATER_THAN", x, xr[0])
        b = math_node(nt, "LESS_THAN", x, xr[1])
        c = math_node(nt, "GREATER_THAN", y, yr[0])
        d = math_node(nt, "LESS_THAN", y, yr[1])
        e = math_node(nt, "LESS_THAN", z, top)
        return math_node(nt, "MULTIPLY", math_node(nt, "MULTIPLY", math_node(nt, "MULTIPLY", a, b), math_node(nt, "MULTIPLY", c, d)), e)
    aw = inside(AWNING_X, (AWNING_LOW[0], FACADE_Y), AWNING_HIGH[1])
    sh = inside((SHELTER_X[0] - 0.1, SHELTER_X[1] + 0.1), (SHELTER_Y[0] - 0.1, SHELTER_Y[1] + 0.1), ROOF_Z + 0.2)
    return math_node(nt, "MAXIMUM", aw, sh)


def rain_material():
    """Lit by the street like water would be: translucent, so drops in front
    of a lamp or a shop window glow, with a little light of their own so the
    rain still reads against the dark."""
    m = bpy.data.materials.new("rain")
    if hasattr(m, "surface_render_method"):
        m.surface_render_method = "BLENDED"
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tl = nt.nodes.new("ShaderNodeBsdfTranslucent")
    tl.inputs["Color"].default_value = (0.9, 0.93, 1.0, 1)
    gl = nt.nodes.new("ShaderNodeBsdfGlossy")
    gl.inputs["Roughness"].default_value = 0.15
    emit = nt.nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = (0.75, 0.82, 0.92, 1)
    attr = nt.nodes.new("ShaderNodeAttribute")
    attr.attribute_type = "INSTANCER"
    attr.attribute_name = "bright"
    nt.links.new(attr.outputs["Fac"], emit.inputs["Strength"])
    add1 = nt.nodes.new("ShaderNodeAddShader")
    nt.links.new(tl.outputs[0], add1.inputs[0])
    nt.links.new(gl.outputs[0], add1.inputs[1])
    add2 = nt.nodes.new("ShaderNodeAddShader")
    nt.links.new(add1.outputs[0], add2.inputs[0])
    nt.links.new(emit.outputs[0], add2.inputs[1])
    transp = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    mix.inputs[0].default_value = 0.38
    nt.links.new(transp.outputs[0], mix.inputs[1])
    nt.links.new(add2.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    return m


def splash_material():
    m = bpy.data.materials.new("splash")
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    emit = nt.nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = (0.85, 0.9, 0.95, 1)
    attr = nt.nodes.new("ShaderNodeAttribute")
    attr.attribute_type = "INSTANCER"
    attr.attribute_name = "fade"
    nt.links.new(attr.outputs["Fac"], emit.inputs["Strength"])
    transp = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(attr.outputs["Fac"], mix.inputs[0])
    nt.links.new(transp.outputs[0], mix.inputs[1])
    nt.links.new(emit.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    return m


def geo_object(name):
    me = bpy.data.meshes.new(name)
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    ng = bpy.data.node_groups.new(name, "GeometryNodeTree")
    ng.interface.new_socket(name="Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
    ng.interface.new_socket(name="Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    mod = o.modifiers.new(name, "NODES")
    mod.node_group = ng
    # Thousands of instances would fill the shadow buffer, and rain casts no
    # shadow worth seeing anyway.
    o.visible_shadow = False
    return o, ng, mod


def build_rain(count=16000):
    """Streaks falling at the drops' speed through a box over the street,
    wrapping from the ground back to the top, none under the roofs. Each
    streak leans by `Tilt` (radians, keyed from the camera's speed) and is
    stretched by `Stretch`."""
    o, ng, mod = geo_object("rain")
    ng.interface.new_socket(name="Tilt", in_out="INPUT", socket_type="NodeSocketFloat")
    ng.interface.new_socket(name="Stretch", in_out="INPUT", socket_type="NodeSocketFloat")
    nt = ng
    gin = nt.nodes.new("NodeGroupInput")
    gout = nt.nodes.new("NodeGroupOutput")
    (x0, x1), (y0, y1), (z0, z1) = RAIN_BOX
    rnd = nt.nodes.new("FunctionNodeRandomValue")
    rnd.data_type = "FLOAT_VECTOR"
    rnd.inputs["Min"].default_value = (x0, y0, z0)
    rnd.inputs["Max"].default_value = (x1, y1, z1)
    rnd.inputs["Seed"].default_value = 3
    pts = node(nt, "GeometryNodePoints", Count=count)
    nt.links.new(rnd.outputs["Value"], pts.inputs["Position"])
    pos = nt.nodes.new("GeometryNodeInputPosition")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(pos.outputs[0], sep.inputs[0])
    time = nt.nodes.new("GeometryNodeInputSceneTime")
    fall = math_node(nt, "MULTIPLY", time.outputs["Seconds"], FALL)
    z = math_node(nt, "WRAP", math_node(nt, "SUBTRACT", sep.outputs["Z"], fall), z1, z0)
    comb = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(sep.outputs["X"], comb.inputs["X"])
    nt.links.new(sep.outputs["Y"], comb.inputs["Y"])
    nt.links.new(z, comb.inputs["Z"])
    setp = nt.nodes.new("GeometryNodeSetPosition")
    nt.links.new(pts.outputs[0], setp.inputs["Geometry"])
    nt.links.new(comb.outputs[0], setp.inputs["Position"])
    # A streak: a thin four-sided rod a metre long, scaled per drop.
    rod = node(nt, "GeometryNodeMeshCylinder", Vertices=4, Radius=0.0028, Depth=1.0)
    setm = nt.nodes.new("GeometryNodeSetMaterial")
    setm.inputs["Material"].default_value = rain_material()
    nt.links.new(rod.outputs["Mesh"], setm.inputs["Geometry"])
    inst = nt.nodes.new("GeometryNodeInstanceOnPoints")
    nt.links.new(setp.outputs[0], inst.inputs["Points"])
    nt.links.new(setm.outputs[0], inst.inputs["Instance"])
    rot = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(gin.outputs["Tilt"], rot.inputs["Y"])
    nt.links.new(rot.outputs[0], inst.inputs["Rotation"])
    # Length: 0.2 to 0.36 m before stretching; none under a roof.
    size = nt.nodes.new("FunctionNodeRandomValue")
    size.data_type = "FLOAT"
    size.inputs[2].default_value = 0.12
    size.inputs[3].default_value = 0.26
    size.inputs["Seed"].default_value = 5
    covered = under_roofs(nt, sep.outputs["X"], sep.outputs["Y"], z)
    keep = math_node(nt, "SUBTRACT", 1.0, covered)
    length = math_node(nt, "MULTIPLY", math_node(nt, "MULTIPLY", size.outputs[1], gin.outputs["Stretch"]), keep)
    thick = math_node(nt, "MULTIPLY", keep, 1.0)
    sc = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(thick, sc.inputs["X"])
    nt.links.new(thick, sc.inputs["Y"])
    nt.links.new(length, sc.inputs["Z"])
    nt.links.new(sc.outputs[0], inst.inputs["Scale"])
    bright = nt.nodes.new("FunctionNodeRandomValue")
    bright.data_type = "FLOAT"
    bright.inputs[2].default_value = 0.05
    bright.inputs[3].default_value = 0.35
    bright.inputs["Seed"].default_value = 9
    store = nt.nodes.new("GeometryNodeStoreNamedAttribute")
    store.data_type = "FLOAT"
    store.domain = "INSTANCE"
    store.inputs["Name"].default_value = "bright"
    nt.links.new(inst.outputs[0], store.inputs["Geometry"])
    nt.links.new(bright.outputs[1], store.inputs["Value"])
    nt.links.new(store.outputs[0], gout.inputs["Geometry"])
    return o, mod


def build_splashes(count=2600):
    """Rings spreading where drops hit the ground, each on its own clock."""
    o, ng, mod = geo_object("splashes")
    nt = ng
    gin = nt.nodes.new("NodeGroupInput")
    gout = nt.nodes.new("NodeGroupOutput")
    rnd = nt.nodes.new("FunctionNodeRandomValue")
    rnd.data_type = "FLOAT_VECTOR"
    rnd.inputs["Min"].default_value = (-12.0, -7.0, 0.0)
    rnd.inputs["Max"].default_value = (34.0, FACADE_Y - 0.1, 0.0)
    rnd.inputs["Seed"].default_value = 21
    pts = node(nt, "GeometryNodePoints", Count=count)
    nt.links.new(rnd.outputs["Value"], pts.inputs["Position"])
    pos = nt.nodes.new("GeometryNodeInputPosition")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(pos.outputs[0], sep.inputs[0])
    on_pavement = math_node(nt, "GREATER_THAN", sep.outputs["Y"], KERB_Y)
    zlift = math_node(nt, "ADD", math_node(nt, "MULTIPLY", on_pavement, 0.12), 0.006)
    comb = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(sep.outputs["X"], comb.inputs["X"])
    nt.links.new(sep.outputs["Y"], comb.inputs["Y"])
    nt.links.new(zlift, comb.inputs["Z"])
    setp = nt.nodes.new("GeometryNodeSetPosition")
    nt.links.new(pts.outputs[0], setp.inputs["Geometry"])
    nt.links.new(comb.outputs[0], setp.inputs["Position"])
    time = nt.nodes.new("GeometryNodeInputSceneTime")
    rate = nt.nodes.new("FunctionNodeRandomValue")
    rate.data_type = "FLOAT"
    rate.inputs[2].default_value = 1.6
    rate.inputs[3].default_value = 2.6
    rate.inputs["Seed"].default_value = 23
    off = nt.nodes.new("FunctionNodeRandomValue")
    off.data_type = "FLOAT"
    off.inputs["Seed"].default_value = 29
    phase = math_node(nt, "FRACT", math_node(nt, "ADD", math_node(nt, "MULTIPLY", time.outputs["Seconds"], rate.outputs[1]), off.outputs[1]))
    covered = under_roofs(nt, sep.outputs["X"], sep.outputs["Y"], 0.5)
    keep = math_node(nt, "SUBTRACT", 1.0, covered)
    # A ring grows over the first 40% of each cycle, then is gone.
    grow = math_node(nt, "MINIMUM", math_node(nt, "DIVIDE", phase, 0.4), 1.0)
    alive = math_node(nt, "LESS_THAN", phase, 0.4)
    r = math_node(nt, "MULTIPLY", math_node(nt, "ADD", math_node(nt, "MULTIPLY", grow, 0.075), 0.012), math_node(nt, "MULTIPLY", keep, alive))
    fade = math_node(nt, "MULTIPLY", math_node(nt, "POWER", math_node(nt, "SUBTRACT", 1.0, grow), 2.0), 0.9)
    ring = node(nt, "GeometryNodeMeshCylinder", Vertices=18, Radius=1.0, Depth=0.012)
    ring.fill_type = "NONE"
    setm = nt.nodes.new("GeometryNodeSetMaterial")
    setm.inputs["Material"].default_value = splash_material()
    nt.links.new(ring.outputs["Mesh"], setm.inputs["Geometry"])
    inst = nt.nodes.new("GeometryNodeInstanceOnPoints")
    nt.links.new(setp.outputs[0], inst.inputs["Points"])
    nt.links.new(setm.outputs[0], inst.inputs["Instance"])
    sc = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(r, sc.inputs["X"])
    nt.links.new(r, sc.inputs["Y"])
    sc.inputs["Z"].default_value = 1.0
    nt.links.new(sc.outputs[0], inst.inputs["Scale"])
    store = nt.nodes.new("GeometryNodeStoreNamedAttribute")
    store.data_type = "FLOAT"
    store.domain = "INSTANCE"
    store.inputs["Name"].default_value = "fade"
    nt.links.new(inst.outputs[0], store.inputs["Geometry"])
    nt.links.new(fade, store.inputs["Value"])
    nt.links.new(store.outputs[0], gout.inputs["Geometry"])
    _ = gin
    return o


# ------------------------------------------------------------------ you


def wet_cloth(mat, dry_rough, darken):
    """Darken a material where water has landed: on surfaces facing up by
    the `top` value, on surfaces facing forward by the `front` value. The
    pack's people face -Y in their own space, so the masks are taken from
    the object-space normal and follow you when you turn. Returns the two
    value nodes to key."""
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    if bsdf is None:
        return None
    base_link = bsdf.inputs["Base Color"].links
    coord = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(coord.outputs["Normal"], sep.inputs[0])
    up = nt.nodes.new("ShaderNodeMapRange")
    up.inputs[1].default_value = 0.15
    up.inputs[2].default_value = 0.7
    nt.links.new(sep.outputs["Z"], up.inputs[0])
    fwd = nt.nodes.new("ShaderNodeMapRange")
    fwd.inputs[1].default_value = -0.05
    fwd.inputs[2].default_value = -0.6
    nt.links.new(sep.outputs["Y"], fwd.inputs[0])
    top = nt.nodes.new("ShaderNodeValue")
    top.name = "wet_top"
    front = nt.nodes.new("ShaderNodeValue")
    front.name = "wet_front"
    a = nt.nodes.new("ShaderNodeMath")
    a.operation = "MULTIPLY"
    nt.links.new(up.outputs[0], a.inputs[0])
    nt.links.new(top.outputs[0], a.inputs[1])
    b = nt.nodes.new("ShaderNodeMath")
    b.operation = "MULTIPLY"
    nt.links.new(fwd.outputs[0], b.inputs[0])
    nt.links.new(front.outputs[0], b.inputs[1])
    wet = nt.nodes.new("ShaderNodeMath")
    wet.operation = "MAXIMUM"
    wet.use_clamp = True
    nt.links.new(a.outputs[0], wet.inputs[0])
    nt.links.new(b.outputs[0], wet.inputs[1])
    dry_color = tuple(bsdf.inputs["Base Color"].default_value)
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    nt.links.new(wet.outputs[0], mix.inputs["Factor"])
    if base_link:
        nt.links.new(base_link[0].from_socket, mix.inputs["A"])
        nt.links.remove(base_link[0])
    else:
        mix.inputs["A"].default_value = dry_color
    mix.inputs["B"].default_value = (dry_color[0] * darken, dry_color[1] * darken, dry_color[2] * darken, 1)
    nt.links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    rough = nt.nodes.new("ShaderNodeMapRange")
    rough.inputs[3].default_value = dry_rough
    rough.inputs[4].default_value = 0.22
    nt.links.new(wet.outputs[0], rough.inputs[0])
    nt.links.new(rough.outputs[0], bsdf.inputs["Roughness"])
    return top, front


def load_you():
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(base.CHARS, f"{MODEL}.gltf"))
    new = [o for o in bpy.data.objects if o not in before]
    arm = next(o for o in new if o.type == "ARMATURE")
    arm.name = "you"
    arm.scale = (CHAR_SCALE,) * 3
    arm.rotation_mode = "XYZ"
    colours = {
        "Skin": ("#C99A72", 0.55, None),
        "Hair": ("#2A211C", 0.5, 0.55),
        "Shirt": ("#BDB8AE", 0.75, 0.42),
        "Pants": ("#4A5A72", 0.75, 0.5),
        "Belt": ("#2A2522", 0.6, None),
        "Face": ("#1B1512", 0.25, None),
    }
    wets = []
    for child in arm.children_recursive:
        if child.type != "MESH":
            continue
        for slot in child.material_slots:
            src = slot.material
            if src is None:
                continue
            name = src.name.split(".")[0]
            m = src.copy()
            slot.link = "OBJECT"
            slot.material = m
            bsdf = m.node_tree.nodes.get("Principled BSDF")
            spec = colours.get(name)
            if bsdf is None or spec is None:
                continue
            bsdf.inputs["Base Color"].default_value = hexrgb(spec[0])
            bsdf.inputs["Roughness"].default_value = spec[1]
            if spec[2] is not None:
                vals = wet_cloth(m, spec[1], spec[2])
                if vals:
                    wets.append(vals)
    return arm, wets


def strip(arm, name, action, frames, weighted=True):
    track = arm.animation_data.nla_tracks.new()
    track.name = name
    s = track.strips.new(name, 0, action)
    # Past its own end a strip is held, and so is its influence: stretch it
    # over the whole reel so the keyed influence counts on every frame. Its
    # time is keyed anyway, so the stretch changes nothing else.
    if hasattr(s, "frame_end_ui"):
        s.frame_end_ui = frames
    else:
        s.frame_end = frames
    s.blend_in = 0
    s.blend_out = 0
    s.extrapolation = "HOLD"
    # Turning animated influence on creates an influence curve keyed at 0,
    # which stays even if it is turned off again: the base strip never has it.
    s.use_animated_influence = weighted
    s.use_animated_time = True
    return s


def heading(dx, dy):
    """Rotation about Z that points a pack character along (dx, dy)."""
    return math.atan2(dx, -dy)


def animate_you(arm, wets, frames):
    """Position, heading, gait and wetness on every frame. Walk and run are
    played by distance covered, so feet do not slide; as you slow under the
    shelter, run hands over to walk and walk to standing, and once stopped
    you turn to face the street."""
    arm.animation_data_create()
    ad = arm.animation_data
    ad.action = None
    # The importer stashes every action of the pack on a track of its own.
    for t in list(ad.nla_tracks):
        ad.nla_tracks.remove(t)
    acts = bpy.data.actions
    idle = strip(arm, "idle", acts["Idle"], len(frames), weighted=False)
    idle.influence = 1.0
    walk = strip(arm, "walk", acts["Walk"], len(frames))
    run = strip(arm, "run", acts["Run"], len(frames))
    idle_len = acts["Idle"].frame_range[1]
    walk_len = acts["Walk"].frame_range[1]
    run_len = acts["Run"].frame_range[1]
    n = len(frames)
    stopped_at = next((f for f in range(n) if frames[f][1] <= 1e-6), n)
    walked = 0.0
    prev_x = frames[0][0]
    steps = []
    last_half = None
    for f in range(n):
        x, speed, wt, wf = frames[f]
        walked += abs(x - prev_x)
        prev_x = x
        wr = smooth((speed - 2.2) / 1.6)
        ww = (1 - wr) * smooth((speed - 0.05) / 0.5)
        turn = smooth((f - stopped_at - 6) / 14)
        h = heading(1, 0) * (1 - turn) + heading(0, -1) * turn
        arm.location = (x, PATH_Y, 0.12)
        arm.keyframe_insert("location", frame=f)
        arm.rotation_euler = (0, 0, h)
        arm.keyframe_insert("rotation_euler", index=2, frame=f)
        walk.influence = ww
        walk.keyframe_insert("influence", frame=f)
        run.influence = wr
        run.keyframe_insert("influence", frame=f)
        idle.strip_time = (f * 0.8) % idle_len
        idle.keyframe_insert("strip_time", frame=f)
        walk.strip_time = (walked / WALK_STRIDE * walk_len) % walk_len
        walk.keyframe_insert("strip_time", frame=f)
        run.strip_time = (walked / RUN_STRIDE * run_len) % run_len
        run.keyframe_insert("strip_time", frame=f)
        for top, front in wets:
            top.outputs[0].default_value = wt
            top.outputs[0].keyframe_insert("default_value", frame=f)
            front.outputs[0].default_value = wf
            front.outputs[0].keyframe_insert("default_value", frame=f)
        # A footfall every half stride of whichever gait is leading.
        if speed > 0.05:
            stride = RUN_STRIDE if wr > 0.5 else WALK_STRIDE
            half = int(walked / (stride / 2))
            if last_half is not None and half > last_half:
                steps.append([f, "run" if wr > 0.5 else "walk"])
            last_half = half
        else:
            last_half = None
    for s in (idle, walk, run):
        for fc in s.fcurves:
            if fc.data_path == "strip_time":
                for kp in fc.keyframe_points:
                    kp.interpolation = "CONSTANT"
    return steps


# --------------------------------------------------------------- camera


def follow(xs, lag=0.22, fps=30.0):
    """A camera that follows x like a dolly on a spring: critically damped,
    settled at the start, so it trails a moving subject a little and eases
    to a stop when the subject stops."""
    w = 1.0 / lag
    dt = 1.0 / fps
    v0 = (xs[1] - xs[0]) / dt
    pos = xs[0] - 2 * lag * v0
    vel = v0
    out = []
    for x in xs:
        acc = w * w * (x - pos) - 2 * w * vel
        vel += acc * dt
        pos += vel * dt
        out.append(pos)
    return out


CAM_AHEAD = 1.9
CAM_BACK = 5.7
CAM_Z = 2.2
AIM_AHEAD = 0.9
AIM_Z = 1.05
LENS = 30


def animate_camera(frames, rain_mod):
    scene = bpy.context.scene
    cam = base.camera((0, -CAM_BACK, CAM_Z), (0, 0, AIM_Z), lens=LENS)
    aim = bpy.data.objects.new("aim", None)
    scene.collection.objects.link(aim)
    con = cam.constraints.new("TRACK_TO")
    con.target = aim
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"
    xs = [f[0] for f in frames]
    # Lead the follow by the spring's steady lag (2 x lag x speed), so the
    # camera keeps level with you while you move and settles when you stop.
    cx = follow([f[0] + 2 * 0.22 * f[1] for f in frames])
    tilt_socket = rain_mod.node_group.interface.items_tree["Tilt"].identifier
    stretch_socket = rain_mod.node_group.interface.items_tree["Stretch"].identifier
    stop = next((f for f in range(len(frames)) if frames[f][1] <= 1e-6), len(frames))
    for f, c in enumerate(cx):
        # Once you have stopped, a slow push in, so the shot never sits dead.
        push = smooth((f - stop) / 240.0) * 0.9
        cam.location = (c + CAM_AHEAD - push * 0.4, PATH_Y - CAM_BACK + push, CAM_Z - push * 0.25)
        cam.keyframe_insert("location", frame=f)
        aim.location = (c + AIM_AHEAD, PATH_Y + 0.5, AIM_Z)
        aim.keyframe_insert("location", frame=f)
        # How fast the camera is moving, and so how far the rain leans.
        v = (cx[min(len(cx) - 1, f + 1)] - cx[max(0, f - 1)]) * 15.0
        rain_mod[tilt_socket] = math.atan2(v, FALL)
        rain_mod.keyframe_insert(f'["{tilt_socket}"]', frame=f)
        rain_mod[stretch_socket] = math.hypot(v, FALL) / FALL
        rain_mod.keyframe_insert(f'["{stretch_socket}"]', frame=f)
    return cam


# ------------------------------------------------------------------ run


def setup(w=1300, h=760):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(w, h)
    scene = bpy.context.scene
    # No motion blur: with the camera moving with you it smeared you rather
    # than the street. The rain's lean carries the motion instead.
    scene.render.use_motion_blur = False
    build_world()
    build_street()
    build_facade()
    build_awning()
    build_shelter()
    build_lamps()


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :]
    timeline, gait, out = argv[0], argv[1], argv[2]
    first = int(argv[3]) if len(argv) > 3 else 0
    last_f = int(argv[4]) if len(argv) > 4 else None
    data = json.load(open(timeline))
    frames = data[gait]["frames"]
    setup()
    _, rain_mod = build_rain()
    build_splashes()
    arm, wets = load_you()
    steps = animate_you(arm, wets, frames)
    animate_camera(frames, rain_mod)
    scene = bpy.context.scene
    scene.frame_start = first
    scene.frame_end = last_f if last_f is not None else len(frames) - 1
    if out.endswith(".json"):
        json.dump(steps, open(out, "w"))
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
