import json
import os
import requests
import base64

STAGE_SYSTEM_PROMPTS = {
    "planning": "Ты — профессиональный дизайнер интерьера. Создай детальное планировочное решение для помещения. Опиши: зонирование пространства, расстановку мебели, расположение перегородок, функциональные зоны, маршруты передвижения и ширину проходов. Ответ структурируй по помещениям.",
    "drawings": "Ты — архитектор-проектировщик. Создай описание комплекта чертежей для помещения. Опиши: обмерный план с размерами, развёртки каждой стены, план полов с уровнями и материалами, план потолков с высотами и уровнями. Укажи все привязки и размеры в мм.\n\nВАЖНО: В самом конце ответа ОБЯЗАТЕЛЬНО добавь блок JSON-данных для автоматического построения чертежа. Формат:\n```json_walls\n{\"rooms\": [{\"name\": \"Гостиная\", \"walls\": [{\"start\": {\"x\": 0, \"y\": 0}, \"end\": {\"x\": 5000, \"y\": 0}, \"openings\": [{\"type\": \"door\", \"position\": 0.5, \"width\": 900, \"direction\": \"left\"}, {\"type\": \"window\", \"position\": 0.3, \"width\": 1500}]}, ...]}, ...]}\n```\nКоординаты в миллиметрах. Каждая комната — замкнутый контур стен (последняя стена соединяется с первой). Располагай комнаты рядом (со смещением по X). Для каждой комнаты указывай массив стен с координатами start/end.\n\nДля каждой стены добавляй массив openings с дверями и окнами:\n- type: \"door\" или \"window\"\n- position: число от 0 до 1 — положение центра проёма вдоль стены (0 = начало, 1 = конец)\n- width: ширина проёма в мм (двери обычно 800-900, окна 1200-1800)\n- direction: \"left\" или \"right\" — направление открывания двери (только для дверей)\n\nРасставляй двери между всеми смежными комнатами. Окна размещай на наружных стенах. Если стена без проёмов — openings: [].",
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

PHOTO_SYSTEM_ADDITION = """
Клиент приложил фотографии помещения. Внимательно проанализируй их:
- Оцени текущее состояние помещения
- Определи примерные размеры и пропорции по фото
- Учти существующую отделку, мебель, коммуникации
- Дай рекомендации с учётом того, что видишь на фото"""


def build_user_content(user_description, notes, photos):
    """Формирует content для user message с текстом и фото"""
    parts = []

    text = f"Описание помещения от клиента:\n{user_description}"
    if notes:
        text += f"\n\nДополнительные заметки клиента:\n{notes}"
    if photos:
        text += f"\n\nКлиент приложил {len(photos)} фото помещения. Проанализируй их и учти в рекомендациях."

    parts.append({"type": "text", "text": text})

    for photo in (photos or []):
        data = photo.get("data", "")
        mime = photo.get("type", "image/jpeg")
        if data:
            parts.append({
                "type": "image_url",
                "image_url": {"url": f"data:{mime};base64,{data}"}
            })

    return parts


def call_polza_ai(stage_id, user_description, notes, photos=None):
    """Генерация через Polza AI (OpenAI-совместимый, поддерживает vision)"""
    api_key = os.environ.get('POLZA_AI_API_KEY')
    if not api_key:
        return None

    stage_prompt = STAGE_SYSTEM_PROMPTS.get(stage_id, "Ты — профессиональный дизайнер интерьера.")
    system = f"{stage_prompt}\n\n{BASE_SYSTEM}"
    if photos:
        system += PHOTO_SYSTEM_ADDITION

    has_photos = photos and len(photos) > 0
    model = 'gpt-4o-mini' if has_photos else 'gpt-4o-mini'

    if has_photos:
        user_content = build_user_content(user_description, notes, photos)
    else:
        text = f"Описание помещения от клиента:\n{user_description}"
        if notes:
            text += f"\n\nДополнительные заметки клиента:\n{notes}"
        user_content = text

    response = requests.post(
        'https://api.polza.ai/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'model': model,
            'messages': [
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': user_content}
            ],
            'temperature': 0.7,
            'max_tokens': 3000
        },
        timeout=90
    )

    if response.status_code not in (200, 201):
        return None

    result = response.json()
    return {
        'content': result['choices'][0]['message']['content'],
        'provider': 'polza_ai'
    }


def call_yandex_gpt(stage_id, user_description, notes, photos=None):
    """Генерация через YandexGPT (без поддержки vision — фото игнорируются)"""
    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID', 'b1gjbflgkc6kmaki44db')
    if not api_key:
        return None

    stage_prompt = STAGE_SYSTEM_PROMPTS.get(stage_id, "Ты — профессиональный дизайнер интерьера.")
    system = f"{stage_prompt}\n\n{BASE_SYSTEM}"

    user_msg = f"Описание помещения от клиента:\n{user_description}"
    if notes:
        user_msg += f"\n\nДополнительные заметки клиента:\n{notes}"
    if photos:
        user_msg += f"\n\n(Клиент приложил {len(photos)} фотографий помещения, но в текстовом режиме они недоступны. Ориентируйся на текстовое описание.)"

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


import re

def extract_walls_from_response(content):
    """Извлечь JSON-данные стен из ответа ИИ"""
    pattern = r'```json_walls\s*\n(.*?)\n```'
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        pattern2 = r'```json\s*\n(\{[^`]*?"rooms"[^`]*?\})\s*\n```'
        match = re.search(pattern2, content, re.DOTALL)
    if not match:
        return None

    raw = match.group(1).strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return None

    rooms = data.get('rooms', [])
    if not rooms:
        return None

    walls = []
    wall_id = 1
    opening_id = 1
    for room in rooms:
        room_walls = room.get('walls', [])
        for w in room_walls:
            s = w.get('start', {})
            e = w.get('end', {})
            sx, sy = float(s.get('x', 0)), float(s.get('y', 0))
            ex, ey = float(e.get('x', 0)), float(e.get('y', 0))
            if sx == ex and sy == ey:
                continue

            openings = []
            for o in w.get('openings', []):
                o_type = o.get('type', '')
                if o_type not in ('door', 'window'):
                    continue
                pos = float(o.get('position', 0.5))
                pos = max(0.05, min(0.95, pos))
                width = float(o.get('width', 900 if o_type == 'door' else 1500))
                width = max(400, min(3000, width))
                op = {
                    'id': f'ai-o-{opening_id}',
                    'type': o_type,
                    'position': pos,
                    'width': width,
                }
                if o_type == 'door':
                    op['direction'] = o.get('direction', 'left')
                openings.append(op)
                opening_id += 1

            walls.append({
                'id': f'ai-{wall_id}',
                'start': {'x': sx, 'y': sy},
                'end': {'x': ex, 'y': ey},
                'thickness': 120,
                'openings': openings
            })
            wall_id += 1

    if not walls:
        return None

    return {'walls': walls}


def handler(event: dict, context) -> dict:
    """Генерация ИИ-рекомендаций для этапа дизайн-проекта с поддержкой фото"""

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
    photos = body.get('photos', [])

    # Проверка лимита визуализаций
    headers_in = event.get('headers') or {}
    user_id_str = headers_in.get('X-User-Id') or body.get('user_id')
    if user_id_str:
        user_id = int(user_id_str)
        import psycopg2
        import psycopg2.extras
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT s.id, s.visualizations_used, p.max_visualizations, p.is_unlimited, p.name as plan_name
            FROM user_subscriptions s
            JOIN user_plans p ON p.code = s.plan_code
            WHERE s.user_id = %s AND s.status = 'active'
              AND (s.expires_at IS NULL OR s.expires_at > NOW())
            ORDER BY s.created_at DESC LIMIT 1
        """, (user_id,))
        sub = cur.fetchone()
        if sub:
            sub = dict(sub)
            if not sub['is_unlimited'] and sub['visualizations_used'] >= sub['max_visualizations']:
                cur.close()
                conn.close()
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'error': 'limit_exceeded',
                        'reason': 'visualizations_limit',
                        'message': f'Лимит визуализаций исчерпан. Тариф «{sub["plan_name"]}» — до {sub["max_visualizations"]} генераций.',
                        'plan_name': sub['plan_name'],
                        'max': sub['max_visualizations'],
                    }, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            # Списываем
            if sub:
                cur.execute("UPDATE user_subscriptions SET visualizations_used = visualizations_used + 1, updated_at = NOW() WHERE id = %s", (sub['id'],))
                conn.commit()
        cur.close()
        conn.close()

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

    valid_photos = []
    for p in photos[:5]:
        data = p.get('data', '')
        if data and len(data) < 5_000_000:
            valid_photos.append({
                'data': data,
                'type': p.get('type', 'image/jpeg')
            })

    has_photos = len(valid_photos) > 0

    if has_photos:
        result = call_polza_ai(stage_id, description, notes, valid_photos)
        if not result:
            result = call_yandex_gpt(stage_id, description, notes, valid_photos)
    else:
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

    response_body = {
        'content': result['content'],
        'provider': result['provider'],
        'stage_id': stage_id,
        'photos_analyzed': len(valid_photos)
    }

    if stage_id == 'drawings':
        walls_data = extract_walls_from_response(result['content'])
        if walls_data:
            response_body['drawing_data'] = walls_data

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(response_body, ensure_ascii=False),
        'isBase64Encoded': False
    }