"""
Парсер строительных компаний (ремонт квартир) через 2ГИС Places API.
Поддерживает: сбор по городу, обогащение ФИО директора через DaData, выгрузка CSV, список/удаление.
"""
import json
import os
import time
import csv
import io
import base64
import psycopg2
import urllib.request
import urllib.parse

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
}
ADMIN_TOKEN = "admin2025"
SCHEMA = "t_p46588937_remont_plus_app"

CITIES = [
    {"name": "Москва",           "id": "1"},
    {"name": "Санкт-Петербург",  "id": "2"},
    {"name": "Новосибирск",      "id": "4"},
    {"name": "Екатеринбург",     "id": "5"},
    {"name": "Казань",           "id": "11"},
    {"name": "Нижний Новгород",  "id": "6"},
    {"name": "Челябинск",        "id": "7"},
    {"name": "Самара",           "id": "12"},
    {"name": "Омск",             "id": "8"},
    {"name": "Ростов-на-Дону",   "id": "10"},
    {"name": "Уфа",              "id": "14"},
    {"name": "Красноярск",       "id": "9"},
    {"name": "Пермь",            "id": "13"},
    {"name": "Воронеж",          "id": "18"},
]

SEARCH_QUERIES = [
    "ремонт квартир",
    "строительная компания ремонт",
    "отделочные работы",
]


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def check_admin(event):
    h = event.get("headers") or {}
    return (h.get("X-Admin-Token") or h.get("x-admin-token", "")) == ADMIN_TOKEN


def http_get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode())


def fetch_2gis(city_id, query, page=1):
    """Запрос к 2ГИС Places API."""
    key = os.environ.get("DGIS_API_KEY", "")
    params = urllib.parse.urlencode({
        "q": query,
        "city_id": city_id,
        "page": page,
        "page_size": 50,
        "fields": "items.point,items.address,items.contact_groups,items.rubrics,items.org",
        "key": key,
    })
    url = f"https://catalog.api.2gis.com/3.0/items?{params}"
    return http_get(url)


def enrich_dadata(name):
    """Поиск ФИО директора и ИНН через DaData."""
    key = os.environ.get("DADATA_API_KEY", "")
    if not key:
        return None, None
    data = json.dumps({"query": name, "count": 1}).encode()
    req = urllib.request.Request(
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party",
        data=data,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Token {key}",
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            result = json.loads(r.read().decode())
        suggestions = result.get("suggestions", [])
        if not suggestions:
            return None, None
        d = suggestions[0].get("data", {})
        inn = d.get("inn")
        mgmt = d.get("management") or {}
        director = mgmt.get("name")
        return inn, director
    except Exception:
        return None, None


def parse_contacts(contact_groups):
    """Извлекает телефон и сайт из contact_groups 2ГИС."""
    phone, website = "", ""
    for group in (contact_groups or []):
        for contact in (group.get("contacts") or []):
            ctype = contact.get("type", "")
            val = contact.get("value", "")
            if ctype == "phone" and not phone:
                phone = val
            elif ctype == "website" and not website:
                website = val
    return phone, website


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    # GET /cities — список городов
    if method == "GET" and params.get("action") == "cities":
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"cities": CITIES}, ensure_ascii=False)}

    # GET /list — список компаний из БД
    if method == "GET" and params.get("action") == "list":
        city = params.get("city", "")
        limit = int(params.get("limit", "100"))
        offset = int(params.get("offset", "0"))
        conn = get_db()
        cur = conn.cursor()
        where = "WHERE city = %s" if city else ""
        args = (city, limit, offset) if city else (limit, offset)
        cur.execute(
            f"""SELECT id, city, name, phone, email, address, website, director_name, inn, created_at
                FROM {SCHEMA}.parsed_companies
                {where}
                ORDER BY city, name
                LIMIT %s OFFSET %s""",
            args
        )
        rows = cur.fetchall()
        cols = ["id", "city", "name", "phone", "email", "address", "website", "director_name", "inn", "created_at"]
        companies = []
        for r in rows:
            row = dict(zip(cols, r))
            if row["created_at"]:
                row["created_at"] = row["created_at"].isoformat()
            companies.append(row)

        cur.execute(
            f"SELECT COUNT(*) FROM {SCHEMA}.parsed_companies {where}",
            (city,) if city else ()
        )
        total = cur.fetchone()[0]
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"companies": companies, "total": total}, ensure_ascii=False)}

    # GET /stats — статистика по городам
    if method == "GET" and params.get("action") == "stats":
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT city, COUNT(*) as cnt,
                       SUM(CASE WHEN director_name IS NOT NULL AND director_name != '' THEN 1 ELSE 0 END) as enriched
                FROM {SCHEMA}.parsed_companies
                GROUP BY city ORDER BY cnt DESC"""
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        stats = [{"city": r[0], "count": r[1], "enriched": r[2]} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"stats": stats}, ensure_ascii=False)}

    # GET /export — выгрузка CSV
    if method == "GET" and params.get("action") == "export":
        if not check_admin(event):
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Forbidden"})}
        city = params.get("city", "")
        conn = get_db()
        cur = conn.cursor()
        where = "WHERE city = %s" if city else ""
        cur.execute(
            f"""SELECT city, name, phone, email, address, website, director_name, inn
                FROM {SCHEMA}.parsed_companies {where}
                ORDER BY city, name""",
            (city,) if city else ()
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Город", "Название", "Телефон", "Email", "Адрес", "Сайт", "Директор", "ИНН"])
        for r in rows:
            writer.writerow(r)

        csv_bytes = output.getvalue().encode("utf-8-sig")
        csv_b64 = base64.b64encode(csv_bytes).decode()
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "text/csv"},
            "body": csv_b64,
            "isBase64Encoded": True,
        }

    # Все изменяющие операции — только админ
    if not check_admin(event):
        return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Forbidden"})}

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    # POST /parse — запуск парсинга по городу
    if method == "POST" and body.get("action") == "parse":
        city_name = body.get("city", "")
        city_obj = next((c for c in CITIES if c["name"] == city_name), None)
        if not city_obj:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Неизвестный город"})}

        city_id = city_obj["id"]
        collected = {}  # inn/name -> данные, дедупликация

        for query in SEARCH_QUERIES:
            for page in range(1, 5):  # до 4 страниц = 200 результатов на запрос
                try:
                    data = fetch_2gis(city_id, query, page)
                except Exception:
                    break

                items = data.get("result", {}).get("items", [])
                if not items:
                    break

                for item in items:
                    name = item.get("name", "").strip()
                    if not name:
                        continue

                    phone, website = parse_contacts(item.get("contact_groups"))
                    address = item.get("address", {}).get("name", "") if item.get("address") else ""
                    rubrics = ", ".join(r.get("name", "") for r in (item.get("rubrics") or []))

                    key = name.lower()
                    if key not in collected:
                        collected[key] = {
                            "name": name,
                            "phone": phone,
                            "website": website,
                            "address": address,
                            "rubric": rubrics,
                        }

                time.sleep(0.2)

        # Сохраняем в БД (пропускаем дубли по city+name)
        conn = get_db()
        cur = conn.cursor()
        inserted = 0
        for item in collected.values():
            cur.execute(
                f"""INSERT INTO {SCHEMA}.parsed_companies (city, name, phone, address, website, rubric)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING""",
                (city_name, item["name"], item["phone"], item["address"], item["website"], item["rubric"])
            )
            if cur.rowcount > 0:
                inserted += 1
        conn.commit()
        cur.close()
        conn.close()

        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"inserted": inserted, "found": len(collected)}, ensure_ascii=False)}

    # POST /enrich — обогащение ФИО директора через DaData
    if method == "POST" and body.get("action") == "enrich":
        city = body.get("city", "")
        conn = get_db()
        cur = conn.cursor()
        where = "WHERE (director_name IS NULL OR director_name = '') AND city = %s" if city else "WHERE director_name IS NULL OR director_name = ''"
        cur.execute(
            f"SELECT id, name FROM {SCHEMA}.parsed_companies {where} LIMIT 50",
            (city,) if city else ()
        )
        rows = cur.fetchall()

        enriched = 0
        for row_id, name in rows:
            inn, director = enrich_dadata(name)
            if inn or director:
                cur.execute(
                    f"UPDATE {SCHEMA}.parsed_companies SET inn=%s, director_name=%s, enriched_at=NOW() WHERE id=%s",
                    (inn, director, row_id)
                )
                enriched += 1
            time.sleep(0.1)

        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"enriched": enriched, "total": len(rows)}, ensure_ascii=False)}

    # DELETE — очистить данные по городу
    if method == "DELETE":
        city = body.get("city", "") or params.get("city", "")
        conn = get_db()
        cur = conn.cursor()
        if city:
            cur.execute(f"DELETE FROM {SCHEMA}.parsed_companies WHERE city = %s", (city,))
        else:
            cur.execute(f"DELETE FROM {SCHEMA}.parsed_companies")
        deleted = cur.rowcount
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"deleted": deleted}, ensure_ascii=False)}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
