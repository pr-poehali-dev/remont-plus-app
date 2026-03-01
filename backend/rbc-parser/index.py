"""
Парсер компаний с companies.rbc.ru по категории и странице.
Возвращает список компаний с ИНН, телефонами, email, сайтом.
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


def extract_between(text: str, start: str, end: str) -> str:
    i = text.find(start)
    if i == -1:
        return ""
    i += len(start)
    j = text.find(end, i)
    if j == -1:
        return text[i:i+500]
    return text[i:j]


def clean(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"&amp;", "&", s)
    s = re.sub(r"&nbsp;", " ", s)
    s = re.sub(r"&#\d+;", "", s)
    return re.sub(r"\s+", " ", s).strip()


def parse_company_page(url: str) -> dict:
    """Парсит страницу конкретной компании на companies.rbc.ru"""
    html = fetch(url)
    result = {}

    # Название — из og:title или title
    title_m = re.search(r'<meta[^>]+property="og:title"[^>]+content="([^"]+)"', html)
    if not title_m:
        title_m = re.search(r'<title>([^<]+)</title>', html)
    if title_m:
        t = title_m.group(1).split("—")[0].split("|")[0].strip()
        if t and t.lower() not in ("companies.rbc.ru", "рбк"):
            result["name"] = t

    # ИНН — встречается как "ИНН:" или в data-атрибутах
    inn_m = re.search(r'[Ии][НнN][НнN][:\s"]*(\d{10,12})', html)
    if inn_m:
        result["inn"] = inn_m.group(1)

    # Телефон: tel: ссылки самый надёжный источник
    tel_links = re.findall(r'href="tel:([^"]+)"', html)
    if tel_links:
        result["phone"] = tel_links[0].strip()
    else:
        ph2 = re.findall(r'(?<!\d)(\+7[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2})(?!\d)', html)
        result["phone"] = ph2[0].strip() if ph2 else ""

    # Email
    emails = re.findall(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', html)
    skip = ["rbc", "rbk", "example", "sentry", "yandex.ru", "google", ".png", ".jpg", "noreply", "support@"]
    filtered = [e for e in emails if not any(x in e.lower() for x in skip)]
    result["email"] = filtered[0] if filtered else ""

    # Сайт — внешние ссылки (redirect через РБК или прямые)
    site_m = re.search(r'href="(https?://(?!companies\.rbc\.ru|rbc\.ru)[^"]{4,})"[^>]*>[^<]{2,50}</a>', html)
    if site_m:
        site = site_m.group(1)
        if "companies.rbc.ru/redirect" in site:
            redir_m = re.search(r'url=([^&"]+)', site)
            site = urllib.parse.unquote(redir_m.group(1)) if redir_m else ""
        result["site"] = site
    else:
        result["site"] = ""

    # Адрес
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

    return result


def parse_category_page(category_path: str, page: int) -> dict:
    """
    Парсит страницу категории, возвращает список компаний.
    category_path например: 924-stroitelnye_otdelochnye_raboty
    """
    if page > 1:
        url = f"https://companies.rbc.ru/category/{category_path}/?page={page}"
    else:
        url = f"https://companies.rbc.ru/category/{category_path}/"

    html = fetch(url)

    # Ищем компании через JSON-LD или через паттерны карточек
    companies = []

    # Ищем все ссылки на компании (сайт рендерит через JS, имена в HTML недоступны)
    links_raw = re.findall(r'https://companies\.rbc\.ru/id/[^/"]+/', html)
    seen = set()
    for href in links_raw:
        if href not in seen:
            seen.add(href)
            # Имя из slug: убираем ОГРН в начале, делаем читабельным
            slug = href.rstrip("/").split("/")[-1]
            slug = re.sub(r'^\d{13}-', '', slug)   # убираем ОГРН
            slug = re.sub(r'^\d+-', '', slug)       # убираем другие числа
            name = slug.replace("-", " ").title()
            companies.append({"url": href, "name": name})

    # Определяем общее кол-во страниц
    total_pages = 1
    pages_m = re.search(r'page=(\d+)[^"]*"[^>]*>[^<]*(?:последн|››|>>|\.\.\.|last)', html, re.IGNORECASE)
    if not pages_m:
        pages_m = re.search(r'"page":(\d+),"total"', html)
    if pages_m:
        total_pages = int(pages_m.group(1))
    else:
        # Ищем максимальный номер страницы в пагинации
        pnums = re.findall(r'[?&]page=(\d+)', html)
        if pnums:
            total_pages = max(int(p) for p in pnums)

    return {"companies": companies, "total_pages": total_pages, "current_page": page}


def handler(event: dict, context) -> dict:
    """Парсит список компаний с companies.rbc.ru и возвращает данные по каждой"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "list")
    category = params.get("category", "924-stroitelnye_otdelochnye_raboty")
    page = int(params.get("page", "1"))

    if action == "list":
        # Вернуть список компаний со страницы категории
        result = parse_category_page(category, page)
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(result, ensure_ascii=False),
        }

    if action == "detail":
        # Распарсить детальную страницу одной компании
        body = json.loads(event.get("body") or "{}")
        company_url = body.get("url") or params.get("url", "")
        if not company_url:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "url required"})}
        detail = parse_company_page(company_url)
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(detail, ensure_ascii=False),
        }

    if action == "batch":
        # Распарсить несколько компаний за раз (POST, body: {urls: [...]})
        body = json.loads(event.get("body") or "{}")
        urls = body.get("urls", [])[:10]  # Максимум 10 за раз
        results = []
        for url in urls:
            try:
                d = parse_company_page(url)
                d["url"] = url
                results.append(d)
                time.sleep(0.3)  # Вежливая пауза
            except Exception as e:
                results.append({"url": url, "error": str(e)})
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"results": results}, ensure_ascii=False),
        }

    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown action"})}