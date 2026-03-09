CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.visitor_leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    source VARCHAR(100) DEFAULT 'popup',
    page_url TEXT,
    consent BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);