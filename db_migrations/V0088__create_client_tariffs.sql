
CREATE TABLE IF NOT EXISTS client_tariffs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    email VARCHAR(255),
    plan_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    is_monthly BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    activated_at TIMESTAMP NOT NULL DEFAULT now(),
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_tariffs_user_id ON client_tariffs(user_id);
CREATE INDEX IF NOT EXISTS idx_client_tariffs_email ON client_tariffs(email);
CREATE INDEX IF NOT EXISTS idx_client_tariffs_status ON client_tariffs(status);

CREATE TABLE IF NOT EXISTS tariff_payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    email VARCHAR(255),
    plan_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'tochka',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    tochka_checkout_id VARCHAR(255),
    order_number VARCHAR(50),
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tariff_payments_user_id ON tariff_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_tariff_payments_email ON tariff_payments(email);
CREATE INDEX IF NOT EXISTS idx_tariff_payments_status ON tariff_payments(status);
