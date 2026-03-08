CREATE TABLE IF NOT EXISTS t_p82294077_user_role_app.order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES t_p82294077_user_role_app.orders(id),
  product_id INTEGER,
  product_name TEXT NOT NULL,
  volume NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'л',
  quantity INTEGER NOT NULL DEFAULT 1
)