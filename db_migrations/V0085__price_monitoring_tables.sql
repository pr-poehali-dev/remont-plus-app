CREATE TABLE IF NOT EXISTS price_snapshots (
  id SERIAL PRIMARY KEY,
  material_key VARCHAR(100) NOT NULL,
  material_name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price_per_unit NUMERIC(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  source VARCHAR(100) DEFAULT 'lemanpro',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_snapshots_key_date ON price_snapshots (material_key, captured_at DESC);

CREATE TABLE IF NOT EXISTS price_alerts (
  id SERIAL PRIMARY KEY,
  material_key VARCHAR(100) NOT NULL,
  material_name VARCHAR(200) NOT NULL,
  old_price NUMERIC(10,2) NOT NULL,
  new_price NUMERIC(10,2) NOT NULL,
  change_pct NUMERIC(6,2) NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);
