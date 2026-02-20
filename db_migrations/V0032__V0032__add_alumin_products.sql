INSERT INTO supplier_products (
  supplier_id, name, description, category, subcategory,
  price, unit, image_url, in_stock, min_order_quantity,
  delivery_available, delivery_cost, delivery_days, floor_lifting_cost,
  specifications, rating, review_count
)
VALUES
(
  5,
  'Перегородка-купе раздвижная под ключ',
  'Раздвижная перегородка системы купе для зонирования комнаты или разделения помещений. Алюминиевый профиль с верхней и нижней направляющей. Стекло прозрачное, матовое или тонированное 8–10 мм. Бесшумный ход, плавное открывание. Возможна комбинация с зеркальными панелями. Монтаж под ключ включает замер, изготовление и установку.',
  'Перегородки',
  'Купе раздвижные',
  11500.00,
  'пог. м',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/2ea0d695-1725-4496-862e-7857d2e4e0e0.jpg',
  true, 1, true, 0, 7, 0,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/2ea0d695-1725-4496-862e-7857d2e4e0e0.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/19f6fd9e-18f2-4f73-acdb-23bbedfe2e7e.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/75324455-f5f0-43c1-9fc9-ea09b00f3aee.jpg"
    ],
    "profile_colors": ["Чёрный", "Белый", "Золото", "Хром"],
    "glass_types": ["Прозрачное", "Матовое", "Зеркало"],
    "glass_thickness": "8-10 мм",
    "height_max": "2800 мм",
    "warranty": "3 года",
    "installation": "Под ключ",
    "system": "Купе (раздвижная)",
    "source_url": "https://alumin.top/peregorodkipodkluch"
  }'::jsonb,
  4.8, 94
),
(
  5,
  'Душевое ограждение стеклянное под ключ',
  'Алюминиевое стеклянное ограждение для душевой зоны. Каркасные и бескаркасные системы. Закалённое стекло 8–10 мм с покрытием Easy Clean. Профиль: хром, матовый хром, чёрный. Одностворчатые, угловые и walk-in конфигурации. Монтаж под ключ: замер, изготовление, доставка, установка и герметизация.',
  'Перегородки',
  'Душевые ограждения',
  14500.00,
  'пог. м',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/4949d57d-fc5c-4f05-a325-d75743819ee1.jpg',
  true, 1, true, 0, 7, 0,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/4949d57d-fc5c-4f05-a325-d75743819ee1.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/65cebde3-5a4e-4cd8-9515-c871088754bd.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/ab35fcd0-c233-4090-9999-5154ea480643.jpg"
    ],
    "profile_colors": ["Хром", "Матовый хром", "Чёрный"],
    "glass_types": ["Прозрачное", "Матовое"],
    "glass_thickness": "8-10 мм (закалённое)",
    "coating": "Easy Clean",
    "configurations": "Walk-in, угловая, одностворчатая",
    "warranty": "3 года",
    "installation": "Под ключ",
    "source_url": "https://alumin.top/peregorodkipodkluch"
  }'::jsonb,
  4.9, 83
),
(
  5,
  'Стеклянная распашная дверь в алюминиевом профиле',
  'Одно- и двустворчатые распашные двери из закалённого стекла 8–10 мм в алюминиевом профиле. Подходит для межкомнатных проёмов, офисов, душевых кабин. Петли скрытые или накладные. Стекло прозрачное, матовое, тонированное или с фьюзинг-рисунком. Профиль: чёрный, белый, золото, хром. Монтаж под ключ.',
  'Перегородки',
  'Стеклянные двери',
  18000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e74d814d-c040-4004-af8f-87225f9a10b5.jpg',
  true, 1, true, 0, 7, 0,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e74d814d-c040-4004-af8f-87225f9a10b5.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/bdbdf635-c062-44bd-ad3e-33dc8c69e35d.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/07a9e3e9-d146-45e8-9e50-b15c674e96ef.jpg"
    ],
    "profile_colors": ["Чёрный", "Белый", "Золото", "Хром"],
    "glass_types": ["Прозрачное", "Матовое", "Тонированное"],
    "glass_thickness": "8-10 мм (закалённое)",
    "door_types": "Одностворчатая, двустворчатая",
    "hinges": "Скрытые / накладные",
    "warranty": "3 года",
    "installation": "Под ключ",
    "source_url": "https://alumin.top/peregorodkipodkluch"
  }'::jsonb,
  4.8, 61
);
