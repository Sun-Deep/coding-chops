"""A physical Wordle board, with the real grid, keyboard and feedback states.

All game states come from the frame export. FRAMES=0,70,214,330 renders a proof.
"""

import json
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "deplane"))
import scene as base

args = sys.argv[sys.argv.index("--") + 1 :]
T = json.load(open(args[0]))
OUT = args[1]
W, H = 1440, 1200
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))


def material(name, color, rough=0.5, metal=0.0, emission=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = base.hexrgb(color)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rough
    p.inputs["Specular IOR Level"].default_value = 0.0 if name in ["empty", "absent", "present", "correct"] else 0.22
    p.inputs["Emission Color"].default_value = base.hexrgb(color)
    p.inputs["Emission Strength"].default_value = emission
    return m


def box(name, dims, loc, mat, bevel=0.02, parent=None):
    o = base.box(name, dims, loc, mat, bevel=bevel)
    if parent:
        o.parent = parent
    return o


def empty(name, loc=(0, 0, 0), parent=None):
    o = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    if parent:
        o.parent = parent
    return o


def text(name, body, size, loc, mat, parent=None, serif=False):
    data = bpy.data.curves.new(name, "FONT")
    data.body = body
    data.size = size
    data.align_x = "CENTER"
    data.align_y = "CENTER"
    data.font = FONTS["serif" if serif else "sans"]
    data.extrude = 0.001
    data.bevel_depth = 0.0005
    data.materials.append(mat)
    o = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    if parent:
        o.parent = parent
    return o


def light(name, loc, energy, size, target, color=(1, 1, 1)):
    o = bpy.data.objects.new(name, bpy.data.lights.new(name, "AREA"))
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    o.data.energy = energy
    o.data.shape = "DISK"
    o.data.size = size
    o.data.color = color
    o.rotation_euler = (Vector(target) - o.location).to_track_quat("-Z", "Y").to_euler()
    return o


def stroke(name, points, mat, parent):
    data = bpy.data.curves.new(name, "CURVE")
    data.dimensions = "3D"
    data.bevel_depth = 0.009
    data.bevel_resolution = 2
    poly = data.splines.new("POLY")
    poly.points.add(len(points) - 1)
    for p, (x, y) in zip(poly.points, points):
        p.co = (x, y, 0.058, 1)
    data.materials.append(mat)
    o = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(o)
    o.parent = parent
    return o


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    base.setup_render(W, H)
    scene.render.resolution_percentage = int(os.environ.get("PERCENT", "100"))
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = int(os.environ.get("SAMPLES", "48"))
    scene.render.image_settings.file_format = "PNG"
    scene.render.fps = 30
    # Standard keeps the game feedback hues recognizable under the soft lights.
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "Medium High Contrast" if "Medium High Contrast" in scene.view_settings.bl_rna.properties["look"].enum_items else "None"
    world = bpy.data.worlds.new("dark studio")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.015, 0.015, 0.018, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.25
    scene.world = world

    global FONTS
    FONTS = {
        "sans": bpy.data.fonts.load("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
        "serif": bpy.data.fonts.load("/System/Library/Fonts/Supplemental/Georgia Bold.ttf"),
    }
    mats = {name: material(name, color, rough=0.48, emission=0.1 if name in ["present", "correct", "text"] else 0) for name, color in T["colors"].items()}
    frame = material("graphite aluminium", "#242528", rough=0.32, metal=0.5)
    dark = material("recess", "#0D0E10", rough=0.65)
    floor = material("charcoal concrete", "#161718", rough=0.5)
    box("table", (200, 200, 0.2), (0, 0, -0.15), floor, 0)
    # A curved studio backdrop removes the hard floor horizon behind the board.
    profile = [(6, -0.05)] + [(6 + 4 * math.sin(i * math.pi / 48), 3.95 - 4 * math.cos(i * math.pi / 48)) for i in range(1, 25)] + [(10, 30)]
    verts = [(x, y, z) for y, z in profile for x in (-50, 50)]
    mesh = bpy.data.meshes.new("curved backdrop")
    mesh.from_pydata(verts, [], [(2*i, 2*i+1, 2*i+3, 2*i+2) for i in range(len(profile)-1)])
    back = bpy.data.objects.new("curved backdrop", mesh)
    scene.collection.objects.link(back)
    back.data.materials.append(floor)
    for face in back.data.polygons:
        face.use_smooth = True

    board = empty("wordle board", (0, 0.85, 0.38))
    board.rotation_euler.x = math.radians(72)
    box("board rim", (5.5, 8.1, 0.2), (0, 4.05, -0.04), frame, 0.11, board)
    box("board face", (5.3, 7.9, 0.045), (0, 4.05, 0.08), dark, 0.055, board)
    text("Wordle", "Wordle", 0.54, (0, 7.64, 0.115), mats["text"], board, serif=True)
    box("masthead rule", (5.05, 0.012, 0.008), (0, 7.15, 0.12), mats["border"], 0, board)

    tiles = []
    for row in range(6):
        for col in range(5):
            x = (col - 2) * 0.80
            y = 6.65 - row * 0.80
            box(f"socket {row} {col}", (0.770, 0.770, 0.025), (x, y, 0.115), mats["border"], 0.016, board)
            pivot = empty(f"tile {row} {col}", (x, y, 0.146), board)
            face = box(f"face {row} {col}", (0.724, 0.724, 0.04), (0, 0, 0), mats["empty"], 0.009, pivot)
            letter = text(f"letter {row} {col}", "", 0.53, (0, -0.002, 0.024), mats["text"], pivot)
            tiles.append((pivot, face, letter))

    keyboard = empty("keyboard", (0, 1.25, 0.13), board)
    keyboard.rotation_euler.x = 0
    box("keyboard base", (5.15, 1.85, 0.10), (0, 0, 0), frame, 0.09, keyboard)
    box("keyboard recess", (5.05, 1.76, 0.025), (0, 0, 0.092), dark, 0.05, keyboard)
    keys = []
    rows = [list("QWERTYUIOP"), list("ASDFGHJKL"), ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"]]
    for r, labels in enumerate(rows):
        widths = [0.68 if label in ["ENTER", "DEL"] else 0.445 for label in labels]
        total = sum(widths) + (len(labels) - 1) * 0.052
        left = -total / 2
        for c, (label, width) in enumerate(zip(labels, widths)):
            x = left + width / 2
            y = 0.53 - r * 0.53
            group = empty(f"key {label}", (x, y, 0.13), keyboard)
            key = box(f"keycap {label}", (width, 0.49, 0.10), (0, 0, 0), mats["key"], 0.035, group)
            letter = text(f"key label {label}", "" if label == "DEL" else label, 0.13 if len(label) > 1 else 0.225, (0, 0, 0.055), mats["text"], group)
            if label == "DEL":
                stroke("backspace outline", [(-0.22, 0), (-0.1, 0.13), (0.21, 0.13), (0.21, -0.13), (-0.1, -0.13), (-0.22, 0)], mats["text"], group)
                stroke("backspace cross a", [(-0.015, -0.06), (0.105, 0.06)], mats["text"], group)
                stroke("backspace cross b", [(-0.015, 0.06), (0.105, -0.06)], mats["text"], group)
            keys.append((label, group, key))
            left += width + 0.052

    # A broad softbox shapes the bevels. A side strip separates the board from the set.
    light("key softbox", (-3.5, -4.5, 9.5), 850, 6, (0, 0.8, 2.6), (1.0, 0.96, 0.9))
    light("right edge", (4.2, 3.0, 7.0), 1100, 3.5, (0, 1.0, 3), (0.94, 0.97, 1.0))
    light("front fill", (0, -8, 5), 260, 5.0, (0, 1, 3))
    box("board foot", (5.8, 2.6, 0.18), (0, 0.6, 0.04), frame, 0.08)
    cam = base.camera((1.1, -12.6, 8.3), (0, 2.0, 4.05), lens=52)
    cam.data.sensor_fit = "HORIZONTAL"
    cam.data.sensor_width = 36
    cam.data.dof.use_dof = False
    scene.render.film_transparent = False
    scene.frame_start, scene.frame_end = 0, T["duration"] - 1
    return scene, board, tiles, keys, mats, cam


def place(f, board, tiles, keys, mats, cam):
    state = T["frames"][f]
    for k, (pivot, face, letter) in enumerate(tiles):
        row, col = divmod(k, 5)
        tile = state["rows"][row][col]
        pivot.rotation_euler.x = tile["angle"]
        pivot.location.y = 6.65 - row * 0.80 + tile["lift"]
        letter.data.body = tile["letter"]
        name = {0: "absent", 1: "present", 2: "correct"}.get(tile["status"], "empty")
        face.data.materials[0] = mats[name]
    for label, pivot, cap in keys:
        status = state["keyboard"].get(label, -1)
        cap.data.materials[0] = mats[{0: "absent", 1: "present", 2: "correct"}.get(status, "key")]
        pivot.location.z = 0.085 if state["pressed"] == label else 0.13
    # The same board stays on screen while the alternate opening resets it.
    board.rotation_euler.z = math.sin(state["turn"] * math.pi) * -0.035 if state["reset"] else 0
    t = f / max(1, T["duration"] - 1)
    def ramp(a, b):
        u = max(0, min(1, (f - a) / (b - a)))
        return u*u*(3-2*u)
    beats = T["beats"]
    first = ramp(beats["FLIP_A"] - 10, beats["FLIP_A"] + 30) * (1-ramp(beats["RESET"]-24, beats["RESET"]))
    second = ramp(beats["FLIP_B"] - 14, beats["FLIP_B"] + 24) * (1-ramp(beats["WIN"]-20, beats["COMPARE"]))
    close = max(first, second)
    centre = Vector((0, 2.0, 4.05))
    position = Vector((2.1 - 3.3*t, -12.6 + 0.25*t, 8.3 - 0.25*t))
    target = centre + Vector((0, 0.15, 1.35)) * close
    cam.location = target + (position-centre) * (1 - 0.18*close)
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()


scene, board, tiles, keys, mats, cam = build()
os.makedirs(OUT, exist_ok=True)
frames = [int(f) for f in os.environ["FRAMES"].split(",")] if os.environ.get("FRAMES") else range(T["duration"])
for f in frames:
    scene.frame_set(f)
    place(f, board, tiles, keys, mats, cam)
    scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
    bpy.ops.render.render(write_still=True)
