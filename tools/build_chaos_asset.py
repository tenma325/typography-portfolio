# Blender 5.1 headless script: shattered "CHAOS" typography asset for the
# portfolio's Chaos mode. Run with:
#   blender -b --python build_chaos_asset.py
# Outputs: ../public/assets/chaos_typo.glb
import bpy
import os
import random
import sys
import traceback

from mathutils import Vector

random.seed(42)

OUT_PATH = os.path.normpath(os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "public", "assets", "chaos_typo.glb",
))

NEON_GREEN = (0.09, 1.0, 0.05, 1.0)
NEON_VIOLET = (0.55, 0.29, 1.0, 1.0)
INK = (0.055, 0.055, 0.055, 1.0)


def make_ink_material():
    mat = bpy.data.materials.new(name="Ink")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = INK
    bsdf.inputs["Metallic"].default_value = 0.55
    bsdf.inputs["Roughness"].default_value = 0.35
    return mat


def make_neon_material(name, color, strength=3.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.0, 0.0, 0.0, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.6
    bsdf.inputs["Emission Color"].default_value = color
    bsdf.inputs["Emission Strength"].default_value = strength
    return mat


def pick_font():
    for name in ("seguibl.ttf", "arialbd.ttf", "arial.ttf"):
        path = os.path.join(r"C:\Windows\Fonts", name)
        if os.path.exists(path):
            return bpy.data.fonts.load(path)
    return None  # Blender built-in font


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)

    mat_ink = make_ink_material()
    mat_green = make_neon_material("NeonGreen", NEON_GREEN)
    mat_violet = make_neon_material("NeonViolet", NEON_VIOLET)

    # --- extruded text, split into one mesh object per letter ---
    bpy.ops.object.text_add()
    txt = bpy.context.object
    txt.data.body = "CHAOS"
    txt.data.size = 1.0
    txt.data.extrude = 0.12
    txt.data.bevel_depth = 0.006
    txt.data.space_character = 1.08
    font = pick_font()
    if font:
        txt.data.font = font

    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.separate(type="LOOSE")
    bpy.ops.object.mode_set(mode="OBJECT")

    letters = list(bpy.context.selected_objects)
    print(f"letters: {len(letters)}")

    noise = bpy.data.textures.new("ChaosNoise", type="CLOUDS")
    noise.noise_scale = 0.35

    for i, obj in enumerate(letters):
        obj.name = f"Letter_{i:02d}"
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.ops.object.origin_set(type="ORIGIN_CENTER_OF_MASS", center="MEDIAN")
        # broken-but-legible: small random tilt and drift per letter
        obj.rotation_euler = (
            random.uniform(-0.18, 0.18),
            random.uniform(-0.18, 0.18),
            random.uniform(-0.14, 0.14),
        )
        obj.location.x += random.uniform(-0.05, 0.05)
        obj.location.y += random.uniform(-0.08, 0.08)
        obj.location.z += random.uniform(-0.12, 0.12)
        sub = obj.modifiers.new("Sub", "SUBSURF")
        sub.subdivision_type = "SIMPLE"
        sub.levels = 2
        sub.render_levels = 2
        disp = obj.modifiers.new("Glitch", "DISPLACE")
        disp.texture = noise
        disp.strength = 0.025
        obj.data.materials.clear()
        obj.data.materials.append(mat_ink)

    # center the word on the world origin
    xs, ys, zs = [], [], []
    for obj in letters:
        for corner in obj.bound_box:
            v = obj.matrix_world @ Vector(corner)
            xs.append(v.x)
            ys.append(v.y)
            zs.append(v.z)
    cx = (min(xs) + max(xs)) / 2
    cy = (min(ys) + max(ys)) / 2
    cz = (min(zs) + max(zs)) / 2
    for obj in letters:
        obj.location.x -= cx
        obj.location.y -= cy
        obj.location.z -= cz
    half_w = (max(xs) - min(xs)) / 2

    # --- debris cloud: neon + ink shards scattered around the word ---
    shard_count = 140
    for i in range(shard_count):
        s = random.uniform(0.02, 0.11)
        kind = random.random()
        if kind < 0.4:
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=s)
        elif kind < 0.75:
            bpy.ops.mesh.primitive_cube_add(size=s * 1.8)
        else:
            bpy.ops.mesh.primitive_cone_add(radius1=s, depth=s * 2.6, vertices=6)
        shard = bpy.context.object
        shard.name = f"Shard_{i:03d}"
        shard.location = (
            random.uniform(-half_w - 1.2, half_w + 1.2),
            random.uniform(-1.4, 1.4),
            random.uniform(-1.1, 1.1),
        )
        shard.rotation_euler = (
            random.uniform(0, 6.283),
            random.uniform(0, 6.283),
            random.uniform(0, 6.283),
        )
        r = random.random()
        if r < 0.25:
            shard.data.materials.append(mat_green)
        elif r < 0.4:
            shard.data.materials.append(mat_violet)
        else:
            shard.data.materials.append(mat_ink)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUT_PATH,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
    )
    print(f"exported: {OUT_PATH} ({os.path.getsize(OUT_PATH)} bytes)")


try:
    build()
except Exception:
    traceback.print_exc()
    sys.exit(1)
