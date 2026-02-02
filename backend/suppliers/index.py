import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для работы с каталогом поставщиков и товаров'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            category = params.get('category')
            supplier_id = params.get('supplier_id')
            search = params.get('search')
            in_stock = params.get('in_stock', 'true') == 'true'
            
            query = '''
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.category,
                    p.subcategory,
                    p.price,
                    p.unit,
                    p.image_url,
                    p.in_stock,
                    p.min_order_quantity,
                    p.delivery_available,
                    p.delivery_cost,
                    p.delivery_days,
                    p.floor_lifting_cost,
                    p.specifications,
                    s.id as supplier_id,
                    s.company_name,
                    s.rating,
                    s.verified
                FROM supplier_products p
                JOIN suppliers s ON p.supplier_id = s.id
                WHERE 1=1
            '''
            
            if in_stock:
                query += ' AND p.in_stock = true'
            
            if category:
                query += f" AND p.category = '{category}'"
            
            if supplier_id:
                query += f" AND p.supplier_id = {supplier_id}"
            
            if search:
                query += f" AND (p.name ILIKE '%{search}%' OR p.description ILIKE '%{search}%')"
            
            query += ' ORDER BY p.created_at DESC LIMIT 100'
            
            cursor.execute(query)
            rows = cursor.fetchall()
            
            products = []
            for row in rows:
                products.append({
                    'id': row[0],
                    'name': row[1],
                    'description': row[2],
                    'category': row[3],
                    'subcategory': row[4],
                    'price': float(row[5]) if row[5] else 0,
                    'unit': row[6],
                    'image_url': row[7],
                    'in_stock': row[8],
                    'min_order_quantity': float(row[9]) if row[9] else 1,
                    'delivery_available': row[10],
                    'delivery_cost': float(row[11]) if row[11] else 0,
                    'delivery_days': row[12],
                    'floor_lifting_cost': float(row[13]) if row[13] else 0,
                    'specifications': row[14],
                    'supplier': {
                        'id': row[15],
                        'name': row[16],
                        'rating': float(row[17]) if row[17] else 0,
                        'verified': row[18]
                    }
                })
            
            cursor.execute('SELECT DISTINCT category FROM supplier_products ORDER BY category')
            categories = [r[0] for r in cursor.fetchall()]
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'products': products,
                    'categories': categories,
                    'total': len(products)
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'add_to_project':
                project_id = body.get('project_id')
                product_id = body.get('product_id')
                quantity = body.get('quantity', 1)
                room_name = body.get('room_name')
                
                cursor.execute('''
                    INSERT INTO design_project_products 
                    (design_project_id, product_id, quantity, room_name)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                ''', (project_id, product_id, quantity, room_name))
                
                item_id = cursor.fetchone()[0]
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'item_id': item_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'get_project_products':
                project_id = body.get('project_id')
                
                cursor.execute('''
                    SELECT 
                        dpp.id,
                        dpp.quantity,
                        dpp.room_name,
                        p.name,
                        p.price,
                        p.unit,
                        p.delivery_cost,
                        p.floor_lifting_cost,
                        s.company_name
                    FROM design_project_products dpp
                    JOIN supplier_products p ON dpp.product_id = p.id
                    JOIN suppliers s ON p.supplier_id = s.id
                    WHERE dpp.design_project_id = %s
                ''', (project_id,))
                
                rows = cursor.fetchall()
                items = []
                total_cost = 0
                total_delivery = 0
                total_lifting = 0
                
                for row in rows:
                    quantity = float(row[1])
                    price = float(row[4])
                    delivery = float(row[6]) if row[6] else 0
                    lifting = float(row[7]) if row[7] else 0
                    
                    item_total = quantity * price
                    total_cost += item_total
                    total_delivery += delivery
                    total_lifting += lifting
                    
                    items.append({
                        'id': row[0],
                        'quantity': quantity,
                        'room_name': row[2],
                        'product_name': row[3],
                        'price': price,
                        'unit': row[5],
                        'delivery_cost': delivery,
                        'floor_lifting_cost': lifting,
                        'supplier_name': row[8],
                        'total': item_total
                    })
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'items': items,
                        'summary': {
                            'products_total': total_cost,
                            'delivery_total': total_delivery,
                            'lifting_total': total_lifting,
                            'grand_total': total_cost + total_delivery + total_lifting
                        }
                    }, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
