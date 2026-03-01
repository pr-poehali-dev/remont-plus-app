CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.calculator_events (
  id SERIAL PRIMARY KEY,
  calc_type VARCHAR(50) NOT NULL,
  event_type VARCHAR(20) NOT NULL,
  user_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);