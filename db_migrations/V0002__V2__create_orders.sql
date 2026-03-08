CREATE TABLE IF NOT EXISTS t_p82294077_user_role_app.orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)