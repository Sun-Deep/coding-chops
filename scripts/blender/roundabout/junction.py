"""The roundabout reel's two junctions: the same suburban crossroads on a
sunny late afternoon, built once with traffic lights and once as a
single-lane roundabout, seen from a drone above the south-west corner.

Run: Blender -b --factory-startup -P scripts/blender/roundabout/junction.py -- \
       <timeline.json> <lights|roundabout> <out_dir|track.json> [first last]

The timeline comes from export.mjs: every car near the junction on every
frame, where it is, which way it faces and whether its brake lights are on,
and at the lights which arms have green. Cars are built here from boxes,
one per car in the timeline, the same car the same colour in both
junctions, yours orange. The road geometry is rebuilt from the model's own
constants, which the timeline carries, so the lanes the cars drive are the
lanes that are painted.

With FRAMES=a,b,c only those frames are rendered, as stills. With a .json
output, where your car is on screen each frame is written instead, for the
YOU tag.

Units are metres; x is east, y is north, z is up, as in the model.
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

PHI = [-math.pi / 2, 0.0, math.pi / 2, math.pi]
RES = (1620, 675)

BODY = ["#E6E6E3", "#B5B9BE", "#6B6F75", "#202226", "#2C3E5C", "#7A2E2E",
        "#C9B89B", "#2F5D62", "#7F9BB3", "#4B5544", "#8C8F93", "#D8D2C4"]
YOU = "#FF7A33"


def smooth(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def d(k):
    return (math.cos(PHI[k]), math.sin(PHI[k]))


def lat(k, r, m):
    """A point r metres out along arm k, m metres to the right of a car
    driving in."""
    dx, dy = d(k)
    return (dx * r - dy * m, dy * r + dx * m)


def polygon(name, pts, z, mat):
    me = bpy.data.meshes.new(name)
    verts = [(p[0], p[1], z) for p in pts]
    me.from_pydata(verts, [], [list(range(len(verts)))])
    me.update()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat)
    return o


def disc(name, r, z, mat, depth=0.0, segs=96, centre=(0, 0)):
    if depth > 0:
        bpy.ops.mesh.primitive_cylinder_add(vertices=segs, radius=r, depth=depth, location=(centre[0], centre[1], z - depth / 2))
    else:
        bpy.ops.mesh.primitive_circle_add(vertices=segs, radius=r, fill_type="NGON", location=(centre[0], centre[1], z))
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(mat)
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def ring(name, r0, r1, z, mat, segs=120):
    me = bpy.data.meshes.new(name)
    verts, faces = [], []
    for i in range(segs):
        a = 2 * math.pi * i / segs
        verts.append((r0 * math.cos(a), r0 * math.sin(a), z))
        verts.append((r1 * math.cos(a), r1 * math.sin(a), z))
    for i in range(segs):
        j = (i + 1) % segs
        faces.append((2 * i, 2 * j, 2 * j + 1, 2 * i + 1))
    me.from_pydata(verts, [], faces)
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat)
    return o


def strip(name, a, b, width, z, mat):
    """A painted line from a to b."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    n = math.hypot(dx, dy)
    nx, ny = -dy / n * width / 2, dx / n * width / 2
    return polygon(name, [(a[0] + nx, a[1] + ny), (b[0] + nx, b[1] + ny), (b[0] - nx, b[1] - ny), (a[0] - nx, a[1] - ny)], z, mat)


def noisy(name, color, rough, scale=0.4, amount=0.12):
    m = bpy.data.materials.new(name)
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = rough
    coord = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 6
    nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeMapRange")
    ramp.inputs[3].default_value = 1 - amount
    ramp.inputs[4].default_value = 1 + amount
    nt.links.new(noise.outputs["Fac"], ramp.inputs[0])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 1.0
    mix.inputs["A"].default_value = color
    comb = nt.nodes.new("ShaderNodeCombineColor")
    for ch in ("Red", "Green", "Blue"):
        nt.links.new(ramp.outputs[0], comb.inputs[ch])
    nt.links.new(comb.outputs[0], mix.inputs["B"])
    nt.links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    return m


# ---------------------------------------------------------------- the set


def build_world():
    world = bpy.data.worlds.new("sky")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = hexrgb("#B9D3EA")
    bg.inputs["Strength"].default_value = 0.9
    bpy.context.scene.world = world
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    bpy.context.scene.collection.objects.link(sun)
    sun.data.energy = 4.2
    sun.data.color = (1.0, 0.9, 0.78)
    sun.data.angle = math.radians(2.0)
    # Low from the south-west: long shadows to the north-east.
    sun.rotation_euler = Vector((0.55, 0.75, -0.55)).to_track_quat("-Z", "Y").to_euler()


GRASS = None
WALK = None
ROAD = None
PAINT = None
YELLOW = None


def materials():
    global GRASS, WALK, ROAD, PAINT, YELLOW
    GRASS = noisy("grass", hexrgb("#6F8A4A"), 0.9, scale=0.15, amount=0.18)
    WALK = noisy("walk", hexrgb("#BDB7AC"), 0.85, scale=0.8, amount=0.05)
    ROAD = noisy("asphalt", hexrgb("#3B3D41"), 0.75, scale=0.6, amount=0.08)
    PAINT = material("paint", hexrgb("#ECEBE6"), rough=0.6)
    YELLOW = material("yellow", hexrgb("#E2B33C"), rough=0.6)


def ground():
    polygon("grass", [(-200, -200), (200, -200), (200, 200), (-200, 200)], 0.0, GRASS)


def arm_strip(name, k, half, z, mat, r0=0.0, r1=150.0, widen=None):
    """A strip along arm k, `half` metres either side of the centre line,
    or widened near the middle by `widen(r)`."""
    pts_r, pts_l = [], []
    steps = 60
    for i in range(steps + 1):
        r = r0 + (r1 - r0) * i / steps
        h = widen(r) if widen else half
        pts_r.append(lat(k, r, h))
        pts_l.append(lat(k, r, -h))
    return polygon(name, pts_r + pts_l[::-1], z, mat)


def tree(name, x, y, rng, s=1.0):
    trunk = material(f"{name}t", hexrgb("#5A4636"), rough=0.9)
    leaf = material(f"{name}l", hexrgb(rng.choice(["#4E6B3A", "#5A7A3F", "#3F5E34", "#6A8447"])), rough=0.85)
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.22 * s, depth=2.4 * s, location=(x, y, 1.2 * s))
    t = bpy.context.active_object
    t.name = f"{name}trunk"
    t.data.materials.append(trunk)
    for j in range(3):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=(1.6 - 0.25 * j) * s, location=(x + rng.uniform(-0.5, 0.5) * s, y + rng.uniform(-0.5, 0.5) * s, (2.9 + 0.7 * j) * s))
        c = bpy.context.active_object
        c.name = f"{name}c{j}"
        c.data.materials.append(leaf)
        for p in c.data.polygons:
            p.use_smooth = True


def house(name, x, y, w, dpt, rot, rng):
    walls = material(f"{name}w", hexrgb(rng.choice(["#E7DFD0", "#D9D4C9", "#C9B9A1", "#B9C3C9", "#E3D6C1", "#A9886F"])), rough=0.8)
    roof = material(f"{name}r", hexrgb(rng.choice(["#5B4A44", "#4A4E57", "#6E4A3A", "#3E4247"])), rough=0.7)
    h = 3.2
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, h / 2), rotation=(0, 0, rot))
    b = bpy.context.active_object
    b.name = name
    b.scale = (w, dpt, h)
    b.data.materials.append(walls)
    # A pitched roof: a triangular prism along the house's width.
    me = bpy.data.meshes.new(f"{name}roof")
    hw, hd, rh = w / 2 + 0.4, dpt / 2 + 0.4, 1.9
    verts = [(-hw, -hd, 0), (hw, -hd, 0), (hw, hd, 0), (-hw, hd, 0), (-hw, 0, rh), (hw, 0, rh)]
    faces = [(0, 1, 5, 4), (3, 2, 5, 4), (0, 3, 4), (1, 2, 5), (0, 1, 2, 3)]
    me.from_pydata(verts, [], faces)
    o = bpy.data.objects.new(f"{name}roof", me)
    bpy.context.scene.collection.objects.link(o)
    o.location = (x, y, h)
    o.rotation_euler = (0, 0, rot)
    o.data.materials.append(roof)


def scenery():
    """A row of houses along each side of the east-west road, back from the
    pavement, with trees in the front gardens, the same in both junctions."""
    rng = random.Random(41)
    for qy in (-1, 1):
        for qx in (-1, 1):
            x = qx * 25
            while abs(x) < 95:
                w = rng.uniform(9, 12)
                house(f"house{qx}{qy}{int(abs(x))}", x + qx * w / 2, qy * rng.uniform(22, 25), w, rng.uniform(7, 8.5), rng.uniform(-0.04, 0.04), rng)
                tree(f"ft{qx}{qy}{int(abs(x))}", x + qx * rng.uniform(1, w - 1), qy * rng.uniform(12.5, 14.5), rng, rng.uniform(0.7, 1.0))
                x += qx * (w + rng.uniform(3, 6))
        for j in range(8):
            tree(f"back{qy}{j}", rng.uniform(-90, 90), qy * rng.uniform(33, 45), rng, rng.uniform(0.9, 1.3))
    # A few trees on the verges of the north-south road.
    for j in range(10):
        qx = 1 if j % 2 else -1
        tree(f"vn{j}", qx * rng.uniform(11, 14), rng.choice((-1, 1)) * rng.uniform(26, 60), rng, rng.uniform(0.8, 1.1))


# ----------------------------------------------------------------- lights


def build_lights(g):
    lane, stop, pocket = g["LANE"], g["STOP_LINE"], g["POCKET"]
    taper = 18.0

    def widen(r):
        if r < pocket - taper:
            return 1.5 * lane
        if r > pocket:
            return lane
        u = (r - (pocket - taper)) / taper
        return 1.5 * lane - 0.5 * lane * smooth(u)

    for k in range(4):
        arm_strip(f"walk{k}", k, 0, 0.02, WALK, widen=lambda r: widen(r) + 2.6)
        arm_strip(f"road{k}", k, 0, 0.04, ROAD, widen=widen)
    disc("walkc", 1.5 * lane + 8.5, 0.02, WALK)
    disc("roadc", 1.5 * lane + 5.0, 0.04, ROAD)
    for k in range(4):
        # The centre line, double yellow, following the widening; then the
        # lane line between the through lane and the left-turn lane.
        for side in (-0.12, 0.12):
            pts = []
            for i in range(41):
                r = stop + (150 - stop) * i / 40
                c = -0.5 * lane if r < pocket - taper else (0 if r > pocket else -0.5 * lane * (1 - smooth((r - (pocket - taper)) / taper)))
                pts.append(lat(k, r, c + side))
            for i in range(len(pts) - 1):
                strip(f"yl{k}{side}{i}", pts[i], pts[i + 1], 0.12, 0.05, YELLOW)
        for i in range(6):
            r = stop + 1 + i * 4
            strip(f"ll{k}{i}", lat(k, r, 0.5 * lane), lat(k, r + 2.2, 0.5 * lane), 0.14, 0.05, PAINT)
        # Edge lines.
        for i in range(30):
            r0 = stop + 2 + i * 5
            strip(f"edge{k}{i}", lat(k, r0, widen(r0) - 0.3), lat(k, r0 + 5, widen(r0 + 5) - 0.3), 0.12, 0.05, PAINT)
        # A zebra crossing between the stop line and the junction.
        for i in range(9):
            m = -1.5 * lane + 0.6 + i * (3 * lane - 1.2) / 8
            strip(f"zeb{k}{i}", lat(k, stop - 3.4, m), lat(k, stop - 0.7, m), 0.55, 0.05, PAINT)
        # Left-turn arrow in the pocket: a shaft and a head.
        a = lat(k, stop + 9, 0)
        b = lat(k, stop + 5, 0)
        strip(f"arr{k}", a, b, 0.25, 0.05, PAINT)
        c = lat(k, stop + 4.2, -0.9)
        strip(f"arrh{k}", b, c, 0.25, 0.05, PAINT)
    # Stop lines that carry the signal, and signal heads on poles.
    lamps = {}
    pole = material("pole", hexrgb("#4A4D52"), rough=0.4, metal=0.6)
    housing = material("housing", hexrgb("#1D1F22"), rough=0.5)
    for k in range(4):
        cols = {}
        for state, hexc in (("red", "#E8423A"), ("amber", "#F2B33D"), ("green", "#38C46A")):
            cols[state] = material(f"stop{k}{state}", hexrgb(hexc), rough=0.5, emit=hexrgb(hexc), strength=2.5)
        objs = {}
        for state, m in cols.items():
            objs[state] = strip(f"stop{k}{state}", lat(k, stop + 0.25, -0.5 * lane + 0.15), lat(k, stop + 0.25, 1.5 * lane - 0.15), 0.55, 0.055 + 0.001 * list(cols).index(state), m)
        # The pole on the near right corner, the head over the through lane.
        px, py = lat(k, stop + 1.5, 1.5 * lane + 1.4)
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.12, depth=5.4, location=(px, py, 2.7))
        bpy.context.active_object.data.materials.append(pole)
        hx, hy = lat(k, stop + 1.5, lane)
        strip(f"mast{k}", (px, py), (hx, hy), 0.14, 5.2, pole)
        dx, dy = d(k)
        bpy.ops.mesh.primitive_cube_add(size=1, location=(hx, hy, 4.75))
        h = bpy.context.active_object
        h.scale = (0.45, 0.45, 1.15)
        h.rotation_euler = (0, 0, PHI[k])
        h.data.materials.append(housing)
        bulbs = {}
        for j, state in enumerate(("red", "amber", "green")):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(hx + dx * 0.0, hy + dy * 0.0, 5.12 - j * 0.36))
            bulb = bpy.context.active_object
            bulb.scale = (1.6, 1.6, 1.0)
            off = material(f"bulb{k}{state}off", hexrgb("#2A2C30"), rough=0.3)
            on = material(f"bulb{k}{state}on", cols[state].node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value, rough=0.3, emit=cols[state].node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value, strength=9.0)
            bulb.data.materials.append(off)
            bulb.data.materials.append(on)
            bulbs[state] = bulb
        lamps[k] = (objs, bulbs)
    return lamps


def key_lamps(lamps, states):
    """Show each arm's state on its stop line and its signal head."""
    for k, (objs, bulbs) in lamps.items():
        shown = None
        for f, st in enumerate(states):
            s = st[k] if st else "red"
            if s == shown:
                continue
            for name, o in objs.items():
                o.hide_render = name != s
                o.keyframe_insert("hide_render", frame=f)
            shown = s
    # Each bulb has a lit twin; one or the other is shown.
    for k, (objs, bulbs) in lamps.items():
        for name, b in bulbs.items():
            lit = b.copy()
            lit.data = b.data.copy()
            bpy.context.scene.collection.objects.link(lit)
            lit.data.materials[0] = lit.data.materials[1]
            shown = None
            for f, st in enumerate(states):
                on = (st[k] if st else "red") == name
                if on == shown:
                    continue
                lit.hide_render = not on
                lit.keyframe_insert("hide_render", frame=f)
                b.hide_render = on
                b.keyframe_insert("hide_render", frame=f)
                shown = on
    for o in bpy.data.objects:
        ad = o.animation_data
        if ad and ad.action:
            for fc in getattr(ad.action, "fcurves", []):
                for kp in fc.keyframe_points:
                    kp.interpolation = "CONSTANT"


# -------------------------------------------------------------- roundabout


def build_roundabout(g):
    lane, ringr, give = g["LANE"], g["RING"], g["GIVE_WAY"]
    outer = ringr + 2.6
    for k in range(4):
        arm_strip(f"walk{k}", k, lane + 2.6, 0.02, WALK, r0=outer - 2)
        arm_strip(f"road{k}", k, lane, 0.04, ROAD, r0=outer - 4)
    ring("walkr", outer, outer + 3.0, 0.02, WALK)
    disc("roadr", outer, 0.04, ROAD)
    # Central island: a mountable apron of setts, a kerb, grass and a tree.
    apron = noisy("apron", hexrgb("#9C7D63"), 0.85, scale=3.0, amount=0.15)
    kerb = material("kerb", hexrgb("#D9D5CC"), rough=0.6)
    island = ringr - 2.5
    disc("apron", island, 0.09, apron, depth=0.08)
    disc("kerb", island - 1.4, 0.16, kerb, depth=0.14)
    disc("island", island - 1.65, 0.2, GRASS, depth=0.18)
    tree("islandtree", 0.0, 0.0, random.Random(3), 1.25)
    # The outer edge line, and the dashes across each entry.
    for i in range(120):
        a0 = 2 * math.pi * i / 120
        a1 = 2 * math.pi * (i + 0.8) / 120
        r = outer - 0.35
        strip(f"oe{i}", (r * math.cos(a0), r * math.sin(a0)), (r * math.cos(a1), r * math.sin(a1)), 0.12, 0.05, PAINT)
    for k in range(4):
        # A narrow raised splitter island between the lanes, widening at
        # the ring, and the give-way triangles across the entry lane.
        pts = [lat(k, outer + 0.5, -0.15), lat(k, outer + 12, -0.12), lat(k, outer + 12, 0.12), lat(k, outer + 0.5, 0.15)]
        isl = polygon(f"split{k}", pts, 0.12, kerb)
        for i in range(6):
            m = 0.25 + i * 0.55
            a = lat(k, give + 0.2, m - 0.22)
            b = lat(k, give + 0.2, m + 0.22)
            c = lat(k, give + 0.9, m)
            polygon(f"tooth{k}{i}", [a, b, c], 0.05, PAINT)
        # Centre line beyond the splitter, and edge lines.
        for i in range(24):
            r0 = outer + 13 + i * 5
            strip(f"cl{k}{i}", lat(k, r0, 0), lat(k, r0 + 2.8, 0), 0.14, 0.05, PAINT)
        for i in range(26):
            r0 = outer + 2 + i * 5
            for m in (lane - 0.3, -lane + 0.3):
                strip(f"edge{k}{i}{m}", lat(k, r0, m), lat(k, r0 + 5, m), 0.12, 0.05, PAINT)
        for i in range(8):
            m = -lane + 0.5 + i * (2 * lane - 1.0) / 7
            strip(f"zeb{k}{i}", lat(k, give + 3.0, m), lat(k, give + 5.6, m), 0.55, 0.05, PAINT)
        _ = isl


# ------------------------------------------------------------------- cars


def build_car(cid, you):
    rng = random.Random(cid * 7919 + 11)
    kind = rng.choice(("sedan", "sedan", "hatch", "suv"))
    L, W, H = {"sedan": (4.5, 1.8, 1.42), "hatch": (4.0, 1.75, 1.48), "suv": (4.7, 1.9, 1.72)}[kind]
    paint = material(f"paint{cid}", hexrgb(YOU if you else rng.choice(BODY)), rough=0.28, metal=0.35)
    glass = material(f"glass{cid}", hexrgb("#1B2430"), rough=0.12, metal=0.2)
    tyre = material(f"tyre{cid}", hexrgb("#151515"), rough=0.8)
    head = material(f"head{cid}", hexrgb("#FFF3D6"), rough=0.2, emit=hexrgb("#FFF3D6"), strength=1.5)
    tail = material(f"tail{cid}", hexrgb("#B0141A"), rough=0.3, emit=hexrgb("#FF2A1F"), strength=0.6)
    root = bpy.data.objects.new(f"car{cid}", None)
    bpy.context.scene.collection.objects.link(root)
    parts = []
    lower = box(f"c{cid}lower", (L, W, 0.62), (0, 0, 0.34 + 0.31), paint, bevel=0.12)
    cab_l = L * (0.52 if kind != "suv" else 0.62)
    cab = box(f"c{cid}cab", (cab_l, W * 0.84, H - 0.96), (-L * 0.06, 0, 0.96 + (H - 0.96) / 2), glass, bevel=0.1)
    roof = box(f"c{cid}roof", (cab_l * 0.86, W * 0.8, 0.07), (-L * 0.06, 0, H - 0.02), paint, bevel=0.03)
    parts += [lower, cab, roof]
    for sx in (1, -1):
        for sy in (1, -1):
            bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.33, depth=0.24, location=(sx * L * 0.32, sy * (W / 2 - 0.08), 0.33), rotation=(math.pi / 2, 0, 0))
            w = bpy.context.active_object
            w.name = f"c{cid}w{sx}{sy}"
            w.data.materials.append(tyre)
            parts.append(w)
        parts.append(box(f"c{cid}h{sx}", (0.06, 0.38, 0.12), (L / 2 - 0.01, sx * (W / 2 - 0.3), 0.78), head))
        parts.append(box(f"c{cid}t{sx}", (0.06, 0.36, 0.13), (-L / 2 + 0.01, sx * (W / 2 - 0.3), 0.8), tail))
    for p in parts:
        p.parent = root
    root["tail"] = tail.name
    return root, tail


def animate_cars(data, rule):
    frames = data[rule]["frames"]
    n = len(frames)
    ids = sorted({c[0] for fr in frames for c in fr})
    cars = {cid: build_car(cid, cid == data["you"]) for cid in ids}
    for cid, (root, tail) in cars.items():
        last = None
        for f in range(n):
            here = next((c for c in frames[f] if c[0] == cid), None)
            vis = here is not None
            if vis:
                _, x, y, h, brake = here
                root.location = (x, y, 0)
                root.rotation_euler = (0, 0, h)
                root.keyframe_insert("location", frame=f)
                root.keyframe_insert("rotation_euler", index=2, frame=f)
                em = tail.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
                em.default_value = 7.0 if brake else 0.6
                em.keyframe_insert("default_value", frame=f)
            if vis != last:
                for o in [root] + list(root.children):
                    o.hide_render = not vis
                    o.keyframe_insert("hide_render", frame=f)
                last = vis
        for o in [root] + list(root.children):
            ad = o.animation_data
            if ad and ad.action:
                for fc in getattr(ad.action, "fcurves", []):
                    if fc.data_path == "hide_render":
                        for kp in fc.keyframe_points:
                            kp.interpolation = "CONSTANT"
    return cars


# ----------------------------------------------------------------- camera


CAM_TARGET = (0.0, 2.0, 0.0)
CAM_AZ = math.radians(-24)
CAM_EL = math.radians(47)
CAM_DIST = 120
SCALE = (78.0, 72.0)


def camera(frames):
    scene = bpy.context.scene
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam.data.type = "ORTHO"
    tx, ty, tz = CAM_TARGET
    # From the south, a little to the west, looking down at CAM_EL.
    ox = math.sin(CAM_AZ) * math.cos(CAM_EL) * CAM_DIST
    oy = -math.cos(CAM_AZ) * math.cos(CAM_EL) * CAM_DIST
    oz = math.sin(CAM_EL) * CAM_DIST
    cam.location = (tx + ox, ty + oy, tz + oz)
    cam.rotation_euler = (Vector(CAM_TARGET) - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.data.clip_end = 1000
    # A slow push in over the whole reel.
    for f, s in ((0, SCALE[0]), (frames - 1, SCALE[1])):
        cam.data.ortho_scale = s
        cam.data.keyframe_insert("ortho_scale", frame=f)
    return cam


# -------------------------------------------------------------------- run


def setup(rule, g):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(*RES)
    build_world()
    materials()
    ground()
    scenery()
    if rule == "lights":
        return build_lights(g)
    build_roundabout(g)
    return None


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :]
    timeline, rule, out = argv[0], argv[1], argv[2]
    first = int(argv[3]) if len(argv) > 3 else 0
    last_f = int(argv[4]) if len(argv) > 4 else None
    data = json.load(open(timeline))
    lamps = setup(rule, data["geometry"])
    cars = animate_cars(data, rule)
    if lamps:
        key_lamps(lamps, data["lights"]["lamps"])
    camera(data["frames"])
    scene = bpy.context.scene
    scene.frame_start = first
    scene.frame_end = last_f if last_f is not None else data["frames"] - 1
    if out.endswith(".json"):
        from bpy_extras.object_utils import world_to_camera_view

        you = cars[data["you"]][0]
        track = []
        for f in range(data["frames"]):
            scene.frame_set(f)
            p = world_to_camera_view(scene, scene.camera, you.matrix_world @ Vector((0, 0, 1.6)))
            track.append([round(p.x, 4), round(1 - p.y, 4), 0 if you.hide_render else 1])
        json.dump(track, open(out, "w"))
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
