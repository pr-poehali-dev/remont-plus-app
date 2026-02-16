ALTER TABLE t_p46588937_remont_plus_app.users ADD COLUMN IF NOT EXISTS yandex_id VARCHAR(50);
ALTER TABLE t_p46588937_remont_plus_app.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
CREATE INDEX IF NOT EXISTS idx_users_yandex_id ON t_p46588937_remont_plus_app.users(yandex_id);