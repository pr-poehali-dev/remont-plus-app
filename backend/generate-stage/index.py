import json
import os
import requests

STAGE_SYSTEM_PROMPTS = {
    "general": "Ты — профессиональный дизайнер интерьера. Создай детальное описание планировки и зонирования помещения. Опиши: расположение функциональных зон, маршруты передвижения, рекомендации по зонированию. Ответ структурируй по разделам.",
    "walls": "Ты — профессиональный дизайнер интерьера. Создай детальное описание развертки стен комнаты. Для каждой стены опиши: материал отделки, декоративные элементы, размеры, ниши и выступы. Ответ структурируй по стенам (A, B, C, D).",
    "electrical": "Ты — инженер-электрик. Создай детальную схему электрики для помещения. Опиши: расположение розеток (с высотами), выключателей, светильников, слаботочных сетей. Укажи группы автоматов для электрощита.",
    "ventilation": "Ты — инженер по вентиляции. Создай схему вентиляции для помещения. Опиши: существующие вентканалы, расположение вытяжек, приточных клапанов, кондиционеров. Укажи сечения воздуховодов.",
    "plumbing": "Ты — инженер-сантехник. Создай схему водопровода и канализации. Опиши: расположение стояков, точки подключения, уклоны труб, диаметры, расположение запорной арматуры и счётчиков.",
    "tiles": "Ты — специалист по плиточным работам. Создай раскладку плитки для помещения. Опиши: направление укладки, расположение подрезок, декоративных вставок, расчёт количества плитки, клея и затирки.",
    "furniture": "Ты — дизайнер интерьера. Создай план расстановки мебели. Опиши: расположение каждого предмета с размерами, ширину проходов, эргономику. Учитывай освещение и радиаторы.",
    "kitchen": "Ты — дизайнер кухонь. Создай детальный план кухонного гарнитура. Опиши: рабочий треугольник, расположение шкафов (верхних и нижних), техники, фартука. Укажи размеры и высоты.",
    "bedroom": "Ты — дизайнер интерьера спален. Создай план спальни. Опиши: расположение кровати, систем хранения, освещения (основное + прикроватное), текстиля. Укажи размеры и расстояния."
}

BASE_SYSTEM = """Ты работаешь в компании АВАНГАРД — профессиональный ремонт и строительство.
Давай конкретные рекомендации с размерами в сантиметрах/метрах.
Используй структуру с заголовками и списками.
В конце добавь раздел "Рекомендуемые материалы" с примерными ценами.
Отвечай на русском языке."""


def call_polza_ai(stage_id: str, user_description: str, notes: str) -> dict:
    """Генерация схемы через Polza AI"""
    api_key = os.environ.get('POLZA_AI_API_KEY')
    if not api_key:
        return None

    stage_prompt = STAGE_SYSTEM_PROMPTS.get(stage_id, "Ты — профессиональный дизайнер интерьера.")
    system = f"{stage_prompt}\n\n{BASE_SYSTEM}"

    user_msg = f"Описание помещения от клиента:\n{user_description}"
    if notes:
        user_msg += f"\n\nДополнительные заметки клиента:\n{notes}"

    response = requests.post(
        'https://api.polza.ai/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'gpt-4o-mini',
            'messages': [
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': user_msg}
            ],
            'temperature': 0.7,
            'max_tokens': 3000
        },
        timeout=60
    )

    if response.status_code not in (200, 201):
        return None

    result = response.json()
    return {
        'content': result['choices'][0]['message']['content'],
        'provider': 'polza_ai'
    }


def call_yandex_gpt(stage_id: str, user_description: str, notes: str) -> dict:
    """Генерация схемы через YandexGPT"""
    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID', 'b1gjbflgkc6kmaki44db')
    if not api_key:
        return None

    stage_prompt = STAGE_SYSTEM_PROMPTS.get(stage_id, "Ты — профессиональный дизайнер интерьера.")
    system = f"{stage_prompt}\n\n{BASE_SYSTEM}"

    user_msg = f"Описание помещения от клиента:\n{user_description}"
    if notes:
        user_msg += f"\n\nДополнительные заметки клиента:\n{notes}"

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
                'maxTokens': 3000
            },
            'messages': [
                {'role': 'system', 'text': system},
                {'role': 'user', 'text': user_msg}
            ]
        },
        timeout=60
    )

    if response.status_code != 200:
        return None

    result = response.json()
    return {
        'content': result['result']['alternatives'][0]['message']['text'],
        'provider': 'yandexgpt'
    }


def handler(event: dict, context) -> dict:
    """Генерация ИИ-схемы для этапа дизайн-проекта"""

    if event.get('httpMethod') == 'OPTIONS':
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

    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body)
    stage_id = body.get('stage_id', '')
    description = body.get('description', '')
    notes = body.get('notes', '')

    if not stage_id or not description:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'stage_id и description обязательны'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    if stage_id not in STAGE_SYSTEM_PROMPTS:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Неизвестный этап: {stage_id}'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    result = call_yandex_gpt(stage_id, description, notes)
    if not result:
        result = call_polza_ai(stage_id, description, notes)

    if not result:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'AI-провайдеры недоступны'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'content': result['content'],
            'provider': result['provider'],
            'stage_id': stage_id
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }