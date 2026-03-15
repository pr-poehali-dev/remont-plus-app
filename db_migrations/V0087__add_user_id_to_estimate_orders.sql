ALTER TABLE t_p46588937_remont_plus_app.estimate_orders
ADD COLUMN IF NOT EXISTS user_id INTEGER NULL REFERENCES t_p46588937_remont_plus_app.users(id);

CREATE INDEX IF NOT EXISTS idx_estimate_orders_user_id ON t_p46588937_remont_plus_app.estimate_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_estimate_orders_user_status ON t_p46588937_remont_plus_app.estimate_orders(user_id, status);