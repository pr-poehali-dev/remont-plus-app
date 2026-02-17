CREATE TABLE t_p46588937_remont_plus_app.user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p46588937_remont_plus_app.users(id),
    region VARCHAR(255) NOT NULL DEFAULT '',
    city VARCHAR(255) NOT NULL DEFAULT '',
    street VARCHAR(255) NOT NULL DEFAULT '',
    house VARCHAR(50) NOT NULL DEFAULT '',
    apartment VARCHAR(50) NOT NULL DEFAULT '',
    postal_code VARCHAR(10) NOT NULL DEFAULT '',
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    label VARCHAR(100) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_addresses_user_id ON t_p46588937_remont_plus_app.user_addresses(user_id);