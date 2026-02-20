INSERT INTO suppliers (company_name, description, rating, reviews_count, location, categories, delivery_info, verified)
VALUES (
  'Home Concept',
  'Дизайнерская мебель премиум-класса для современных интерьеров. Комоды, стеллажи, шкафы, тумбы из натуральной кожи, дерева, мрамора, алюминия и стали. Эксклюзивный европейский дизайн.',
  4.8,
  214,
  'Москва',
  ARRAY['Мебель', 'Комоды', 'Стеллажи', 'Премиум'],
  'Доставка по Москве и России. Сборка в подарок при заказе от 100 000 ₽.',
  true
)
ON CONFLICT DO NOTHING;
