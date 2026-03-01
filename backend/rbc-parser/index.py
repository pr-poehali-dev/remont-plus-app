"""
Парсер компаний с companies.rbc.ru + обогащение данных через DaData (ЕГРЮЛ/ЕГРИП).
Возвращает список компаний с ИНН, телефонами, email, сайтом, адресом, руководителем и статусом.
"""
import json
import os
import time
import re
import urllib.request
import urllib.parse

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ru-RU,ru;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def fetch(url: str, headers: dict = None, data: bytes = None, method: str = "GET") -> str:
    h = {**HEADERS, **(headers or {})}
    req = urllib.request.Request(url, headers=h, data=data, method=method)
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read().decode("utf-8", errors="ignore")


def clean(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"&amp;", "&", s)
    s = re.sub(r"&nbsp;", " ", s)
    s = re.sub(r"&#\d+;", "", s)
    return re.sub(r"\s+", " ", s).strip()


# ─────────────────────────────────────────
#  RBC parser
# ─────────────────────────────────────────

def parse_rbc_company_page(url: str) -> dict:
    """Парсит страницу компании на companies.rbc.ru"""
    html = fetch(url)
    result = {}

    title_m = re.search(r'<meta[^>]+property="og:title"[^>]+content="([^"]+)"', html)
    if not title_m:
        title_m = re.search(r'<title>([^<]+)</title>', html)
    if title_m:
        t = title_m.group(1).split("—")[0].split("|")[0].strip()
        if t and t.lower() not in ("companies.rbc.ru", "рбк"):
            result["name"] = t

    inn_m = re.search(r'[Ии][НнN][НнN][:\s"]*(\d{10,12})', html)
    if inn_m:
        result["inn"] = inn_m.group(1)

    tel_links = re.findall(r'href="tel:([^"]+)"', html)
    if tel_links:
        result["phone"] = tel_links[0].strip()
    else:
        ph2 = re.findall(r'(?<!\d)(\+7[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2})(?!\d)', html)
        result["phone"] = ph2[0].strip() if ph2 else ""

    emails = re.findall(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', html)
    skip = ["rbc", "rbk", "example", "sentry", "yandex.ru", "google", ".png", ".jpg", "noreply", "support@"]
    filtered = [e for e in emails if not any(x in e.lower() for x in skip)]
    result["email"] = filtered[0] if filtered else ""

    site_m = re.search(r'href="(https?://(?!companies\.rbc\.ru|rbc\.ru)[^"]{4,})"[^>]*>[^<]{2,50}</a>', html)
    if site_m:
        site = site_m.group(1)
        if "companies.rbc.ru/redirect" in site:
            redir_m = re.search(r'url=([^&"]+)', site)
            site = urllib.parse.unquote(redir_m.group(1)) if redir_m else ""
        result["site"] = site
    else:
        result["site"] = ""

    addr_patterns = [
        r'"address"[^:]*:[^"]*"([^"]{10,})"',
        r'itemprop="address"[^>]*>([^<]{5,})<',
        r'г\.\s*[А-Яа-я][^<"]{5,50}',
    ]
    for pat in addr_patterns:
        addr_m = re.search(pat, html)
        if addr_m:
            result["address"] = clean(addr_m.group(1) if addr_m.lastindex else addr_m.group(0))
            break

    result["source"] = "rbc"
    return result


def parse_rbc_category_page(category_path: str, page: int) -> dict:
    """Парсит страницу категории companies.rbc.ru"""
    url = f"https://companies.rbc.ru/category/{category_path}/" + (f"?page={page}" if page > 1 else "")
    html = fetch(url)
    companies = []

    links_raw = re.findall(r'https://companies\.rbc\.ru/id/[^/"]+/', html)
    seen = set()
    for href in links_raw:
        if href not in seen:
            seen.add(href)
            slug = href.rstrip("/").split("/")[-1]
            slug = re.sub(r'^\d{13}-', '', slug)
            slug = re.sub(r'^\d+-', '', slug)
            name = slug.replace("-", " ").title()
            companies.append({"url": href, "name": name, "source": "rbc"})

    total_pages = 1
    pnums = re.findall(r'[?&]page=(\d+)', html)
    if pnums:
        total_pages = max(int(p) for p in pnums)

    return {"companies": companies, "total_pages": total_pages, "current_page": page}


# ─────────────────────────────────────────
#  DaData enrichment
# ─────────────────────────────────────────

STATUS_MAP = {
    "ACTIVE": "Действующая",
    "LIQUIDATING": "В процессе ликвидации",
    "LIQUIDATED": "Ликвидирована",
    "BANKRUPT": "Банкрот",
    "REORGANIZING": "В процессе реорганизации",
}

TYPE_MAP = {
    "LEGAL": "Юридическое лицо",
    "INDIVIDUAL": "ИП",
}


def enrich_by_inn(inn: str, api_key: str) -> dict:
    """Запрашивает данные компании по ИНН через DaData API (ЕГРЮЛ/ЕГРИП)"""
    url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party"
    payload = json.dumps({"query": inn, "count": 1}).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Token {api_key}",
    }
    raw = fetch(url, headers=headers, data=payload, method="POST")
    data = json.loads(raw)
    suggestions = data.get("suggestions", [])
    if not suggestions:
        return {"error": "Компания не найдена в ЕГРЮЛ"}

    s = suggestions[0]
    d = s.get("data", {})

    state = d.get("state", {})
    status_code = state.get("status", "")
    status = STATUS_MAP.get(status_code, status_code)

    reg_date = state.get("registration_date")
    if reg_date:
        from datetime import datetime
        try:
            reg_date = datetime.fromtimestamp(reg_date / 1000).strftime("%d.%m.%Y")
        except Exception:
            reg_date = str(reg_date)

    mgmt = d.get("management", {}) or {}
    manager_name = mgmt.get("name", "")
    manager_post = mgmt.get("post", "")

    address = d.get("address", {})
    address_full = address.get("value", "") if isinstance(address, dict) else ""

    okved = d.get("okved", "")
    okved_name = d.get("okved_type", "")

    return {
        "full_name": s.get("value", ""),
        "inn": d.get("inn", inn),
        "kpp": d.get("kpp", ""),
        "ogrn": d.get("ogrn", ""),
        "status": status,
        "type": TYPE_MAP.get(d.get("type", ""), d.get("type", "")),
        "reg_date": reg_date or "",
        "address_full": address_full,
        "manager_name": manager_name,
        "manager_post": manager_post,
        "okved": okved,
        "okved_name": okved_name,
    }


# ─────────────────────────────────────────
#  Handler
# ─────────────────────────────────────────

def handler(event: dict, context) -> dict:
    """Парсит компании с companies.rbc.ru и обогащает данные через DaData (ЕГРЮЛ)"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "list")
    category = params.get("category", "924-stroitelnye_otdelochnye_raboty")
    page = int(params.get("page", "1"))

    if action == "list":
        result = parse_rbc_category_page(category, page)
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(result, ensure_ascii=False),
        }

    if action == "detail":
        body = json.loads(event.get("body") or "{}")
        company_url = body.get("url") or params.get("url", "")
        if not company_url:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "url required"})}
        detail = parse_rbc_company_page(company_url)
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(detail, ensure_ascii=False),
        }

    if action == "batch":
        body = json.loads(event.get("body") or "{}")
        items = body.get("urls", [])[:10]
        results = []
        for item in items:
            url = item if isinstance(item, str) else item.get("url", "")
            try:
                d = parse_rbc_company_page(url)
                d["url"] = url
                results.append(d)
                time.sleep(0.3)
            except Exception as e:
                results.append({"url": url, "error": str(e)})
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"results": results}, ensure_ascii=False),
        }

    if action == "enrich":
        api_key = os.environ.get("DADATA_API_KEY", "")
        if not api_key:
            return {
                "statusCode": 500,
                "headers": {**CORS, "Content-Type": "application/json"},
                "body": json.dumps({"error": "DADATA_API_KEY не настроен"}),
            }
        body = json.loads(event.get("body") or "{}")
        inns = body.get("inns", [])
        if not inns:
            inn_single = body.get("inn") or params.get("inn", "")
            if inn_single:
                inns = [inn_single]
        if not inns:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "inns required"})}

        results = []
        for inn in inns[:20]:
            if not inn or len(inn) < 10:
                results.append({"inn": inn, "error": "Некорректный ИНН"})
                continue
            try:
                d = enrich_by_inn(inn, api_key)
                d["inn"] = inn
                results.append(d)
                time.sleep(0.1)
            except Exception as e:
                results.append({"inn": inn, "error": str(e)})

        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"results": results}, ensure_ascii=False),
        }

    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown action"})}
