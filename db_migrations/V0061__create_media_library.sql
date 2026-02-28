CREATE TABLE IF NOT EXISTS media_library (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    media_type VARCHAR(10) NOT NULL DEFAULT 'photo',
    filename TEXT DEFAULT '',
    title TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);