"""
Парсер строительных компаний через DaData Suggest API.
Ищет компании по ОКВЭД 43 (строительство/отделка) и городу, сохраняет в БД.
"""
import json
import os
import time
import csv
import io
import base64
import re
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

# Коды регионов КЛАДР для фильтрации по городу
CITIES = [
    {"name": "Москва",          "region": "77", "query_prefix": ""},
    {"name": "Санкт-Петербург", "region": "78", "query_prefix": ""},
    {"name": "Новосибирск",     "region": "54", "query_prefix": "Новосибирск"},
    {"name": "Екатеринбург",    "region": "66", "query_prefix": "Екатеринбург"},
    {"name": "Казань",          "region": "16", "query_prefix": "Казань"},
    {"name": "Нижний Новгород", "region": "52", "query_prefix": "Нижний Новгород"},
    {"name": "Челябинск",       "region": "74", "query_prefix": "Челябинск"},
    {"name": "Самара",          "region": "63", "query_prefix": "Самара"},
    {"name": "Омск",            "region": "55", "query_prefix": "Омск"},
    {"name": "Ростов-на-Дону",  "region": "61", "query_prefix": "Ростов-на-Дону"},
    {"name": "Уфа",             "region": "02", "query_prefix": "Уфа"},
    {"name": "Красноярск",      "region": "24", "query_prefix": "Красноярск"},
    {"name": "Пермь",           "region": "59", "query_prefix": "Пермь"},
    {"name": "Воронеж",         "region": "36", "query_prefix": "Воронеж"},
]

# ОКВЭД коды: строительство, отделка, ремонт
OKVED_CODES = ["43.3", "43.31", "43.32", "43.33", "43.34", "43.39", "41.20", "43.1"]

# Запросы для поиска по названию
SEARCH_QUERIES = [
    "ремонт квартир",
    "ремонтно-строительная",
    "отделочные работы",
    "строительная компания",
    "ремонт и отделка",
]

DADATA_SUGGEST_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party"
DADATA_FIND_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party"

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", re.ASCII)
EMAIL_EXCLUDE = re.compile(r"(example|test|noreply|no-reply|support@sentry|yandex-team|@2gis|@dadata|\.png|\.jpg|\.gif|@w3)", re.I)


def scrape_email_from_site(url: str) -> str:
    if not url:
        return ""
    if not url.startswith("http"):
        url = "https://" + url
    try:
        req = urllib.request.Request(
            url, headers={"User-Agent": "Mozilla/5.0", "Accept": "text/html"}
        )
        with urllib.request.urlopen(req, timeout=8) as r:
            raw = r.read(80000).decode("utf-8", errors="ignore")
        # mailto: в первую очередь
        mailto = re.findall(r'mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})', raw)
        for em in mailto:
            if not EMAIL_EXCLUDE.search(em):
                return em.lower()
        # обычный текст
        found = EMAIL_RE.findall(raw)
        for em in found:
            if not EMAIL_EXCLUDE.search(em):
                return em.lower()
    except Exception:
        pass
    return ""


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def check_admin(event):
    h = event.get("headers") or {}
    return (h.get("X-Admin-Token") or h.get("x-admin-token", "")) == ADMIN_TOKEN


def dadata_suggest(query, region_code, okved, api_key):
    """Поиск компаний через DaData Suggest с фильтром по региону и ОКВЭД."""
    payload = json.dumps({
        "query": query,
        "count": 20,
        "filters": [
            {"status": ["ACTIVE"]},
            {"type": ["LEGAL"]},
            {"okved": okved},
            {"region_code": [region_code]},
        ]
    }).encode("utf-8")
    req = urllib.request.Request(
        DADATA_SUGGEST_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Token {api_key}",
        }
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode())


def extract_company(suggestion):
    """Извлекает данные компании из ответа DaData."""
    d = suggestion.get("data", {})
    name = suggestion.get("value", "").strip()
    if not name:
        return None

    address = (d.get("address") or {}).get("value", "")
    inn = d.get("inn", "")
    ogrn = d.get("ogrn", "")
    kpp = d.get("kpp", "")

    mgmt = d.get("management") or {}
    director = mgmt.get("name", "")

    state = d.get("state") or {}
    status = state.get("status", "")

    okved = d.get("okved", "")

    return {
        "name": name,
        "inn": inn,
        "ogrn": ogrn,
        "kpp": kpp,
        "address": address,
        "director": director,
        "okved": okved,
        "status": status,
    }


def handler(event: dict, context) -> dict:
    """Сборщик компаний по ОКВЭД через DaData Suggest (ЕГРЮЛ)."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    # GET cities
    if method == "GET" and params.get("action") == "cities":
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"cities": [{"name": c["name"], "id": c["name"]} for c in CITIES]}, ensure_ascii=False),
        }

    # GET list
    if method == "GET" and params.get("action") == "list":
        city = params.get("city", "")
        limit = int(params.get("limit", "100"))
        offset = int(params.get("offset", "0"))
        conn = get_db()
        cur = conn.cursor()
        if city:
            cur.execute(
                f"""SELECT id, city, name, phone, email, address, website, director_name, inn, created_at
                    FROM {SCHEMA}.parsed_companies WHERE city = %s
                    ORDER BY city, name LIMIT %s OFFSET %s""",
                (city, limit, offset)
            )
        else:
            cur.execute(
                f"""SELECT id, city, name, phone, email, address, website, director_name, inn, created_at
                    FROM {SCHEMA}.parsed_companies
                    ORDER BY city, name LIMIT %s OFFSET %s""",
                (limit, offset)
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
            f"SELECT COUNT(*) FROM {SCHEMA}.parsed_companies" + (" WHERE city = %s" if city else ""),
            (city,) if city else ()
        )
        total = cur.fetchone()[0]
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"companies": companies, "total": total}, ensure_ascii=False)}

    # GET stats
    if method == "GET" and params.get("action") == "stats":
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT city, COUNT(*) as cnt,
                       SUM(CASE WHEN director_name IS NOT NULL AND director_name != '' THEN 1 ELSE 0 END) as enriched,
                       SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as with_email
                FROM {SCHEMA}.parsed_companies GROUP BY city ORDER BY cnt DESC"""
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        stats = [{"city": r[0], "count": r[1], "enriched": r[2], "with_email": r[3]} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"stats": stats}, ensure_ascii=False)}

    # GET export CSV
    if method == "GET" and params.get("action") == "export":
        if not check_admin(event):
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Forbidden"})}
        city = params.get("city", "")
        conn = get_db()
        cur = conn.cursor()
        if city:
            cur.execute(
                f"SELECT city, name, phone, email, address, website, director_name, inn FROM {SCHEMA}.parsed_companies WHERE city = %s ORDER BY city, name",
                (city,)
            )
        else:
            cur.execute(f"SELECT city, name, phone, email, address, website, director_name, inn FROM {SCHEMA}.parsed_companies ORDER BY city, name")
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
        return {"statusCode": 200, "headers": {**CORS, "Content-Type": "text/csv"}, "body": csv_b64, "isBase64Encoded": True}

    # Защита для изменяющих операций
    if not check_admin(event):
        return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Forbidden"})}

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    # POST parse
    if method == "POST" and body.get("action") == "parse":
        city_name = body.get("city", "")
        city_obj = next((c for c in CITIES if c["name"] == city_name), None)
        if not city_obj:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Неизвестный город"})}

        api_key = os.environ.get("DADATA_API_KEY", "")
        if not api_key:
            return {"statusCode": 500, "headers": CORS, "body": json.dumps({"error": "DADATA_API_KEY не настроен"})}

        region = city_obj["region"]
        query_prefix = city_obj["query_prefix"]
        collected = {}
        debug_info = []

        # Перебираем запросы × ОКВЭД коды
        for query in SEARCH_QUERIES:
            full_query = f"{query_prefix} {query}".strip() if query_prefix else query
            for okved in OKVED_CODES:
                try:
                    data = dadata_suggest(full_query, region, okved, api_key)
                    suggestions = data.get("suggestions", [])
                    debug_info.append(f"q={full_query} okved={okved} got={len(suggestions)}")
                    for s in suggestions:
                        company = extract_company(s)
                        if not company or company["status"] != "ACTIVE":
                            continue
                        key = company["inn"] or company["name"].lower()
                        if key not in collected:
                            collected[key] = company
                    time.sleep(0.1)
                except Exception as e:
                    debug_info.append(f"error q={full_query} okved={okved}: {str(e)[:100]}")

        conn = get_db()
        cur = conn.cursor()
        inserted = 0
        for item in collected.values():
            cur.execute(
                f"""INSERT INTO {SCHEMA}.parsed_companies (city, name, address, director_name, inn)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING""",
                (city_name, item["name"], item["address"], item["director"], item["inn"])
            )
            if cur.rowcount > 0:
                inserted += 1
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "inserted": inserted,
            "found": len(collected),
            "debug": debug_info
        }, ensure_ascii=False)}

    # POST enrich — дополняем телефон/email/сайт через DaData + парсинг сайта
    if method == "POST" and body.get("action") == "enrich":
        city = body.get("city", "")
        api_key = os.environ.get("DADATA_API_KEY", "")
        conn = get_db()
        cur = conn.cursor()
        if city:
            cur.execute(
                f"SELECT id, name, inn, website FROM {SCHEMA}.parsed_companies WHERE (email IS NULL OR email = '') AND inn IS NOT NULL AND inn != '' AND city = %s LIMIT 50",
                (city,)
            )
        else:
            cur.execute(f"SELECT id, name, inn, website FROM {SCHEMA}.parsed_companies WHERE (email IS NULL OR email = '') AND inn IS NOT NULL AND inn != '' LIMIT 50")
        rows = cur.fetchall()
        enriched = 0
        for row_id, name, inn, existing_website in rows:
            phone, email, website = "", "", existing_website or ""
            # 1. DaData findById
            try:
                payload = json.dumps({"query": inn, "count": 1}).encode()
                req = urllib.request.Request(
                    DADATA_FIND_URL,
                    data=payload,
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": f"Token {api_key}",
                    }
                )
                with urllib.request.urlopen(req, timeout=10) as r:
                    result = json.loads(r.read().decode())
                suggestions = result.get("suggestions", [])
                if suggestions:
                    d = suggestions[0].get("data", {})
                    phones = d.get("phones") or []
                    emails = d.get("emails") or []
                    sites = d.get("sites") or []
                    phone = phones[0].get("value", "") if phones else ""
                    email = emails[0].get("value", "") if emails else ""
                    if not website:
                        website = sites[0].get("value", "") if sites else ""
                time.sleep(0.15)
            except Exception:
                pass
            # 2. Парсим сайт если email не нашли в DaData, но есть сайт
            if not email and website:
                email = scrape_email_from_site(website)
            # 3. Сохраняем если есть что-то новое
            if phone or email or website:
                cur.execute(
                    f"""UPDATE {SCHEMA}.parsed_companies SET
                        phone = CASE WHEN %s != '' THEN %s ELSE phone END,
                        email = CASE WHEN %s != '' THEN %s ELSE email END,
                        website = CASE WHEN %s != '' THEN %s ELSE website END,
                        enriched_at = NOW()
                    WHERE id = %s""",
                    (phone, phone, email, email, website, website, row_id)
                )
                enriched += 1
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"enriched": enriched, "total": len(rows)}, ensure_ascii=False)}

    # DELETE
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