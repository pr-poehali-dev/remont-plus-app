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


ANALYZE_PROMPT = """Ты — сметчик-эксперт и бизнес-аналитик по ремонтно-строительным работам в России.
Тебе дают ГОТОВУЮ смету заказчика (часто выгруженную из программы Estimate/Гранд-Смета/Excel,
возможно распознанную из PDF/фото). В ней уже есть позиции, объёмы и ЦЕНЫ ЗАКАЗЧИКА.

Твоя задача — проанализировать смету с точки зрения ПОДРЯДЧИКА: стоит ли браться, сколько можно заработать.

ЧТО СДЕЛАТЬ ПО КАЖДОЙ ПОЗИЦИИ:
1. Извлеки: наименование, ед. изм., количество, ЦЕНУ ЗАКАЗЧИКА за единицу (customerPrice), сумму заказчика.
2. Определи РЕАЛЬНУЮ СЕБЕСТОИМОСТЬ работы/материала по рынку РФ 2026 и нашему справочнику (costPrice за единицу).
   Для работ используй нашу расценку из справочника, если позиция совпадает ("source":"book"), иначе рынок ("estimated").
3. Пометь тип: "work" или "material".
4. verdict по цене заказчика относительно себестоимости:
   - "good"    — цена заказчика выгодна подрядчику (заметно выше себестоимости, хорошая маржа);
   - "fair"    — цена рыночная, маржа умеренная;
   - "low"     — цена занижена, работа в ноль или в убыток (риск!);
   - "unknown" — не удалось оценить.

НАШ СПРАВОЧНИК СЕБЕСТОИМОСТИ (расценки работ):
{price_book}

ОБЩИЙ АНАЛИЗ (analysis):
- Оцени суммарную выручку (по ценам заказчика), суммарную себестоимость и ВАЛОВУЮ МАРЖУ (выручка − себестоимость).
- marginPct — маржа в % от выручки.
- recommendation: краткий вывод «стоит ли браться» (1-2 предложения) — например: выгодно, средне, рискованно, отказаться.
- risks: список рисков (позиции в убыток, забытые сопутствующие работы: демонтаж/грунтовка/вывоз мусора, подозрительные объёмы).
- missingWorks: список работ, которые обычно нужны по технологии, но отсутствуют в смете заказчика.

Верни СТРОГО JSON без markdown:
{{
  "mode": "analyze",
  "title": "краткое название объекта",
  "summary": "1-2 предложения что за смета",
  "items": [
    {{"name":"...","type":"work"|"material","unit":"...","qty":number,
      "customerPrice":number,"costPrice":number,"customerTotal":number,"costTotal":number,
      "verdict":"good"|"fair"|"low"|"unknown","source":"book"|"estimated","note":"..."}}
  ],
  "analysis": {{
    "revenue": number, "cost": number, "margin": number, "marginPct": number,
    "recommendation": "...", "risks": ["..."], "missingWorks": ["..."]
  }}
}}
Все цены — числа (₽). customerTotal = customerPrice×qty, costTotal = costPrice×qty."""


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


def _num(v):
    try:
        return float(v or 0)
    except (TypeError, ValueError):
        return 0.0


def build_analyze_response(result: dict, data: dict) -> dict:
    """Нормализует и пересчитывает анализ сметы заказчика (маржа/выгода)."""
    items = result.get('items', []) if isinstance(result, dict) else []
    norm = []
    revenue = 0
    cost = 0
    for it in items:
        qty = _num(it.get('qty'))
        cust = _num(it.get('customerPrice'))
        cst = _num(it.get('costPrice'))
        cust_total = round(cust * qty) if cust else round(_num(it.get('customerTotal')))
        cost_total = round(cst * qty) if cst else round(_num(it.get('costTotal')))
        margin = cust_total - cost_total
        # verdict пересчитываем сами по фактической марже позиции
        if cust_total <= 0:
            verdict = 'unknown'
        elif margin < 0:
            verdict = 'low'
        else:
            mp = margin / cust_total * 100
            verdict = 'good' if mp >= 25 else ('fair' if mp >= 8 else 'low')
        revenue += cust_total
        cost += cost_total
        norm.append({
            'name': str(it.get('name', 'Позиция')),
            'type': 'material' if it.get('type') == 'material' else 'work',
            'unit': str(it.get('unit', '')),
            'qty': round(qty, 2),
            'customerPrice': round(cust),
            'costPrice': round(cst),
            'customerTotal': cust_total,
            'costTotal': cost_total,
            'margin': margin,
            'verdict': verdict,
            'source': 'book' if it.get('source') == 'book' else 'estimated',
            'note': str(it.get('note', '')),
        })

    total_margin = revenue - cost
    margin_pct = round(total_margin / revenue * 100, 1) if revenue > 0 else 0
    a = result.get('analysis', {}) if isinstance(result.get('analysis'), dict) else {}
    analysis = {
        'revenue': revenue,
        'cost': cost,
        'margin': total_margin,
        'marginPct': margin_pct,
        'recommendation': str(a.get('recommendation', '')),
        'risks': a.get('risks', []) if isinstance(a.get('risks'), list) else [],
        'missingWorks': a.get('missingWorks', []) if isinstance(a.get('missingWorks'), list) else [],
    }
    out = {
        'mode': 'analyze',
        'title': str(result.get('title', 'Анализ сметы')),
        'summary': str(result.get('summary', '')),
        'items': norm,
        'analysis': analysis,
        'usage': data.get('usage', {}),
    }
    return {'statusCode': 200, 'headers': cors_headers(),
            'body': json.dumps(out, ensure_ascii=False), 'isBase64Encoded': False}


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
    mode = 'analyze' if body.get('mode') == 'analyze' else 'estimate'

    if not text and not images:
        return {'statusCode': 400, 'headers': cors_headers(),
                'body': json.dumps({'error': 'Нужен текст ТЗ или изображения'}), 'isBase64Encoded': False}

    prompt = ANALYZE_PROMPT if mode == 'analyze' else SYSTEM_PROMPT
    system = {'role': 'system', 'content': prompt.replace('{price_book}', price_book_text())}

    user_content = []
    if mode == 'analyze':
        head = 'Готовая смета заказчика для анализа выгоды подрядчика:'
        img_hint = 'Распознай смету заказчика на изображениях и проанализируй выгоду для подрядчика.'
    else:
        head = 'Техническое задание / смета:'
        img_hint = 'Распознай ТЗ/смету на изображениях и оцени стоимость.'
    if text:
        user_content.append({'type': 'text', 'text': f'{head}\n\n{text[:15000]}'})
    else:
        user_content.append({'type': 'text', 'text': img_hint})

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
                'max_tokens': 8000 if mode == 'analyze' else 4000,
                'response_format': {'type': 'json_object'},
            },
            timeout=55 if mode == 'analyze' else 25,
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

    if mode == 'analyze':
        return build_analyze_response(result, data)

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
        'mode': 'estimate',
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