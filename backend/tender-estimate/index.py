import json
import os
import re
import math
import requests
from price_book import price_book_text

POLZA_URL = 'https://api.polza.ai/v1/chat/completions'

SYSTEM_PROMPT = """Ты — сметчик-эксперт по ремонтно-строительным работам в России.
Тебе дают техническое задание (ТЗ) на ремонт или готовую смету (текст, возможно распознанный из PDF/фото).
Твоя задача — ГЛУБОКО разобрать документ на позиции и оценить стоимость для участия в ТЕНДЕРЕ.

ГЛУБОКИЙ РАЗБОР ТЕКСТА (важно!):
- Читай ВЕСЬ документ построчно, включая таблицы, примечания, сноски и мелкий текст.
- Одна строка сметы может содержать несколько работ («демонтаж и монтаж…», «грунтовка + шпаклёвка») — раздели их на отдельные позиции.
- Распознавай СОКРАЩЕНИЯ и профжаргон: ГКЛ=гипсокартон, ЦПС=цементно-песчаная смесь, ВЭ=водоэмульсионная краска,
  м/п=м.п.=погонный метр, шт.=штука, компл.=комплект, ГВЛ, СМР, ЛКМ, СГ=сухая смесь.
- Учитывай, что распознавание из PDF/фото может искажать буквы/цифры — восстанавливай смысл по контексту.
- Не пропускай позиции с нестандартными формулировками — если по смыслу это строительная работа, включи её.

ПРАВИЛА ОЦЕНКИ (ГИБРИД):
1. Сопоставляй позицию с нашим справочником ПО СМЫСЛУ, а не по точному совпадению текста.
   Используй раздел СИНОНИМЫ в справочнике: одна работа может быть названа в ТЗ совершенно иначе
   (напр. «улучшенная штукатурка стен» = «Штукатурка стен по маякам»; «устройство стяжки» = «Устройство цементной стяжки»;
   «облицовка стен керамической плиткой» = «Укладка настенной плитки»). Если по смыслу работа есть в справочнике —
   ОБЯЗАТЕЛЬНО бери НАШУ цену и "source":"book", в поле name пиши каноничное название из справочника.
2. Если позиции реально нет в справочнике — оцени по РЫНКУ РФ 2026: ориентируйся на открытые источники
   (прайсы ремонтных компаний и бирж услуг: Профи.ру, Ремонт-Экспресс, YouDo, Авито Услуги, региональные прайсы),
   а также сметные нормативы ГЭСН/ФЕР с текущими индексами. Указывай реалистичную рыночную цену, "source":"estimated",
   в note кратко поясни базу оценки (напр. «рынок РФ, средняя по прайсам ремонтных бригад»).
3. Разделяй РАБОТЫ и МАТЕРИАЛЫ. Для КАЖДОЙ работы ОБЯЗАТЕЛЬНО добавь сопутствующие материалы —
   смета без материалов недопустима. Покраска → краска + грунтовка + расходники; шпаклёвка → шпаклёвка + грунтовка;
   плитка → клей + затирка + гидроизоляция; стяжка → ЦПС/наливной пол; обои → обои + клей и т.д.
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
8. ЕДИНИЦЫ МАТЕРИАЛОВ: сыпучие/жидкие материалы указывай в БАЗОВЫХ единицах —
   сухие смеси (клей, ЦПС, штукатурка, шпаклёвка, наливной пол, затирка) в КГ,
   грунтовку/краску в Л, цену pricePerUnit — за кг/л. НЕ переводи сам в мешки/вёдра —
   систему упаковки (кратность вверх) применит программа. В note укажи норму расхода и итог в кг/л.
9. ОБЯЗАТЕЛЬНЫЕ РАСХОДНИКИ ПРИ ПОКРАСКЕ: если в смете есть любая покраска/окрашивание (стен, потолка, фасада),
   ОБЯЗАТЕЛЬНО добавь отдельными строками (type="material"): валик малярный 230 мм, кювета (малярная ванночка),
   кисть 50 мм ИЛИ 100 мм (для углов/примыканий), перчатки. Каждый — своя позиция с ценой из справочника.
10. КОРРЕКЦИЯ РАСХОДНИКОВ НА БРИГАДУ (2 МАСТЕРА): расходники и малярный/рабочий инструмент нужны на каждого мастера.
    Итоговое количество валиков, кистей, кювет, перчаток УМНОЖАЙ на 2 (бригада из 2 мастеров).
    В note укажи «×2 мастера». Это касается ТОЛЬКО инструмента/расходников, НЕ основных материалов (краска, клей, смеси считаются по площади).

НАШ СПРАВОЧНИК РАСЦЕНОК:
{price_book}

ПЕРЕД ОТВЕТОМ ПРОВЕРЬ ЧЕК-ЛИСТ (обязательно):
[ ] Для каждой работы добавлены материалы (type="material").
[ ] Сыпучие/жидкие материалы — в базовых единицах (кг/л), pricePerUnit за кг/л (упаковку посчитает программа).
[ ] Если есть покраска — добавлены валик 230 мм, кювета, кисть 50/100 мм, перчатки.
[ ] Количество расходников/инструмента умножено на 2 (бригада 2 мастера), note «×2 мастера».

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

ОСОБОЕ ВНИМАНИЕ — КОЭФФИЦИЕНТЫ (это критично для правильной цены!):
Сметы Estimate/Гранд-Смета почти всегда содержат коэффициенты. Игнорировать их НЕЛЬЗЯ —
без них цена заказчика искажается. Найди и УЧТИ в customerPrice все применимые:
  - коэффициенты к отдельным позициям/расценкам (Кпоз): стеснённость, высота, демонтаж (обычно 0.4–0.7 от расценки), работа в зимнее время и т.п.;
  - индексы пересчёта в текущие цены (СМР/ОЗП/ЭМ/МАТ) — перевод из базовых цен (2000/2001 г.) в текущие, часто ×5…×12;
  - коэффициенты к итогам разделов и по смете в целом (зимнее удорожание, временные здания, непредвиденные);
  - накладные расходы (НР) и сметная прибыль (СП) — если начислены в смете, они часть цены заказчика;
  - НДС — отдельно, в итоговую цену заказчика включай с НДС, если он есть.
customerPrice = цена за единицу ПОСЛЕ применения всех коэффициентов и индексов (то, что заказчик реально платит).
Если исходная расценка базовая, а рядом стоит индекс/коэффициент — обязательно перемножь. Кратко перечисли
применённые коэффициенты в поле "coeff" позиции (например: "демонтаж К=0.6; индекс СМР ×8.2") и в note.

ГЛУБОКИЙ РАЗБОР ТЕКСТА (важно!):
- Читай ВЕСЬ документ построчно: таблицы, примечания, сноски, мелкий текст. Не пропускай ни одной позиции.
- Распознавай сокращения и профжаргон (ГКЛ, ЦПС, ВЭ, м/п, ГВЛ, СМР, ЛКМ) и искажения OCR — восстанавливай смысл по контексту.

ЧТО СДЕЛАТЬ ПО КАЖДОЙ ПОЗИЦИИ:
1. Извлеки: наименование, ед. изм., количество, ЦЕНУ ЗАКАЗЧИКА за единицу (customerPrice) — уже С УЧЁТОМ коэффициентов (см. выше).
2. Определи РЕАЛЬНУЮ СЕБЕСТОИМОСТЬ работы/материала (costPrice за единицу):
   - Сопоставляй позицию с нашим справочником ПО СМЫСЛУ, используя раздел СИНОНИМЫ (работа в смете может называться иначе:
     «улучшенная штукатурка» = «Штукатурка стен по маякам», «устройство стяжки» = «Устройство цементной стяжки» и т.п.).
     Если по смыслу работа есть в справочнике — бери НАШУ цену как себестоимость, "source":"book".
   - Если позиции реально нет в справочнике — оцени себестоимость по РЫНКУ РФ 2026 из открытых источников
     (прайсы ремонтных бригад и бирж: Профи.ру, YouDo, Авито Услуги, региональные прайсы; при необходимости — ГЭСН/ФЕР
     с текущими индексами). "source":"estimated", в note укажи базу оценки.
3. Пометь тип: "work" или "material".
4. verdict по цене заказчика относительно себестоимости:
   - "good"    — цена заказчика выгодна подрядчику (заметно выше себестоимости, хорошая маржа);
   - "fair"    — цена рыночная, маржа умеренная;
   - "low"     — цена занижена, работа в ноль или в убыток (риск!);
   - "unknown" — не удалось оценить.

НАШ СПРАВОЧНИК СЕБЕСТОИМОСТИ (расценки работ):
{price_book}

ОБЩИЙ АНАЛИЗ (analysis):
- Оцени суммарную выручку (по ценам заказчика С УЧЁТОМ коэффициентов), суммарную себестоимость и ВАЛОВУЮ МАРЖУ (выручка − себестоимость).
- marginPct — маржа в % от выручки.
- recommendation: краткий вывод «стоит ли браться» (1-2 предложения) — например: выгодно, средне, рискованно, отказаться.
- coeffsSummary: перечисли ОБЩИЕ коэффициенты и индексы, применённые в смете (индексы пересчёта, зимнее удорожание, НР, СП, НДС) — как понял их подрядчик. Если коэффициентов нет — пустой список.
- risks: список рисков (позиции в убыток, забытые сопутствующие работы: демонтаж/грунтовка/вывоз мусора, подозрительные объёмы, а также НЕПОНЯТНЫЕ или сомнительные коэффициенты — например базовые цены без индекса пересчёта).
- missingWorks: список работ, которые обычно нужны по технологии, но отсутствуют в смете заказчика.

Верни СТРОГО JSON без markdown:
{{
  "mode": "analyze",
  "title": "краткое название объекта",
  "summary": "1-2 предложения что за смета",
  "items": [
    {{"name":"...","type":"work"|"material","unit":"...","qty":number,
      "customerPrice":number,"costPrice":number,"customerTotal":number,"costTotal":number,
      "verdict":"good"|"fair"|"low"|"unknown","source":"book"|"estimated","coeff":"...","note":"..."}}
  ],
  "analysis": {{
    "revenue": number, "cost": number, "margin": number, "marginPct": number,
    "recommendation": "...", "coeffsSummary": ["..."], "risks": ["..."], "missingWorks": ["..."]
  }}
}}
Все цены — числа (₽). customerPrice — С учётом коэффициентов. customerTotal = customerPrice×qty, costTotal = costPrice×qty.
"coeff" — строка с применёнными к позиции коэффициентами (пусто, если их нет)."""


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


# Фасовки материалов РФ 2026: (ключевые слова в названии) -> (объём фасовки, ед., подпись упаковки).
# Если ИИ вернул материал «россыпью» (в кг/л) — переводим в целые упаковки и пересчитываем цену за упаковку.
PACKAGING = [
    (('плиточный клей', 'клей c2', 'клей для плитки'), 25, 'кг', 'мешок'),
    (('цементно-песчан', 'цпс', 'стяжк', 'пескобетон'), 25, 'кг', 'мешок'),
    (('гипсовая штукатур', 'штукатурка гипс'), 30, 'кг', 'мешок'),
    (('шпакл', 'шпатл'), 25, 'кг', 'мешок'),
    (('наливной пол', 'ровнитель', 'самонивелир'), 20, 'кг', 'мешок'),
    (('затирк', 'фуг'), 2, 'кг', 'уп'),
    (('грунтов',), 10, 'л', 'канистра'),
    (('краск', 'эмаль', 'водоэмульс'), 9, 'л', 'ведро'),
]


def packagify(name: str, unit: str, qty: float, price: float):
    """Округляет фасованный материал вверх до целых упаковок и пересчитывает цену за упаковку.
    Возвращает (qty, unit, price). Если материал не фасованный или уже в упаковках — без изменений."""
    n = name.lower()
    u = unit.lower().strip()
    # уже в упаковках — оставляем, но количество округляем вверх
    if u in ('уп', 'упак', 'мешок', 'ведро', 'канистра', 'рулон', 'пачка', 'бухта'):
        return math.ceil(qty) if qty > 0 else qty, unit, price
    if u not in ('кг', 'л', 'литр'):
        return qty, unit, price
    u_norm = 'кг' if u == 'кг' else 'л'
    for keys, pack_size, pack_unit, pack_label in PACKAGING:
        if pack_unit != u_norm:
            continue
        if any(k in n for k in keys):
            packs = math.ceil(qty / pack_size) if qty > 0 else 0
            return packs, pack_label, round(price * pack_size)
    return qty, unit, price


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
            'coeff': str(it.get('coeff', '')),
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
        'coeffsSummary': a.get('coeffsSummary', []) if isinstance(a.get('coeffsSummary'), list) else [],
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
        user_content.append({'type': 'text', 'text': f'{head}\n\n{text[:30000]}'})
    else:
        user_content.append({'type': 'text', 'text': img_hint})

    # Лимит времени функции (задаётся в настройках: Ядро → Функции → Настройки).
    # Код автоматически подстраивается: requests-таймаут держим на несколько секунд
    # ниже лимита функции, чтобы успеть вернуть понятную ошибку вместо обрыва связи.
    try:
        func_timeout = int(os.environ.get('FUNCTION_TIMEOUT', '180'))
    except (TypeError, ValueError):
        func_timeout = 180
    ai_timeout = max(20, func_timeout - 6)

    # Чем больше времени у функции — тем больше страниц можем распознать за раз.
    # OCR картинок — самая долгая операция, поэтому масштабируем от лимита.
    per_image_budget = 12 if mode == 'analyze' else 9
    max_images = max(3, min(12, ai_timeout // per_image_budget))
    for img in images[:max_images]:
        if isinstance(img, str) and img.startswith('data:'):
            user_content.append({'type': 'image_url', 'image_url': {'url': img}})

    # Выбор модели по сложности задачи:
    # - анализ сметы или распознавание сканов/фото → gpt-4o (глубже разбирает текст, точнее OCR);
    # - простой текстовый ТЗ → gpt-4o-mini (быстрее и дешевле).
    has_images = any(isinstance(i, str) and i.startswith('data:') for i in images[:max_images])
    model = 'gpt-4o' if (mode == 'analyze' or has_images) else 'gpt-4o-mini'

    try:
        resp = requests.post(
            POLZA_URL,
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            json={
                'model': model,
                'messages': [system, {'role': 'user', 'content': user_content}],
                'temperature': 0.2,
                'max_tokens': 8000 if mode == 'analyze' else 4500,
                'response_format': {'type': 'json_object'},
            },
            timeout=ai_timeout,
        )
    except requests.Timeout:
        hint = ('Слишком большой документ для одного расчёта. Оставьте самые важные страницы '
                '(1–3 листа сметы) или вставьте текст в поле — и повторите.')
        return {'statusCode': 504, 'headers': cors_headers(),
                'body': json.dumps({'error': f'ИИ не успел обработать документ за отведённое время. {hint}'}), 'isBase64Encoded': False}
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
        itype = 'material' if it.get('type') == 'material' else 'work'
        unit = str(it.get('unit', ''))
        if itype == 'material':
            qty, unit, price = packagify(str(it.get('name', '')), unit, qty, price)
        total = round(price * qty)
        if itype == 'work':
            works_total += total
        else:
            materials_total += total
        norm_items.append({
            'name': str(it.get('name', 'Позиция')),
            'type': itype,
            'unit': unit,
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