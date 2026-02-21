INSERT INTO user_plans (code, name, segment, price, is_monthly, max_projects, max_visualizations, max_revisions, has_materials, has_suppliers, has_brief, has_manager, has_crm, has_whitelabel, is_unlimited) VALUES
('start',      'START',      'b2c', 1990,   false, 1,   3,    0,  false, false, false, false, false, false, false),
('pro',        'PRO',        'b2c', 7990,   false, 1,   10,   2,  false, false, false, false, false, false, false),
('max',        'MAX',        'b2c', 14990,  false, 1,   15,   99, true,  true,  true,  true,  false, false, false),
('studio',     'STUDIO',     'b2b', 19000,  true,  20,  50,   99, false, false, false, false, false, false, false),
('business',   'BUSINESS',   'b2b', 39000,  true,  60,  200,  99, false, false, false, false, true,  false, false),
('enterprise', 'ENTERPRISE', 'b2b', 120000, true,  9999, 9999, 99, true, true,  true,  true,  true,  true,  true);