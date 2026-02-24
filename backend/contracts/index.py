"""
Управление договорами — CRUD для юридического отдела.
Поддерживает создание, редактирование, удаление и поиск договоров.
"""
import json
import os
import psycopg2
from datetime import date, datetime


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def json_serial(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def resp(status, body, headers=None):
    h = {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"}
    if headers:
        h.update(headers)
    return {"statusCode": status, "headers": h, "body": json.dumps(body, default=json_serial)}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
            "Access-Control-Max-Age": "86400"
        }, "body": ""}

    token = event.get("headers", {}).get("X-Admin-Token", "")
    if token != "admin2025":
        return resp(403, {"error": "Forbidden"})

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "GET":
            contract_id = params.get("id")
            if contract_id:
                cur.execute("""
                    SELECT id, title, contract_number, contract_type, counterparty_name,
                           counterparty_inn, counterparty_type, status, subject, amount,
                           currency, signed_at, valid_from, valid_until, auto_renewal,
                           responsible_person, file_url, notes, tags, created_at, updated_at
                    FROM contracts WHERE id = %s
                """ % int(contract_id))
                row = cur.fetchone()
                if not row:
                    return resp(404, {"error": "Not found"})
                cols = ["id","title","contract_number","contract_type","counterparty_name",
                        "counterparty_inn","counterparty_type","status","subject","amount",
                        "currency","signed_at","valid_from","valid_until","auto_renewal",
                        "responsible_person","file_url","notes","tags","created_at","updated_at"]
                return resp(200, {"contract": dict(zip(cols, row))})

            status_filter = params.get("status", "")
            type_filter = params.get("contract_type", "")
            search = params.get("search", "").strip()

            where = []
            if status_filter:
                where.append(f"status = '{status_filter}'")
            if type_filter:
                where.append(f"contract_type = '{type_filter}'")
            if search:
                s = search.replace("'", "''")
                where.append(f"(title ILIKE '%{s}%' OR counterparty_name ILIKE '%{s}%' OR contract_number ILIKE '%{s}%')")

            where_clause = "WHERE " + " AND ".join(where) if where else ""
            cur.execute(f"""
                SELECT id, title, contract_number, contract_type, counterparty_name,
                       counterparty_inn, counterparty_type, status, subject, amount,
                       currency, signed_at, valid_from, valid_until, auto_renewal,
                       responsible_person, file_url, notes, tags, created_at, updated_at
                FROM contracts {where_clause}
                ORDER BY created_at DESC
            """)
            rows = cur.fetchall()
            cols = ["id","title","contract_number","contract_type","counterparty_name",
                    "counterparty_inn","counterparty_type","status","subject","amount",
                    "currency","signed_at","valid_from","valid_until","auto_renewal",
                    "responsible_person","file_url","notes","tags","created_at","updated_at"]
            contracts = [dict(zip(cols, r)) for r in rows]

            cur.execute("SELECT status, COUNT(*) FROM contracts GROUP BY status")
            stats = {row[0]: row[1] for row in cur.fetchall()}

            return resp(200, {"contracts": contracts, "stats": stats, "total": len(contracts)})

        elif method == "POST":
            title = body.get("title", "").strip()
            if not title:
                return resp(400, {"error": "title required"})

            counterparty_name = body.get("counterparty_name", "").strip()
            if not counterparty_name:
                return resp(400, {"error": "counterparty_name required"})

            contract_number = body.get("contract_number", "") or ""
            contract_type = body.get("contract_type", "partner")
            counterparty_inn = body.get("counterparty_inn", "") or ""
            counterparty_type = body.get("counterparty_type", "company")
            status = body.get("status", "draft")
            subject = body.get("subject", "") or ""
            amount = body.get("amount")
            currency = body.get("currency", "RUB")
            signed_at = body.get("signed_at") or None
            valid_from = body.get("valid_from") or None
            valid_until = body.get("valid_until") or None
            auto_renewal = body.get("auto_renewal", False)
            responsible_person = body.get("responsible_person", "") or ""
            file_url = body.get("file_url", "") or ""
            notes = body.get("notes", "") or ""
            tags = body.get("tags", [])

            amt_val = f"{float(amount)}" if amount is not None else "NULL"
            signed_val = f"'{signed_at}'" if signed_at else "NULL"
            from_val = f"'{valid_from}'" if valid_from else "NULL"
            until_val = f"'{valid_until}'" if valid_until else "NULL"
            tags_val = "'{" + ",".join([t.replace("'","''") for t in tags]) + "}'" if tags else "NULL"

            cur.execute(f"""
                INSERT INTO contracts (title, contract_number, contract_type, counterparty_name,
                    counterparty_inn, counterparty_type, status, subject, amount, currency,
                    signed_at, valid_from, valid_until, auto_renewal, responsible_person,
                    file_url, notes, tags)
                VALUES ('{title.replace("'","''")}', '{contract_number.replace("'","''")}',
                    '{contract_type}', '{counterparty_name.replace("'","''")}',
                    '{counterparty_inn}', '{counterparty_type}', '{status}',
                    '{subject.replace("'","''")}', {amt_val}, '{currency}',
                    {signed_val}, {from_val}, {until_val}, {str(auto_renewal).upper()},
                    '{responsible_person.replace("'","''")}', '{file_url.replace("'","''")}',
                    '{notes.replace("'","''")}', {tags_val})
                RETURNING id
            """)
            new_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {"id": new_id, "message": "Договор создан"})

        elif method == "PUT":
            contract_id = params.get("id") or body.get("id")
            if not contract_id:
                return resp(400, {"error": "id required"})

            fields = []
            allowed = ["title","contract_number","contract_type","counterparty_name",
                       "counterparty_inn","counterparty_type","status","subject","amount",
                       "currency","signed_at","valid_from","valid_until","auto_renewal",
                       "responsible_person","file_url","notes"]
            for f in allowed:
                if f in body:
                    val = body[f]
                    if val is None:
                        fields.append(f"{f} = NULL")
                    elif isinstance(val, bool):
                        fields.append(f"{f} = {str(val).upper()}")
                    elif isinstance(val, (int, float)):
                        fields.append(f"{f} = {val}")
                    else:
                        fields.append(f"{f} = '{str(val).replace(chr(39), chr(39)+chr(39))}'")
            if "tags" in body:
                tags = body["tags"] or []
                tags_val = "'{" + ",".join([t.replace("'","''") for t in tags]) + "}'" if tags else "NULL"
                fields.append(f"tags = {tags_val}")

            if not fields:
                return resp(400, {"error": "No fields to update"})

            fields.append("updated_at = NOW()")
            cur.execute(f"UPDATE contracts SET {', '.join(fields)} WHERE id = {int(contract_id)}")
            conn.commit()
            return resp(200, {"message": "Договор обновлён"})

        elif method == "DELETE":
            contract_id = params.get("id")
            if not contract_id:
                return resp(400, {"error": "id required"})
            cur.execute(f"DELETE FROM contracts WHERE id = {int(contract_id)}")
            conn.commit()
            return resp(200, {"message": "Договор удалён"})

        return resp(405, {"error": "Method not allowed"})

    finally:
        cur.close()
        conn.close()
