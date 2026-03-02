CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.builder_subscriptions (
  id SERIAL PRIMARY KEY,
  contractor_id INTEGER NOT NULL REFERENCES t_p46588937_remont_plus_app.contractors(id),
  plan_code VARCHAR(20) NOT NULL REFERENCES t_p46588937_remont_plus_app.builder_plans(code),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  leads_used INTEGER NOT NULL DEFAULT 0,
  activated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builder_subs_contractor ON t_p46588937_remont_plus_app.builder_subscriptions(contractor_id);
