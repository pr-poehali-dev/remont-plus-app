ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS project_id INTEGER NULL;
CREATE INDEX IF NOT EXISTS idx_user_addresses_project_id ON user_addresses(project_id);
