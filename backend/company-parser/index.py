"""
Парсер строительных компаний (ремонт квартир) через orgpage.ru.
Собирает компании по городам, обогащает данные через DaData. Выгрузка в CSV.
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

# slug города на orgpage.ru → название
CITIES = [
    {"name": "Москва",          "slug": "moskva"},
    {"name": "Санкт-Петербург", "slug": "sankt-peterburg"},
    {"name": "Новосибирск",     "slug": "novosibirsk"},
    {"name": "Екатеринбург",    "slug": "ekaterinburg"},
    {"name": "Казань",          "slug": "kazan"},
    {"name": "Нижний Новгород", "slug": "nizhnij-novgorod"},
    {"name": "Челябинск",       "slug": "chelyabinsk"},
    {"name": "Самара",          "slug": "samara"},
    {"name": "Омск",            "slug": "omsk"},
    {"name": "Ростов-на-Дону",  "slug": "rostov-na-donu"},
    {"name": "Уфа",             "slug": "ufa"},
    {"name": "Красноярск",      "slug": "krasnoyarsk"},
    {"name": "Пермь",           "slug": "perm"},
    {"name": "Воронеж",         "slug": "voronezh"},
]

CATEGORY_SLUG = "%D1%80%D0%B5%D0%BC%D0%BE%D0%BD%D1%82_%D0%BA%D0%B2%D0%B0%D1%80%D1%82%D0%B8%D1%80"  # ремонт_квартир

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9",
}


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def check_admin(event):
    h = event.get("headers") or {}
    return (h.get("X-Admin-Token") or h.get("x-admin-token", "")) == ADMIN_TOKEN


def http_get_html(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", errors="ignore")


def clean(s):
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"&amp;", "&", s)
    s = re.sub(r"&nbsp;", " ", s)
    s = re.sub(r"&#\d+;", "", s)
    return re.sub(r"\s+", " ", s).strip()


def parse_orgpage_list(city_slug, page):
    """Парсит страницу списка компаний на orgpage.ru."""
    if page == 1:
        url = f"https://www.orgpage.ru/{city_slug}/{CATEGORY_SLUG}/"
    else:
        url = f"https://www.orgpage.ru/{city_slug}/{CATEGORY_SLUG}/?page={page}"

    html = http_get_html(url)
    print(f"[ORGPAGE] city={city_slug} page={page} html_len={len(html)}")

    companies = []

    # Ищем блоки компаний — div с классом содержащим "org" или "company" или "item"
    # Orgpage использует структуру: <div class="org-item"> или <article>
    # Парсим ссылки на компании вида /city/slug-компании/
    # Паттерн ссылок на компании: href="/{city_slug}/название-компании-цифры/"
    company_links = re.findall(
        rf'href="(/{city_slug}/[^/"]+/)"[^>]*>',
        html
    )
    # Убираем служебные ссылки (категории, пагинация)
    seen = set()
    for href in company_links:
        # Исключаем саму категорию и страницы пагинации
        if CATEGORY_SLUG.lower() in urllib.parse.unquote(href).lower():
            continue
        if "page=" in href or href == f"/{city_slug}/":
            continue
        if href not in seen:
            seen.add(href)
            companies.append(f"https://www.orgpage.ru{href}")

    # Проверяем наличие следующей страницы
    has_next = bool(re.search(rf'/{city_slug}/{CATEGORY_SLUG}/\?page={page + 1}', html))

    print(f"[ORGPAGE] found {len(companies)} company links, has_next={has_next}")
    print(f"[ORGPAGE] sample html snippet: {html[2000:3000]}")

    return companies, has_next


def parse_orgpage_company(url):
    """Парсит страницу отдельной компании на orgpage.ru."""
    html = http_get_html(url)
    result = {"url": url}

    # Название
    title_m = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
    if not title_m:
        title_m = re.search(r'<meta[^>]+property="og:title"[^>]+content="([^"]+)"', html)
    if title_m:
        result["name"] = clean(title_m.group(1)).split(" — ")[0].split(" | ")[0].strip()

    # Телефон
    tel_links = re.findall(r'href="tel:([^"]+)"', html)
    if tel_links:
        result["phone"] = tel_links[0].strip()
    else:
        ph = re.findall(r'(?<!\d)(\+7[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2})(?!\d)', html)
        result["phone"] = ph[0].strip() if ph else ""

    # Email
    emails = re.findall(r'href="mailto:([^"]+)"', html)
    if not emails:
        emails = re.findall(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', html)
        skip = ["orgpage", "example", "sentry", "noreply", "support@", ".png", ".jpg"]
        emails = [e for e in emails if not any(x in e.lower() for x in skip)]
    result["email"] = emails[0] if emails else ""

    # Сайт
    site_m = re.search(r'href="(https?://(?!(?:www\.)?orgpage\.ru)[^"]{4,})"', html)
    result["website"] = site_m.group(1) if site_m else ""

    # Адрес
    addr_patterns = [
        r'itemprop="streetAddress"[^>]*>([^<]+)<',
        r'"address"[^:]*:[^"]*"([^"]{10,})"',
        r'г\.\s*[А-Яа-я][^<"]{5,80}',
    ]
    for pat in addr_patterns:
        addr_m = re.search(pat, html)
        if addr_m:
            result["address"] = clean(addr_m.group(1) if addr_m.lastindex else addr_m.group(0))
            break

    return result


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
    """Парсер компаний с orgpage.ru + обогащение через DaData."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    # GET cities
    if method == "GET" and params.get("action") == "cities":
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"cities": [{"name": c["name"], "id": c["slug"]} for c in CITIES]}, ensure_ascii=False)}

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

        city_slug = city_obj["slug"]
        collected = {}
        debug_info = []

        for page in range(1, 6):
            try:
                company_urls, has_next = parse_orgpage_list(city_slug, page)
                debug_info.append(f"page={page} urls={len(company_urls)}")
                if not company_urls:
                    break
                for comp_url in company_urls[:20]:
                    try:
                        detail = parse_orgpage_company(comp_url)
                        name = detail.get("name", "").strip()
                        if not name:
                            continue
                        key = name.lower()
                        if key not in collected:
                            collected[key] = detail
                        time.sleep(0.3)
                    except Exception as e:
                        debug_info.append(f"detail_error {comp_url}: {str(e)[:80]}")
                if not has_next:
                    break
                time.sleep(0.5)
            except Exception as e:
                debug_info.append(f"page_error p={page}: {str(e)[:100]}")
                break

        conn = get_db()
        cur = conn.cursor()
        inserted = 0
        for item in collected.values():
            cur.execute(
                f"""INSERT INTO {SCHEMA}.parsed_companies (city, name, phone, email, address, website)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING""",
                (city_name, item.get("name", ""), item.get("phone", ""),
                 item.get("email", ""), item.get("address", ""), item.get("website", ""))
            )
            if cur.rowcount > 0:
                inserted += 1
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"inserted": inserted, "found": len(collected), "debug": debug_info[:20]}, ensure_ascii=False)}

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
