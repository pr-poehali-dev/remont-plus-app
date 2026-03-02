"""
AI-менеджер по продажам — эксперт по продажам ремонтно-строительной компании.
Помогает закрывать сделки, работать с возражениями, составлять скрипты и коммерческие предложения.
"""
import json
import os
import urllib.request


POLZA_URL = "https://api.polza.ai/v1/chat/completions"

SYSTEM_PROMPT = """Ты — Алексей, старший AI-менеджер по продажам с 12-летним опытом в продажах услуг ремонта и строительства.

Твои компетенции:
— Скрипты продаж для входящих и исходящих звонков, мессенджеров
— Работа с возражениями клиентов: дорого, подумаю, работаю с другими, не сейчас
— Составление коммерческих предложений и смет под клиента
— Техники закрытия сделок: urgency, FOMO, anchor pricing
— Квалификация лидов: BANT, SPIN, методология challenger
— Постпродажное сопровождение, допродажи, upsell, cross-sell
— Работа с CRM: воронка продаж, этапы, конверсия
— Обучение менеджеров: KPI, мотивация, разбор звонков
— Ценообразование: как обосновать стоимость, пакетные предложения
— Переговоры: торг, скидки, условия договора

Ты работаешь в компании "Авангард" — строительно-ремонтная компания, работающая с частными клиентами 
и корпоративными заказчиками. Выполняем ремонт квартир, офисов, коттеджей. 
Средний чек: от 500 000 до 5 000 000 рублей. Цикл сделки: 2–6 недель.
Есть калькуляторы стоимости ремонта, шоурум, портфолио, прайс-лист.

ВАЖНО: Ты представляешь интересы компании "Авангард". Всегда называй компанию "Авангард" в скриптах и шаблонах. 
Все советы давай с позиции менеджера "Авангарда". Цель — закрыть сделку для "Авангарда", 
увеличить средний чек "Авангарда", защитить репутацию "Авангарда".

Стиль общения:
— Отвечай конкретно: давай готовые скрипты, фразы, шаблоны — не описывай их
— Пиши скрипты в формате диалога: Менеджер: ... / Клиент: ...
— Используй психологию продаж, триггеры доверия и срочности
— Указывай конкретные цифры конверсии, бенчмарки, метрики для отрасли
— Учитывай специфику строительного рынка: длинные решения, высокий чек, страхи клиентов
— Отвечай на русском языке"""

QUICK_PROMPTS = [
    {"id": "objection_expensive", "label": "Возражение «дорого»", "icon": "DollarSign", "text": "Напиши скрипт обработки возражения «Дорого» / «У конкурентов дешевле» для менеджера ремонтной компании. Дай 5 разных вариантов ответа."},
    {"id": "first_call", "label": "Скрипт первого звонка", "icon": "Phone", "text": "Напиши скрипт входящего звонка от клиента, который интересуется ремонтом квартиры. От приветствия до назначения замера."},
    {"id": "commercial_offer", "label": "Коммерческое предложение", "icon": "FileText", "text": "Напиши шаблон коммерческого предложения на ремонт квартиры под ключ. Структура, ключевые блоки, что должно убеждать клиента."},
    {"id": "upsell", "label": "Допродажи / Upsell", "icon": "TrendingUp", "text": "Какие дополнительные услуги можно допродавать при ремонте квартиры? Как предлагать upsell ненавязчиво? Дай скрипты."},
    {"id": "think_it_over", "label": "«Я подумаю»", "icon": "Clock", "text": "Клиент говорит «Я подумаю» или «Мне нужно посоветоваться с женой/мужем». Дай скрипты как не потерять сделку и договориться о следующем шаге."},
    {"id": "lead_qualification", "label": "Квалификация лида", "icon": "Filter", "text": "Как быстро квалифицировать лид по телефону: нужный ли это клиент, каков его бюджет, сроки, готовность. Дай список вопросов и критерии оценки."},
    {"id": "followup", "label": "Follow-up письмо", "icon": "Mail", "text": "Напиши серию follow-up сообщений (3 штуки) для клиента после встречи/замера, который не принимает решение уже 2 недели."},
    {"id": "closing", "label": "Техники закрытия", "icon": "CheckCircle", "text": "Дай 7 техник закрытия сделки для ремонтной компании с примерами фраз. Как подтолкнуть клиента к подписанию договора."},
]


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        "body": json.dumps(body, ensure_ascii=False),
    }


def call_ai(messages: list) -> str:
    api_key = os.environ.get("POLZA_AI_API_KEY", "")
    payload = json.dumps({
        "model": "gpt-4o",
        "messages": messages,
        "max_tokens": 2000,
        "temperature": 0.75,
    }).encode("utf-8")
    req = urllib.request.Request(
        POLZA_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.loads(r.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"]


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    token = event.get("headers", {}).get("X-Admin-Token", "")
    if token != "admin2025":
        return resp(403, {"error": "Forbidden"})

    method = event.get("httpMethod", "GET")

    if method == "GET":
        return resp(200, {"quick_prompts": QUICK_PROMPTS, "status": "ok"})

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        history = body.get("history", [])
        user_message = body.get("message", "").strip()
        calc_context = body.get("calc_context", "")  # контекст сметы из калькулятора

        if not user_message:
            return resp(400, {"error": "message required"})

        # Расширяем системный промпт контекстом расчёта, если он передан
        system = SYSTEM_PROMPT
        if calc_context:
            system += f"\n\n{calc_context}\n\nИспользуй эти данные для точных советов по продаже и допродажам."

        messages = [{"role": "system", "content": system}]
        for msg in history[-20:]:
            if msg.get("role") in ("user", "assistant") and msg.get("content"):
                messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})

        answer = call_ai(messages)
        return resp(200, {"answer": answer})

    return resp(405, {"error": "Method not allowed"})