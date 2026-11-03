"""The Manhattan reel: one delivery from Harlem to Wall Street, searched twice.

Run headless:
  Blender -b --factory-startup -P scripts/blender/manhattan/city.py -- \
      public/vr59/timeline.json public/vr59/search.json <frames dir | track.json>

New York at night, built from the OpenStreetMap extract in
third_party/osm-nyc: every street a faint line on dark ground, every
building extruded to its tagged height. Both searches leave Harlem on the
same clock. Each intersection A* checks lights its street orange, each one
Dijkstra checks lights its street blue, on the frame beats.ts gives it, so
the orange thread reaches Wall Street while the blue is still a pool around
Harlem, and the blue then floods the island and the boroughs around it.
The route both find is traced back from Wall Street in white.

Which streets light, and in what order, comes from
scripts/measure-delivery-route.mjs (search.json); the frames come from
src/vertical/59-manhattan-route/beats.ts (timeline.json). This script only
draws them.

Given a directory, renders every frame into it (or only FRAMES=a,b,c);
RES=50 renders at half size for a proof. Given a .json path, writes where
Harlem and Wall Street sit on screen every frame, for the reel's labels.
"""

import json
import math
import os
import sys

import bpy
import numpy as np
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "deplane"))
import scene as base  # noqa: E402

args = sys.argv[sys.argv.index("--") + 1 :]
T = json.load(open(args[0]))
S = json.load(open(args[1]))
OUT = args[2]
OSM = "third_party/osm-nyc"
D = T["duration"]
B = T["beats"]
W, H = 1080, 1920

BLUE = "#4D9BFF"
ORANGE = "#FF7A33"
CHALK = "#E9E4D8"

# ---------------------------------------------------------------- the map
# One Blender unit is 100 m. Wall Street is the origin and the map is turned
# so Harlem lies straight up the screen, +Y.
UNIT = 100.0
G = S["goal"]
ST = S["start"]
KX = math.cos(math.radians((G["lat"] + ST["lat"]) / 2)) * 111320 / UNIT
KY = 110574 / UNIT
_vx = (ST["lon"] - G["lon"]) * KX
_vy = (ST["lat"] - G["lat"]) * KY
TURN = math.atan2(_vx, _vy)
CT, STN = math.cos(TURN), math.sin(TURN)


def proj(latlon):
    """[[lat, lon], ...] to an (N, 2) array of map units."""
    a = np.asarray(latlon, dtype=np.float64).reshape(-1, 2)
    x = (a[:, 1] - G["lon"]) * KX
    y = (a[:, 0] - G["lat"]) * KY
    return np.stack([x * CT - y * STN, x * STN + y * CT], 1)


START = proj([[ST["lat"], ST["lon"]]])[0]
GOAL = np.zeros(2)
REGION = (-130.0, 130.0, -70.0, 300.0)  # x0, x1, y0, y1: streets drawn
TOWNS = (-70.0, 70.0, -40.0, 280.0)  # buildings drawn
PIN_Z, PIN_R = 4.4, 0.85  # map pins: height of the head, its radius


def inside(p, box):
    return box[0] <= p[0] <= box[1] and box[2] <= p[1] <= box[3]


# ---------------------------------------------------------------- meshes


def link(name, me, mat):
    me.materials.append(mat)
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    return o


def ribbons(name, lines, width, z, mat, lit=None):
    """Every polyline as flat quads `width` wide, one per segment, with
    square ends so the joints close. lit[k] goes on every face of line k."""
    A, Bv, own = [], [], []
    for k, P in enumerate(lines):
        if len(P) < 2:
            continue
        A.append(P[:-1])
        Bv.append(P[1:])
        own.append(np.full(len(P) - 1, k))
    A = np.concatenate(A)
    Bv = np.concatenate(Bv)
    own = np.concatenate(own)
    d = Bv - A
    L = np.linalg.norm(d, axis=1)
    keep = L > 1e-6
    A, Bv, own, d, L = A[keep], Bv[keep], own[keep], d[keep], L[keep]
    u = d / L[:, None]
    n = np.stack([-u[:, 1], u[:, 0]], 1) * (width / 2)
    a = A - u * (width / 2)
    b = Bv + u * (width / 2)
    quad = np.stack([a - n, b - n, b + n, a + n], 1).reshape(-1, 2)
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
    if lit is not None:
        at = me.attributes.new("lit", "FLOAT", "FACE")
        at.data.foreach_set("value", np.asarray(lit, dtype=np.float32)[own])
    print(f"{name}: {m} segments")
    return link(name, me, mat)


def metres(tag):
    if not tag:
        return None
    num = ""
    for ch in tag.strip():
        if ch.isdigit() or (ch == "." and "." not in num):
            num += ch
        elif num:
            break
    if not num:
        return None
    v = float(num)
    return v * 0.3048 if ("'" in tag or "ft" in tag) else v


def buildings(mat):
    raw = json.load(open(os.path.join(OSM, "buildings.json")))["elements"]
    V, loops, starts, glint = [], [], [], []
    count = 0
    rng = np.random.default_rng(59)
    for e in raw:
        g = e.get("geometry")
        if e.get("type") != "way" or not g or len(g) < 4:
            continue
        P = proj([[p["lat"], p["lon"]] for p in g])
        if np.allclose(P[0], P[-1]):
            P = P[:-1]
        if len(P) < 3 or not inside(P.mean(0), TOWNS):
            continue
        t = e.get("tags", {})
        h = metres(t.get("height"))
        if h is None:
            lv = metres(t.get("building:levels"))
            h = lv * 3.4 + 2 if lv else 12.0
        h = max(4.0, min(h, 560.0)) / UNIT
        x, y = P[:, 0], P[:, 1]
        if np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y) < 0:
            P = P[::-1]
        n = len(P)
        o = len(V)
        for px, py in P:
            V.append((px, py, 0.0))
        for px, py in P:
            V.append((px, py, h))
        g_ = float(rng.random()) ** 9
        starts.append(len(loops))
        loops.extend(range(o + n, o + 2 * n))
        glint.append(0.0)
        for i in range(n):
            glint.append(g_)
            j = (i + 1) % n
            starts.append(len(loops))
            loops.extend((o + i, o + j, o + n + j, o + n + i))
        count += 1
    me = bpy.data.meshes.new("buildings")
    me.vertices.add(len(V))
    me.vertices.foreach_set("co", np.asarray(V, dtype=np.float32).ravel())
    me.loops.add(len(loops))
    me.loops.foreach_set("vertex_index", np.asarray(loops, dtype=np.int32))
    me.polygons.add(len(starts))
    me.polygons.foreach_set("loop_start", np.asarray(starts, dtype=np.int32))
    me.update(calc_edges=True)
    at = me.attributes.new("glint", "FLOAT", "FACE")
    at.data.foreach_set("value", np.asarray(glint, dtype=np.float32))
    print(f"buildings: {count}")
    return link("buildings", me, mat)


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


def glow(name, color, steady, flash, tau, pulse=None):
    """Dark until the frame in the face's `lit` attribute, then a flash
    that settles to a steady glow. `pulse` = (frame, size, tau) adds a
    second flash to every lit face at that frame."""
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
    f = frame_value(nt)
    age = maths(nt, "SUBTRACT", f, at.outputs["Fac"])
    on = maths(nt, "GREATER_THAN", age, 0.0)
    ex = maths(nt, "EXPONENT", maths(nt, "MULTIPLY", maths(nt, "MAXIMUM", age, 0.0), -1.0 / tau))
    s = maths(nt, "ADD", maths(nt, "MULTIPLY", ex, flash), steady)
    if pulse:
        pf, size, ptau = pulse
        page = maths(nt, "SUBTRACT", f, pf)
        pon = maths(nt, "GREATER_THAN", page, 0.0)
        pex = maths(nt, "EXPONENT", maths(nt, "MULTIPLY", maths(nt, "MAXIMUM", page, 0.0), -1.0 / ptau))
        s = maths(nt, "ADD", s, maths(nt, "MULTIPLY", maths(nt, "MULTIPLY", pex, pon), size))
    nt.links.new(maths(nt, "MULTIPLY", on, s), em.inputs["Strength"])
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    return m


def tower(name, color, lights):
    """Dark stone; each building's walls glow by its own random `glint`,
    so a few towers stand lit and most stay dark, like a city at night."""
    m = solid(name, color, 0.6)
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    at = nt.nodes.new("ShaderNodeAttribute")
    at.attribute_type = "GEOMETRY"
    at.attribute_name = "glint"
    p.inputs["Emission Color"].default_value = base.hexrgb(lights)
    nt.links.new(maths(nt, "MULTIPLY", at.outputs["Fac"], 1.3), p.inputs["Emission Strength"])
    return m


def flat(name, color, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = base.hexrgb(color)
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    return m


def solid(name, color, rough):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = base.hexrgb(color)
    p.inputs["Roughness"].default_value = rough
    return m


# ---------------------------------------------------------------- camera
LENS = 34.0
TAN_V = 18.0 / LENS  # portrait: the 36 mm sensor spans the height


def shot(pitch, ys, yg, yaw):
    """The camera that puts Harlem at screen height ys and Wall Street at
    yg (fractions from the top), looking down at `pitch` degrees, turned
    `yaw` degrees about the route's middle."""
    p, a = math.radians(pitch), math.radians(yaw)
    w = Vector((math.sin(a) * math.cos(p), math.cos(a) * math.cos(p), -math.sin(p)))
    r = w.cross(Vector((0, 0, 1))).normalized()
    v = r.cross(w)
    s3 = Vector((START[0], START[1], 0))
    g3 = Vector((0, 0, 0))

    def screen(c, q):
        d = q - c
        return 0.5 - (d.dot(v) / d.dot(w)) / TAN_V * 0.5

    # Slide the camera back along -w and sideways along v until both land.
    mid = (s3 + g3) / 2
    dist, up = 200.0, 0.0
    for _ in range(60):
        c = mid - w * dist + v * up
        e1 = screen(c, s3) - ys
        e2 = screen(c, g3) - yg
        h = 1e-3
        j11 = (screen(c - w * h, s3) - ys - e1) / h
        j12 = (screen(c + v * h, s3) - ys - e1) / h
        j21 = (screen(c - w * h, g3) - yg - e2) / h
        j22 = (screen(c + v * h, g3) - yg - e2) / h
        det = j11 * j22 - j12 * j21
        dist -= (e1 * j22 - e2 * j12) / det
        up -= (j11 * e2 - j21 * e1) / det
    c = mid - w * dist + v * up
    return c, c + w


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def camera_at(f):
    """Close on the route while A* runs, then rise and pull back while the
    blue floods, then keep drifting so the last seconds never freeze."""
    pull = ease((f - B["ASTAR_DONE"] + 6) / (B["DIJKSTRA_DONE"] - B["ASTAR_DONE"] + 20))
    pitch = 38 + 16 * pull
    ys = 0.30 + 0.04 * pull
    yg = 0.64
    yaw = -7 + 11 * (f / D)
    return shot(pitch, ys, yg, yaw)


def make_camera(scene):
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    cam.data.lens = LENS
    cam.data.sensor_width = 36
    cam.data.sensor_fit = "VERTICAL"
    cam.data.sensor_height = 36
    cam.data.clip_start = 1
    cam.data.clip_end = 2000
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
    scene = bpy.context.scene
    for o in list(scene.objects):
        bpy.data.objects.remove(o)
    base.setup_render(W, H)
    pct = int(os.environ.get("RES", "100"))
    scene.render.resolution_percentage = pct
    scene.frame_start, scene.frame_end = 0, D - 1
    scene.render.use_motion_blur = False
    scene.render.film_transparent = False

    world = bpy.data.worlds.new("night")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = base.hexrgb("#05070B")
    bg.inputs["Strength"].default_value = 1.0
    scene.world = world

    # Moonlight from the north-west, so tower tops and west faces read.
    sun = bpy.data.objects.new("moon", bpy.data.lights.new("moon", "SUN"))
    sun.data.energy = 2.2
    sun.data.color = (0.75, 0.82, 1.0)
    sun.data.angle = math.radians(2)
    sun.rotation_euler = (math.radians(58), 0, math.radians(-140))
    scene.collection.objects.link(sun)

    bpy.ops.mesh.primitive_plane_add(size=2000, location=(0, 100, -0.02))
    bpy.context.active_object.data.materials.append(flat("water", "#04060A", 1.0))

    streets = json.load(open(os.path.join(OSM, "streets.json")))["elements"]
    lines = []
    for e in streets:
        g = e.get("geometry")
        if e.get("type") != "way" or not g:
            continue
        P = proj([[p["lat"], p["lon"]] for p in g])
        if inside(P[0], REGION) or inside(P[-1], REGION):
            lines.append(P)
    ribbons("streets", lines, 0.09, 0.005, flat("street", "#6A7280", 0.8))

    buildings(tower("tower", "#262B35", "#AEB8C8"))

    dj = [proj(s) for s in S["dijkstra"]]
    ribbons("dijkstra", dj, 0.16, 0.012, glow("blue", BLUE, 1.4, 9.0, 7.0), T["dijkstraLit"])
    ast = [proj(s) for s in S["astar"]]
    ribbons("astar", ast, 0.26, 0.02, glow("orange", ORANGE, 2.6, 12.0, 7.0), T["astarLit"])
    # The route, traced back from Wall Street to Harlem as A* rebuilds it,
    # then flashed again when Dijkstra arrives at the same answer.
    route = [proj(s) for s in S["route"]]
    m = len(route)
    trace = [B["ASTAR_DONE"] + B["TRACE"] * (1 - (k + 1) / m) for k in range(m)]
    ribbons(
        "route", route, 0.42, 0.03,
        glow("route", CHALK, 3.2, 10.0, 6.0, (B["DIJKSTRA_DONE"], 8.0, 10.0)), trace,
    )

    # A map pin at each end, tall enough to stand above the towers round it.
    for name, (x, y) in (("harlem", START), ("wallst", GOAL)):
        m = flat(name, CHALK, 3.0)
        bpy.ops.mesh.primitive_cone_add(radius1=0.0, radius2=0.56, depth=PIN_Z, location=(x, y, PIN_Z / 2), vertices=32)
        bpy.context.active_object.data.materials.append(m)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=PIN_R, location=(x, y, PIN_Z), segments=48, ring_count=24)
        bpy.ops.object.shade_smooth()
        bpy.context.active_object.data.materials.append(m)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.7, depth=0.03, location=(x, y, 0.05), vertices=48)
        bpy.context.active_object.data.materials.append(m)

    make_camera(scene)

    ng = bpy.data.node_groups.new("comp", "CompositorNodeTree")
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    rl = ng.nodes.new("CompositorNodeRLayers")
    glare = ng.nodes.new("CompositorNodeGlare")
    glare.inputs["Type"].default_value = "Bloom"
    glare.inputs["Threshold"].default_value = 0.6
    glare.inputs["Strength"].default_value = 0.55
    glare.inputs["Size"].default_value = 0.6
    outn = ng.nodes.new("NodeGroupOutput")
    ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
    ng.links.new(glare.outputs["Image"], outn.inputs[0])
    scene.compositing_node_group = ng
    scene.render.use_compositing = True
    return scene


# ---------------------------------------------------------------- output


def track():
    """The heads of the Harlem and Wall Street pins on screen, as fractions
    of the frame, every frame: [hx, hy, wx, wy] with y from the top."""
    scene = bpy.context.scene
    for o in list(scene.objects):
        bpy.data.objects.remove(o)
    scene.render.resolution_x, scene.render.resolution_y = W, H
    cam = make_camera(scene)
    rows = []
    for f in range(D):
        scene.frame_set(f)
        row = []
        for x, y in (START, GOAL):
            q = world_to_camera_view(scene, cam, Vector((x, y, PIN_Z)))
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
