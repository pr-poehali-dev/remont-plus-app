CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.builder_leads (
  id SERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL DEFAULT 'calculator',
  city VARCHAR(100),
  work_types TEXT[],
  budget BIGINT,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_comment TEXT,
  calc_type VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builder_leads_city ON t_p46588937_remont_plus_app.builder_leads(city);
CREATE INDEX IF NOT EXISTS idx_builder_leads_status ON t_p46588937_remont_plus_app.builder_leads(status);
