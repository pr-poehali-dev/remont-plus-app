
CREATE TABLE IF NOT EXISTS calculator_leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) DEFAULT '',
    calc_type VARCHAR(100) DEFAULT 'Калькулятор ремонта',
    total_sum VARCHAR(50) DEFAULT '',
    items_count INTEGER DEFAULT 0,
    region VARCHAR(100) DEFAULT '',
    source VARCHAR(50) DEFAULT 'export_pdf',
    page_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calculator_leads_phone ON calculator_leads(phone);
CREATE INDEX IF NOT EXISTS idx_calculator_leads_created ON calculator_leads(created_at DESC);
