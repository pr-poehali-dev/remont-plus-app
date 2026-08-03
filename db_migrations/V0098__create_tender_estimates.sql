CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.tender_estimates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p46588937_remont_plus_app.users(id),
    email VARCHAR(255),
    title VARCHAR(255) NOT NULL DEFAULT 'Смета по ТЗ',
    mode VARCHAR(20) NOT NULL DEFAULT 'estimate',
    total NUMERIC(15,2) NOT NULL DEFAULT 0,
    payload JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tender_estimates_user ON t_p46588937_remont_plus_app.tender_estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_tender_estimates_email ON t_p46588937_remont_plus_app.tender_estimates(email);
CREATE INDEX IF NOT EXISTS idx_tender_estimates_created ON t_p46588937_remont_plus_app.tender_estimates(created_at DESC);