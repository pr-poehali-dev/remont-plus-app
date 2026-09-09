import json
import os
import requests

POLZA_URL = 'https://api.polza.ai/v1/chat/completions'
MODEL = 'openai/gpt-6-astra'

AUDIT_PROMPT = """Ты — юрист с 20-летней практикой в строительном подряде в России.
Ты защищаешь интересы ПОДРЯДЧИКА (строителя), которому заказчик дал договор на подпись.

Твоя задача — найти всё, что может привести подрядчика к убыткам, неоплате, штрафам или срыву проекта.

На что смотреть особенно внимательно:
1. ОПЛАТА: отсутствие аванса, оплата «по факту приёмки всего объекта», право заказчика задерживать
   оплату, зачёт/удержания, привязка оплаты к сдаче объекта третьим лицам, гарантийные удержания.
2. ШТРАФЫ И ПЕНИ: несимметричные санкции (штрафы только для подрядчика), пени без верхнего предела,
   штрафы за просрочку при отсутствии обязанностей заказчика, безакцептное списание.
3. ПРИЁМКА: право заказчика не подписывать акт без мотивировки, отсутствие сроков приёмки,
   «приёмка по усмотрению заказчика», отсутствие правила о молчаливой приёмке.
4. ОБЪЁМ РАБОТ: «и иные работы, необходимые для достижения результата», работы без сметы,
   право заказчика менять объём без изменения цены и срока.
5. СРОКИ: жёсткие сроки без учёта задержек заказчика (доступ на объект, материалы, согласования),
   отсутствие механизма продления.
6. ЦЕНА: твёрдая цена без права пересмотра при росте цен на материалы, запрет на доп. работы.
7. ГАРАНТИЯ: чрезмерный срок, гарантия на материалы заказчика, гарантия на износ.
8. РАСТОРЖЕНИЕ: право заказчика расторгнуть в любой момент без оплаты выполненного,
   удержание аванса, изъятие материалов подрядчика.
9. ОТВЕТСТВЕННОСТЬ: полная материальная ответственность за объект, риски третьих лиц,
   ответственность за проект/материалы заказчика.
10. ПРОЧЕЕ: подсудность в далёком регионе, запрет привлекать субподряд, скрытые обязанности,
    односторонние изменения договора, эксклюзивность, штраф за переговоры с другими.

Оцени риск каждого пункта:
- "critical" — грозит прямыми убытками или неоплатой, подписывать нельзя без правки;
- "high" — серьёзный риск, нужно исправить;
- "medium" — невыгодно, желательно поправить;
- "info" — обратить внимание, обсудить.

Верни СТРОГО JSON:
{
  "title": "Договор подряда №... (краткое описание предмета)",
  "verdict": "sign | fix | reject",
  "verdict_text": "1-2 предложения — можно ли подписывать и что главное",
  "risk_score": 0-100,
  "summary": "краткое резюме договора: предмет, сумма, сроки, кто заказчик — что удалось понять",
  "parties": {"customer": "заказчик как в договоре", "contractor": "подрядчик", "amount": "сумма или 'не указана'", "term": "срок или 'не указан'"},
  "issues": [
    {
      "clause": "п. 4.2 (номер пункта как в договоре, или 'не указан')",
      "quote": "короткая цитата опасной формулировки (до 200 знаков)",
      "risk": "critical|high|medium|info",
      "category": "оплата|штрафы|приёмка|объём работ|сроки|цена|гарантия|расторжение|ответственность|прочее",
      "problem": "чем это опасно для подрядчика — конкретно, на деньги и последствия",
      "money_risk": "оценка потерь в рублях или '—', если не считается",
      "fix": "готовая формулировка на замену — так, чтобы можно было скопировать и отправить заказчику"
    }
  ],
  "missing": [
    {"what": "чего в договоре НЕТ, но обязательно нужно подрядчику", "why": "зачем", "text": "готовая формулировка пункта для вставки"}
  ],
  "negotiation": ["тезисы для переговоров с заказчиком — по одному на пункт, в порядке важности"]
}

ВАЖНО:
- issues отсортируй по риску: critical → high → medium → info.
- Формулировки в "fix" и "text" — юридически грамотные, готовые к отправке, на русском языке.
- Если договор распознан частично — работай с тем, что есть, и отметь это в summary.
- verdict: "reject" если есть critical; "fix" если high/medium; "sign" если существенных рисков нет.
- risk_score: 0 — безопасно, 100 — кабальный договор.
- Не выдумывай пункты, которых нет в тексте. Цитаты — только реальные.
"""


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def extract_json(text: str) -> dict:
    text = (text or '').strip()
    if text.startswith('```'):
        text = text.split('```')[1] if '```' in text[3:] else text[3:]
        if text.startswith('json'):
            text = text[4:]
    start = text.find('{')
    end = text.rfind('}')
    if start >= 0 and end > start:
        text = text[start:end + 1]
    return json.loads(text)


RISK_ORDER = {'critical': 0, 'high': 1, 'medium': 2, 'info': 3}


def normalize(data: dict) -> dict:
    issues = []
    for it in (data.get('issues') or []):
        risk = str(it.get('risk') or 'medium').lower()
        if risk not in RISK_ORDER:
            risk = 'medium'
        issues.append({
            'clause': str(it.get('clause') or 'не указан'),
            'quote': str(it.get('quote') or '')[:400],
            'risk': risk,
            'category': str(it.get('category') or 'прочее'),
            'problem': str(it.get('problem') or ''),
            'money_risk': str(it.get('money_risk') or '—'),
            'fix': str(it.get('fix') or ''),
        })
    issues.sort(key=lambda x: RISK_ORDER.get(x['risk'], 9))

    missing = []
    for m in (data.get('missing') or []):
        missing.append({
            'what': str(m.get('what') or ''),
            'why': str(m.get('why') or ''),
            'text': str(m.get('text') or ''),
        })

    verdict = str(data.get('verdict') or '').lower()
    if verdict not in ('sign', 'fix', 'reject'):
        verdict = 'reject' if any(i['risk'] == 'critical' for i in issues) else ('fix' if issues else 'sign')

    try:
        score = int(float(data.get('risk_score') or 0))
    except (TypeError, ValueError):
        score = 0
    score = max(0, min(100, score))

    parties = data.get('parties') or {}
    counts = {
        'critical': sum(1 for i in issues if i['risk'] == 'critical'),
        'high': sum(1 for i in issues if i['risk'] == 'high'),
        'medium': sum(1 for i in issues if i['risk'] == 'medium'),
        'info': sum(1 for i in issues if i['risk'] == 'info'),
    }

    return {
        'title': str(data.get('title') or 'Договор подряда'),
        'verdict': verdict,
        'verdict_text': str(data.get('verdict_text') or ''),
        'risk_score': score,
        'summary': str(data.get('summary') or ''),
        'parties': {
            'customer': str(parties.get('customer') or '—'),
            'contractor': str(parties.get('contractor') or '—'),
            'amount': str(parties.get('amount') or 'не указана'),
            'term': str(parties.get('term') or 'не указан'),
        },
        'issues': issues,
        'missing': missing,
        'negotiation': [str(x) for x in (data.get('negotiation') or [])],
        'counts': counts,
        'model': MODEL,
    }


def handler(event: dict, context) -> dict:
    """Юридический аудит договора заказчика на GPT-6 Astra: находит риски для подрядчика и даёт формулировки на замену."""
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
    images = body.get('images') or []

    if not text and not images:
        return {'statusCode': 400, 'headers': cors_headers(),
                'body': json.dumps({'error': 'Нужен текст договора или его сканы'}), 'isBase64Encoded': False}

    try:
        func_timeout = int(os.environ.get('FUNCTION_TIMEOUT', '180'))
    except (TypeError, ValueError):
        func_timeout = 180
    ai_timeout = max(20, func_timeout - 6)

    user_content = []
    if text:
        # Astra держит большой контекст — можно отдать договор целиком
        user_content.append({'type': 'text',
                             'text': f'Договор, который заказчик предлагает подписать подрядчику:\n\n{text[:200000]}'})
    else:
        user_content.append({'type': 'text',
                             'text': 'Распознай договор на изображениях и проведи юридический аудит в интересах подрядчика.'})

    max_images = max(3, min(20, ai_timeout // 8))
    for img in images[:max_images]:
        if isinstance(img, str) and img.startswith('data:'):
            user_content.append({'type': 'image_url', 'image_url': {'url': img}})

    try:
        resp = requests.post(
            POLZA_URL,
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            json={
                'model': MODEL,
                'messages': [
                    {'role': 'system', 'content': AUDIT_PROMPT},
                    {'role': 'user', 'content': user_content},
                ],
                'temperature': 0.15,
                'max_tokens': 12000,
                'response_format': {'type': 'json_object'},
            },
            timeout=ai_timeout,
        )
    except requests.Timeout:
        return {'statusCode': 504, 'headers': cors_headers(),
                'body': json.dumps({'error': 'ИИ не успел разобрать договор за отведённое время. '
                                             'Оставьте ключевые разделы (оплата, сроки, ответственность, приёмка) '
                                             'или вставьте текст договора в поле — и повторите.'}),
                'isBase64Encoded': False}
    except requests.RequestException as e:
        return {'statusCode': 502, 'headers': cors_headers(),
                'body': json.dumps({'error': f'Ошибка соединения с ИИ-сервисом: {str(e)}'}), 'isBase64Encoded': False}

    if resp.status_code != 200:
        detail = resp.text[:300]
        if resp.status_code in (401, 403):
            msg = 'ИИ-сервис отклонил запрос (ошибка авторизации ключа). Обратитесь в поддержку.'
        elif resp.status_code == 402:
            msg = 'На балансе ИИ-сервиса закончились средства. Пополните баланс и повторите.'
        elif resp.status_code == 429:
            msg = 'ИИ-сервис перегружен, попробуйте через минуту.'
        else:
            msg = f'ИИ-сервис вернул ошибку {resp.status_code}. {detail}'
        return {'statusCode': 502, 'headers': cors_headers(),
                'body': json.dumps({'error': msg}), 'isBase64Encoded': False}

    try:
        payload = resp.json()
        content = payload['choices'][0]['message']['content']
        data = extract_json(content)
    except (KeyError, IndexError, ValueError, json.JSONDecodeError):
        return {'statusCode': 502, 'headers': cors_headers(),
                'body': json.dumps({'error': 'ИИ вернул некорректный ответ, повторите попытку'}),
                'isBase64Encoded': False}

    return {'statusCode': 200, 'headers': cors_headers(),
            'body': json.dumps(normalize(data), ensure_ascii=False), 'isBase64Encoded': False}
