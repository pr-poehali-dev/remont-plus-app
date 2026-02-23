import json
import os
import boto3
import base64
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Загрузка изображений для статей блога в S3'''

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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

    body = json.loads(event.get('body', '{}'))
    image_base64 = body.get('image')
    content_type = body.get('content_type', 'image/jpeg')
    filename = body.get('filename', 'image.jpg')

    if not image_base64:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'image (base64) is required'})
        }

    # Strip data URL prefix if present
    if ',' in image_base64:
        header, image_base64 = image_base64.split(',', 1)
        if 'image/png' in header:
            content_type = 'image/png'
        elif 'image/webp' in header:
            content_type = 'image/webp'
        elif 'image/gif' in header:
            content_type = 'image/gif'

    image_data = base64.b64decode(image_base64)

    ext = 'jpg'
    if content_type == 'image/png':
        ext = 'png'
    elif content_type == 'image/webp':
        ext = 'webp'
    elif content_type == 'image/gif':
        ext = 'gif'

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
    file_key = f"blog/{timestamp}.{ext}"

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

    s3.put_object(
        Bucket='files',
        Key=file_key,
        Body=image_data,
        ContentType=content_type
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'url': cdn_url})
    }
