"""
Органайзер ремонта: управление планом этапов, бюджетом и контрольными точками.
CRUD для renovation_plans и renovation_stages.
"""
import json
import os
import psycopg2
from datetime import date, datetime

SCHEMA = "t_p46588937_remont_plus_app"

STAGE_TEMPLATES = [
    {"sort_order": 1, "title": "Демонтаж", "description": "Снос перегородок, демонтаж покрытий, вывоз мусора", "checkpoints": ["Демонтаж завершён", "Мусор вынесен и вывезен", "Площадка очищена"], "plan_days": 5, "plan_amount": 120000},
    {"sort_order": 2, "title": "Черновые работы / перепланировка", "description": "Возведение новых перегородок, заделка проёмов", "checkpoints": ["Перегородки возведены", "Проёмы заделаны", "Акт скрытых работ"], "plan_days": 7, "plan_amount": 180000},
    {"sort_order": 3, "title": "Электрика", "description": "Разводка кабелей, установка распредкоробок, щита", "checkpoints": ["Схема согласована", "Кабели проложены", "Щит собран", "Проверка мегаомметром"], "plan_days": 7, "plan_amount": 150000},
    {"sort_order": 4, "title": "Сантехника (черновая)", "description": "Разводка труб водоснабжения и канализации", "checkpoints": ["Трубы разведены", "Опрессовка пройдена", "Акт скрытых работ"], "plan_days": 5, "plan_amount": 130000},
    {"sort_order": 5, "title": "Штукатурка стен и потолков", "description": "Выравнивание стен и потолков по маякам", "checkpoints": ["Маяки выставлены", "Штукатурка нанесена", "Поверхность затёрта", "Просушка"], "plan_days": 14, "plan_amount": 250000},
    {"sort_order": 6, "title": "Стяжка пола", "description": "Устройство цементно-песчаной или полусухой стяжки", "checkpoints": ["Подготовка основания", "Стяжка залита", "Просушка (28 дней)"], "plan_days": 7, "plan_amount": 90000},
    {"sort_order": 7, "title": "Монтаж окон и дверных коробок", "description": "Установка оконных блоков, входной и межкомнатных дверей", "checkpoints": ["Окна установлены", "Откосы готовы", "Двери установлены"], "plan_days": 3, "plan_amount": 80000},
    {"sort_order": 8, "title": "Чистовая отделка стен", "description": "Шпаклёвка, грунтовка, поклейка обоев или покраска", "checkpoints": ["Шпаклёвка нанесена", "Грунтовка", "Финишное покрытие"], "plan_days": 14, "plan_amount": 220000},
    {"sort_order": 9, "title": "Потолки", "description": "Натяжные потолки или покраска", "checkpoints": ["Материал доставлен", "Монтаж завершён", "Светильники установлены"], "plan_days": 3, "plan_amount": 100000},
    {"sort_order": 10, "title": "Укладка напольного покрытия", "description": "Плитка, ламинат, паркет или линолеум", "checkpoints": ["Основание подготовлено", "Покрытие уложено", "Плинтусы установлены"], "plan_days": 7, "plan_amount": 160000},
    {"sort_order": 11, "title": "Сантехника (чистовая)", "description": "Установка сантехники, смесителей, инсталляций", "checkpoints": ["Сантехника установлена", "Подключение выполнено", "Протечек нет"], "plan_days": 3, "plan_amount": 70000},
    {"sort_order": 12, "title": "Финишные работы и сдача", "description": "Установка розеток, выключателей, плинтусов, уборка", "checkpoints": ["Электрика подключена", "Плинтусы установлены", "Генеральная уборка", "Объект принят"], "plan_days": 5, "plan_amount": 60000},
]

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def serial(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def json_resp(status, data):
    return {"statusCode": status, "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}, "body": json.dumps(data, default=serial)}

def get_user_id(event):
    h = event.get("headers", {})
    uid = h.get("X-User-Id") or h.get("x-user-id")
    return int(uid) if uid else None

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id", "Access-Control-Max-Age": "86400"}, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    qs = event.get("queryStringParameters") or {}
    body = json.loads(event.get("body") or "{}")
    user_id = get_user_id(event)

    conn = get_conn()
    cur = conn.cursor()

    try:
        # GET /templates — шаблон этапов
        if method == "GET" and path.endswith("/templates"):
            return json_resp(200, {"templates": STAGE_TEMPLATES})

        # GET / — получить план пользователя (или создать из шаблона)
        if method == "GET" and not path.endswith("/stages"):
            if not user_id:
                return json_resp(200, {"plan": None, "stages": []})
            cur.execute(f"SELECT id, title, address, apartment_area, start_date, notes, created_at FROM {SCHEMA}.renovation_plans WHERE user_id = %s ORDER BY id LIMIT 1", (user_id,))
            row = cur.fetchone()
            if not row:
                return json_resp(200, {"plan": None, "stages": []})
            plan_id = row[0]
            plan = {"id": plan_id, "title": row[1], "address": row[2], "apartment_area": float(row[3]) if row[3] else None, "start_date": row[4], "notes": row[5], "created_at": row[6]}
            cur.execute(f"""SELECT id, sort_order, title, description, checkpoints, plan_days, plan_amount, fact_days, fact_amount, planned_start, planned_end, actual_start, actual_end, status, comment FROM {SCHEMA}.renovation_stages WHERE plan_id = %s ORDER BY sort_order""", (plan_id,))
            stages = []
            for s in cur.fetchall():
                stages.append({"id": s[0], "sort_order": s[1], "title": s[2], "description": s[3], "checkpoints": s[4] or [], "plan_days": s[5], "plan_amount": float(s[6]) if s[6] else None, "fact_days": s[7], "fact_amount": float(s[8]) if s[8] else None, "planned_start": s[9], "planned_end": s[10], "actual_start": s[11], "actual_end": s[12], "status": s[13], "comment": s[14]})
            return json_resp(200, {"plan": plan, "stages": stages})

        # POST / — создать план из шаблона
        if method == "POST" and not path.endswith("/stages"):
            if not user_id:
                return json_resp(400, {"error": "User ID required"})
            title = body.get("title", "Мой ремонт")
            address = body.get("address", "")
            area = body.get("apartment_area")
            start_date = body.get("start_date") or None
            notes = body.get("notes", "")
            cur.execute(f"INSERT INTO {SCHEMA}.renovation_plans (user_id, title, address, apartment_area, start_date, notes) VALUES (%s,%s,%s,%s,%s,%s) RETURNING id", (user_id, title, address, area, start_date, notes))
            plan_id = cur.fetchone()[0]
            for t in STAGE_TEMPLATES:
                cur.execute(f"""INSERT INTO {SCHEMA}.renovation_stages (plan_id, sort_order, title, description, checkpoints, plan_days, plan_amount, status) VALUES (%s,%s,%s,%s,%s,%s,%s,'pending')""", (plan_id, t["sort_order"], t["title"], t["description"], t["checkpoints"], t["plan_days"], t["plan_amount"]))
            conn.commit()
            return json_resp(201, {"plan_id": plan_id})

        # PUT / — обновить план
        if method == "PUT" and not path.endswith("/stages"):
            if not user_id:
                return json_resp(400, {"error": "User ID required"})
            plan_id = body.get("plan_id")
            cur.execute(f"UPDATE {SCHEMA}.renovation_plans SET title=%s, address=%s, apartment_area=%s, start_date=%s, notes=%s, updated_at=NOW() WHERE id=%s AND user_id=%s", (body.get("title"), body.get("address"), body.get("apartment_area"), body.get("start_date"), body.get("notes"), plan_id, user_id))
            conn.commit()
            return json_resp(200, {"ok": True})

        # PUT /stages — обновить этап
        if method == "PUT" and path.endswith("/stages"):
            stage_id = body.get("stage_id")
            cur.execute(f"""UPDATE {SCHEMA}.renovation_stages SET title=%s, description=%s, checkpoints=%s, plan_days=%s, plan_amount=%s, fact_days=%s, fact_amount=%s, planned_start=%s, planned_end=%s, actual_start=%s, actual_end=%s, status=%s, comment=%s, updated_at=NOW() WHERE id=%s""",
                (body.get("title"), body.get("description"), body.get("checkpoints"), body.get("plan_days"), body.get("plan_amount"), body.get("fact_days"), body.get("fact_amount"), body.get("planned_start"), body.get("planned_end"), body.get("actual_start"), body.get("actual_end"), body.get("status"), body.get("comment"), stage_id))
            conn.commit()
            return json_resp(200, {"ok": True})

        return json_resp(404, {"error": "Not found"})

    finally:
        cur.close()
        conn.close()