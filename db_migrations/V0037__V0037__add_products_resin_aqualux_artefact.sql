-- ===== ResinArt Studio (supplier_id = 7) =====

INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, in_stock, min_order_quantity, delivery_available, delivery_cost, delivery_days, floor_lifting_cost, specifications, rating, review_count)
VALUES (
  7,
  'Обеденный стол River Table из эпоксидной смолы',
  'Культовый River Table — слэб натурального ореха или дуба с рекой из прозрачной/цветной эпоксидной смолы. Каждый стол уникален, выполняется под заказ по индивидуальным размерам. На выбор: синяя океанская река, зелёный малахит, чёрный космос, флуоресцентный эффект. Ножки — чёрный металл или нержавейка. Крышка полируется до зеркального блеска.',
  'Мебель',
  'Столы на заказ',
  185000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3aa6b703-b2fd-4ba9-bcbf-07bf2f5b7702.jpg',
  true, 1, true, 5000, 45, 2000,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3aa6b703-b2fd-4ba9-bcbf-07bf2f5b7702.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/15afad81-5e0a-4649-b41b-c0af36329c75.jpg"
    ],
    "wood": "Слэб ореха / дуба натуральный",
    "resin_colors": "Синий океан, малахит, чёрный космос, флуоресцент, под заказ",
    "legs": "Чёрный металл / нержавеющая сталь",
    "surface": "Зеркальная полировка",
    "size": "Любой размер под заказ",
    "typical_size": "200×90×75 см",
    "weight": "от 80 кг",
    "production": "45 дней",
    "warranty": "5 лет",
    "unique": true,
    "custom_order": true
  }'::jsonb,
  5.0, 41
);

INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, in_stock, min_order_quantity, delivery_available, delivery_cost, delivery_days, floor_lifting_cost, specifications, rating, review_count)
VALUES (
  7,
  'Кухонная столешница из эпоксидной смолы',
  'Столешница для кухни или барной стойки из эпоксидной смолы с эффектом чёрного космоса, золотыми переливами или имитацией мрамора. Полностью влагостойкая, жаростойкая (до +80°C), химически стойкая поверхность. Производится точно по вашему проекту — любая форма, размер, цвет. Возможна интеграция мойки.',
  'Кухня',
  'Столешницы на заказ',
  42000.00,
  'пог.м.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/15afad81-5e0a-4649-b41b-c0af36329c75.jpg',
  true, 1, true, 3500, 30, 1500,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/15afad81-5e0a-4649-b41b-c0af36329c75.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3aa6b703-b2fd-4ba9-bcbf-07bf2f5b7702.jpg"
    ],
    "effects": "Чёрный космос с золотом, имитация мрамора, океан, под заказ",
    "heat_resistance": "до +80°C",
    "waterproof": true,
    "thickness": "50–80 мм",
    "unit_note": "Цена за погонный метр при ширине 60 см",
    "production": "30 дней",
    "warranty": "3 года",
    "custom_order": true,
    "sink_integration": "Возможна"
  }'::jsonb,
  4.9, 33
);

INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, in_stock, min_order_quantity, delivery_available, delivery_cost, delivery_days, floor_lifting_cost, specifications, rating, review_count)
VALUES (
  7,
  'Журнальный стол из эпоксидной смолы',
  'Авторский кофейный стол с основанием из массива и столешницей из цветной эпоксидной смолы. Популярные варианты: изумрудный с золотом, лазурный океан, розовое кварцевое стекло. Форма круглая, овальная или неправильная органическая — на выбор. Станет главным акцентом гостиной.',
  'Мебель',
  'Столы на заказ',
  78000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0beeff87-e55a-46bd-a0a5-db6087ae60f9.jpg',
  true, 1, true, 3000, 30, 1000,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0beeff87-e55a-46bd-a0a5-db6087ae60f9.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/1b5a4c2b-7912-451f-9a10-c01aa68b2182.jpg"
    ],
    "effects": "Изумруд с золотом, лазурный, розовый кварц, под заказ",
    "shape": "Круглый / овальный / органический",
    "base": "Массив дуба / орех / металл",
    "diameter": "60–120 см",
    "production": "30 дней",
    "warranty": "3 года",
    "custom_order": true
  }'::jsonb,
  4.9, 27
);

INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, in_stock, min_order_quantity, delivery_available, delivery_cost, delivery_days, floor_lifting_cost, specifications, rating, review_count)
VALUES (
  7,
  'Раковина из эпоксидной смолы на заказ',
  'Дизайнерская раковина для ванной комнаты из монолитной эпоксидной смолы. Полностью водостойкая, гигиеничная поверхность без пор. Цвет, форма и размер — на выбор. Популярные варианты: глубокий фиолетовый с серебром, агат, терракота. Настольная или накладная установка.',
  'Сантехника',
  'Раковины на заказ',
  55000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/1b5a4c2b-7912-451f-9a10-c01aa68b2182.jpg',
  true, 1, true, 2500, 30, 1000,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/1b5a4c2b-7912-451f-9a10-c01aa68b2182.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0beeff87-e55a-46bd-a0a5-db6087ae60f9.jpg"
    ],
    "effects": "Фиолетовый с серебром, агат, терракота, под заказ",
    "installation": "Настольная / накладная",
    "waterproof": true,
    "antibacterial": true,
    "size": "Любой под заказ",
    "production": "30 дней",
    "warranty": "3 года",
    "custom_order": true
  }'::jsonb,
  4.8, 19
);

-- ===== AquaLux (supplier_id = 8) =====

INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, in_stock, min_order_quantity, delivery_available, delivery_cost, delivery_days, floor_lifting_cost, specifications, rating, review_count)
VALUES (
  8,
  'Ванна отдельностоящая Bette Lux Shape',
  'Отдельностоящая дизайнерская ванна из стальной эмали Bette (Германия). Асимметричная скульптурная форма, матовый чёрный или белый цвет. Класс защиты BetteGlasur Plus — устойчива к царапинам, моющим средствам, ультрафиолету. Встроенный слив Bette Lux с хромированной крышкой. Устанавливается на ножки или платформу.',
  'Сантехника',
  'Ванны',
  385000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0a5995b9-7baa-418b-b1b3-1138b303f2e0.jpg',
  true, 1, true, 4500, 14, 3000,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0a5995b9-7baa-418b-b1b3-1138b303f2e0.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/9fc0a93b-a6ce-4217-8175-1117f8e824e4.jpg"
    ],
    "brand": "Bette (Германия)",
    "material": "Стальная эмаль BetteGlasur Plus",
    "colors": "Матовый чёрный, белый, 25+ оттенков",
    "size": "180×80 см",
    "volume": "290 л",
    "drain": "Встроенный Bette Lux",
    "installation": "Отдельностоящая / на платформе",
    "warranty": "30 лет",
    "scratch_resistant": true,
    "uv_resistant": true
  }'::jsonb,
  4.9, 56
);

INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, in_stock, min_order_quantity, delivery_available, delivery_cost, delivery_days, floor_lifting_cost, specifications, rating, review_count)
VALUES (
  8,
  'Раковина подвесная Duravit Viu',
  'Подвесная раковина из сантехнического фарфора серии Viu, дизайн Sieger Design × Duravit. Геометрическая угловатая форма, тонкий борт 5 мм — ультрасовременный вид. Доступна в белом глянце и антрацитовом матовом. Смеситель устанавливается на борт или на стену. SensoWash совместимость.',
  'Сантехника',
  'Раковины',
  68000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/9fc0a93b-a6ce-4217-8175-1117f8e824e4.jpg',
  true, 1, true, 2500, 10, 800,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/9fc0a93b-a6ce-4217-8175-1117f8e824e4.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0a734166-6724-4103-b3c9-b1a7857b98e4.jpg"
    ],
    "brand": "Duravit (Германия)",
    "series": "Viu",
    "design": "Sieger Design",
    "material": "Сантехнический фарфор WonderGliss",
    "colors": "Белый глянец, антрацит матовый",
    "size": "60×47 см",
    "installation": "Подвесная",
    "faucet_holes": "Борт / стена",
    "warranty": "10 лет"
  }'::jsonb,
  4.8, 43
);

INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, in_stock, min_order_quantity, delivery_available, delivery_cost, delivery_days, floor_lifting_cost, specifications, rating, review_count)
VALUES (
  8,
  'Душевая система Fantini с термостатом',
  'Верхний душ-водопад + термостат + боковые форсунки — полная встраиваемая душевая система итальянского бренда Fantini. Матовый золотой или сатинированный хром. Верхний душ 300×300 мм с потоком «тропический дождь». Термостат фиксирует температуру с точностью 1°C. Все скрытые части хромированы, внешние — покрытие PVD.',
  'Сантехника',
  'Душевые системы',
  245000.00,
  'компл.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/ab638ced-8f4c-4fff-b0db-920cca4d1576.jpg',
  true, 1, true, 3500, 14, 0,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/ab638ced-8f4c-4fff-b0db-920cca4d1576.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0a5995b9-7baa-418b-b1b3-1138b303f2e0.jpg"
    ],
    "brand": "Fantini (Италия)",
    "finish": "Матовое золото / сатинированный хром (PVD)",
    "rain_head": "300×300 мм",
    "thermostat": "±1°C точность",
    "body_jets": "6 форсунок",
    "pressure": "от 1.5 бар",
    "installation": "Встраиваемая в стену",
    "warranty": "5 лет"
  }'::jsonb,
  4.9, 29
);

INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, in_stock, min_order_quantity, delivery_available, delivery_cost, delivery_days, floor_lifting_cost, specifications, rating, review_count)
VALUES (
  8,
  'Унитаз подвесной безободковый Villeroy & Boch Subway 3.0',
  'Подвесной безободковый унитаз с функцией DirectFlush — мощный смыв без ободка, гигиенично на 100%. CeramicPlus покрытие: грязь и известковый налёт не прилипают. Доступен в белом и черном матовом. Совместим со всеми инсталляциями Viega и Geberit. Сиденье с микролифтом TwistOff в комплекте.',
  'Сантехника',
  'Унитазы',
  78000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0a734166-6724-4103-b3c9-b1a7857b98e4.jpg',
  true, 1, true, 2000, 7, 500,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0a734166-6724-4103-b3c9-b1a7857b98e4.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/9fc0a93b-a6ce-4217-8175-1117f8e824e4.jpg"
    ],
    "brand": "Villeroy & Boch (Германия)",
    "series": "Subway 3.0",
    "flush": "DirectFlush безободковый",
    "coating": "CeramicPlus антигрязевое",
    "colors": "Белый, чёрный матовый",
    "installation": "Подвесной",
    "seat": "Микролифт TwistOff в комплекте",
    "compatibility": "Viega / Geberit инсталляции",
    "warranty": "10 лет"
  }'::jsonb,
  4.8, 71
);

-- ===== Artefact (supplier_id = 9) =====

INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, in_stock, min_order_quantity, delivery_available, delivery_cost, delivery_days, floor_lifting_cost, specifications, rating, review_count)
VALUES (
  9,
  'Картина маслом абстракция «Глубина»',
  'Авторская живопись маслом на холсте — крупноформатная абстракция в стиле contemporary. Тёмно-синий, золото, медь — техника мастихина с объёмными мазками. Каждая работа уникальна, выполняется под заказ с учётом вашей цветовой гаммы. Готова к вывешиванию: натянута на подрамник, торцы окрашены. Авторский сертификат в комплекте.',
  'Декор',
  'Картины',
  95000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/2b95105d-f80d-42b9-b877-1423e5fef070.jpg',
  true, 1, true, 2500, 21, 0,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/2b95105d-f80d-42b9-b877-1423e5fef070.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/2c634d6b-4ea7-478f-b62b-f3c603b99a6f.jpg"
    ],
    "technique": "Масло на холсте, мастихин",
    "style": "Contemporary абстракция",
    "palette": "Тёмно-синий, золото, медь (под заказ)",
    "size": "120×80 см (под заказ до 200×150 см)",
    "frame": "Без рамы / с рамой флоат",
    "certificate": "Авторский сертификат",
    "custom_order": true,
    "production": "21 день"
  }'::jsonb,
  5.0, 34
);

INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, in_stock, min_order_quantity, delivery_available, delivery_cost, delivery_days, floor_lifting_cost, specifications, rating, review_count)
VALUES (
  9,
  'Светильник подвесной ручной работы Wabi-Sabi',
  'Дизайнерский подвесной светильник — керамический плафон ручной формовки в стиле wabi-sabi. Каждый экземпляр уникален по форме и цвету глазури (слоновая кость, шалфей, антрацит). Льняной шнур, цоколь E27, совместим с диммером. Подходит над обеденным столом, в спальне, над кухонным островом.',
  'Освещение',
  'Подвесные светильники',
  28000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/809f75d5-4964-4d12-92fd-a3af488b78a8.jpg',
  true, 1, true, 1500, 14, 0,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/809f75d5-4964-4d12-92fd-a3af488b78a8.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/2b95105d-f80d-42b9-b877-1423e5fef070.jpg"
    ],
    "material": "Керамика ручной формовки, льняной шнур",
    "style": "Wabi-Sabi, japandi",
    "glazes": "Слоновая кость, шалфей, антрацит",
    "socket": "E27",
    "dimmable": true,
    "cord_length": "до 3 м (регулируется)",
    "unique": true,
    "custom_glaze": "Возможна под заказ",
    "production": "14 дней"
  }'::jsonb,
  4.9, 48
);

INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, in_stock, min_order_quantity, delivery_available, delivery_cost, delivery_days, floor_lifting_cost, specifications, rating, review_count)
VALUES (
  9,
  'Набор декоративных ваз Organic',
  'Сет из 3 скульптурных ваз из натурального травертина и матовой терракоты. Органические асимметричные формы — каждый предмет уникален. Идеально для сухих цветов, пампасной травы, веток. Расставляются группой на комоде, полке или полу. Устойчивое основание, без отверстия под воду.',
  'Декор',
  'Вазы и аксессуары',
  18500.00,
  'компл.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/2c634d6b-4ea7-478f-b62b-f3c603b99a6f.jpg',
  true, 1, true, 1200, 7, 0,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/2c634d6b-4ea7-478f-b62b-f3c603b99a6f.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/809f75d5-4964-4d12-92fd-a3af488b78a8.jpg"
    ],
    "set": "3 вазы",
    "materials": "Травертин натуральный, терракота матовая",
    "heights": "15 / 25 / 40 см",
    "style": "Органика, japandi, wabi-sabi",
    "use": "Сухие цветы, декоративные ветки",
    "unique": true
  }'::jsonb,
  4.8, 22
);

INSERT INTO supplier_products (supplier_id, name, description, category, subcategory, price, unit, image_url, in_stock, min_order_quantity, delivery_available, delivery_cost, delivery_days, floor_lifting_cost, specifications, rating, review_count)
VALUES (
  9,
  'Навесные полки из слэба Live Edge',
  'Плавающие полки из слэба натурального дерева (орех, дуб) с живым краем — природным изгибом дерева. Каждая полка уникальна по форме и рисунку волокна. Крепятся на скрытых стальных кронштейнах — эффект парения в воздухе. Покрытие маслом Rubio или лаком. Размер и количество полок — под заказ.',
  'Декор',
  'Полки на заказ',
  22000.00,
  'шт.',
  'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/79f2e7f2-a59a-4b26-a109-f9245f6f97b5.jpg',
  true, 1, true, 2000, 21, 500,
  '{
    "photos": [
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/79f2e7f2-a59a-4b26-a109-f9245f6f97b5.jpg",
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/2b95105d-f80d-42b9-b877-1423e5fef070.jpg"
    ],
    "wood": "Слэб ореха / дуба, Live Edge",
    "mounting": "Скрытые стальные кронштейны",
    "coating": "Масло Rubio / лак",
    "length": "60–200 см (под заказ)",
    "depth": "20–35 см",
    "load": "до 30 кг",
    "unique": true,
    "custom_order": true,
    "production": "21 день"
  }'::jsonb,
  4.9, 37
);
