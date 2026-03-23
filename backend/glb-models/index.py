import json
import os
import urllib.request
import boto3


DEMO_MODELS = [
    {
        "url": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb",
        "name": "sheen-chair",
        "category": "living",
        "catalogId": "armchair"
    },
    {
        "url": "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/ShadowmappableMesh.glb",
        "name": "shadow-table",
        "category": "kitchen",
        "catalogId": "dining-table"
    },
]


def handler(event, context):
    """Управление 3D-моделями мебели: загрузка, хранение, получение списка"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    cors = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

    access_key = os.environ['AWS_ACCESS_KEY_ID']
    cdn_base = f"https://cdn.poehali.dev/projects/{access_key}/bucket"

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}

        if params.get('action') == 'demo':
            results = []
            errors = []
            for demo in DEMO_MODELS:
                s3_key = f"3d-models/{demo['category']}/{demo['name']}.glb"

                existing = None
                try:
                    existing = s3.head_object(Bucket='files', Key=s3_key)
                except Exception:
                    pass

                if existing:
                    results.append({
                        'key': s3_key,
                        'name': demo['name'],
                        'category': demo['category'],
                        'catalogId': demo.get('catalogId', ''),
                        'url': f"{cdn_base}/{s3_key}",
                        'size': existing.get('ContentLength', 0),
                        'skipped': True
                    })
                    continue

                try:
                    req = urllib.request.Request(demo['url'], headers={'User-Agent': 'Mozilla/5.0'})
                    response = urllib.request.urlopen(req, timeout=25)
                    data = response.read()

                    s3.put_object(
                        Bucket='files',
                        Key=s3_key,
                        Body=data,
                        ContentType='model/gltf-binary'
                    )

                    results.append({
                        'key': s3_key,
                        'name': demo['name'],
                        'category': demo['category'],
                        'catalogId': demo.get('catalogId', ''),
                        'url': f"{cdn_base}/{s3_key}",
                        'size': len(data),
                        'skipped': False
                    })
                except Exception as e:
                    errors.append({'name': demo['name'], 'error': str(e)})

            return {
                'statusCode': 200,
                'headers': cors,
                'body': json.dumps({'results': results, 'errors': errors})
            }

        result = s3.list_objects_v2(Bucket='files', Prefix='3d-models/')
        models = []
        for obj in result.get('Contents', []):
            key = obj['Key']
            parts = key.replace('3d-models/', '').split('/')
            if len(parts) == 2:
                category = parts[0]
                name = parts[1].replace('.glb', '')
                models.append({
                    'key': key,
                    'name': name,
                    'category': category,
                    'url': f"{cdn_base}/{key}",
                    'size': obj['Size']
                })
        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({'models': models})
        }

    if method == 'POST':
        raw_body = event.get('body') or '{}'
        try:
            body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
            if isinstance(body, str):
                body = json.loads(body)
        except (json.JSONDecodeError, TypeError):
            body = {}
        if not isinstance(body, dict):
            body = {}
        url = body.get('url', '')
        name = body.get('name', '')
        category = body.get('category', 'other')

        if not url or not name:
            return {
                'statusCode': 400,
                'headers': cors,
                'body': json.dumps({'error': 'url and name required'})
            }

        safe_name = ''.join(c for c in name if c.isalnum() or c in '-_').lower()
        s3_key = f"3d-models/{category}/{safe_name}.glb"

        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req, timeout=30)
        data = response.read()

        s3.put_object(
            Bucket='files',
            Key=s3_key,
            Body=data,
            ContentType='model/gltf-binary'
        )

        cdn_url = f"{cdn_base}/{s3_key}"

        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({
                'key': s3_key,
                'url': cdn_url,
                'name': safe_name,
                'category': category,
                'size': len(data)
            })
        }

    if method == 'DELETE':
        params = event.get('queryStringParameters', {}) or {}
        key = params.get('key', '')

        if not key or not key.startswith('3d-models/'):
            return {
                'statusCode': 400,
                'headers': cors,
                'body': json.dumps({'error': 'valid key required'})
            }

        s3.delete_object(Bucket='files', Key=key)

        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({'deleted': key})
        }

    return {
        'statusCode': 405,
        'headers': cors,
        'body': json.dumps({'error': 'method not allowed'})
    }
