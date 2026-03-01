"""
Парсер компаний с companies.rbc.ru и orgpage.ru по категории.
Возвращает список компаний с ИНН, телефонами, email, сайтом, адресом.
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


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
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
    """Парсит страницу конкретной компании на companies.rbc.ru"""
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
    if page > 1:
        url = f"https://companies.rbc.ru/category/{category_path}/?page={page}"
    else:
        url = f"https://companies.rbc.ru/category/{category_path}/"

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
#  ORGPAGE parser
# ─────────────────────────────────────────

def parse_orgpage_company_page(url: str) -> dict:
    """Парсит страницу компании на orgpage.ru"""
    html = fetch(url)
    result = {"source": "orgpage", "url": url}

    # Название
    name_m = re.search(r'<h1[^>]*>([^<]{3,})</h1>', html)
    if name_m:
        result["name"] = clean(name_m.group(1))

    # Телефон
    tel_links = re.findall(r'href="tel:([^"]+)"', html)
    if tel_links:
        result["phone"] = tel_links[0].strip()
    else:
        ph = re.findall(r'(?<!\d)(\+7[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2})(?!\d)', html)
        result["phone"] = ph[0].strip() if ph else ""

    # Email
    emails = re.findall(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', html)
    skip_em = ["orgpage", "example", "noreply", "sentry", ".png", ".jpg", "google", "yandex.ru"]
    filtered = [e for e in emails if not any(x in e.lower() for x in skip_em)]
    result["email"] = filtered[0] if filtered else ""

    # Сайт
    site_m = re.search(r'href="(https?://(?!orgpage\.ru)[^"]{5,})"[^>]*>\s*(?:сайт|website|www\.[^\s<]{3,})', html, re.IGNORECASE)
    if not site_m:
        site_m = re.search(r'<a[^>]+href="(https?://(?!orgpage\.ru)[^"]{5,})"[^>]*class="[^"]*site[^"]*"', html)
    result["site"] = site_m.group(1) if site_m else ""

    # Адрес
    addr_m = re.search(r'itemprop="address"[^>]*>(.*?)</[^>]+>', html, re.DOTALL)
    if addr_m:
        result["address"] = clean(addr_m.group(1))
    else:
        addr_m2 = re.search(r'г\.\s*[А-Яа-я][^<"]{5,80}', html)
        result["address"] = clean(addr_m2.group(0)) if addr_m2 else ""

    # ИНН
    inn_m = re.search(r'[Ии][НнN][НнN][:\s"]*(\d{10,12})', html)
    result["inn"] = inn_m.group(1) if inn_m else ""

    # Рейтинг / отзывы
    rating_m = re.search(r'itemprop="ratingValue"[^>]*>([^<]+)<', html)
    result["rating"] = rating_m.group(1).strip() if rating_m else ""

    reviews_m = re.search(r'itemprop="reviewCount"[^>]*>([^<]+)<', html)
    result["reviews_count"] = reviews_m.group(1).strip() if reviews_m else ""

    return result


def parse_orgpage_category_page(category_path: str, page: int) -> dict:
    """
    Парсит страницу категории orgpage.ru.
    category_path например: rossiya/remont_kvartir
    """
    if page > 1:
        url = f"https://www.orgpage.ru/{category_path}/page/{page}/"
    else:
        url = f"https://www.orgpage.ru/{category_path}/"

    html = fetch(url)
    companies = []

    # Ссылки на компании
    links = re.findall(r'href="(/[a-z0-9_\-]+/[a-z0-9_\-]+/[a-z0-9_\-]+-\d+\.html)"', html)
    seen = set()
    for path in links:
        if path not in seen:
            seen.add(path)
            full_url = f"https://www.orgpage.ru{path}"
            slug = path.rstrip("/").split("/")[-1].replace(".html", "")
            slug = re.sub(r'-\d+$', '', slug)
            name = slug.replace("-", " ").title()
            companies.append({"url": full_url, "name": name, "source": "orgpage"})

    # Пагинация
    total_pages = 1
    pnums = re.findall(r'/page/(\d+)/', html)
    if pnums:
        total_pages = max(int(p) for p in pnums)

    return {"companies": companies, "total_pages": total_pages, "current_page": page}


# ─────────────────────────────────────────
#  Handler
# ─────────────────────────────────────────

def handler(event: dict, context) -> dict:
    """Парсит список компаний с companies.rbc.ru или orgpage.ru и возвращает данные по каждой"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "list")
    source = params.get("source", "rbc")
    category = params.get("category", "924-stroitelnye_otdelochnye_raboty")
    page = int(params.get("page", "1"))

    if action == "list":
        if source == "orgpage":
            result = parse_orgpage_category_page(category, page)
        else:
            result = parse_rbc_category_page(category, page)
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(result, ensure_ascii=False),
        }

    if action == "detail":
        body = json.loads(event.get("body") or "{}")
        company_url = body.get("url") or params.get("url", "")
        detail_source = body.get("source") or params.get("source", "rbc")
        if not company_url:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "url required"})}
        if detail_source == "orgpage":
            detail = parse_orgpage_company_page(company_url)
        else:
            detail = parse_rbc_company_page(company_url)
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(detail, ensure_ascii=False),
        }

    if action == "batch":
        body = json.loads(event.get("body") or "{}")
        items = body.get("urls", [])[:10]
        batch_source = body.get("source", "rbc")
        results = []
        for item in items:
            url = item if isinstance(item, str) else item.get("url", "")
            item_source = batch_source if isinstance(item, str) else item.get("source", batch_source)
            try:
                if item_source == "orgpage":
                    d = parse_orgpage_company_page(url)
                else:
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

    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown action"})}
