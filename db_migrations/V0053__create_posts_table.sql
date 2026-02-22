CREATE TABLE t_p46588937_remont_plus_app.posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'Статьи',
  type TEXT NOT NULL DEFAULT 'article',
  image_url TEXT,
  read_time INTEGER DEFAULT 5,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO t_p46588937_remont_plus_app.posts (title, slug, excerpt, content, category, type, read_time, is_published, is_pinned) VALUES
('10 ошибок при ремонте квартиры, которые стоят дорого', '10-oshibok-pri-remonte', 'Узнайте, какие распространённые ошибки допускают при ремонте и как их избежать', '<p>Ремонт квартиры — серьёзное мероприятие, требующее тщательной подготовки. Многие заказчики совершают одни и те же ошибки, которые в итоге выливаются в серьёзные дополнительные расходы.</p><p>В этой статье мы разберём 10 самых распространённых ошибок и дадим советы, как их избежать.</p>', 'Советы', 'article', 8, TRUE, TRUE),
('Как выбрать правильный стиль интерьера', 'kak-vybrat-stil-interera', 'Гид по современным стилям интерьера: от минимализма до эклектики', '<p>Выбор стиля интерьера — первый и один из самых важных шагов при создании дизайн-проекта. От этого решения зависит всё: выбор материалов, мебели, декора и освещения.</p>', 'Дизайн', 'article', 12, TRUE, FALSE),
('Весенние акции на окна и остекление балконов', 'akcii-okna-vesna-2026', 'Скидки до 30% на установку окон ПВХ и алюминиевого остекления балконов в марте 2026', '<p>Только в марте 2026 года действуют специальные условия на установку окон. Успейте воспользоваться предложением!</p>', 'Акции', 'promo', 3, TRUE, TRUE),
('Расчёт бюджета на ремонт: полное руководство', 'raschet-byudzheta-na-remont', 'Пошаговая инструкция по планированию бюджета и избежанию скрытых расходов', '<p>Правильно рассчитать бюджет на ремонт — значит избежать половины проблем. Рассказываем, как это сделать грамотно.</p>', 'Финансы', 'article', 10, TRUE, FALSE);
