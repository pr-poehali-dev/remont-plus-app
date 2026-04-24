import json
import os
import requests

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}

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


def handler(event: dict, context) -> dict:
    """Анализ фото квартиры для хоумстейджинга через ИИ"""
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
        image_url = body.get('imageUrl', '')
        user_note = body.get('note', '')

        if not image_base64 and not image_url:
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
            image_payload = image_url

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

        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'result': parsed, 'usage': data.get('usage', {})}, ensure_ascii=False)}

    except requests.RequestException as e:
        return {'statusCode': 502, 'headers': CORS_HEADERS, 'body': json.dumps({'error': f'AI service error: {str(e)}'})}
    except Exception as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': f'Internal error: {str(e)}'})}