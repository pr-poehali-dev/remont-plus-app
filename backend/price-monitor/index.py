"""
Мониторинг цен на строительные материалы.
Сохраняет актуальные цены из каталога и выявляет отклонения > 10%.
"""
import json
import os
import psycopg2
from datetime import datetime, timezone

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

# Эталонные цены (обновляются вручную или через POST)
REFERENCE_PRICES = [
    {"key": "rotband_30kg",       "name": "Knauf Rotband 30 кг",            "category": "Штукатурка",  "price": 648.0,  "unit": "мешок 30кг"},
    {"key": "volma_sloy_30kg",    "name": "Волма Слой 30 кг",               "category": "Штукатурка",  "price": 420.0,  "unit": "мешок 30кг"},
    {"key": "ceresit_ct35_25kg",  "name": "Ceresit CT 35 25 кг",            "category": "Штукатурка",  "price": 720.0,  "unit": "мешок 25кг"},
    {"key": "knauf_fugen_25kg",   "name": "Knauf Fugen 25 кг",              "category": "Шпаклёвка",   "price": 490.0,  "unit": "мешок 25кг"},
    {"key": "volma_finish_20kg",  "name": "Волма Финиш 20 кг",              "category": "Шпаклёвка",   "price": 360.0,  "unit": "мешок 20кг"},
    {"key": "ceresit_ct127_20kg", "name": "Ceresit CT 127 20 кг",           "category": "Шпаклёвка",   "price": 590.0,  "unit": "мешок 20кг"},
    {"key": "ceresit_ct17_10l",   "name": "Ceresit CT 17 10 л",             "category": "Грунтовка",   "price": 1375.0, "unit": "канистра 10л"},
    {"key": "knauf_tiefengrund",  "name": "Knauf Tiefengrund 10 л",         "category": "Грунтовка",   "price": 720.0,  "unit": "канистра 10л"},
    {"key": "vvg_25_50m",         "name": "Кабель ВВГнг-LS 3×2,5мм² 50м",  "category": "Электрика",   "price": 6350.0, "unit": "бухта 50м"},
    {"key": "vvg_15_50m",         "name": "Кабель ВВГнг-LS 3×1,5мм² 50м",  "category": "Электрика",   "price": 4200.0, "unit": "бухта 50м"},
    {"key": "nym_25_50m",         "name": "Кабель NYM 3×2,5мм² 50м",        "category": "Электрика",   "price": 7500.0, "unit": "бухта 50м"},
    {"key": "knauf_ubo_25kg",     "name": "Knauf Убо стяжка 25 кг",         "category": "Стяжка",      "price": 490.0,  "unit": "мешок 25кг"},
    {"key": "tarkett_lam_m2",     "name": "Ламинат Tarkett 32кл м²",        "category": "Напольные",   "price": 950.0,  "unit": "м²"},
    {"key": "kronospan_lam_m2",   "name": "Ламинат Kronospan 33кл м²",      "category": "Напольные",   "price": 1180.0, "unit": "м²"},
]

ALERT_THRESHOLD_PCT = 10.0  # порог изменения цены для алерта


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")

    # GET /price-monitor — вернуть историю и алерты
    if method == "GET":
        params = event.get("queryStringParameters") or {}
        action = params.get("action", "dashboard")

        conn = get_db()
        cur = conn.cursor()

        if action == "alerts":
            cur.execute("""
                SELECT id, material_name, old_price, new_price, change_pct, detected_at, is_read
                FROM price_alerts
                ORDER BY detected_at DESC
                LIMIT 50
            """)
            rows = cur.fetchall()
            alerts = [
                {
                    "id": r[0],
                    "material_name": r[1],
                    "old_price": float(r[2]),
                    "new_price": float(r[3]),
                    "change_pct": float(r[4]),
                    "detected_at": r[5].isoformat(),
                    "is_read": r[6],
                }
                for r in rows
            ]
            conn.close()
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"alerts": alerts})}

        if action == "history":
            key = params.get("key")
            if not key:
                conn.close()
                return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "key required"})}
            cur.execute("""
                SELECT price_per_unit, captured_at
                FROM price_snapshots
                WHERE material_key = %s
                ORDER BY captured_at DESC
                LIMIT 30
            """, (key,))
            rows = cur.fetchall()
            history = [{"price": float(r[0]), "date": r[1].isoformat()} for r in rows]
            conn.close()
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"history": history})}

        # dashboard — последние цены + unread alerts count
        cur.execute("""
            SELECT DISTINCT ON (material_key)
                material_key, material_name, category, price_per_unit, unit, captured_at
            FROM price_snapshots
            ORDER BY material_key, captured_at DESC
        """)
        rows = cur.fetchall()
        latest = [
            {
                "key": r[0],
                "name": r[1],
                "category": r[2],
                "price": float(r[3]),
                "unit": r[4],
                "captured_at": r[5].isoformat(),
            }
            for r in rows
        ]

        cur.execute("SELECT COUNT(*) FROM price_alerts WHERE is_read = FALSE")
        unread = cur.fetchone()[0]

        conn.close()
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "prices": latest,
                "unread_alerts": unread,
                "reference": REFERENCE_PRICES,
            }),
        }

    # POST /price-monitor — зафиксировать новые цены и проверить отклонения
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        items = body.get("prices", [])

        if not items:
            # если цены не переданы — записываем эталонные (плановая задача)
            items = REFERENCE_PRICES

        conn = get_db()
        cur = conn.cursor()
        alerts_created = 0
        now = datetime.now(timezone.utc)

        for item in items:
            key = item["key"]
            new_price = float(item["price"])

            # последняя зафиксированная цена
            cur.execute("""
                SELECT price_per_unit FROM price_snapshots
                WHERE material_key = %s
                ORDER BY captured_at DESC LIMIT 1
            """, (key,))
            row = cur.fetchone()

            if row:
                old_price = float(row[0])
                if old_price > 0:
                    change_pct = ((new_price - old_price) / old_price) * 100
                    if abs(change_pct) >= ALERT_THRESHOLD_PCT:
                        cur.execute("""
                            INSERT INTO price_alerts
                                (material_key, material_name, old_price, new_price, change_pct, detected_at)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (key, item["name"], old_price, new_price, round(change_pct, 2), now))
                        alerts_created += 1

            # сохраняем снимок
            cur.execute("""
                INSERT INTO price_snapshots
                    (material_key, material_name, category, price_per_unit, unit, source, captured_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (key, item["name"], item.get("category", ""), new_price,
                  item.get("unit", ""), item.get("source", "manual"), now))

        conn.commit()
        conn.close()

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "saved": len(items),
                "alerts_created": alerts_created,
                "timestamp": now.isoformat(),
            }),
        }

    # PATCH — пометить алерты прочитанными
    if method == "PATCH":
        body = json.loads(event.get("body") or "{}")
        alert_ids = body.get("ids", [])
        conn = get_db()
        cur = conn.cursor()
        if alert_ids:
            cur.execute(
                "UPDATE price_alerts SET is_read = TRUE WHERE id = ANY(%s)",
                (alert_ids,)
            )
        else:
            cur.execute("UPDATE price_alerts SET is_read = TRUE")
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}
