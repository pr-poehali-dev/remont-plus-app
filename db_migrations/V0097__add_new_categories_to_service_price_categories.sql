-- Функция прайс-листа читает категории из service_price_categories.
-- Добавляем туда 3 новые категории с id, совпадающими с category_id в service_prices (10,11,12).
INSERT INTO t_p46588937_remont_plus_app.service_price_categories (id, name, slug, icon, sort_order, is_active) VALUES
  (10, 'Фасадные работы', 'facade', 'Building2', 10, true),
  (11, 'Кровельные работы', 'roofing', 'Home', 11, true),
  (12, 'Бетонные полы и топпинг', 'concrete-floors', 'Layers', 12, true);

-- Синхронизация сиквенса после вставки явных id
SELECT setval('t_p46588937_remont_plus_app.service_price_categories_id_seq', (SELECT MAX(id) FROM t_p46588937_remont_plus_app.service_price_categories));
