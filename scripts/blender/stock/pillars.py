"""The stock lesson's set: six price pillars and a walker, rendered in Blender.

Run headless:
  Blender -b --factory-startup -P scripts/blender/stock/pillars.py -- \
      public/vr48/timeline.json <frames dir | track.json>

Eye level, side on, on a dark floor. Six stone pillars stand in a row, one
per day, as tall as that day's price, 7 1 5 3 6 4, each with its price on
its face. A person stands in front of day one.

Every beat is a frame the creator says a word on, from timeline.json:

  the opening   close on day one, the person buys at 7: the orange line
                at 7 is what they paid. At "sell" they step to day two,
                which rises only to 1, under the line, and they slump. At
                "but how" the camera pulls back while the other four days
                rise; at "let's say" the line goes and they step back;
  the hook      the prices light as the six days are named;
  every pair    at "a hundred thousand days" the row runs on, 150 more
                pillars, and the camera swings to look down it;
  the trick     back to six;
  the walk      the person walks day to day, arriving as each price is
                said, carrying the cheapest price so far as an orange line
                held at that pillar's height: it starts at 7 and drops to 1
                on day two;
  time, space   at "no matter how many prices" the row runs on again and
                the person walks on along it, still carrying one line.

Arcs, labels, profit bars and numbers are drawn over this by Remotion, from
the track this script writes.

Given a directory, renders every frame into it (or only FRAMES=a,b,c).
Given a .json path, writes where Remotion's marks go on every frame.
Characters are Quaternius's CC0 pack (third_party/quaternius-characters,
not in Git).
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

ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CHARS = os.path.join(ROOT, "third_party", "quaternius-characters")

args = sys.argv[sys.argv.index("--") + 1 :]
T = json.load(open(args[0]))
OUT = args[1]
D = T["duration"]
B = T["beats"]
PRICES = T["prices"]

W, H = 1620, 850
UNIT = 0.3  # metres of pillar per dollar
SPACING = 1.1
PW = 0.62  # pillar width and depth
FRONT = -PW / 2
LINE_Y = -0.62
WALK_Y = -0.4
# The walker stands in the gap just left of the day he is on, close to the
# row and behind the carried line, so no pillar or price is ever hidden.
BESIDE = -0.55
SCALE = 0.5  # about 1.1 m: small beside the pillars, so he never hides one
EXTRA = 150
X = [(i - 2.5) * SPACING for i in range(6)]
TOP = [p * UNIT for p in PRICES]

ORANGE = base.hexrgb("#FF7A33")
CHALK = base.hexrgb("#E8E6E1")

rng = random.Random(48)
# The long row: prices from 1.5 to 9, so day two's 1 stays the cheapest.
EXTRA_X = [X[5] + SPACING * (k + 1) for k in range(EXTRA)]
EXTRA_TOP = [rng.uniform(1.5, 9.0) * UNIT for _ in range(EXTRA)]


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ramp(f, a, b):
    return ease((f - a) / (b - a)) if b > a else float(f >= a)


def clamp01(t):
    return max(0.0, min(1.0, t))


# ---------------------------------------------------------------- beats

DAY = B["day"]
WALK_ON = B["noMatter"]  # second long row, and the walk along it
O = B["open"]
STEP = 20  # frames for the walker to cross one gap


def rise_at(i):
    """The frame each of the six starts to rise: day one is already coming
    up on the first frame, day two as the walker reaches it, the other four
    a beat apart while the camera pulls back."""
    if i == 0:
        return -4
    if i == 1:
        return O["sell"] + 6
    return O["but"] + 10 + (i - 2) * 16


def pillar_rise(i, f):
    a = rise_at(i)
    return ramp(f, a, a + 14)


def price_lit(i, f):
    a = B["sixDays"] + i * 6
    return ramp(f, a, a + 6)


def extra_rise(k, f):
    """The long row: up at a hundred thousand days, gone at the cut back to
    six, up again at no matter how many prices."""
    d = k / EXTRA
    a = B["hundredK"] + 26 * d
    first = ramp(f, a, a + 10) * (1.0 if f < B["trick"] else 0.0)
    b = WALK_ON - 20 + 30 * d
    second = ramp(f, b, b + 10)
    return max(first, second)


def walker_x(f):
    """Day one until the walk; then arriving at each day as it is said; then
    on along the long row."""
    x = X[0] + BESIDE
    # The opening: over to day two at "sell", back to day one at "let's say".
    x += (X[1] - X[0]) * (ramp(f, O["sell"], O["sell"] + STEP) - ramp(f, O["letsSay"], O["letsSay"] + STEP))
    for i in range(1, 6):
        x = x + (X[i] - X[i - 1]) * ramp(f, DAY[i] - 20, DAY[i])
    # On along the long row, at walking pace, to the end.
    if f > WALK_ON:
        x = X[5] + BESIDE + 1.25 * (f - WALK_ON) / 30 * ramp(f, WALK_ON, WALK_ON + 10)
    return x


def walking(f):
    """1 walking on, -1 walking back, 0 standing."""
    if O["letsSay"] <= f < O["letsSay"] + STEP:
        return -1
    if O["sell"] <= f < O["sell"] + STEP:
        return 1
    if any(DAY[i] - 20 <= f < DAY[i] for i in range(1, 6)):
        return 1
    return 1 if f >= WALK_ON + 4 else 0


def cheapest_z(f):
    """The carried line's height: 7 at day one, 1 from day two."""
    return TOP[0] + (TOP[1] - TOP[0]) * ramp(f, DAY[1], DAY[1] + 8)


def line_state(f):
    """Start x, end x, height and opacity of the orange line, or None."""
    # The opening: what they paid, 7, held over day two when it falls to 1.
    if O["buy"] <= f < O["letsSay"] + 12:
        x0 = X[0] - 0.45
        x1 = X[0] + 0.45 + (X[1] - X[0]) * ramp(f, O["sell"], O["sell"] + STEP)
        grow = ramp(f, O["buy"], O["buy"] + 10)
        return x0, x0 + (x1 - x0) * grow, TOP[0], 1.0 - ramp(f, O["letsSay"], O["letsSay"] + 12)
    # A first look in the trick: day two's price carried to day five.
    if B["remember"] <= f < B["walk"]:
        u = ramp(f, B["remember"], B["remember"] + 16)
        return X[1] - 0.2, X[1] - 0.2 + (X[4] - X[1] + 0.2) * u, TOP[1], 1.0 - ramp(f, B["walk"] - 8, B["walk"])
    if f < DAY[0]:
        return None
    start = X[0] - 0.2 + (X[1] - X[0]) * ramp(f, DAY[1], DAY[1] + 8)
    end = walker_x(f) + 0.3
    grow = ramp(f, DAY[0], DAY[0] + 8)
    return start, start + (end - start) * grow, cheapest_z(f), 1.0


# ---------------------------------------------------------------- camera

LENS, SENSOR = 34, 36
TAN_H = (SENSOR / 2) / LENS
TAN_V = TAN_H * H / W


def side(cx, d, z=1.45, look_z=1.05):
    return Vector((cx, -d, z)), Vector((cx, 0.0, look_z))


def down_row():
    """Looking along the row from beside day one, so it runs out of sight."""
    return Vector((X[0] - 2.6, -5.6, 2.1)), Vector((X[0] + 9.0, 0.0, 0.4))


def mix(a, b, t):
    return a[0].lerp(b[0], t), a[1].lerp(b[1], t)


def camera_at(f):
    if f < B["trick"]:
        # The hook and every pair: a slow push in on the six, then down the row.
        cam = side(0.0, 9.0 - 0.8 * ramp(f, 0, B["hundredK"]))
        # The opening starts close on days one and two and pulls back to it.
        close = side(X[0] + 0.65, 5.9 - 0.3 * ramp(f, 0, O["but"]), z=1.6, look_z=1.3)
        cam = mix(close, cam, ramp(f, O["but"], O["highest"]))
        return mix(cam, down_row(), ramp(f, B["hundredK"] - 4, B["hundredK"] + 34))
    if f < B["walk"]:
        return side(-0.25, 8.4 - 0.4 * ramp(f, B["trick"], B["walk"]))
    if f < WALK_ON - 24:
        # The walk: in a little, drifting with the walker.
        u = ramp(f, B["walk"], B["walk"] + 30)
        return side(0.45 * walker_x(f) * u, 7.2 - 0.5 * u)
    # On along the long row, pulled back, following the walker.
    u = ramp(f, WALK_ON - 24, WALK_ON + 30)
    wx = walker_x(f)
    a = side(0.45 * wx, 6.7)
    b = side(wx + 1.2, 8.6, z=1.6, look_z=0.95)
    return mix(a, b, u)


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


def box(size, loc, material, bevel=0.0):
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


def pillar_mesh(stone):
    """A unit-high pillar standing on z = 0."""
    body = box((PW, PW, 1.0), (0, 0, 0.5), stone, bevel=0.02)
    mesh = body.data
    bpy.data.objects.remove(body)
    return mesh


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


def dress(arm, shirt, skin, hair):
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
                    bsdf.inputs["Base Color"].default_value = base.hexrgb(shirt)
                elif n == "Skin":
                    bsdf.inputs["Base Color"].default_value = base.hexrgb(skin)
                elif n == "Hair":
                    bsdf.inputs["Base Color"].default_value = base.hexrgb(hair)
                elif n == "Face":
                    bsdf.inputs["Base Color"].default_value = base.hexrgb("#1B1512")
                if n != "Face":
                    bsdf.inputs["Roughness"].default_value = 0.7
            slot.material = m


def strip(arm, action, start, end):
    tr = arm.animation_data.nla_tracks.new()
    a = bpy.data.actions[action]
    s = tr.strips.new(action, int(start), a)
    length = a.frame_range[1] - a.frame_range[0]
    s.repeat = max(0.01, (end - start) / length)
    s.extrapolation = "NOTHING"
    s.blend_in = 4 if start > 0 else 0
    s.blend_out = 4
    return s


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base.setup_render(W, H)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 0, D - 1
    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0016, 0.0016, 0.0019, 1)
    scene.world = world

    floor = mat("floor", base.hexrgb("#0E0F12"), 0.3)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(60, 20, 0))
    bpy.context.object.scale = (300, 200, 1)
    bpy.context.object.data.materials.append(floor)

    stone = mat("stone", base.hexrgb("#3D3F46"), 0.55)
    stone_far = mat("stonefar", base.hexrgb("#2C2E34"), 0.6)
    cap = mat("cap", CHALK, 0.4, emit=CHALK, strength=1.6)
    unit = pillar_mesh(stone)
    far = unit.copy()
    far.materials.clear()
    far.materials.append(stone_far)
    cap_obj = box((PW + 0.01, PW + 0.01, 0.014), (0, 0, 0), cap)
    cap_mesh = cap_obj.data
    bpy.data.objects.remove(cap_obj)

    pillars, caps, digits = [], [], []
    for i in range(6):
        o = bpy.data.objects.new(f"day{i + 1}", unit)
        o.location = (X[i], 0, 0)
        scene.collection.objects.link(o)
        pillars.append(o)
        c = bpy.data.objects.new(f"cap{i + 1}", cap_mesh)
        scene.collection.objects.link(c)
        caps.append(c)
        # The price on the pillar's face, near its top.
        bpy.ops.object.text_add(location=(X[i], FRONT - 0.005, 0))
        t = bpy.context.object
        t.data.body = str(PRICES[i])
        t.data.align_x = "CENTER"
        t.data.align_y = "TOP"
        t.data.size = 0.26
        t.data.extrude = 0.004
        t.rotation_euler = (math.pi / 2, 0, 0)
        m = mat(f"digit{i}", CHALK, 0.4, emit=CHALK, strength=0.0)
        t.data.materials.append(m)
        digits.append((t, m))
    extras = []
    for k in range(EXTRA):
        o = bpy.data.objects.new(f"extra{k}", far)
        o.location = (EXTRA_X[k], 0, 0)
        scene.collection.objects.link(o)
        extras.append(o)
    lm = mat("line", ORANGE, 0.3, emit=ORANGE, strength=4.0)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    line = bpy.context.object
    line.data.materials.append(lm)

    person = load("Casual_Male")
    dress(person, "#5D6B7E", "#C99272", "#3A2A20")
    strip(person, "Idle", 0, D)
    # The slump when day two comes in at 1, once, before the step back.
    slump = bpy.data.actions["Defeat"]
    n = slump.frame_range[1] - slump.frame_range[0]
    strip(person, "Defeat", O["high"], min(O["high"] + n, O["letsSay"] - 4))
    walks = [(O["sell"], O["sell"] + STEP), (O["letsSay"], O["letsSay"] + STEP)]
    walks += [(DAY[i] - 20, DAY[i]) for i in range(1, 6)] + [(WALK_ON + 4, D)]
    for a, b in walks:
        strip(person, "Walk", a, b)

    def light(name, kind, loc, at, energy, size=1.0, spot=None, color=(1, 1, 1)):
        L = bpy.data.objects.new(name, bpy.data.lights.new(name, kind))
        L.data.energy = energy
        L.data.color = color
        if kind == "AREA":
            L.data.size = size
        if spot:
            L.data.spot_size = math.radians(spot)
            L.data.spot_blend = 0.6
        L.location = loc
        L.rotation_euler = (Vector(at) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        scene.collection.objects.link(L)
        return L

    # Both follow the camera along the row, so the far end is lit too.
    key = light("key", "AREA", (-1.5, -4.5, 4.2), (0, 0, 1.0), 520, size=4, color=(1.0, 0.92, 0.84))
    rim = light("rim", "AREA", (1.0, 3.5, 3.5), (0, 0, 1.0), 300, size=6, color=(0.8, 0.86, 1.0))

    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    cam.data.lens = LENS
    cam.data.sensor_width = SENSOR
    cam.data.sensor_fit = "HORIZONTAL"
    cam.data.clip_end = 400
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 4.0
    scene.camera = cam

    ng = bpy.data.node_groups.new("comp", "CompositorNodeTree")
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    rl = ng.nodes.new("CompositorNodeRLayers")
    glare = ng.nodes.new("CompositorNodeGlare")
    glare.inputs["Type"].default_value = "Bloom"
    glare.inputs["Threshold"].default_value = 1.0
    glare.inputs["Strength"].default_value = 0.35
    glare.inputs["Size"].default_value = 0.5
    outn = ng.nodes.new("NodeGroupOutput")
    ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
    ng.links.new(glare.outputs["Image"], outn.inputs[0])
    scene.compositing_node_group = ng
    scene.render.use_compositing = True
    return scene, pillars, caps, digits, extras, line, lm, person, cam, (key, rim)


# ---------------------------------------------------------------- output


def track():
    """Per frame: the top of each of the six pillars, the point at the
    cheapest price's height in front of each, and the walker's head."""
    rows = []
    for f in range(D):
        cam, at = camera_at(f)
        pts = [Vector((X[i], FRONT, TOP[i] * pillar_rise(i, f))) for i in range(6)]
        pts += [Vector((X[i], LINE_Y, TOP[1])) for i in range(6)]
        pts.append(Vector((walker_x(f), WALK_Y, 1.35)))
        # The opening's line over day two: what was paid, above what it is now.
        pts.append(Vector((X[1], LINE_Y, TOP[0])))
        row = []
        for p in pts:
            x, y, z = project(p, cam, at)
            row.append([round(x * 0.5 + 0.5, 4), round(0.5 - y * 0.5, 4), 1 if z > 0 and abs(x) < 1.05 and abs(y) < 1.05 else 0])
        rows.append(row)
    json.dump(rows, open(OUT, "w"))
    print(f"wrote {OUT}")


def render():
    scene, pillars, caps, digits, extras, line, lm, person, cam, (key, rim) = build()
    os.makedirs(OUT, exist_ok=True)
    frames = [int(x) for x in os.environ["FRAMES"].split(",")] if os.environ.get("FRAMES") else range(D)
    scene.render.filepath = os.path.join(OUT, "warmup.png")
    bpy.ops.render.render(write_still=True)
    os.remove(scene.render.filepath)
    for f in frames:
        scene.frame_set(f)
        for i in range(6):
            h = max(TOP[i] * pillar_rise(i, f), 0.001)
            pillars[i].scale = (1, 1, h)
            caps[i].location = (X[i], 0, h)
            caps[i].hide_render = h < 0.01
            t, m = digits[i]
            t.location = (X[i], FRONT - 0.005, h - 0.06)
            m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 0.15 + 2.2 * price_lit(i, f)
            t.hide_render = h < 0.2
        for k, o in enumerate(extras):
            h = EXTRA_TOP[k] * extra_rise(k, f)
            o.hide_render = h < 0.01
            o.scale = (1, 1, max(h, 0.001))
        st = line_state(f)
        line.hide_render = st is None or st[3] <= 0.01
        if st is not None:
            x0, x1, z, a = st
            line.location = ((x0 + x1) / 2, LINE_Y, z)
            line.scale = (max(x1 - x0, 0.001), 0.04, 0.04)
            lm.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 4.0 * a
        person.location = (walker_x(f), WALK_Y, 0)
        person.rotation_euler.z = math.radians(90) * walking(f)
        pos, at = camera_at(f)
        for L, off in ((key, Vector((-1.5, -4.5, 4.2))), (rim, Vector((1.0, 3.5, 3.5)))):
            L.location = Vector((at.x, 0, 0)) + off
            L.rotation_euler = (Vector((at.x, 0, 1.0)) - L.location).to_track_quat("-Z", "Y").to_euler()
        cam.location = pos
        cam.rotation_euler = (at - pos).to_track_quat("-Z", "Y").to_euler()
        cam.data.dof.focus_distance = (Vector((walker_x(f), 0, 1.0)) - pos).length
        scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
        bpy.ops.render.render(write_still=True)


if OUT.endswith(".json"):
    track()
else:
    render()
