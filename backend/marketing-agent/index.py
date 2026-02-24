"""
AI-маркетолог — старший эксперт по маркетингу ремонтно-строительной компании.
Помогает с контентом, рекламой, анализом ЦА, стратегией, позиционированием.
"""
import json
import os
import urllib.request


POLZA_URL = "https://api.polza.ai/v1/chat/completions"

SYSTEM_PROMPT = """Ты — Марина, старший AI-маркетолог с 15-летним опытом в B2C и B2B маркетинге, 
специализируешься на ремонтно-строительной отрасли России.

Твои компетенции:
— Разработка маркетинговых стратегий для ремонтных компаний
— Создание продающего контента (тексты, посты, рекламные объявления, скрипты)
— Анализ целевой аудитории: сегментация, портрет клиента, боли и возражения
— Настройка и оптимизация рекламных кампаний (Яндекс.Директ, ВКонтакте, Telegram Ads)
— SEO для строительной тематики, семантика, контент-планы
— Построение воронок продаж и работа с лидами
— Ценообразование, акции, спецпредложения
— Репутационный маркетинг: работа с отзывами, рейтинги, кейсы
— Email и мессенджер-маркетинг: рассылки, чат-боты, прогрев
— Аналитика: метрики, KPI, ROI, CPL, LTV для строительного бизнеса

Компания "Авангард Строй" — строительно-ремонтная компания, работающая с частными клиентами 
и корпоративными заказчиками. Выполняем ремонт квартир, офисов, коттеджей. 
Есть калькуляторы стоимости ремонта, шоурум, портфолио, прайс-лист.

Стиль общения:
— Отвечай конкретно, давай готовые решения, примеры, шаблоны
— Используй структуру: сначала стратегия/рекомендация, затем практические шаги
— Если нужен текст — пиши сразу готовый текст, не описывай его
— Указывай конкретные цифры, бенчмарки, сроки, где это возможно
— Говори на языке бизнеса: конверсия, CAC, LTV, ROAS, CPL
— При необходимости задавай уточняющие вопросы
— Отвечай на русском языке"""

QUICK_PROMPTS = [
    {"id": "content_plan", "label": "Контент-план", "icon": "Calendar", "text": "Составь контент-план для нашей компании на месяц: Instagram, ВКонтакте и Telegram. Укажи темы постов, форматы и рекомендации по времени публикации."},
    {"id": "ad_copy", "label": "Рекламные объявления", "icon": "Megaphone", "text": "Напиши 5 вариантов рекламных объявлений для Яндекс.Директ по запросу «ремонт квартиры под ключ». Разные заголовки и описания."},
    {"id": "target_audience", "label": "Анализ ЦА", "icon": "Users", "text": "Сделай детальный анализ целевой аудитории для ремонтной компании: сегменты, портрет, боли, возражения, каналы привлечения."},
    {"id": "usp", "label": "УТП компании", "icon": "Star", "text": "Помоги сформулировать сильное уникальное торговое предложение (УТП) для ремонтной компании. Что выделит нас среди конкурентов?"},
    {"id": "reviews_strategy", "label": "Стратегия отзывов", "icon": "MessageSquare", "text": "Разработай стратегию по сбору и работе с отзывами клиентов: как просить, на каких площадках, как отвечать на негатив."},
    {"id": "email_sequence", "label": "Email-цепочка", "icon": "Mail", "text": "Напиши цепочку из 5 писем для прогрева лида, который оставил заявку на расчёт стоимости ремонта, но не подписал договор."},
    {"id": "promo", "label": "Акция / спецпредложение", "icon": "Tag", "text": "Придумай акцию для привлечения клиентов в низкий сезон (январь-февраль). Какой механик использовать, какой дедлайн, как рекламировать?"},
    {"id": "kpi", "label": "KPI и метрики", "icon": "BarChart2", "text": "Какие KPI нужно отслеживать маркетологу ремонтной компании? Дай конкретные цифры-бенчмарки для нашей отрасли."},
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

        if not user_message:
            return resp(400, {"error": "message required"})

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in history[-20:]:
            if msg.get("role") in ("user", "assistant") and msg.get("content"):
                messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})

        answer = call_ai(messages)
        return resp(200, {"answer": answer})

    return resp(405, {"error": "Method not allowed"})
