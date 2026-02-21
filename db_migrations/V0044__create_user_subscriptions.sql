CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan_code VARCHAR(20) NOT NULL REFERENCES user_plans(code),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  projects_used INTEGER NOT NULL DEFAULT 0,
  visualizations_used INTEGER NOT NULL DEFAULT 0,
  revisions_used INTEGER NOT NULL DEFAULT 0,
  activated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);