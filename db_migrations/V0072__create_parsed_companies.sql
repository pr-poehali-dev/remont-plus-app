CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.parsed_companies (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    name VARCHAR(500) NOT NULL,
    phone VARCHAR(100),
    email VARCHAR(200),
    address TEXT,
    website VARCHAR(500),
    director_name VARCHAR(300),
    inn VARCHAR(20),
    rubric VARCHAR(200),
    source VARCHAR(50) DEFAULT '2gis',
    raw_data JSONB,
    enriched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parsed_companies_city ON t_p46588937_remont_plus_app.parsed_companies(city);
CREATE INDEX IF NOT EXISTS idx_parsed_companies_inn ON t_p46588937_remont_plus_app.parsed_companies(inn);