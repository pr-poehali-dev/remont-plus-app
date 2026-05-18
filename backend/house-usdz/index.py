"""
Business: Генерация USDZ-модели каркасного дома для AR Quick Look на iOS.
         Принимает спецификацию дома, строит USDA-сцену, упаковывает в USDZ
         и загружает в S3.
Args:    event с httpMethod и body (FrameHouseSpec в JSON)
Returns: JSON с url модели в формате USDZ
"""

import json
import os
import math
import hashlib
import zipfile
import io
import boto3


def mm(value: float) -> float:
    return value / 1000.0


def usda_header() -> str:
    return (
        '#usda 1.0\n'
        '(\n'
        '    defaultPrim = "House"\n'
        '    metersPerUnit = 1\n'
        '    upAxis = "Y"\n'
        ')\n\n'
    )


def cube_xform(name: str, sx: float, sy: float, sz: float,
               px: float, py: float, pz: float,
               color: tuple) -> str:
    """Куб как Xform с трансформом и геометрией."""
    r, g, b = color
    return (
        f'def Xform "{name}"\n'
        '{\n'
        f'    matrix4d xformOp:transform = ( ({sx}, 0, 0, 0), (0, {sy}, 0, 0), '
        f'(0, 0, {sz}, 0), ({px}, {py}, {pz}, 1) )\n'
        '    uniform token[] xformOpOrder = ["xformOp:transform"]\n'
        '\n'
        '    def Mesh "Mesh"\n'
        '    {\n'
        '        int[] faceVertexCounts = [4, 4, 4, 4, 4, 4]\n'
        '        int[] faceVertexIndices = [0,1,3,2, 4,6,7,5, 0,4,5,1, 2,3,7,6, 0,2,6,4, 1,5,7,3]\n'
        '        point3f[] points = [(-0.5,-0.5,-0.5),(0.5,-0.5,-0.5),(-0.5,0.5,-0.5),(0.5,0.5,-0.5),(-0.5,-0.5,0.5),(0.5,-0.5,0.5),(-0.5,0.5,0.5),(0.5,0.5,0.5)]\n'
        f'        color3f[] primvars:displayColor = [({r}, {g}, {b})]\n'
        '        uniform token subdivisionScheme = "none"\n'
        '    }\n'
        '}\n\n'
    )


def rotated_xform(name: str, sx: float, sy: float, sz: float,
                  px: float, py: float, pz: float,
                  rot_x_rad: float, color: tuple) -> str:
    r, g, b = color
    cos_a = math.cos(rot_x_rad)
    sin_a = math.sin(rot_x_rad)
    m00 = sx
    m11 = sy * cos_a
    m12 = sy * sin_a
    m21 = -sz * sin_a
    m22 = sz * cos_a
    return (
        f'def Xform "{name}"\n'
        '{\n'
        f'    matrix4d xformOp:transform = ( ({m00}, 0, 0, 0), (0, {m11}, {m12}, 0), '
        f'(0, {m21}, {m22}, 0), ({px}, {py}, {pz}, 1) )\n'
        '    uniform token[] xformOpOrder = ["xformOp:transform"]\n'
        '\n'
        '    def Mesh "Mesh"\n'
        '    {\n'
        '        int[] faceVertexCounts = [4, 4, 4, 4, 4, 4]\n'
        '        int[] faceVertexIndices = [0,1,3,2, 4,6,7,5, 0,4,5,1, 2,3,7,6, 0,2,6,4, 1,5,7,3]\n'
        '        point3f[] points = [(-0.5,-0.5,-0.5),(0.5,-0.5,-0.5),(-0.5,0.5,-0.5),(0.5,0.5,-0.5),(-0.5,-0.5,0.5),(0.5,-0.5,0.5),(-0.5,0.5,0.5),(0.5,0.5,0.5)]\n'
        f'        color3f[] primvars:displayColor = [({r}, {g}, {b})]\n'
        '        uniform token subdivisionScheme = "none"\n'
        '    }\n'
        '}\n\n'
    )


def build_usda(spec: dict) -> str:
    L = mm(spec['length'])
    W = mm(spec['width'])
    H = mm(spec['wallHeight'])
    floors = spec.get('floors', 1)
    totalH = H * floors
    overhang = mm(spec.get('roofOverhang', 500))
    pitch_deg = spec.get('roofPitchDeg', 25)
    pitch_rad = math.radians(pitch_deg)
    ridge_h = totalH + (W / 2) * math.tan(pitch_rad)

    out = usda_header()
    out += 'def Xform "House"\n{\n'

    parts = []

    parts.append(cube_xform(
        'Foundation', L + 0.6, 0.3, W + 0.6,
        0, -0.15, 0, (0.55, 0.55, 0.55)
    ))

    wall_color = (0.85, 0.72, 0.52)
    belt_color = (0.42, 0.29, 0.17)
    glass_color = (0.68, 0.86, 0.96)
    door_color = (0.42, 0.29, 0.17)
    roof_color = (0.23, 0.23, 0.23)

    wt = 0.05
    parts.append(cube_xform('WallFront', L, totalH, wt, 0, totalH / 2, -W / 2, wall_color))
    parts.append(cube_xform('WallBack', L, totalH, wt, 0, totalH / 2, W / 2, wall_color))
    parts.append(cube_xform('WallLeft', wt, totalH, W, -L / 2, totalH / 2, 0, wall_color))
    parts.append(cube_xform('WallRight', wt, totalH, W, L / 2, totalH / 2, 0, wall_color))

    for idx, y in enumerate([0, totalH]):
        for jdx, z in enumerate([-W / 2, W / 2]):
            parts.append(cube_xform(
                f'BeltLong_{idx}_{jdx}', L, 0.15, 0.15,
                0, y, z, belt_color
            ))
        for jdx, x in enumerate([-L / 2, L / 2]):
            parts.append(cube_xform(
                f'BeltShort_{idx}_{jdx}', 0.15, 0.15, W,
                x, y, 0, belt_color
            ))

    slope_w = (W / 2 + overhang) / math.cos(pitch_rad)
    y_center = (totalH + ridge_h) / 2
    parts.append(rotated_xform(
        'RoofLeft', L + overhang * 2, slope_w, 0.05,
        0, y_center, -W / 4, pitch_rad, roof_color
    ))
    parts.append(rotated_xform(
        'RoofRight', L + overhang * 2, slope_w, 0.05,
        0, y_center, W / 4, -pitch_rad, roof_color
    ))

    ww = mm(spec.get('windowWidth', 1200))
    wh = mm(spec.get('windowHeight', 1400))
    wc = spec.get('windowsCount', 5)
    for f in range(floors):
        y = f * H + 0.9 + wh / 2
        step = L / (wc + 1)
        for i in range(wc):
            parts.append(cube_xform(
                f'Window_{f}_{i}', ww, wh, 0.05,
                -L / 2 + step * (i + 1), y, -W / 2 - 0.03, glass_color
            ))

    dw = mm(spec.get('doorWidth', 900))
    dh = mm(spec.get('doorHeight', 2100))
    dc = spec.get('doorsCount', 2)
    dstep = L / (dc + 1)
    for i in range(dc):
        parts.append(cube_xform(
            f'Door_{i}', dw, dh, 0.06,
            -L / 2 + dstep * (i + 1), dh / 2, W / 2 + 0.03, door_color
        ))

    for part in parts:
        out += '    ' + part.replace('\n', '\n    ').rstrip() + '\n\n'

    out += '}\n'
    return out


def make_usdz(usda_content: str) -> bytes:
    """USDZ — zip без сжатия. AR Quick Look принимает такой формат."""
    usda_bytes = usda_content.encode('utf-8')
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', compression=zipfile.ZIP_STORED) as zf:
        info = zipfile.ZipInfo('house.usda')
        info.compress_type = zipfile.ZIP_STORED
        zf.writestr(info, usda_bytes)
    return buf.getvalue()


def handler(event: dict, context) -> dict:
    """Генерирует USDZ-модель дома и возвращает URL"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    try:
        body = json.loads(event.get('body') or '{}')
        spec = body.get('spec') or body
    except (ValueError, TypeError):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON'}),
        }

    required = ['length', 'width', 'wallHeight']
    for field in required:
        if field not in spec:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Missing required field: {field}'}),
            }

    usda = build_usda(spec)
    usdz_bytes = make_usdz(usda)

    spec_key = json.dumps(spec, sort_keys=True).encode('utf-8')
    file_hash = hashlib.md5(spec_key).hexdigest()[:16]
    key = f'ar-models/house-{file_hash}.usdz'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(
        Bucket='files',
        Key=key,
        Body=usdz_bytes,
        ContentType='model/vnd.usdz+zip',
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
        'body': json.dumps({
            'url': cdn_url,
            'size': len(usdz_bytes),
            'hash': file_hash,
        }),
    }
