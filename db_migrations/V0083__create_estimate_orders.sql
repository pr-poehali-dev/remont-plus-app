CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.estimate_orders (
  id SERIAL PRIMARY KEY,
  payment_id VARCHAR(100) UNIQUE,
  order_number VARCHAR(50),
  status VARCHAR(30) DEFAULT 'pending',
  plan_type VARCHAR(30) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  client_name VARCHAR(200),
  client_email VARCHAR(200),
  client_phone VARCHAR(50),
  client_comment TEXT,
  yookassa_payment_id VARCHAR(100),
  paid_at TIMESTAMP,
  notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);