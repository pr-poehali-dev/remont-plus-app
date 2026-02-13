import json
import os
import requests

SYSTEM_PROMPT = """Ты — профессиональный консультант по ремонту и строительству компании АВАНГАРД. 
Твоя задача — помогать клиентам с вопросами о ремонте квартир, выборе материалов, дизайне интерьера.
Давай конкретные, практичные советы. Будь дружелюбным и профессиональным.
Если клиент спрашивает про товары — рекомендуй посмотреть каталог на сайте.
Отвечай структурировано, используй списки где уместно."""


def call_yandex_gpt(user_message: str, history: list) -> dict:
    """Вызов YandexGPT API"""
    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID', 'b1gjbflgkc6kmaki44db')

    if not api_key:
        return None

    messages = [{'role': 'system', 'text': SYSTEM_PROMPT}]

    for msg in history[-10:]:
        role = msg.get('role', 'user')
        text = msg.get('text', '')
        if role in ('user', 'assistant') and text:
            messages.append({'role': role, 'text': text})

    messages.append({'role': 'user', 'text': user_message})

    response = requests.post(
        'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
        headers={
            'Authorization': f'Api-Key {api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'modelUri': f'gpt://{folder_id}/yandexgpt/rc',
            'completionOptions': {
                'stream': False,
                'temperature': 0.7,
                'maxTokens': 2000
            },
            'messages': messages
        },
        timeout=30
    )

    if response.status_code != 200:
        return None

    result = response.json()
    return {
        'message': result['result']['alternatives'][0]['message']['text'],
        'provider': 'yandexgpt'
    }


def call_polza_ai(user_message: str, history: list) -> dict:
    """Fallback на Polza AI (ChatGPT)"""
    api_key = os.environ.get('POLZA_AI_API_KEY')

    if not api_key:
        return None

    messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]

    for msg in history[-10:]:
        role = msg.get('role', 'user')
        text = msg.get('text', '')
        if role in ('user', 'assistant') and text:
            messages.append({'role': role, 'content': text})

    messages.append({'role': 'user', 'content': user_message})

    response = requests.post(
        'https://api.polza.ai/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'gpt-4o-mini',
            'messages': messages,
            'temperature': 0.7,
            'max_tokens': 2000
        },
        timeout=30
    )

    if response.status_code not in (200, 201):
        return None

    result = response.json()
    return {
        'message': result['choices'][0]['message']['content'],
        'provider': 'polza_ai'
    }


def handler(event: dict, context) -> dict:
    """ИИ-консультант по ремонту: YandexGPT с fallback на Polza AI"""

    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    try:
        body = json.loads(event.get('body', '{}'))
        user_message = body.get('message', '')
        history = body.get('history', [])

        if not user_message:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Сообщение не может быть пустым'}),
                'isBase64Encoded': False
            }

        result = call_yandex_gpt(user_message, history)

        if not result:
            result = call_polza_ai(user_message, history)

        if not result:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Ни один AI-провайдер не доступен. Проверьте ключи YANDEX_GPT_API_KEY или POLZA_AI_API_KEY.'
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': result['message'],
                'provider': result['provider']
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': f'Внутренняя ошибка: {str(e)}'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }