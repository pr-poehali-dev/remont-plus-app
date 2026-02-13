
CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.design_stage_results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES t_p46588937_remont_plus_app.design_projects(id),
    stage_id VARCHAR(50) NOT NULL,
    user_description TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    ai_result TEXT,
    ai_provider VARCHAR(50),
    checklist_state JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, stage_id)
);

CREATE INDEX IF NOT EXISTS idx_stage_results_project ON t_p46588937_remont_plus_app.design_stage_results(project_id);
CREATE INDEX IF NOT EXISTS idx_stage_results_stage ON t_p46588937_remont_plus_app.design_stage_results(stage_id);

ALTER TABLE t_p46588937_remont_plus_app.design_projects
    ADD COLUMN IF NOT EXISTS room_count INTEGER DEFAULT 2,
    ADD COLUMN IF NOT EXISTS total_area NUMERIC(10,2) DEFAULT 60;
