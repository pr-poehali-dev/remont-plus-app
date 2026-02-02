-- Создание таблицы продуктов/материалов от поставщиков
CREATE TABLE IF NOT EXISTS supplier_products (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER REFERENCES suppliers(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  min_order_quantity DECIMAL(10, 2) DEFAULT 1,
  delivery_available BOOLEAN DEFAULT true,
  delivery_cost DECIMAL(10, 2) DEFAULT 0,
  delivery_days INTEGER DEFAULT 3,
  floor_lifting_cost DECIMAL(10, 2) DEFAULT 0,
  specifications JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier_id ON supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_category ON supplier_products(category);
CREATE INDEX IF NOT EXISTS idx_supplier_products_in_stock ON supplier_products(in_stock);

-- Добавление тестовых поставщиков
INSERT INTO suppliers (company_name, description, rating, reviews_count, location, categories, delivery_info, verified) VALUES
('СтройМатериалы Плюс', 'Крупнейший поставщик строительных материалов в регионе', 4.8, 324, 'Самара, ул. Промышленная 45', ARRAY['Стройматериалы', 'Отделка', 'Сантехника'], 'Доставка по городу в течение 1-2 дней', true),
('Мир Интерьера', 'Элитная мебель и предметы интерьера', 4.9, 187, 'Самара, пр. Кирова 78', ARRAY['Мебель', 'Декор', 'Освещение'], 'Бесплатная доставка при заказе от 50 000 ₽', true),
('ЭкоДом', 'Экологичные материалы для ремонта', 4.7, 256, 'Самара, ул. Ленинская 12', ARRAY['Краски', 'Обои', 'Напольные покрытия'], 'Доставка и подъем на этаж включены', true);

-- Добавление тестовых продуктов
INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, delivery_available, delivery_cost, floor_lifting_cost, specifications) VALUES
(1, 'Ламинат "Дуб натуральный" 33 класс', 'Влагостойкий ламинат премиум класса с фаской', 'Напольные покрытия', 'Ламинат', 1250.00, 'м²', null, true, 500, 150, '{"thickness": "12мм", "warranty": "25 лет", "country": "Германия"}'),
(1, 'Грунтовка глубокого проникновения', 'Укрепляющая грунтовка для стен и потолков', 'Стройматериалы', 'Грунтовки', 450.00, 'л', null, true, 300, 50, '{"volume": "10л", "coverage": "100 м²"}'),
(1, 'Штукатурка гипсовая Rotband', 'Универсальная сухая смесь для выравнивания стен', 'Стройматериалы', 'Штукатурка', 380.00, 'мешок 30кг', null, true, 400, 100, '{"weight": "30кг", "coverage": "3-4 м²"}'),
(2, 'Диван-кровать "Скандинавия"', 'Современный диван с механизмом трансформации', 'Мебель', 'Мягкая мебель', 45000.00, 'шт', null, true, 1500, 500, '{"size": "220x95x85см", "material": "Велюр", "color": "Серый"}'),
(2, 'Люстра LED "Модерн"', 'Потолочная люстра с пультом управления', 'Освещение', 'Потолочные светильники', 8900.00, 'шт', null, true, 0, 0, '{"power": "60Вт", "color_temp": "3000-6000К", "diameter": "60см"}'),
(2, 'Зеркало настенное "Лофт"', 'Большое зеркало в металлической раме', 'Декор', 'Зеркала', 12500.00, 'шт', null, true, 800, 300, '{"size": "120x80см", "frame": "Черный металл"}'),
(3, 'Краска интерьерная "Эко-Лайт"', 'Гипоаллергенная краска без запаха', 'Краски', 'Интерьерные краски', 650.00, 'л', null, true, 350, 80, '{"volume": "9л", "coverage": "60-70 м²", "eco": "A+"}'),
(3, 'Обои флизелиновые "Скандинавия"', 'Моющиеся обои с геометрическим узором', 'Обои', 'Флизелиновые обои', 2800.00, 'рулон', null, true, 250, 50, '{"width": "1.06м", "length": "10м", "pattern": "Геометрия"}'),
(3, 'Паркетная доска "Дуб классик"', 'Трехполосная паркетная доска', 'Напольные покрытия', 'Паркетная доска', 3200.00, 'м²', null, true, 600, 200, '{"thickness": "14мм", "width": "188мм", "finish": "Масло-воск"}');

-- Таблица для связи продуктов с дизайн-проектами
CREATE TABLE IF NOT EXISTS design_project_products (
  id SERIAL PRIMARY KEY,
  design_project_id INTEGER REFERENCES design_projects(id),
  product_id INTEGER REFERENCES supplier_products(id),
  quantity DECIMAL(10, 2) NOT NULL,
  room_name VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_design_project_products_project ON design_project_products(design_project_id);
CREATE INDEX IF NOT EXISTS idx_design_project_products_product ON design_project_products(product_id);
