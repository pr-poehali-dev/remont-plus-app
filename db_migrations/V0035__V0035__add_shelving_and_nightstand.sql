INSERT INTO supplier_products (
  supplier_id, name, description, category, subcategory,
  price, unit, image_url, in_stock, min_order_quantity,
  delivery_available, delivery_cost, delivery_days, floor_lifting_cost,
  specifications, rating, review_count
)
VALUES
(
  6,
  'Стеллаж дизайнерский открытый',
  'Дизайнерский открытый стеллаж из натурального дерева (дуб, орех) с металлическим каркасом (чёрный матовый или латунь). 4–8 полок, возможна напольная и настенная версия. Индивидуальное изготовление под высоту и ширину помещения. Подходит для гостиной, кабинета, спальни. Идеально для хранения книг, декора, предметов искусства.',
  'Мебель',
  'Стеллажи',
  145000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/48545713-4e5d-441d-865e-e8be33cba75e.jpg',
  true, 1, true, 3500, 21, 1500,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/48545713-4e5d-441d-865e-e8be33cba75e.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/ef829fcb-5dee-4eb8-a329-b9f380976403.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/90ad068f-cbc8-41b6-bb5c-2de8ee5a659e.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/d2730846-de83-4df5-994f-98cdd9ae9734.jpg"
    ],
    "materials": "Массив дуба / орех, металлический каркас",
    "frame_colors": "Чёрный матовый, латунь",
    "shelves": "4–8 полок",
    "versions": "Напольный, настенный",
    "width": "80–240 см (под заказ)",
    "height": "до 280 см",
    "warranty": "2 года",
    "production": "Под заказ 21 день",
    "installation": "Сборка включена",
    "source_url": "https://homeconcept.ru/catalog/mebel/storage/"
  }'::jsonb,
  4.7, 28
),
(
  6,
  'Тумба прикроватная с мраморной столешницей',
  'Прикроватная тумба премиум-класса с натуральной мраморной столешницей. Корпус из массива дуба, ореха или лакированного МДФ. 1–2 ящика с доводчиками Blum. Ножки латунь или нержавеющая сталь. Выпускается в паре для симметричной расстановки. Подходит к любому дизайну спальни — от современного до арт-деко.',
  'Мебель',
  'Тумбы',
  68000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/bde5d767-6c11-48e7-b22b-781ec9979f65.jpg',
  true, 1, true, 2500, 21, 1000,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/bde5d767-6c11-48e7-b22b-781ec9979f65.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/b8fde087-0636-4447-8108-9b868282b9de.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/08b1155c-8241-44a5-8340-300dce7cbaa9.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e96843e7-dfc8-47ba-9736-41b6fb9337e4.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/84b7659d-60eb-4eda-95a8-7bec853977b0.jpg"
    ],
    "materials": "Массив дуба / орех / лак МДФ, мрамор натуральный",
    "fittings": "Латунь / нержавеющая сталь",
    "drawers": "1–2 ящика с доводчиками Blum",
    "marble": "Каррара, Emperador, Nero Marquina",
    "size": "50×45×60 см (ШxГxВ)",
    "pair": "Доступна парная комплектация",
    "warranty": "2 года",
    "production": "Под заказ 21 день",
    "installation": "Сборка включена",
    "source_url": "https://homeconcept.ru/catalog/mebel/storage/"
  }'::jsonb,
  4.9, 19
);
