CREATE TABLE IF NOT EXISTS agent_transactions (
    id SERIAL PRIMARY KEY,
    contractor_id INTEGER NOT NULL,
    contract_amount NUMERIC(12,2) NOT NULL,
    commission_pct NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    commission_amount NUMERIC(12,2) NOT NULL,
    payout_amount NUMERIC(12,2) NOT NULL,
    customer_name VARCHAR(255) DEFAULT '',
    work_description TEXT DEFAULT '',
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP,
    payout_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
