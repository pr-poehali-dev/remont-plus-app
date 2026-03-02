INSERT INTO t_p46588937_remont_plus_app.builder_plans (code, name, price, leads_per_month, is_unlimited, priority, description)
SELECT 'start', 'Старт', 25000, 5, false, 1, '5 заявок в месяц, обычный приоритет'
WHERE NOT EXISTS (SELECT 1 FROM t_p46588937_remont_plus_app.builder_plans WHERE code = 'start');

INSERT INTO t_p46588937_remont_plus_app.builder_plans (code, name, price, leads_per_month, is_unlimited, priority, description)
SELECT 'business', 'Бизнес', 59000, 15, false, 2, '15 заявок в месяц, повышенный приоритет'
WHERE NOT EXISTS (SELECT 1 FROM t_p46588937_remont_plus_app.builder_plans WHERE code = 'business');

INSERT INTO t_p46588937_remont_plus_app.builder_plans (code, name, price, leads_per_month, is_unlimited, priority, description)
SELECT 'pro', 'Про', 99000, 30, false, 3, '30 заявок в месяц, высокий приоритет'
WHERE NOT EXISTS (SELECT 1 FROM t_p46588937_remont_plus_app.builder_plans WHERE code = 'pro');

INSERT INTO t_p46588937_remont_plus_app.builder_plans (code, name, price, leads_per_month, is_unlimited, priority, description)
SELECT 'unlim', 'Безлимит', 200000, 0, true, 4, 'Безлимитные заявки, максимальный приоритет'
WHERE NOT EXISTS (SELECT 1 FROM t_p46588937_remont_plus_app.builder_plans WHERE code = 'unlim');
