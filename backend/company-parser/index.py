"""
Парсер строительных компаний (ремонт квартир) через Яндекс Геопоиск API.
Ищет компании по городам, обогащает данные через DaData. Выгрузка в CSV.
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
    {"name": "Москва",          "ll": "37.617644,55.755819", "spn": "0.5,0.5"},
    {"name": "Санкт-Петербург", "ll": "30.315868,59.939095", "spn": "0.5,0.5"},
    {"name": "Новосибирск",     "ll": "82.934600,54.983200", "spn": "0.4,0.4"},
    {"name": "Екатеринбург",    "ll": "60.612200,56.851900", "spn": "0.4,0.4"},
    {"name": "Казань",          "ll": "49.122100,55.788700", "spn": "0.4,0.4"},
    {"name": "Нижний Новгород", "ll": "44.002000,56.326900", "spn": "0.4,0.4"},
    {"name": "Челябинск",       "ll": "61.429100,55.164400", "spn": "0.4,0.4"},
    {"name": "Самара",          "ll": "50.160600,53.195900", "spn": "0.4,0.4"},
    {"name": "Омск",            "ll": "73.368600,54.988500", "spn": "0.4,0.4"},
    {"name": "Ростов-на-Дону",  "ll": "39.712500,47.235700", "spn": "0.4,0.4"},
    {"name": "Уфа",             "ll": "55.972100,54.738800", "spn": "0.4,0.4"},
    {"name": "Красноярск",      "ll": "92.893200,56.015300", "spn": "0.4,0.4"},
    {"name": "Пермь",           "ll": "56.229100,58.010500", "spn": "0.4,0.4"},
    {"name": "Воронеж",         "ll": "39.184300,51.672000", "spn": "0.4,0.4"},
]

SEARCH_QUERIES = [
    "ремонт квартир",
    "строительная компания ремонт",
    "отделочные работы",
]

YANDEX_GEOSEARCH_URL = "https://search-maps.yandex.ru/v1/"


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def check_admin(event):
    h = event.get("headers") or {}
    return (h.get("X-Admin-Token") or h.get("x-admin-token", "")) == ADMIN_TOKEN


def fetch_yandex(query, ll, spn, skip, api_key):
    """Поиск организаций через Яндекс Геопоиск API."""
    params = urllib.parse.urlencode({
        "text": query,
        "ll": ll,
        "spn": spn,
        "type": "biz",
        "lang": "ru_RU",
        "results": 50,
        "skip": skip,
        "apikey": api_key,
    })
    url = f"{YANDEX_GEOSEARCH_URL}?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def extract_company(feature):
    """Извлекает данные компании из GeoJSON feature Яндекс Геопоиска."""
    props = feature.get("properties", {})
    meta = props.get("CompanyMetaData", {})

    name = meta.get("name", "").strip()
    if not name:
        return None

    address = meta.get("address", "")
    phone = ""
    email = ""
    website = ""

    for p in meta.get("Phones", []):
        if not phone:
            phone = p.get("formatted", "")

    for link in meta.get("Links", []):
        href = link.get("href", "")
        if not email and "mailto:" in href:
            email = href.replace("mailto:", "").strip()
        elif not website and href.startswith("http"):
            website = href.strip()

    rubrics = ", ".join(r.get("name", "") for r in meta.get("Categories", []))

    return {
        "name": name,
        "phone": phone,
        "email": email,
        "website": website,
        "address": address,
        "rubric": rubrics,
    }


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


def handler(event: dict, context) -> dict:
    """Парсер компаний через Яндекс Геопоиск + обогащение данных через DaData."""
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

        api_key = os.environ.get("YANDEX_GEOSEARCH_KEY", "")
        if not api_key:
            return {"statusCode": 500, "headers": CORS, "body": json.dumps({"error": "YANDEX_GEOSEARCH_KEY не настроен"})}

        ll = city_obj["ll"]
        spn = city_obj["spn"]
        collected = {}
        debug_info = []

        for query in SEARCH_QUERIES:
            for skip in range(0, 200, 50):
                try:
                    data = fetch_yandex(query, ll, spn, skip, api_key)
                    features = data.get("features", [])
                    debug_info.append(f"q={query} skip={skip} got={len(features)}")
                    if not features:
                        break
                    for feature in features:
                        company = extract_company(feature)
                        if not company:
                            continue
                        key = company["name"].lower()
                        if key not in collected:
                            collected[key] = company
                    if len(features) < 50:
                        break
                    time.sleep(0.3)
                except Exception as e:
                    debug_info.append(f"error q={query} skip={skip}: {str(e)[:120]}")
                    break

        conn = get_db()
        cur = conn.cursor()
        inserted = 0
        for item in collected.values():
            cur.execute(
                f"""INSERT INTO {SCHEMA}.parsed_companies (city, name, phone, email, address, website, rubric)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING""",
                (city_name, item["name"], item["phone"], item["email"],
                 item["address"], item["website"], item.get("rubric", ""))
            )
            if cur.rowcount > 0:
                inserted += 1
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"inserted": inserted, "found": len(collected), "debug": debug_info}, ensure_ascii=False)}

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
