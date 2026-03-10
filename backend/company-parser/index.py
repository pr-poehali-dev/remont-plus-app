"""
Парсер строительных компаний через DaData Suggest API.
Ищет компании по ОКВЭД 43 (строительство/отделка) и городу, сохраняет в БД.
Обогащает контакты: парсит сайты компаний (email, телефон) и ищет сайты через Яндекс по ИНН.
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

CITIES = [
    # Города-миллионники
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
    # Города от 500 000 до 1 000 000 жителей
    {"name": "Краснодар",       "region": "23", "query_prefix": "Краснодар"},
    {"name": "Саратов",         "region": "64", "query_prefix": "Саратов"},
    {"name": "Тюмень",          "region": "72", "query_prefix": "Тюмень"},
    {"name": "Тольятти",        "region": "63", "query_prefix": "Тольятти"},
    {"name": "Ижевск",          "region": "18", "query_prefix": "Ижевск"},
    {"name": "Барнаул",         "region": "22", "query_prefix": "Барнаул"},
    {"name": "Ульяновск",       "region": "73", "query_prefix": "Ульяновск"},
    {"name": "Иркутск",         "region": "38", "query_prefix": "Иркутск"},
    {"name": "Хабаровск",       "region": "27", "query_prefix": "Хабаровск"},
    {"name": "Ярославль",       "region": "76", "query_prefix": "Ярославль"},
    {"name": "Владивосток",     "region": "25", "query_prefix": "Владивосток"},
    {"name": "Махачкала",       "region": "05", "query_prefix": "Махачкала"},
    {"name": "Томск",           "region": "70", "query_prefix": "Томск"},
    {"name": "Оренбург",        "region": "56", "query_prefix": "Оренбург"},
    {"name": "Кемерово",        "region": "42", "query_prefix": "Кемерово"},
    {"name": "Новокузнецк",     "region": "42", "query_prefix": "Новокузнецк"},
    {"name": "Рязань",          "region": "62", "query_prefix": "Рязань"},
    {"name": "Астрахань",       "region": "30", "query_prefix": "Астрахань"},
    {"name": "Пенза",           "region": "58", "query_prefix": "Пенза"},
    {"name": "Липецк",          "region": "48", "query_prefix": "Липецк"},
]

OKVED_CODES = ["43.3", "43.31", "43.32", "43.33", "43.34", "43.39", "41.20", "43.1"]

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
EMAIL_EXCLUDE = re.compile(
    r"(example|test|noreply|no-reply|support@sentry|yandex-team|@2gis|@dadata|\.png|\.jpg|\.gif|@w3|@mc\.|wixpress|sentry\.io|googleapis|cloudflare)",
    re.I
)

# Телефон: +7/8, скобки, дефисы, пробелы — минимум 10 цифр
PHONE_RE = re.compile(
    r'(?:(?:\+7|8)[\s\-\(]?(?:\d{3})[\s\-\)]?(?:\d{3})[\s\-]?(?:\d{2})[\s\-]?(?:\d{2}))',
    re.ASCII
)

# Контактные страницы для обхода
CONTACT_PATHS = [
    "/contacts", "/contact", "/kontakty", "/kontakt",
    "/о-нас", "/o-nas", "/about", "/about-us",
    "/pages/contacts", "/pages/contact",
    "/company/contacts", "/company",
    "/svyaz", "/svyaz-s-nami",
]

FAKE_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)

# Домены, которые не стоит считать сайтом компании
BAD_DOMAINS = re.compile(
    r"(yandex\.|google\.|bing\.|mail\.ru|vk\.com|ok\.ru|2gis\.|dadata\.|avito\.|hh\.ru|"
    r"headhunter\.|superjob\.|profi\.ru|zoon\.ru|flamp\.|tripadvisor\.|youdo\.|rabota\.|"
    r"gosuslugi\.|nalog\.|egrul\.|spark-interfax\.|rusprofile\.|list-org\.|"
    r"instagram\.|facebook\.|twitter\.|t\.me|telegram\.|youtube\.|rutube\.|"
    r"wikipedia\.|wikimedia\.|rbc\.ru|vedomosti\.|kommersant\.|ria\.ru|tass\.ru)",
    re.I
)


def _fetch_html(url: str, timeout: int = 8, max_bytes: int = 80000) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": FAKE_UA,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "ru-RU,ru;q=0.9",
        }
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read(max_bytes).decode("utf-8", errors="ignore")


def _extract_emails(html: str) -> list:
    results = []
    # mailto: — самый надёжный
    for em in re.findall(r'mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})', html):
        if not EMAIL_EXCLUDE.search(em):
            results.append(em.lower())
    # plain text
    for em in EMAIL_RE.findall(html):
        if not EMAIL_EXCLUDE.search(em) and em not in results:
            results.append(em.lower())
    return results


def _extract_phones(html: str) -> list:
    # tel: ссылки — самый надёжный источник
    tel_links = re.findall(r'tel:([\+\d][\d\s\-\(\)]{8,17})', html)
    results = []
    for raw in tel_links:
        digits = re.sub(r'\D', '', raw)
        if len(digits) >= 10:
            # нормализуем к +7XXXXXXXXXX
            if digits.startswith("8") and len(digits) == 11:
                digits = "7" + digits[1:]
            if len(digits) == 10:
                digits = "7" + digits
            normalized = f"+{digits}"
            if normalized not in results:
                results.append(normalized)
    # обычный текст — regex
    for raw in PHONE_RE.findall(html):
        digits = re.sub(r'\D', '', raw)
        if len(digits) >= 10:
            if digits.startswith("8") and len(digits) == 11:
                digits = "7" + digits[1:]
            if len(digits) == 10:
                digits = "7" + digits
            normalized = f"+{digits}"
            if normalized not in results:
                results.append(normalized)
    return results


def scrape_contacts_from_site(url: str) -> dict:
    """Парсит email и телефон с сайта: главная страница + контактные подстраницы."""
    if not url:
        return {"email": "", "phone": ""}
    if not url.startswith("http"):
        url = "https://" + url

    parsed = urllib.parse.urlparse(url)
    base = parsed.scheme + "://" + parsed.netloc

    emails_found = []
    phones_found = []

    # 1. Главная страница
    try:
        html = _fetch_html(url)
        emails_found.extend(_extract_emails(html))
        phones_found.extend(_extract_phones(html))
    except Exception:
        pass

    # 2. Контактные страницы — останавливаемся как только нашли и email и телефон
    if not emails_found or not phones_found:
        for path in CONTACT_PATHS:
            if emails_found and phones_found:
                break
            try:
                contact_url = base + path
                html = _fetch_html(contact_url, timeout=6)
                if not emails_found:
                    emails_found.extend(_extract_emails(html))
                if not phones_found:
                    phones_found.extend(_extract_phones(html))
                time.sleep(0.3)
            except Exception:
                continue

    email = emails_found[0] if emails_found else ""
    phone = phones_found[0] if phones_found else ""
    return {"email": email, "phone": phone}


def find_website_via_yandex(name: str, inn: str, city: str = "") -> str:
    """Ищет сайт компании через Яндекс по ИНН и названию."""
    queries = []
    if inn:
        queries.append(f'"{inn}" официальный сайт')
    if name:
        city_part = f" {city}" if city else ""
        queries.append(f'{name}{city_part} официальный сайт')

    for query in queries:
        try:
            encoded = urllib.parse.quote(query)
            req = urllib.request.Request(
                f"https://yandex.ru/search/?text={encoded}&lr=213",
                headers={
                    "User-Agent": FAKE_UA,
                    "Accept": "text/html",
                    "Accept-Language": "ru-RU,ru;q=0.9",
                }
            )
            with urllib.request.urlopen(req, timeout=10) as r:
                html = r.read(100000).decode("utf-8", errors="ignore")

            # Ищем ссылки результатов поиска
            links = re.findall(
                r'href="(https?://[^"]+)"',
                html
            )
            for link in links:
                p = urllib.parse.urlparse(link)
                domain = p.netloc.lstrip("www.")
                if not domain or "." not in domain or len(domain) < 4:
                    continue
                if BAD_DOMAINS.search(domain):
                    continue
                # Берём только корень сайта
                website = p.scheme + "://" + p.netloc
                return website

            time.sleep(0.7)
        except Exception:
            continue

    return ""


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def check_admin(event):
    h = event.get("headers") or {}
    return (h.get("X-Admin-Token") or h.get("x-admin-token", "")) == ADMIN_TOKEN


def dadata_suggest(query, region_code, okved, api_key):
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

    phones = d.get("phones") or []
    emails = d.get("emails") or []
    sites = d.get("sites") or []
    phone = phones[0].get("value", "") if phones else ""
    email = emails[0].get("value", "") if emails else ""
    website = sites[0].get("value", "") if sites else ""

    return {
        "name": name,
        "inn": inn,
        "ogrn": ogrn,
        "kpp": kpp,
        "address": address,
        "director": director,
        "okved": okved,
        "status": status,
        "phone": phone,
        "email": email,
        "website": website,
    }


def handler(event: dict, context) -> dict:
    """Сборщик компаний по ОКВЭД через DaData Suggest (ЕГРЮЛ). Обогащение: email/телефон с сайтов, поиск сайтов через Яндекс."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = {}
    if method in ("POST", "DELETE"):
        try:
            body = json.loads(event.get("body") or "{}")
        except Exception:
            pass

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
                       SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as with_email,
                       SUM(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) as with_phone,
                       SUM(CASE WHEN website IS NOT NULL AND website != '' THEN 1 ELSE 0 END) as with_website
                FROM {SCHEMA}.parsed_companies GROUP BY city ORDER BY cnt DESC"""
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        stats = [
            {"city": r[0], "count": r[1], "enriched": r[2], "with_email": r[3], "with_phone": r[4], "with_website": r[5]}
            for r in rows
        ]
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
            cur.execute(
                f"SELECT city, name, phone, email, address, website, director_name, inn FROM {SCHEMA}.parsed_companies ORDER BY city, name"
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
            "headers": {**CORS, "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=companies.csv"},
            "body": csv_b64,
            "isBase64Encoded": True,
        }

    # POST parse — запуск парсинга
    if method == "POST" and body.get("action") == "parse":
        if not check_admin(event):
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Forbidden"})}
        city_name = body.get("city", "")
        api_key = os.environ.get("DADATA_API_KEY", "")
        city_cfg = next((c for c in CITIES if c["name"] == city_name), None)
        if not city_cfg:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Unknown city"})}

        collected = {}
        debug_info = []
        for query_tpl in SEARCH_QUERIES:
            query = f"{city_cfg['query_prefix']} {query_tpl}".strip() if city_cfg["query_prefix"] else query_tpl
            for okved in OKVED_CODES:
                try:
                    result = dadata_suggest(query, city_cfg["region"], okved, api_key)
                    for s in result.get("suggestions", []):
                        item = extract_company(s)
                        if item and item["inn"] and item["inn"] not in collected:
                            collected[item["inn"]] = item
                    time.sleep(0.2)
                except Exception as e:
                    debug_info.append(f"err {query}/{okved}: {e}")
                    continue

        conn = get_db()
        cur = conn.cursor()
        inserted = 0
        for item in collected.values():
            inn = item["inn"]
            if inn:
                cur.execute(f"SELECT id FROM {SCHEMA}.parsed_companies WHERE inn = %s", (inn,))
                existing = cur.fetchone()
                if existing:
                    cur.execute(
                        f"""UPDATE {SCHEMA}.parsed_companies SET
                            phone = CASE WHEN %s != '' AND (phone IS NULL OR phone = '') THEN %s ELSE phone END,
                            email = CASE WHEN %s != '' AND (email IS NULL OR email = '') THEN %s ELSE email END,
                            website = CASE WHEN %s != '' AND (website IS NULL OR website = '') THEN %s ELSE website END
                            WHERE id = %s""",
                        (item.get("phone",""), item.get("phone",""),
                         item.get("email",""), item.get("email",""),
                         item.get("website",""), item.get("website",""),
                         existing[0])
                    )
                    continue
            cur.execute(
                f"""INSERT INTO {SCHEMA}.parsed_companies (city, name, address, director_name, inn, phone, email, website, source)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'dadata')""",
                (city_name, item["name"], item["address"], item["director"], inn,
                 item.get("phone", ""), item.get("email", ""), item.get("website", ""))
            )
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
        limit = int(body.get("limit", 30))
        api_key = os.environ.get("DADATA_API_KEY", "")
        conn = get_db()
        cur = conn.cursor()
        base_cond = "(phone IS NULL OR phone = '' OR email IS NULL OR email = '') AND inn IS NOT NULL AND inn != '' AND enriched_at IS NULL"
        if city:
            cur.execute(
                f"""SELECT id, name, inn, website, city
                    FROM {SCHEMA}.parsed_companies
                    WHERE {base_cond} AND city = %s
                    ORDER BY id LIMIT %s""",
                (city, limit)
            )
        else:
            cur.execute(
                f"""SELECT id, name, inn, website, city
                    FROM {SCHEMA}.parsed_companies
                    WHERE {base_cond}
                    ORDER BY id LIMIT %s""",
                (limit,)
            )
        rows = cur.fetchall()
        enriched = 0
        debug_info = []
        for row_id, name, inn, existing_website, row_city in rows:
            phone, email, website = "", "", existing_website or ""

            # 1. DaData findById по ИНН
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
            except Exception as e:
                debug_info.append(f"dadata_err {inn}: {e}")

            # 2. Если сайта нет — ищем через Яндекс
            if not website:
                try:
                    website = find_website_via_yandex(name, inn, row_city)
                    if website:
                        time.sleep(0.5)
                except Exception as e:
                    debug_info.append(f"yandex_err {inn}: {e}")

            # 3. Парсим сайт — email и телефон
            if website and (not email or not phone):
                try:
                    contacts = scrape_contacts_from_site(website)
                    if not email:
                        email = contacts["email"]
                    if not phone:
                        phone = contacts["phone"]
                except Exception as e:
                    debug_info.append(f"scrape_err {website}: {e}")

            # 4. Сохраняем (даже если не нашли — отмечаем enriched_at чтобы не крутить бесконечно)
            cur.execute(
                f"""UPDATE {SCHEMA}.parsed_companies SET
                    phone = CASE WHEN %s != '' AND (phone IS NULL OR phone = '') THEN %s ELSE phone END,
                    email = CASE WHEN %s != '' AND (email IS NULL OR email = '') THEN %s ELSE email END,
                    website = CASE WHEN %s != '' AND (website IS NULL OR website = '') THEN %s ELSE website END,
                    enriched_at = NOW()
                WHERE id = %s""",
                (phone, phone, email, email, website, website, row_id)
            )
            if phone or email or website:
                enriched += 1

        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "enriched": enriched, "total": len(rows), "debug": debug_info[:10]
        }, ensure_ascii=False)}

    # POST find_websites — ищем сайт через Яндекс по ИНН + названию
    if method == "POST" and body.get("action") == "find_websites":
        city = body.get("city", "")
        limit = int(body.get("limit", 30))
        conn = get_db()
        cur = conn.cursor()
        if city:
            cur.execute(
                f"SELECT id, name, inn, city FROM {SCHEMA}.parsed_companies WHERE (website IS NULL OR website = '') AND city = %s LIMIT %s",
                (city, limit)
            )
        else:
            cur.execute(
                f"SELECT id, name, inn, city FROM {SCHEMA}.parsed_companies WHERE (website IS NULL OR website = '') LIMIT %s",
                (limit,)
            )
        rows = cur.fetchall()
        found_count = 0
        for row_id, name, inn, row_city in rows:
            website = find_website_via_yandex(name, inn, row_city)
            if website:
                cur.execute(
                    f"UPDATE {SCHEMA}.parsed_companies SET website = %s WHERE id = %s",
                    (website, row_id)
                )
                found_count += 1
            time.sleep(0.7)
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"found": found_count, "total": len(rows)}, ensure_ascii=False)}

    # POST scrape_contacts — парсим email/телефон с уже известных сайтов
    if method == "POST" and body.get("action") == "scrape_contacts":
        city = body.get("city", "")
        limit = int(body.get("limit", 20))
        conn = get_db()
        cur = conn.cursor()
        where_contact = "(email IS NULL OR email = '' OR phone IS NULL OR phone = '')"
        if city:
            cur.execute(
                f"""SELECT id, website FROM {SCHEMA}.parsed_companies
                    WHERE website IS NOT NULL AND website != '' AND {where_contact} AND city = %s
                    LIMIT %s""",
                (city, limit)
            )
        else:
            cur.execute(
                f"""SELECT id, website FROM {SCHEMA}.parsed_companies
                    WHERE website IS NOT NULL AND website != '' AND {where_contact}
                    LIMIT %s""",
                (limit,)
            )
        rows = cur.fetchall()
        scraped = 0
        for row_id, website in rows:
            contacts = scrape_contacts_from_site(website)
            email = contacts["email"]
            phone = contacts["phone"]
            if email or phone:
                cur.execute(
                    f"""UPDATE {SCHEMA}.parsed_companies SET
                        email = CASE WHEN %s != '' AND (email IS NULL OR email = '') THEN %s ELSE email END,
                        phone = CASE WHEN %s != '' AND (phone IS NULL OR phone = '') THEN %s ELSE phone END,
                        enriched_at = NOW()
                    WHERE id = %s""",
                    (email, email, phone, phone, row_id)
                )
                scraped += 1
            time.sleep(0.4)
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"scraped": scraped, "total": len(rows)}, ensure_ascii=False)}

    # DELETE
    if method == "DELETE":
        if not check_admin(event):
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Forbidden"})}
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