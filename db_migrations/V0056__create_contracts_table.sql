
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  contract_number VARCHAR(100),
  contract_type VARCHAR(50) NOT NULL DEFAULT 'partner',
  counterparty_name VARCHAR(255) NOT NULL,
  counterparty_inn VARCHAR(20),
  counterparty_type VARCHAR(20) NOT NULL DEFAULT 'company',
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  subject TEXT,
  amount DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'RUB',
  signed_at DATE,
  valid_from DATE,
  valid_until DATE,
  auto_renewal BOOLEAN DEFAULT FALSE,
  responsible_person VARCHAR(255),
  file_url TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(contract_type);
CREATE INDEX IF NOT EXISTS idx_contracts_counterparty ON contracts(counterparty_name);
