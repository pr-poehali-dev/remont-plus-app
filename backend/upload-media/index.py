import json
import os
import boto3
import base64
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Загрузка фото и видео в S3 для медиатеки'''

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    if event.get('headers', {}).get('X-Admin-Token') != 'admin2025':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Forbidden'})
        }

    body = json.loads(event.get('body', '{}'))
    file_base64 = body.get('file')
    filename = body.get('filename', 'file')
    media_type = body.get('media_type', 'photo')  # 'photo' or 'video'

    if not file_base64:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'file (base64) is required'})
        }

    content_type = 'image/jpeg'
    ext = 'jpg'

    if ',' in file_base64:
        header, file_base64 = file_base64.split(',', 1)
        if 'image/png' in header:
            content_type, ext = 'image/png', 'png'
        elif 'image/webp' in header:
            content_type, ext = 'image/webp', 'webp'
        elif 'image/gif' in header:
            content_type, ext = 'image/gif', 'gif'
        elif 'video/mp4' in header:
            content_type, ext = 'video/mp4', 'mp4'
        elif 'video/webm' in header:
            content_type, ext = 'video/webm', 'webm'
        elif 'video/quicktime' in header:
            content_type, ext = 'video/quicktime', 'mov'
        elif 'video/' in header:
            content_type = 'video/mp4'
            ext = 'mp4'
    else:
        name_lower = filename.lower()
        if name_lower.endswith('.png'):
            content_type, ext = 'image/png', 'png'
        elif name_lower.endswith('.webp'):
            content_type, ext = 'image/webp', 'webp'
        elif name_lower.endswith('.gif'):
            content_type, ext = 'image/gif', 'gif'
        elif name_lower.endswith('.mp4'):
            content_type, ext = 'video/mp4', 'mp4'
        elif name_lower.endswith('.webm'):
            content_type, ext = 'video/webm', 'webm'
        elif name_lower.endswith('.mov'):
            content_type, ext = 'video/quicktime', 'mov'

    file_data = base64.b64decode(file_base64)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
    folder = 'media/videos' if media_type == 'video' else 'media/photos'
    file_key = f"{folder}/{timestamp}.{ext}"

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

    s3.put_object(
        Bucket='files',
        Key=file_key,
        Body=file_data,
        ContentType=content_type
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'url': cdn_url,
            'media_type': media_type,
            'filename': filename,
            'content_type': content_type
        })
    }
