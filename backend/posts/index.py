"""
Управление постами блога: новости, статьи, акции.
GET / — список опубликованных постов (публичный)
POST / — создать пост (админ)
GET /?slug=... — получить пост по slug
PUT /?id=... — обновить пост (админ)
DELETE /?id=... — удалить пост (админ)
POST /view?id=... — увеличить счётчик просмотров
"""

import json
import os
import re
import psycopg2
from psycopg2.extras import RealDictCursor


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
}

SCHEMA = "t_p46588937_remont_plus_app"


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def slugify(text: str) -> str:
    pairs = list(zip(
        "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
        ["a","b","v","g","d","e","yo","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","kh","ts","ch","sh","shch","","y","","e","yu","ya"]
    ))
    t = text.lower()
    for ru, en in pairs:
        t = t.replace(ru, en)
    t = re.sub(r"[^a-z0-9]+", "-", t)
    return t.strip("-")[:80]


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False, default=str),
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    path = event.get("path", "/")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # POST /view — счётчик просмотров
        if method == "POST" and "view" in path:
            post_id = params.get("id")
            if not post_id:
                return resp(400, {"error": "id required"})
            cur.execute(f"UPDATE {SCHEMA}.posts SET views = views + 1 WHERE id = %s", (post_id,))
            conn.commit()
            return resp(200, {"ok": True})

        # GET
        if method == "GET":
            slug = params.get("slug")
            post_id = params.get("id")
            admin = params.get("admin") == "1"

            if slug:
                cur.execute(f"SELECT * FROM {SCHEMA}.posts WHERE slug = %s", (slug,))
                row = cur.fetchone()
                if not row:
                    return resp(404, {"error": "Not found"})
                return resp(200, dict(row))

            if post_id:
                cur.execute(f"SELECT * FROM {SCHEMA}.posts WHERE id = %s", (post_id,))
                row = cur.fetchone()
                if not row:
                    return resp(404, {"error": "Not found"})
                return resp(200, dict(row))

            category = params.get("category", "")
            search = params.get("q", "")
            post_type = params.get("type", "")
            limit = min(int(params.get("limit", "20")), 100)
            offset = int(params.get("offset", "0"))

            conditions = []
            if not admin:
                conditions.append("is_published = TRUE")
            if category:
                conditions.append(f"category = '{category.replace(chr(39), chr(39)*2)}'")
            if post_type:
                conditions.append(f"type = '{post_type.replace(chr(39), chr(39)*2)}'")
            if search:
                s = search.replace("'", "''")
                conditions.append(f"(title ILIKE '%{s}%' OR excerpt ILIKE '%{s}%')")

            where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

            cur.execute(f"""
                SELECT id, title, slug, excerpt, category, type, image_url, read_time,
                       is_published, is_pinned, views, created_at, updated_at
                FROM {SCHEMA}.posts
                {where}
                ORDER BY is_pinned DESC, created_at DESC
                LIMIT {limit} OFFSET {offset}
            """)
            posts = [dict(r) for r in cur.fetchall()]

            cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.posts {where}")
            total = cur.fetchone()["cnt"]

            cur.execute(f"SELECT DISTINCT category FROM {SCHEMA}.posts WHERE is_published = TRUE ORDER BY category")
            cats = [r["category"] for r in cur.fetchall()]

            return resp(200, {"posts": posts, "total": total, "categories": cats})

        # POST — создать
        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            title = (body.get("title") or "").strip()
            if not title:
                return resp(400, {"error": "title required"})
            slug = body.get("slug") or slugify(title)
            cur.execute(f"""
                INSERT INTO {SCHEMA}.posts (title, slug, excerpt, content, category, type, image_url, read_time, is_published, is_pinned)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (
                title, slug,
                body.get("excerpt", ""),
                body.get("content", ""),
                body.get("category", "Статьи"),
                body.get("type", "article"),
                body.get("image_url"),
                int(body.get("read_time", 5)),
                bool(body.get("is_published", False)),
                bool(body.get("is_pinned", False)),
            ))
            row = dict(cur.fetchone())
            conn.commit()
            return resp(201, row)

        # PUT — обновить
        if method == "PUT":
            post_id = params.get("id")
            if not post_id:
                return resp(400, {"error": "id required"})
            body = json.loads(event.get("body") or "{}")
            allowed = ["title", "slug", "excerpt", "content", "category", "type", "image_url", "read_time", "is_published", "is_pinned"]
            fields = [f"{k} = %s" for k in allowed if k in body]
            values = [body[k] for k in allowed if k in body]
            if not fields:
                return resp(400, {"error": "nothing to update"})
            fields.append("updated_at = NOW()")
            values.append(post_id)
            cur.execute(
                f"UPDATE {SCHEMA}.posts SET {', '.join(fields)} WHERE id = %s RETURNING *",
                values
            )
            row = cur.fetchone()
            conn.commit()
            if not row:
                return resp(404, {"error": "Not found"})
            return resp(200, dict(row))

        # DELETE
        if method == "DELETE":
            post_id = params.get("id")
            if not post_id:
                return resp(400, {"error": "id required"})
            cur.execute(f"DELETE FROM {SCHEMA}.posts WHERE id = %s", (post_id,))
            conn.commit()
            return resp(200, {"ok": True})

        return resp(405, {"error": "Method not allowed"})

    finally:
        cur.close()
        conn.close()