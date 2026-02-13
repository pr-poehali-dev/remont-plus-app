import json
import os
import requests

STAGE_SYSTEM_PROMPTS = {
    "planning": "Ты — профессиональный дизайнер интерьера. Создай детальное планировочное решение для помещения. Опиши: зонирование пространства, расстановку мебели, расположение перегородок, функциональные зоны, маршруты передвижения и ширину проходов. Ответ структурируй по помещениям.",
    "drawings": "Ты — архитектор-проектировщик. Создай описание комплекта чертежей для помещения. Опиши: обмерный план с размерами, развёртки каждой стены, план полов с уровнями и материалами, план потолков с высотами и уровнями. Укажи все привязки и размеры в мм.",
    "visualization": "Ты — дизайнер-визуализатор интерьеров. Создай подробное описание визуализации интерьера. Опиши: цветовую палитру (основной, акцентный, нейтральный цвета), фактуры и текстуры поверхностей, сценарии освещения (дневное и вечернее), общее настроение и атмосферу. Структурируй по помещениям.",
    "materials": "Ты — специалист по отделочным материалам. Создай подборку материалов и отделки для помещения. Опиши: напольные покрытия, настенные покрытия, плитку, потолочные материалы, плинтусы и молдинги. Для каждого материала укажи характеристики, расход и примерную стоимость.",
    "electrical": "Ты — инженер-электрик и светодизайнер. Создай схему электроразводки и освещения для помещения. Опиши: расположение розеток (с высотами), выключателей (обычных и проходных), светильников, сценарии освещения (общий, рабочий, акцентный, ночной), группы автоматов для электрощита, слаботочные сети.",
    "plumbing": "Ты — инженер-сантехник. Создай схему сантехнических работ для помещения. Опиши: разводку труб ХВС и ГВС, расположение стояков, точки подключения смесителей, унитаза, ванны/душа, стиральной и посудомоечной машин, полотенцесушителя. Укажи диаметры труб, уклоны и требования по гидроизоляции.",
    "decor": "Ты — декоратор и стилист интерьеров. Создай план декорирования помещения. Опиши: подбор штор и карнизов, текстиль (подушки, пледы, ковры), настенный декор (картины, зеркала, полки), аксессуары (вазы, свечи, рамки), живые или искусственные растения, освещение как элемент декора. Структурируй по помещениям."
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