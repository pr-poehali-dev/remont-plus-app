CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.builder_lead_assignments (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES t_p46588937_remont_plus_app.builder_leads(id),
  contractor_id INTEGER NOT NULL REFERENCES t_p46588937_remont_plus_app.contractors(id),
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  notified_at TIMESTAMP,
  viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lead_id, contractor_id)
);

CREATE INDEX IF NOT EXISTS idx_builder_assign_contractor ON t_p46588937_remont_plus_app.builder_lead_assignments(contractor_id);
