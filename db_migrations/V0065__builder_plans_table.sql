CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.builder_plans (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  leads_per_month INTEGER NOT NULL DEFAULT 5,
  is_unlimited BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
