"""
Загрузка фото и видео для шоурума в S3. Принимает base64-файл, возвращает CDN URL.
"""
import json
import os
import base64
import uuid
import boto3

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}

ALLOWED_IMAGES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
ALLOWED_VIDEOS = {'video/mp4', 'video/webm', 'video/mov', 'video/quicktime'}
ALLOWED_TYPES = ALLOWED_IMAGES | ALLOWED_VIDEOS

MAX_IMAGE_SIZE = 20 * 1024 * 1024   # 20 MB
MAX_VIDEO_SIZE = 200 * 1024 * 1024  # 200 MB

EXT_MAP = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
    'video/mp4': 'mp4', 'video/webm': 'webm', 'video/mov': 'mov', 'video/quicktime': 'mov',
}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    content_type = body.get('content_type', '')
    file_data = body.get('file_data', '')  # base64

    if content_type not in ALLOWED_TYPES:
        return {
            'statusCode': 400,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': f'Неподдерживаемый тип файла: {content_type}'})
        }

    raw = base64.b64decode(file_data)
    max_size = MAX_VIDEO_SIZE if content_type in ALLOWED_VIDEOS else MAX_IMAGE_SIZE
    if len(raw) > max_size:
        mb = max_size // (1024 * 1024)
        return {
            'statusCode': 400,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': f'Файл превышает {mb} МБ'})
        }

    ext = EXT_MAP.get(content_type, 'bin')
    file_key = f'showroom/{uuid.uuid4()}.{ext}'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(
        Bucket='files',
        Key=file_key,
        Body=raw,
        ContentType=content_type,
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"

    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps({'url': cdn_url, 'type': 'video' if content_type in ALLOWED_VIDEOS else 'image'}),
    }