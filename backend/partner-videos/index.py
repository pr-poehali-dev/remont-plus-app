"""
API для управления видеороликами партнёров и собственными видео на главной странице.
Поддерживает загрузку mp4, получение списка, создание, обновление и удаление.
"""
import json
import os
import base64
import uuid
import psycopg2
import boto3

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id, X-Admin-Token",
}

ADMIN_TOKEN = "admin2025"
SCHEMA = "t_p46588937_remont_plus_app"


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def cdn_url(key: str) -> str:
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def check_admin(event: dict) -> bool:
    headers = event.get("headers") or {}
    token = headers.get("X-Admin-Token") or headers.get("x-admin-token", "")
    return token == ADMIN_TOKEN


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    # GET — список видео (публичный или admin)
    if method == "GET":
        is_admin_req = params.get("admin") == "1" and check_admin(event)
        conn = get_db()
        cur = conn.cursor()
        if is_admin_req:
            cur.execute(
                f"""
                SELECT id, title, description, video_url, thumbnail_url, embed_url,
                       partner_name, is_own, is_active, sort_order, created_at
                FROM {SCHEMA}.partner_videos
                ORDER BY sort_order ASC, created_at DESC
                """
            )
        else:
            cur.execute(
                f"""
                SELECT id, title, description, video_url, thumbnail_url, embed_url,
                       partner_name, is_own, is_active, sort_order, created_at
                FROM {SCHEMA}.partner_videos
                WHERE is_active = TRUE
                ORDER BY sort_order ASC, created_at DESC
                """
            )
        rows = cur.fetchall()
        cols = ["id", "title", "description", "video_url", "thumbnail_url", "embed_url",
                "partner_name", "is_own", "is_active", "sort_order", "created_at"]
        videos = [dict(zip(cols, r)) for r in rows]
        for v in videos:
            if v["created_at"]:
                v["created_at"] = v["created_at"].isoformat()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"videos": videos}, ensure_ascii=False)}

    # Все остальные методы — только для администратора
    if not check_admin(event):
        return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Forbidden"})}

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    # POST — загрузка нового видео
    if method == "POST":
        video_b64 = body.get("video_data")
        thumb_b64 = body.get("thumbnail_data")
        title = body.get("title", "")
        description = body.get("description", "")
        partner_name = body.get("partner_name", "")
        is_own = body.get("is_own", False)
        sort_order = body.get("sort_order", 0)

        s3 = get_s3()
        video_url = ""
        thumbnail_url = ""

        embed_url = body.get("embed_url", "")

        if video_b64:
            ext = body.get("video_ext", "mp4")
            key = f"partner-videos/{uuid.uuid4()}.{ext}"
            data = base64.b64decode(video_b64)
            s3.put_object(Bucket="files", Key=key, Body=data, ContentType=f"video/{ext}")
            video_url = cdn_url(key)

        if thumb_b64:
            thumb_ext = body.get("thumb_ext", "jpg")
            tkey = f"partner-videos/thumbs/{uuid.uuid4()}.{thumb_ext}"
            tdata = base64.b64decode(thumb_b64)
            s3.put_object(Bucket="files", Key=tkey, Body=tdata, ContentType=f"image/{thumb_ext}")
            thumbnail_url = cdn_url(tkey)

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.partner_videos
                (title, description, video_url, thumbnail_url, embed_url, partner_name, is_own, sort_order)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (title, description, video_url, thumbnail_url, embed_url, partner_name, is_own, sort_order),
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id, "video_url": video_url})}

    # PUT — обновление записи
    if method == "PUT":
        vid_id = body.get("id")
        if not vid_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}

        s3 = get_s3()
        video_b64 = body.get("video_data")
        thumb_b64 = body.get("thumbnail_data")
        video_url = body.get("video_url", "")
        thumbnail_url = body.get("thumbnail_url", "")

        if video_b64:
            ext = body.get("video_ext", "mp4")
            key = f"partner-videos/{uuid.uuid4()}.{ext}"
            data = base64.b64decode(video_b64)
            s3.put_object(Bucket="files", Key=key, Body=data, ContentType=f"video/{ext}")
            video_url = cdn_url(key)

        if thumb_b64:
            thumb_ext = body.get("thumb_ext", "jpg")
            tkey = f"partner-videos/thumbs/{uuid.uuid4()}.{thumb_ext}"
            tdata = base64.b64decode(thumb_b64)
            s3.put_object(Bucket="files", Key=tkey, Body=tdata, ContentType=f"image/{thumb_ext}")
            thumbnail_url = cdn_url(tkey)

        conn = get_db()
        cur = conn.cursor()
        embed_url_put = body.get("embed_url", "")

        cur.execute(
            f"""
            UPDATE {SCHEMA}.partner_videos SET
                title = %s, description = %s, partner_name = %s,
                is_own = %s, is_active = %s, sort_order = %s,
                embed_url = %s,
                video_url = CASE WHEN %s != '' THEN %s ELSE video_url END,
                thumbnail_url = CASE WHEN %s != '' THEN %s ELSE thumbnail_url END,
                updated_at = NOW()
            WHERE id = %s
            """,
            (
                body.get("title", ""), body.get("description", ""), body.get("partner_name", ""),
                body.get("is_own", False), body.get("is_active", True), body.get("sort_order", 0),
                embed_url_put,
                video_url, video_url,
                thumbnail_url, thumbnail_url,
                vid_id,
            ),
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    # DELETE
    if method == "DELETE":
        vid_id = params.get("id") or body.get("id")
        if not vid_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.partner_videos WHERE id = %s", (vid_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}