ALTER TABLE users
    ADD COLUMN IF NOT EXISTS referral_code VARCHAR(16) NULL UNIQUE,
    ADD COLUMN IF NOT EXISTS referred_by INTEGER NULL REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

CREATE TABLE IF NOT EXISTS referral_rewards (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER NOT NULL REFERENCES users(id),
    referred_user_id INTEGER NOT NULL REFERENCES users(id),
    reward_type VARCHAR(32) NOT NULL DEFAULT 'signup',
    reward_value INTEGER NOT NULL DEFAULT 0,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_referral_rewards_user ON referral_rewards(referred_user_id, reward_type);
