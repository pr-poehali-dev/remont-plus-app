CREATE TABLE IF NOT EXISTS calculator_leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  estimate_total NUMERIC(12,2),
  item_count INTEGER DEFAULT 0,
  region VARCHAR(255),
  doc_type VARCHAR(50),
  page_url VARCHAR(500),
  source VARCHAR(50) DEFAULT 'calculator',
  created_at TIMESTAMP DEFAULT NOW()
);