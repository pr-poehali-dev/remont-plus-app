
CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.builder_balances (
    id serial PRIMARY KEY,
    contractor_id integer NOT NULL REFERENCES t_p46588937_remont_plus_app.contractors(id) UNIQUE,
    amount integer NOT NULL DEFAULT 0,
    updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.builder_transactions (
    id serial PRIMARY KEY,
    contractor_id integer NOT NULL REFERENCES t_p46588937_remont_plus_app.contractors(id),
    type varchar(20) NOT NULL,
    amount integer NOT NULL,
    balance_after integer NOT NULL DEFAULT 0,
    description text,
    lead_id integer REFERENCES t_p46588937_remont_plus_app.builder_leads(id),
    created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_builder_tx_contractor ON t_p46588937_remont_plus_app.builder_transactions(contractor_id, created_at DESC);
