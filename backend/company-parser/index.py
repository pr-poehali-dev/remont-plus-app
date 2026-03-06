"""
Парсер строительных компаний (ремонт квартир) через 2ГИС Places API 3.0.
Сначала получает city_id через Regions API, затем ищет компании с фильтрацией по городу.
Обогащает данные ФИО директора через DaData. Выгрузка в CSV.
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

# Координаты центров городов для параметра location в 2ГИС API (lon,lat)
CITIES = [
    {"name": "Москва",          "location": "37.6173,55.7558"},
    {"name": "Санкт-Петербург", "location": "30.3141,59.9386"},
    {"name": "Новосибирск",     "location": "82.9346,54.9833"},
    {"name": "Екатеринбург",    "location": "60.6122,56.8519"},
    {"name": "Казань",          "location": "49.1221,55.7887"},
    {"name": "Нижний Новгород", "location": "44.0020,56.3269"},
    {"name": "Челябинск",       "location": "61.4291,55.1644"},
    {"name": "Самара",          "location": "50.1606,53.1959"},
    {"name": "Омск",            "location": "73.3686,54.9885"},
    {"name": "Ростов-на-Дону",  "location": "39.7125,47.2357"},
    {"name": "Уфа",             "location": "55.9721,54.7388"},
    {"name": "Красноярск",      "location": "92.8932,56.0153"},
    {"name": "Пермь",           "location": "56.2291,58.0105"},
    {"name": "Воронеж",         "location": "39.1843,51.6720"},
]

SEARCH_QUERIES = [
    "ремонт квартир",
    "строительная компания ремонт",
    "отделочные работы",
    "ремонтно-строительная компания",
]


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def check_admin(event):
    h = event.get("headers") or {}
    return (h.get("X-Admin-Token") or h.get("x-admin-token", "")) == ADMIN_TOKEN


def http_get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())


def resolve_city_id(city_name, api_key):
    """Получает реальный city_id из 2ГИС через поиск по городу в /3.0/items."""
    params = urllib.parse.urlencode({
        "q": city_name,
        "type": "adm_div.city",
        "fields": "items.point",
        "key": api_key,
    })
    url = f"https://catalog.api.2gis.com/3.0/items?{params}"
    try:
        data = http_get(url)
        items = data.get("result", {}).get("items", [])
        for item in items:
            if item.get("type") in ("adm_div.city", "adm_div.settlement"):
                raw_id = item.get("id", "")
                # city_id — часть id до знака "_"
                return raw_id.split("_")[0]
    except Exception:
        pass
    return None


def fetch_2gis(query, location, page, api_key):
    """Поиск организаций через 2ГИС Places API 3.0 — фильтрация по координатам города."""
    # Строим URL вручную без urlencode — 2ГИС не принимает %XX для кириллицы в q
    url = (
        f"https://catalog.api.2gis.com/3.0/items"
        f"?q={urllib.parse.quote(query, safe='')}"
        f"&location={location}"
        f"&page={page}"
        f"&page_size=10"
        f"&key={api_key}"
    )
    return http_get(url)


def enrich_dadata(name):
    """Поиск ФИО директора и ИНН через DaData."""
    key = os.environ.get("DADATA_API_KEY", "")
    if not key:
        return None, None
    data = json.dumps({"query": name, "count": 1}).encode()
    req = urllib.request.Request(
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party",
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
            elif ctype in ("website", "url") and not website:
                website = val
    return phone, website


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    # GET cities
    if method == "GET" and params.get("action") == "cities":
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"cities": [{"name": c["name"], "id": c["location"]} for c in CITIES]}, ensure_ascii=False)}

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
                       SUM(CASE WHEN director_name IS NOT NULL AND director_name != '' THEN 1 ELSE 0 END) as enriched
                FROM {SCHEMA}.parsed_companies GROUP BY city ORDER BY cnt DESC"""
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        stats = [{"city": r[0], "count": r[1], "enriched": r[2]} for r in rows]
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

        api_key = os.environ.get("DGIS_API_KEY", "")
        location = city_obj["location"]
        collected = {}
        debug_info = []

        for query in SEARCH_QUERIES:
            for page in range(1, 6):
                try:
                    data = fetch_2gis(query, location, page, api_key)
                    print(f"[2GIS] q={query} p={page} raw_keys={list(data.keys())} meta={data.get('meta')} result_keys={list((data.get('result') or {}).keys())}")
                    meta_code = data.get("meta", {}).get("code", 200)
                    if meta_code != 200:
                        err_msg = data.get("meta", {}).get("error", {}).get("message", "")
                        debug_info.append(f"meta_code={meta_code} q={query} p={page} err={err_msg}")
                        print(f"[2GIS ERROR] meta_code={meta_code} err={err_msg}")
                        break
                    items = (data.get("result") or {}).get("items", [])
                    if not items:
                        debug_info.append(f"empty q={query} p={page} result={data.get('result')}")
                        print(f"[2GIS EMPTY] result={data.get('result')}")
                        break
                    debug_info.append(f"got {len(items)} items q={query} p={page} first_type={items[0].get('type')} first_name={items[0].get('name')}")
                    for item in items:
                        # принимаем branch и филиалы
                        itype = item.get("type", "")
                        if itype not in ("branch", "organization"):
                            continue
                        name = item.get("name", "").strip()
                        if not name:
                            continue
                        phone, website = parse_contacts(item.get("contact_groups"))
                        address = item.get("address_name", "") or (item.get("address") or {}).get("name", "")
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
                except Exception as e:
                    debug_info.append(f"error q={query} p={page}: {str(e)[:100]}")
                    break
                time.sleep(0.3)

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
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"inserted": inserted, "found": len(collected), "debug": debug_info[:10]}, ensure_ascii=False)}

    # POST enrich
    if method == "POST" and body.get("action") == "enrich":
        city = body.get("city", "")
        conn = get_db()
        cur = conn.cursor()
        if city:
            cur.execute(
                f"SELECT id, name FROM {SCHEMA}.parsed_companies WHERE (director_name IS NULL OR director_name = '') AND city = %s LIMIT 50",
                (city,)
            )
        else:
            cur.execute(f"SELECT id, name FROM {SCHEMA}.parsed_companies WHERE director_name IS NULL OR director_name = '' LIMIT 50")
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