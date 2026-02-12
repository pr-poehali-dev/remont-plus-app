-- Добавление полей для рейтингов товаров
ALTER TABLE supplier_products 
ADD COLUMN IF NOT EXISTS rating DECIMAL(2, 1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Обновление тестовых данных с рейтингами
UPDATE supplier_products SET rating = 4.8, review_count = 45 WHERE name = 'Ламинат "Дуб натуральный" 33 класс';
UPDATE supplier_products SET rating = 4.5, review_count = 28 WHERE name = 'Грунтовка глубокого проникновения';
UPDATE supplier_products SET rating = 4.9, review_count = 67 WHERE name = 'Штукатурка гипсовая Rotband';
UPDATE supplier_products SET rating = 4.7, review_count = 89 WHERE name = 'Диван-кровать "Скандинавия"';
UPDATE supplier_products SET rating = 4.6, review_count = 34 WHERE name = 'Люстра LED "Модерн"';
UPDATE supplier_products SET rating = 4.8, review_count = 52 WHERE name = 'Зеркало настенное "Лофт"';
UPDATE supplier_products SET rating = 4.9, review_count = 71 WHERE name = 'Краска интерьерная "Эко-Лайт"';
UPDATE supplier_products SET rating = 4.7, review_count = 43 WHERE name = 'Обои флизелиновые "Скандинавия"';
UPDATE supplier_products SET rating = 4.8, review_count = 56 WHERE name = 'Паркетная доска "Дуб классик"';

CREATE INDEX IF NOT EXISTS idx_supplier_products_rating ON supplier_products(rating DESC);
