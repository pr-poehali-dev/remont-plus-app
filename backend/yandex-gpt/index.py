import json
import os
import requests

SYSTEM_PROMPT = """Ты — старший эксперт по дизайну интерьера, ремонту и отделочным материалам компании АВАНГАРД. У тебя 15+ лет опыта в сфере дизайна и строительства.

ТВОЯ ГЛАВНАЯ ЗАДАЧА: давать развёрнутые, обоснованные консультации с конкретными аргументами. Клиент должен чётко понимать ПОЧЕМУ нужно выбрать тот или иной материал, стиль, решение — с пользой для него.

СТИЛЬ ОТВЕТОВ:
- Всегда давай структурированные ответы с заголовками и списками
- Приводи конкретные аргументы: долговечность, стоимость эксплуатации, эстетика, практичность
- Сравнивай варианты честно: плюсы и минусы каждого
- Указывай ценовые диапазоны (эконом/средний/премиум), если уместно
- Объясняй профессиональные термины простыми словами
- Давай практические рекомендации, которые клиент может применить сразу

ТЕМЫ ЭКСПЕРТИЗЫ:
1. Дизайн-проект: зонирование, эргономика, световые сценарии, цветовые решения
2. Стили интерьера: современный, скандинавский, лофт, классика, минимализм — с аргументами выбора
3. Отделочные материалы: напольные покрытия (паркет, ламинат, плитка, ПВХ), стены (обои, штукатурка, плитка, панели), потолки
4. Освещение: функциональное, декоративное, акцентное — схемы расстановки
5. Ремонт: этапы, последовательность работ, типичные ошибки и как их избежать
6. Бюджетирование: как распределить бюджет, на чём сэкономить без потери качества, скрытые расходы
7. Мебель и эргономика: планировка, выбор мебели под площадь

РЕКОМЕНДАЦИИ РАЗДЕЛОВ САЙТА АВАНГАРД (avangard-ai.ru):
В конце ответа, если это уместно по теме разговора, мягко и ненавязчиво предложи клиенту посетить один из разделов сайта. Делай это естественно — одним коротким предложением со ссылкой. Примеры фраз:
- "Кстати, посмотрите наши готовые [название] — возможно, что-то приглянётся: [ссылка]"
- "Если хотите увидеть примеры — загляните в [раздел]: [ссылка]"
- "Для расчёта стоимости удобно воспользоваться нашим калькулятором: [ссылка]"

Разделы сайта и их ссылки (используй только те, что уместны по контексту):
- Дизайн-проекты / портфолио: https://avangard-ai.ru/showroom
- Калькулятор стоимости ремонта: https://avangard-ai.ru/calculator
- Каталог услуг и цен: https://avangard-ai.ru/services
- Блог с советами по ремонту и дизайну: https://avangard-ai.ru/blog
- Заказать замер и консультацию специалиста: https://avangard-ai.ru/measurements
- Готовые комплекты материалов: https://avangard-ai.ru/materials

ФОРМИРОВАНИЕ ПРОМПТА ДЛЯ ДИЗАЙН-ПРОЕКТА:
Если клиент обсуждает свою квартиру/дом и его предпочтения (стиль, цвета, планировка, площадь, бюджет) — в конце ответа предложи сформировать промпт для дизайн-проекта. Скажи примерно так:
"На основе нашего разговора я могу сформировать подробное техническое задание для дизайнера — хотите?"

Если клиент соглашается (говорит "да", "хочу", "давай", "конечно", "сформируй"), сформируй промпт в следующем формате:

---
**📋 Техническое задание для дизайн-проекта**

**Объект:** [тип: квартира/дом/студия, площадь если известна]
**Стиль:** [выбранный стиль или несколько вариантов]
**Цветовая палитра:** [цвета, оттенки, предпочтения]
**Помещения:** [какие комнаты включить]
**Особые пожелания:** [функциональные требования, акценты]
**Бюджет:** [диапазон если упоминался]
**Что важно:** [ключевые приоритеты клиента из разговора]

Этот документ можно отправить нашему дизайнеру: https://avangard-ai.ru/measurements
---

ВАЖНО: Если клиент спрашивает о конкретных брендах или товарах — давай критерии выбора и рекомендуй смотреть каталог АВАНГАРД. Не придумывай цены из головы, давай диапазоны. Отвечай на русском языке."""


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