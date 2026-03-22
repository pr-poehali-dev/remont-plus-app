
ALTER TABLE t_p46588937_remont_plus_app.builder_plans ADD COLUMN IF NOT EXISTS max_budget bigint DEFAULT NULL;
ALTER TABLE t_p46588937_remont_plus_app.builder_plans ADD COLUMN IF NOT EXISTS lead_fee_pct numeric(5,2) NOT NULL DEFAULT 5.0;
ALTER TABLE t_p46588937_remont_plus_app.builder_plans ADD COLUMN IF NOT EXISTS lead_fee_min integer NOT NULL DEFAULT 5000;
ALTER TABLE t_p46588937_remont_plus_app.builder_plans ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE t_p46588937_remont_plus_app.builder_lead_assignments ADD COLUMN IF NOT EXISTS lead_fee integer DEFAULT NULL;

UPDATE t_p46588937_remont_plus_app.builder_plans SET is_active = false WHERE code = 'unlim';

UPDATE t_p46588937_remont_plus_app.builder_plans SET
  name = 'Старт',
  price = 9900,
  leads_per_month = 10,
  is_unlimited = false,
  priority = 1,
  max_budget = 500000,
  lead_fee_pct = 5.0,
  lead_fee_min = 5000,
  is_active = true,
  description = 'Заявки с бюджетом до 500 тыс, до 10 лидов/мес, обычный приоритет'
WHERE code = 'start';

UPDATE t_p46588937_remont_plus_app.builder_plans SET
  name = 'Бизнес',
  price = 29900,
  leads_per_month = 30,
  is_unlimited = false,
  priority = 2,
  max_budget = 3000000,
  lead_fee_pct = 5.0,
  lead_fee_min = 5000,
  is_active = true,
  description = 'Заявки с бюджетом до 3 млн, до 30 лидов/мес, высокий приоритет'
WHERE code = 'business';

UPDATE t_p46588937_remont_plus_app.builder_plans SET
  name = 'Премиум',
  price = 59900,
  leads_per_month = 0,
  is_unlimited = true,
  priority = 3,
  max_budget = NULL,
  lead_fee_pct = 5.0,
  lead_fee_min = 5000,
  is_active = true,
  description = 'Любой бюджет, безлимит заявок, максимальный приоритет'
WHERE code = 'pro';
