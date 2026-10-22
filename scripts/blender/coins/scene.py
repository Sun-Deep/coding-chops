"""Render the complete coin puzzle from its frame timeline.

Blender --background --factory-startup --python scene.py -- timeline out scale
Set FRAMES=0,80,116 to render selected frames instead of the complete preview.
Coin positions and the direction of the balance come from export.mjs.
"""
import json
import math
import os
import sys

import bpy
from mathutils import Vector


def srgb(value):
    return value / 12.92 if value < 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def material(name, color, metallic=0, roughness=0.4):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    return mat


def finish(obj, mat, bevel=0):
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new("soft machined edges", "BEVEL")
        mod.width = bevel
        mod.segments = 3
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def cube(name, location, scale, mat, bevel=0.04):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, mat, bevel)


def cylinder(name, location, radius, depth, mat, parent=None, bevel=0.012):
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=radius, depth=depth, location=location)
    obj = bpy.context.object
    obj.name = name
    finish(obj, mat, bevel)
    if parent:
        obj.parent = parent
    return obj


def ring(name, location, radius, thickness, mat, parent=None):
    bpy.ops.mesh.primitive_torus_add(major_segments=96, minor_segments=10, location=location,
                                    major_radius=radius, minor_radius=thickness)
    obj = bpy.context.object
    obj.name = name
    finish(obj, mat)
    if parent:
        obj.parent = parent
    return obj


def rod(name, start, end, radius, mat):
    a, b = Vector(start), Vector(end)
    obj = cylinder(name, (a + b) / 2, radius, (b - a).length, mat)
    obj.rotation_euler = (b - a).to_track_quat("Z", "Y").to_euler()
    return obj


def empty(name, location):
    obj = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = location
    return obj


def dish(name, mat, parent):
    # A shallow lathed bowl, with a flat centre that really supports the coins.
    profile = [(0, 0), (0.55, 0), (0.66, 0.025), (0.76, 0.09), (0.79, 0.15), (0.8, 0.16),
               (0.82, 0.14), (0.8, 0.07), (0.71, -0.02), (0.58, -0.055), (0, -0.055)]
    n = 96
    vertices = [(r * math.cos(2 * math.pi * i / n), r * math.sin(2 * math.pi * i / n), z)
                for r, z in profile for i in range(n)]
    faces = []
    for j in range(len(profile) - 1):
        for i in range(n):
            faces.append((j * n + i, j * n + (i + 1) % n,
                          (j + 1) * n + (i + 1) % n, (j + 1) * n + i))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent
    finish(obj, mat)
    return obj


def area(name, location, energy, size, target):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


args = sys.argv[sys.argv.index("--") + 1:]
timeline, output = args[:2]
scale = float(args[2]) if len(args) > 2 else 0.5
with open(timeline) as source:
    data = json.load(source)
os.makedirs(output, exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
scene.render.resolution_percentage = int(scale * 100)
scene.render.image_settings.file_format = "PNG"
scene.render.fps = data["fps"]
scene.render.film_transparent = False
scene.render.use_file_extension = True
scene.eevee.taa_render_samples = 64
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Medium High Contrast"
scene.world.color = (0.015, 0.015, 0.015)
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.06, 0.06, 0.06, 1)
scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.2

silver = material("circulated nickel silver", (0.24, 0.24, 0.24), 0.82, 0.36)
edge = material("coin recesses", (0.12, 0.12, 0.12), 0.75, 0.43)
relief = material("minted relief", (0.34, 0.34, 0.34), 0.84, 0.31)
accent_rgb = tuple(srgb(int(data["accent"][i:i+2], 16) / 255) for i in (1, 3, 5))
accent = material("remaining candidates", accent_rgb, 0.15, 0.36)
steel = material("satin steel", (0.34, 0.34, 0.34), 0.78, 0.28)
bright = material("polished edge", (0.62, 0.62, 0.62), 0.9, 0.2)
graphite = material("graphite base", (0.018, 0.018, 0.018), 0.35, 0.33)
table = material("black stone table", (0.006, 0.006, 0.006), 0, 0.83)
table.node_tree.nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.12
# Fine stone roughness belongs to the table, rather than a decorative overlay.
nodes = table.node_tree.nodes
noise = nodes.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value = 170
bump = nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.12
bump.inputs["Distance"].default_value = 0.012
table.node_tree.links.new(noise.outputs["Fac"], bump.inputs["Height"])
table.node_tree.links.new(bump.outputs["Normal"], nodes["Principled BSDF"].inputs["Normal"])

bpy.ops.mesh.primitive_plane_add(size=40, location=(0,0,0))
tabletop = bpy.context.object
tabletop.name = "stone tabletop"
tabletop.data.materials.append(table)
cylinder("base", (0, 0.4, 0.12), 0.68, 0.24, graphite)
ring("base rim", (0, 0.4, 0.21), 0.61, 0.018, steel)
cylinder("column foot", (0, 0.4, 0.38), 0.22, 0.33, steel)
rod("column", (0, 0.4, 0.42), (0, 0.4, data["beamZ"]), 0.075, steel)
rod("pivot bracket", (0, 0.4, data["beamZ"]), (0, 0, data["beamZ"]), 0.12, bright)
pivot = empty("balance pivot", (0, 0, data["beamZ"]))
beam = cube("beam", (0, 0, 0), (data["halfBeam"] * 2 + 0.22, 0.1, 0.13), steel, 0.045)
beam.parent = pivot
for side in [-1, 1]:
    pin = ring("end hook", (side * data["halfBeam"], 0, 0), 0.065, 0.022, bright, pivot)
    pin.rotation_euler.x = math.pi / 2
centre = cylinder("pivot cap", (0, -0.1, data["beamZ"]), 0.15, 0.13, graphite)
centre.rotation_euler.x = math.pi / 2

pans = []
cords = []
for side in [-1, 1]:
    pan = empty("left pan" if side == -1 else "right pan", (side * data["halfBeam"], 0, data["panZ"]))
    dish("weighing pan", steel, pan)
    ring("pan lip", (0, 0, 0.15), 0.79, 0.018, bright, pan)
    pans.append(pan)
    side_cords = []
    # Keep the front open so every coin can be counted.
    for angle in [math.pi / 6, math.pi * 5 / 6, math.pi * 3 / 2]:
        x, y = 0.74 * math.cos(angle), 0.74 * math.sin(angle)
        cord = rod("suspension", (side * data["halfBeam"], 0, data["beamZ"]),
                   (side * data["halfBeam"] + x, y, data["panZ"] + 0.14), 0.012, bright)
        side_cords.append((cord, x, y))
    cords.append(side_cords)

def path_relief(name, points, z, width, mat, parent, closed=False):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 2
    curve.bevel_depth = width
    curve.bevel_resolution = 2
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, (x, y) in zip(spline.points, points):
        point.co = (x, y, z, 1)
    spline.use_cyclic_u = closed
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj


def stamp(name, outline, z, mat, parent):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "2D"
    curve.fill_mode = "BOTH"
    curve.extrude = 0.002
    curve.bevel_depth = 0.0015
    curve.bevel_resolution = 2
    spline = curve.splines.new("POLY")
    spline.points.add(len(outline)-1)
    for point, (x, y) in zip(spline.points, outline):
        point.co = (x, y, 0, 1)
    spline.use_cyclic_u = True
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj.location.z = z
    obj.parent = parent
    return obj


font_path = "/System/Library/Fonts/Supplemental/Times New Roman.ttf"
font = bpy.data.fonts.load(font_path) if os.path.exists(font_path) else None
coins = []
coin_accents = []
# The same invented portrait is struck into every coin. It carries no clue.
portrait = [(-0.07,-0.06),(-0.10,-0.025),(-0.10,0.045),(-0.075,0.10),(-0.035,0.125),
            (0.018,0.125),(0.065,0.092),(0.073,0.052),(0.107,0.020),(0.078,0.007),
            (0.083,-0.021),(0.055,-0.044),(0.025,-0.045),(0.020,-0.078),
            (0.073,-0.108),(0.107,-0.15),(-0.115,-0.15),(-0.102,-0.105),(-0.062,-0.083)]
for i in range(data["coins"]):
    root = empty(f"coin {i}", (0, 0, 0))
    radius, thickness = data["radius"], data["thickness"]
    cylinder(f"coin blank {i}", (0, 0, 0), radius, thickness, silver, root, 0.003)
    cylinder(f"struck face {i}", (0, 0, thickness/2), 0.265, 0.002, edge, root, 0.001)
    rim = ring(f"raised rim {i}", (0, 0, thickness/2 + 0.002), 0.272, 0.005, relief, root)
    coin_accents.append(rim)
    ring(f"inner border {i}", (0, 0, thickness/2 + 0.002), 0.238, 0.0025, silver, root)
    stamp(f"portrait {i}", portrait, thickness/2 + 0.006, relief, root)
    path_relief(f"hair {i}", [(-0.087,-0.01),(-0.08,0.063),(-0.042,0.103),(0.009,0.105),(0.039,0.088)], thickness/2+0.013, 0.004, silver, root)
    path_relief(f"eye {i}", [(0.035,0.056),(0.052,0.053)], thickness/2+0.013, 0.003, edge, root)
    path_relief(f"shoulder {i}", [(-0.083,-0.121),(-0.03,-0.095),(0.055,-0.127)], thickness/2+0.013, 0.003, silver, root)
    # A small wreath and serif denomination make the blank read as a coin.
    for side in [-1,1]:
        branch = [(side*(0.115+0.05*math.sin(t)), -0.15+0.25*t) for t in [j/12 for j in range(13)]]
        path_relief(f"wreath stem {i} {side}", branch, thickness/2+0.008, 0.0024, relief, root)
        for j in range(5):
            t=j/5
            x=side*(0.115+0.05*math.sin(t))
            y=-0.14+0.24*t
            stamp(f"leaf {i} {side} {j}", [(x,y),(x+side*0.027,y+0.025),(x+side*0.03,y+0.045),(x+side*0.006,y+0.031)], thickness/2+0.007, relief, root)
    letters = bpy.data.curves.new(f"denomination {i}", "FONT")
    letters.body = "ONE"
    letters.align_x = "CENTER"
    letters.size = 0.061
    letters.extrude = 0.0014
    letters.bevel_depth = 0.0007
    if font:
        letters.font = font
    text = bpy.data.objects.new(f"minted lettering {i}", letters)
    scene.collection.objects.link(text)
    letters.materials.append(relief)
    text.parent = root
    text.location = (0, 0.159, thickness/2 + 0.006)
    # Fine vertical cuts in the edge, much narrower than the old token's teeth.
    for k in range(96):
        angle = k*2*math.pi/96
        groove = cube(f"reed {i} {k}", (0.283*math.cos(angle),0.283*math.sin(angle),0), (0.003,0.004,0.024), edge, 0)
        groove.rotation_euler.z = angle
        groove.parent = root
    coins.append(root)

# Spring tweezers visibly support transfers instead of coins flying by themselves.
tools = []
for hand in [-1,1]:
    root = empty(f"tweezers {hand}", (0,0,0))
    jaws = []
    for side in [-1,1]:
        jaw = empty(f"jaw {hand} {side}",(0,0,0))
        jaw.parent = root
        points = [(side*0.294,0,0),(side*0.30,0.12,0.025),(side*0.21,0.64,0.09),(side*0.045,1.0,0.12)]
        # A flat strip, rather than a cylindrical robot claw.
        for j in range(len(points)-1):
            part=rod(f"tweezer strip {hand} {side} {j}",points[j],points[j+1],0.013,steel)
            part.parent=jaw
        tip=cube(f"nylon tip {hand} {side}",(side*0.294,0,-0.003),(0.021,0.065,0.024),graphite,0.004)
        tip.parent=jaw
        jaws.append(jaw)
    hinge=cube(f"tweezer end {hand}",(0,1.0,0.12),(0.15,0.30,0.045),steel,0.025)
    hinge.parent=root
    tools.append((root,jaws))

# An arrest lever holds the beam level while coins are loaded and removed.
arrest = cube("arrest lever", (0.23,-0.08,0.44),(0.35,0.06,0.07),steel,0.025)
for side in [-1,1]:
    collar=cylinder(f"adjustment collar {side}",(side*1.88,0,data["beamZ"]),0.08,0.12,graphite)
    collar.rotation_euler.y=math.pi/2
    collar.parent=pivot
    collar.location=(side*1.88,0,0)

area("large softbox", (-3.5, -4, 8), 1000, 4, (0, 0, 1))
area("right strip", (5, 1, 6), 1000, 3, (0, 0, 2))
area("front fill", (0, -7, 4), 300, 4, (0, 0, 1.5))
area("top reflection", (-1, 4, 7), 1100, 4, (0, 0, 1))

camera_data = bpy.data.cameras.new("camera")
camera = bpy.data.objects.new("camera", camera_data)
scene.collection.objects.link(camera)
scene.camera = camera
camera_data.type = "ORTHO"
camera.location = (0, -12, 9)
camera.rotation_euler = (Vector((0, -0.1, 1.4)) - camera.location).to_track_quat("-Z", "Y").to_euler()
camera_data.ortho_scale = 14.8
camera_data.lens = 50


def pose(frame):
    state = data["poses"][frame]
    pivot.rotation_euler.y = -state["tilt"]
    for index, location in enumerate(state["pans"]):
        pans[index].location = location
        sign = -1 if index == 0 else 1
        top = Vector((location[0], 0, data["beamZ"] + sign * data["halfBeam"] * math.sin(state["tilt"])))
        for cord, x, y in cords[index]:
            end = Vector((location[0] + x, y, location[2] + 0.14))
            cord.location = (top + end) / 2
            cord.rotation_euler = (end - top).to_track_quat("Z", "Y").to_euler()
            # Each support has constant length under the beam's vertical travel.
    for coin, state_coin in zip(coins, state["coins"]):
        coin.location = state_coin["pos"]
        coin.rotation_euler = state_coin["rotation"]
        coin_accents[state_coin["id"]].data.materials[0] = accent if state_coin["accent"] else relief
    for (root,jaws), tool in zip(tools,state["tools"]):
        root.location=tool["pos"]
        root.rotation_euler=tool["rotation"]
        for j, jaw in enumerate(jaws):
            jaw.location.x=(-1 if j==0 else 1)*tool["open"]*0.08
        for child in root.children_recursive:
            child.hide_render=not tool["visible"]
    arrest.rotation_euler.y = -0.30 if state["arrested"] else 0.20
    camera.location = state["camera"]["location"]
    camera.rotation_euler = (Vector(state["camera"]["target"]) - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera_data.ortho_scale = state["camera"]["scale"]
    scene.frame_set(frame)


requested = os.environ.get("FRAMES")
frames = [int(f) for f in requested.split(",")] if requested else range(data["frames"])
for frame in frames:
    pose(frame)
    scene.render.filepath = os.path.join(output, f"f{frame:04d}.png")
    bpy.ops.render.render(write_still=True)
print(f"Coin puzzle rendered to {output}")
