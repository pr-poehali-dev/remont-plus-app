
CREATE TABLE t_p46588937_remont_plus_app.renovation_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p46588937_remont_plus_app.users(id),
  title VARCHAR(255) NOT NULL DEFAULT 'Мой ремонт',
  address TEXT,
  apartment_area NUMERIC(8,2),
  start_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p46588937_remont_plus_app.renovation_stages (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES t_p46588937_remont_plus_app.renovation_plans(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  checkpoints TEXT[],
  plan_days INTEGER,
  plan_amount NUMERIC(12,2),
  fact_days INTEGER,
  fact_amount NUMERIC(12,2),
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_renovation_plans_user ON t_p46588937_remont_plus_app.renovation_plans(user_id);
CREATE INDEX idx_renovation_stages_plan ON t_p46588937_remont_plus_app.renovation_stages(plan_id);
