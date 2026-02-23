CREATE TABLE t_p46588937_remont_plus_app.partner_leads (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    partner_type VARCHAR(50) NOT NULL,
    region VARCHAR(255),
    comment TEXT,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
);