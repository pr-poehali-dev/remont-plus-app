INSERT INTO supplier_products (
  supplier_id, name, description, category, subcategory,
  price, unit, image_url, in_stock, min_order_quantity,
  delivery_available, delivery_cost, delivery_days, floor_lifting_cost,
  specifications, rating, review_count
)
VALUES (
  6,
  'Комод дизайнерский с мраморной столешницей',
  'Дизайнерский комод премиум-класса с натуральной мраморной столешницей и корпусом из массива дуба или ореха. Ручки и ножки из латуни или нержавеющей стали. 4–6 выдвижных ящиков с плавным закрыванием (доводчики Blum). Индивидуальное изготовление под размер и цвет интерьера. Подходит для спален, гостиных, холлов.',
  'Мебель',
  'Комоды',
  185000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/86eecdf5-bdd9-4d6d-b4d6-8e478b7d7512.jpg',
  true, 1, true, 3500, 21, 1500,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/86eecdf5-bdd9-4d6d-b4d6-8e478b7d7512.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/a1f56302-9dd2-4cc6-9c93-80191885c1f9.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/c827a578-19ea-4b68-b299-d3d3f18dfb55.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/5db8546a-21f3-4a18-9382-45d8a656602f.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/b590dfac-18f6-4618-b4a7-5fa2b44bafe9.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/c8c7def2-a9d0-42b6-89df-8cbc3144544b.jpg"
    ],
    "materials": "Массив дуба / орех, мрамор натуральный",
    "fittings": "Латунь / нержавеющая сталь",
    "drawers": "4–6 ящиков с доводчиками Blum",
    "colors": "Дуб натуральный, орех тёмный, белый глянец",
    "marble": "Каррара, Emperador, Nero Marquina",
    "width": "120–180 см (под заказ)",
    "warranty": "2 года",
    "production": "Под заказ 21 день",
    "installation": "Сборка включена",
    "source_url": "https://homeconcept.ru/catalog/mebel/storage/"
  }'::jsonb,
  4.8,
  37
);
