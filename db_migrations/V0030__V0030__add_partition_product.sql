INSERT INTO supplier_products (
  supplier_id, name, description, category, subcategory,
  price, unit, image_url,
  in_stock, min_order_quantity,
  delivery_available, delivery_cost, delivery_days,
  floor_lifting_cost, specifications, rating, review_count
)
VALUES (
  5,
  'Перегородка для зонирования под ключ',
  'Алюминиевая стеклянная перегородка для зонирования пространства. Изготовление по индивидуальным размерам. Алюминиевый профиль (чёрный, белый, золото, хром), стекло прозрачное или матовое 8-10мм. Монтаж под ключ включает замер, изготовление, доставку и установку. Подходит для квартир, домов, офисов.',
  'Перегородки',
  'Зонирование',
  0,
  'пог. м',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/837b161b-15f9-4c08-a301-b7d875af2a27.jpg',
  true,
  1,
  true,
  0,
  7,
  0,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/837b161b-15f9-4c08-a301-b7d875af2a27.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/f1820ed0-b784-4338-ace3-c2010aae1aba.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/fee73ab3-cd9f-4307-b963-e67dc8dab174.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/8c12119e-bf79-4cbc-b175-f64408afe9be.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/9bb8de75-75ad-46d2-a362-7f624ea800b8.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/c1a6c04c-65ec-460c-9d22-f367bb17056b.jpg"
    ],
    "profile_colors": ["Чёрный", "Белый", "Золото", "Хром"],
    "glass_types": ["Прозрачное", "Матовое", "Тонированное"],
    "glass_thickness": "8-10 мм",
    "height_max": "3000 мм",
    "warranty": "3 года",
    "installation": "Под ключ",
    "source_url": "https://alumin.top/peregorodkipodkluch"
  }'::jsonb,
  4.9,
  127
);
