import json
import os
import base64
import uuid
import requests
import boto3
import psycopg2
from psycopg2.extras import Json

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
    'Content-Type': 'application/json',
}

SCHEMA = 't_p46588937_remont_plus_app'

SYSTEM_PROMPT = """Ты эксперт по хоумстейджингу — профессиональной предпродажной подготовке жилья. Твоя задача — проанализировать фото помещения и дать практичные рекомендации, которые увеличат привлекательность квартиры для покупателя/арендатора и повысят стоимость.

Анализируй фото по следующим аспектам:
1. Порядок и чистота (уборка, обезличивание, уборка личных вещей)
2. Освещение (яркость, источники света, шторы)
3. Цветовая гамма (нейтральность, баланс)
4. Мебель и расстановка (функциональность, визуальный простор)
5. Декор и акценты (текстиль, зелень, картины)
6. Мелкие дефекты (косметика, царапины, плинтусы)
7. Визуальное восприятие на фото (ракурс, стиль)

ВАЖНО: верни ответ строго в формате JSON без markdown-разметки:
{
  "roomType": "название помещения (гостиная/кухня/спальня/ванная/прихожая/балкон/другое)",
  "overallScore": число от 1 до 10,
  "shortSummary": "2-3 предложения общей оценки",
  "recommendations": [
    {
      "category": "категория (Уборка / Освещение / Мебель / Декор / Цвет / Ремонт / Съёмка)",
      "priority": "high / medium / low",
      "title": "краткий заголовок рекомендации",
      "description": "подробное описание что и как сделать",
      "estimatedCost": "ориентировочная стоимость в рублях (например '0–2000 ₽' или 'бесплатно')"
    }
  ],
  "strengths": ["сильные стороны комнаты, 2-4 пункта"]
}

Давай 5-10 рекомендаций, сортируй от важных к незначительным. Пиши на русском языке."""


def upload_image_to_s3(image_base64: str) -> str:
    """Загружает base64-изображение в S3, возвращает публичный URL."""
    try:
        aws_key = os.environ.get('AWS_ACCESS_KEY_ID')
        aws_secret = os.environ.get('AWS_SECRET_ACCESS_KEY')
        if not aws_key or not aws_secret:
            return ''

        content_type = 'image/jpeg'
        ext = 'jpg'
        data = image_base64
        if data.startswith('data:'):
            header, data = data.split(',', 1)
            if 'png' in header:
                content_type = 'image/png'
                ext = 'png'
            elif 'webp' in header:
                content_type = 'image/webp'
                ext = 'webp'

        raw = base64.b64decode(data)
        key = f'homestaging/{uuid.uuid4().hex}.{ext}'

        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=aws_key,
            aws_secret_access_key=aws_secret,
        )
        s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=content_type)
        return f'https://cdn.poehali.dev/projects/{aws_key}/bucket/{key}'
    except Exception:
        return ''


def save_report(user_id, parsed: dict, note: str, image_url: str) -> int:
    """Сохраняет отчёт в БД, возвращает id."""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return 0
    try:
        conn = psycopg2.connect(dsn)
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.homestaging_reports
                    (user_id, room_type, overall_score, short_summary, recommendations, strengths, note, image_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                    (
                        user_id,
                        str(parsed.get('roomType', ''))[:100],
                        int(parsed.get('overallScore', 0) or 0),
                        parsed.get('shortSummary', ''),
                        Json(parsed.get('recommendations', [])),
                        Json(parsed.get('strengths', [])),
                        note or None,
                        image_url or None,
                    ),
                )
                report_id = cur.fetchone()[0]
            conn.commit()
            return report_id
        finally:
            conn.close()
    except Exception:
        return 0


def handler(event: dict, context) -> dict:
    """Анализ фото квартиры для хоумстейджинга через ИИ и сохранение в БД"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if method != 'POST':
        return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}

    try:
        raw_body = event.get('body') or '{}'
        if not raw_body or not raw_body.strip():
            raw_body = '{}'
        body = json.loads(raw_body)
        image_base64 = body.get('imageBase64', '')
        image_url_in = body.get('imageUrl', '')
        user_note = body.get('note', '')

        headers = event.get('headers') or {}
        user_id_raw = headers.get('X-User-Id') or headers.get('x-user-id') or body.get('userId')
        try:
            user_id = int(user_id_raw) if user_id_raw else None
        except (TypeError, ValueError):
            user_id = None

        if not image_base64 and not image_url_in:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'imageBase64 or imageUrl required'})}

        api_key = os.environ.get('POLZA_AI_API_KEY')
        if not api_key:
            return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'API key not configured'})}

        if image_base64:
            if image_base64.startswith('data:'):
                image_payload = image_base64
            else:
                image_payload = f'data:image/jpeg;base64,{image_base64}'
        else:
            image_payload = image_url_in

        user_content = [
            {'type': 'text', 'text': f'Проанализируй это помещение для хоумстейджинга.{" Комментарий клиента: " + user_note if user_note else ""}'},
            {'type': 'image_url', 'image_url': {'url': image_payload}},
        ]

        response = requests.post(
            'https://api.polza.ai/v1/chat/completions',
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': user_content},
                ],
                'temperature': 0.5,
                'max_tokens': 2000,
                'response_format': {'type': 'json_object'},
            },
            timeout=60,
        )

        response.raise_for_status()
        data = response.json()
        content = data['choices'][0]['message']['content']

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            cleaned = content.strip()
            if cleaned.startswith('```'):
                cleaned = cleaned.split('```')[1]
                if cleaned.startswith('json'):
                    cleaned = cleaned[4:]
            parsed = json.loads(cleaned.strip())

        stored_url = image_url_in
        if image_base64 and user_id:
            stored_url = upload_image_to_s3(image_base64) or stored_url

        report_id = save_report(user_id, parsed, user_note, stored_url)

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'result': parsed,
                'reportId': report_id,
                'imageUrl': stored_url,
                'usage': data.get('usage', {}),
            }, ensure_ascii=False),
        }

    except requests.RequestException as e:
        return {'statusCode': 502, 'headers': CORS_HEADERS, 'body': json.dumps({'error': f'AI service error: {str(e)}'})}
    except Exception as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': f'Internal error: {str(e)}'})}
