CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan_code VARCHAR(50) NOT NULL,
    yukassa_payment_id VARCHAR(100) UNIQUE,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    status VARCHAR(20) DEFAULT 'pending',
    payment_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP
);