import json
import os
import re
import requests
from price_book import price_book_text

POLZA_URL = 'https://api.polza.ai/v1/chat/completions'

SYSTEM_PROMPT = """Ты — сметчик-эксперт по ремонтно-строительным работам в России.
Тебе дают техническое задание (ТЗ) на ремонт или готовую смету (текст, возможно распознанный из PDF/фото).
Твоя задача — разобрать документ на позиции и оценить стоимость для участия в ТЕНДЕРЕ.

ПРАВИЛА ОЦЕНКИ (ГИБРИД):
1. Если позиция совпадает с расценкой из нашего справочника ниже — используй НАШУ цену, "source":"book".
2. Если позиции нет в справочнике — оцени по рынку РФ 2026 самостоятельно, "source":"estimated".
3. Разделяй РАБОТЫ и МАТЕРИАЛЫ.
4. МАТЕРИАЛЫ считай по НОРМЕ РАСХОДА на площадь/объём с учётом технологии, а не «на глаз». Примеры норм:
   - Плиточный клей: ~5-7 кг/м² (гребёнка); затирка: ~0.5 кг/м² (пол), ~0.3 кг/м² (стены);
   - Штукатурка гипсовая: ~9 кг/м² на 1 см слоя; шпаклёвка финишная: ~1.2 кг/м²;
   - ЦПС для стяжки: ~20 кг/м² на 1 см толщины; грунтовка: ~0.15 л/м²; краска: ~0.15-0.2 л/м² на слой (2 слоя);
   - Плитка/ламинат/обои: площадь + запас на подрезку 5-10%;
   - Кабель: ~0.9 м/м² (освещение+розетки); подрозетники: по числу точек.
   Указывай реальную ед. изм. материала (кг, л, м², м.п., шт) и рассчитанное количество.
5. ДЕМОНТАЖ: если в ТЗ есть замена/новая отделка поверх старой (демонтаж плитки, стяжки, обоев, старого пола,
   сантехники, перегородок) — ОБЯЗАТЕЛЬНО включи соответствующие демонтажные работы, даже если явно не прописаны.
   Если про демонтаж в ТЗ не сказано, но он логически нужен — добавь позицию с note "демонтаж, уточнить объём".
6. Количество бери из ТЗ. Если объём не указан — qty: 0 и note "уточнить объём".
7. Не выдумывай работы, которых нет в документе и которые не следуют из технологии.

НАШ СПРАВОЧНИК РАСЦЕНОК:
{price_book}

Верни СТРОГО JSON без markdown, без пояснений, в формате:
{{
  "title": "краткое название объекта/тендера",
  "summary": "1-2 предложения что за работы",
  "items": [
    {{"name": "...", "type": "work"|"material", "unit": "м²|шт|м.п.|точка|...", "qty": number, "pricePerUnit": number, "source": "book"|"estimated", "note": "..."}}
  ],
  "warnings": ["список неясностей/что уточнить у заказчика"]
}}
qty и pricePerUnit — числа (₽). Если чего-то нет — пустой массив/строка."""


def cors_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }


def extract_json(text: str) -> dict:
    """Достаёт JSON из ответа модели (на случай markdown-обёртки)."""
    text = text.strip()
    if text.startswith('```'):
        text = re.sub(r'^```[a-zA-Z]*\n?', '', text)
        text = re.sub(r'\n?```$', '', text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r'\{.*\}', text, re.DOTALL)
        if m:
            return json.loads(m.group(0))
        raise


def handler(event: dict, context) -> dict:
    """Распознаёт ТЗ/смету (текст + изображения) и оценивает стоимость работ и материалов для тендера."""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': '', 'isBase64Encoded': False}

    if method != 'POST':
        return {'statusCode': 405, 'headers': cors_headers(),
                'body': json.dumps({'error': 'Method not allowed'}), 'isBase64Encoded': False}

    api_key = os.environ.get('POLZA_AI_API_KEY')
    if not api_key:
        return {'statusCode': 500, 'headers': cors_headers(),
                'body': json.dumps({'error': 'AI ключ не настроен'}), 'isBase64Encoded': False}

    try:
        body = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return {'statusCode': 400, 'headers': cors_headers(),
                'body': json.dumps({'error': 'Некорректный JSON'}), 'isBase64Encoded': False}

    text = (body.get('text') or '').strip()
    images = body.get('images') or []  # список data-url base64 (сканы/фото)

    if not text and not images:
        return {'statusCode': 400, 'headers': cors_headers(),
                'body': json.dumps({'error': 'Нужен текст ТЗ или изображения'}), 'isBase64Encoded': False}

    system = {'role': 'system', 'content': SYSTEM_PROMPT.replace('{price_book}', price_book_text())}

    user_content = []
    if text:
        user_content.append({'type': 'text', 'text': f'Техническое задание / смета:\n\n{text[:15000]}'})
    else:
        user_content.append({'type': 'text', 'text': 'Распознай ТЗ/смету на изображениях и оцени стоимость.'})

    for img in images[:8]:
        if isinstance(img, str) and img.startswith('data:'):
            user_content.append({'type': 'image_url', 'image_url': {'url': img}})

    # gpt-4o-mini поддерживает vision (OCR сканов/фото) и текст, дешевле gpt-4o.
    # Единая модель снижает расход баланса ИИ-сервиса и время ответа.
    model = 'gpt-4o-mini'

    try:
        resp = requests.post(
            POLZA_URL,
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            json={
                'model': model,
                'messages': [system, {'role': 'user', 'content': user_content}],
                'temperature': 0.2,
                'max_tokens': 4000,
                'response_format': {'type': 'json_object'},
            },
            timeout=25,
        )
    except requests.Timeout:
        return {'statusCode': 504, 'headers': cors_headers(),
                'body': json.dumps({'error': 'ИИ не успел обработать документ за отведённое время. Сократите объём (меньше страниц/фото) или вставьте текст ТЗ и повторите.'}), 'isBase64Encoded': False}
    except requests.RequestException as e:
        return {'statusCode': 502, 'headers': cors_headers(),
                'body': json.dumps({'error': f'Ошибка соединения с ИИ-сервисом: {str(e)}'}), 'isBase64Encoded': False}

    if resp.status_code != 200:
        detail = resp.text[:300]
        if resp.status_code in (401, 403):
            msg = 'ИИ-сервис отклонил запрос (ошибка авторизации ключа). Обратитесь в поддержку.'
        elif resp.status_code == 402:
            msg = 'На балансе ИИ-сервиса закончились средства. Пополните баланс Polza.ai и повторите расчёт.'
        elif resp.status_code == 429:
            msg = 'ИИ-сервис перегружен, попробуйте через минуту.'
        else:
            msg = f'ИИ-сервис вернул ошибку {resp.status_code}. {detail}'
        return {'statusCode': 502, 'headers': cors_headers(),
                'body': json.dumps({'error': msg}), 'isBase64Encoded': False}

    try:
        data = resp.json()
        raw = data['choices'][0]['message']['content']
        result = extract_json(raw)
    except (json.JSONDecodeError, KeyError, ValueError, IndexError) as e:
        return {'statusCode': 502, 'headers': cors_headers(),
                'body': json.dumps({'error': f'Не удалось разобрать ответ ИИ: {str(e)}'}), 'isBase64Encoded': False}

    items = result.get('items', []) if isinstance(result, dict) else []
    norm_items = []
    works_total = 0
    materials_total = 0
    for it in items:
        try:
            qty = float(it.get('qty') or 0)
            price = float(it.get('pricePerUnit') or 0)
        except (TypeError, ValueError):
            qty, price = 0, 0
        total = round(price * qty)
        itype = 'material' if it.get('type') == 'material' else 'work'
        if itype == 'work':
            works_total += total
        else:
            materials_total += total
        norm_items.append({
            'name': str(it.get('name', 'Позиция')),
            'type': itype,
            'unit': str(it.get('unit', '')),
            'qty': round(qty, 2),
            'pricePerUnit': round(price),
            'total': total,
            'source': 'book' if it.get('source') == 'book' else 'estimated',
            'note': str(it.get('note', '')),
        })

    out = {
        'title': str(result.get('title', 'Смета по ТЗ')),
        'summary': str(result.get('summary', '')),
        'items': norm_items,
        'worksTotal': works_total,
        'materialsTotal': materials_total,
        'subtotal': works_total + materials_total,
        'warnings': result.get('warnings', []) if isinstance(result.get('warnings'), list) else [],
        'usage': data.get('usage', {}),
    }
    return {'statusCode': 200, 'headers': cors_headers(),
            'body': json.dumps(out, ensure_ascii=False), 'isBase64Encoded': False}