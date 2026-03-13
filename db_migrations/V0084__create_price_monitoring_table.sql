CREATE TABLE IF NOT EXISTS price_monitoring (
  id SERIAL PRIMARY KEY,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  material_key VARCHAR(80) NOT NULL,
  material_name VARCHAR(200) NOT NULL,
  category VARCHAR(60) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  current_price NUMERIC(12,2) NOT NULL,
  prev_price NUMERIC(12,2),
  change_pct NUMERIC(6,2),
  source VARCHAR(120),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_price_monitoring_key ON price_monitoring(material_key);
CREATE INDEX IF NOT EXISTS idx_price_monitoring_date ON price_monitoring(checked_at DESC);
