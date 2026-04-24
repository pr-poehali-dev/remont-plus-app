CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.homestaging_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  session_id VARCHAR(64),
  room_type VARCHAR(100),
  overall_score INTEGER,
  short_summary TEXT,
  recommendations JSONB NOT NULL,
  strengths JSONB,
  note TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_homestaging_user ON t_p46588937_remont_plus_app.homestaging_reports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_homestaging_session ON t_p46588937_remont_plus_app.homestaging_reports(session_id, created_at DESC);