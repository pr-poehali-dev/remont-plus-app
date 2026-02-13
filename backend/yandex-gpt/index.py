import json
import os
import requests

def handler(event: dict, context) -> dict:
    """API для работы с YandexGPT - консультации по ремонту с поддержкой истории чата"""

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

        api_key = os.environ.get('YANDEX_GPT_API_KEY')
        folder_id = os.environ.get('YANDEX_FOLDER_ID', 'b1gjbflgkc6kmaki44db')

        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'API ключ YandexGPT не настроен. Добавьте YANDEX_GPT_API_KEY в секреты проекта.'}),
                'isBase64Encoded': False
            }

        url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'

        headers = {
            'Authorization': f'Api-Key {api_key}',
            'Content-Type': 'application/json'
        }

        system_prompt = """Ты — профессиональный консультант по ремонту и строительству компании АВАНГАРД. 
Твоя задача — помогать клиентам с вопросами о ремонте квартир, выборе материалов, дизайне интерьера.
Давай конкретные, практичные советы. Будь дружелюбным и профессиональным.
Если клиент спрашивает про товары — рекомендуй посмотреть каталог на сайте.
Отвечай структурировано, используй списки где уместно."""

        messages = [
            {
                'role': 'system',
                'text': system_prompt
            }
        ]

        for msg in history[-10:]:
            role = msg.get('role', 'user')
            text = msg.get('text', '')
            if role in ('user', 'assistant') and text:
                messages.append({
                    'role': role,
                    'text': text
                })

        messages.append({
            'role': 'user',
            'text': user_message
        })

        payload = {
            'modelUri': f'gpt://{folder_id}/yandexgpt/rc',
            'completionOptions': {
                'stream': False,
                'temperature': 0.7,
                'maxTokens': 2000
            },
            'messages': messages
        }

        response = requests.post(url, headers=headers, json=payload, timeout=30)

        if response.status_code != 200:
            error_text = response.text
            return {
                'statusCode': response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': f'Ошибка YandexGPT API: {error_text}'
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }

        result = response.json()
        assistant_message = result['result']['alternatives'][0]['message']['text']

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': assistant_message,
                'tokens_used': result['result']['usage']['totalTokens']
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