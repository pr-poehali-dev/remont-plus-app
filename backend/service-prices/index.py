import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API прайс-листа работ с привязкой к регионам'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    params = event.get('queryStringParameters') or {}
    category_slug = params.get('category')
    region_code = params.get('region')
    search = params.get('search')
    
    cursor.execute('''
        SELECT id, name, slug, icon, sort_order
        FROM service_price_categories
        WHERE is_active = true
        ORDER BY sort_order
    ''')
    categories = []
    for row in cursor.fetchall():
        categories.append({
            'id': row[0],
            'name': row[1],
            'slug': row[2],
            'icon': row[3],
            'sort_order': row[4]
        })
    
    cursor.execute('''
        SELECT id, name, code, price_coefficient, sort_order
        FROM service_regions
        WHERE is_active = true
        ORDER BY sort_order
    ''')
    regions = []
    coefficients = {}
    for row in cursor.fetchall():
        regions.append({
            'id': row[0],
            'name': row[1],
            'code': row[2],
            'sort_order': row[4]
        })
        coefficients[row[2]] = float(row[3])
    
    coefficient = coefficients.get(region_code, 1.0)
    
    query = '''
        SELECT sp.id, sp.name, sp.description, sp.unit, sp.price_base, sp.sort_order,
               spc.id as cat_id, spc.name as cat_name, spc.slug as cat_slug, spc.icon as cat_icon
        FROM service_prices sp
        JOIN service_price_categories spc ON sp.category_id = spc.id
        WHERE sp.is_active = true AND spc.is_active = true
    '''
    
    if category_slug:
        query += " AND spc.slug = '" + category_slug.replace("'", "''") + "'"
    
    if search:
        safe_search = search.replace("'", "''")
        query += " AND (sp.name ILIKE '%" + safe_search + "%' OR sp.description ILIKE '%" + safe_search + "%')"
    
    query += ' ORDER BY spc.sort_order, sp.sort_order, sp.id'
    
    cursor.execute(query)
    rows = cursor.fetchall()
    
    prices_by_category = {}
    for row in rows:
        cat_slug = row[8]
        if cat_slug not in prices_by_category:
            prices_by_category[cat_slug] = {
                'id': row[6],
                'name': row[7],
                'slug': cat_slug,
                'icon': row[9],
                'items': []
            }
        
        base = float(row[4])
        adjusted = round(base * coefficient)
        
        prices_by_category[cat_slug]['items'].append({
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'unit': row[3],
            'price': adjusted
        })
    
    result_categories = list(prices_by_category.values())
    
    total_items = sum(len(c['items']) for c in result_categories)
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'categories': categories,
            'regions': regions,
            'prices': result_categories,
            'selected_region': region_code,
            'total_items': total_items
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }
