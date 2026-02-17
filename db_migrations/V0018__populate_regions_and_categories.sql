
INSERT INTO service_regions (name, code, price_coefficient, sort_order) VALUES
('Москва', 'moscow', 1.30, 1),
('Московская область', 'moscow_region', 1.20, 2),
('Санкт-Петербург', 'spb', 1.20, 3),
('Ленинградская область', 'leningrad_region', 1.10, 4),
('Краснодарский край', 'krasnodar', 1.05, 5),
('Новосибирск', 'novosibirsk', 0.90, 6),
('Екатеринбург', 'ekaterinburg', 0.95, 7),
('Казань', 'kazan', 0.90, 8),
('Нижний Новгород', 'nizhny_novgorod', 0.90, 9),
('Самара', 'samara', 0.85, 10),
('Ростов-на-Дону', 'rostov', 0.90, 11),
('Воронеж', 'voronezh', 0.85, 12),
('Тюмень', 'tyumen', 1.00, 13),
('Красноярск', 'krasnoyarsk', 0.95, 14),
('Челябинск', 'chelyabinsk', 0.85, 15),
('Другой регион', 'other', 1.00, 99);

INSERT INTO service_price_categories (name, slug, icon, sort_order) VALUES
('Отделочные работы', 'otdelochnye', 'PaintBucket', 1),
('Общестроительные работы', 'obshchestroitelnye', 'Hammer', 2),
('Сантехнические работы', 'santekhnicheskie', 'Droplets', 3),
('Электромонтажные работы', 'elektromontazhnye', 'Zap', 4),
('Монтаж дверей', 'montazh-dverey', 'DoorOpen', 5),
('Монтаж кондиционеров и вентиляции', 'montazh-kondicionerov', 'Wind', 6),
('Монтаж окон', 'montazh-okon', 'Square', 7);
