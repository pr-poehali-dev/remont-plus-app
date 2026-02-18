CREATE TABLE t_p46588937_remont_plus_app.portfolio_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    area VARCHAR(50),
    duration VARCHAR(50),
    price VARCHAR(100),
    category VARCHAR(100) DEFAULT 'Ремонт',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_p46588937_remont_plus_app.client_reviews (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    date_label VARCHAR(100),
    emoji VARCHAR(10) DEFAULT '👤',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p46588937_remont_plus_app.portfolio_projects (title, description, image_url, area, duration, price, sort_order) VALUES
('Ванная комната', 'Современный дизайн с мраморной плиткой', 'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/c50e56a4-0403-4a15-9304-377f1e623dcd.jpg', '8 м²', '14 дней', 'от 320 000 ₽', 1),
('Кухня-гостиная', 'Скандинавский стиль с островом', 'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e8794aeb-95cc-471b-af60-ac670e68e682.jpg', '25 м²', '21 день', 'от 580 000 ₽', 2),
('Гостиная', 'Уютная гостиная с акцентной стеной', 'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3c16649d-8e76-43b4-9b6f-0ed4f4f2ff25.jpg', '18 м²', '12 дней', 'от 290 000 ₽', 3);

INSERT INTO t_p46588937_remont_plus_app.client_reviews (name, text, rating, date_label, emoji, sort_order) VALUES
('Анна К.', 'Сделали ремонт ванной за 2 недели. Плитка уложена идеально, швы ровные. Мастера аккуратные, после себя всё убрали. Рекомендую!', 5, 'Январь 2026', '👩', 1),
('Дмитрий П.', 'Заказывал ремонт кухни под ключ. Дизайн-проект помог сразу понять, как будет выглядеть результат. Уложились в бюджет и сроки.', 5, 'Декабрь 2025', '👨', 2),
('Елена М.', 'Очень удобный калькулятор — сразу видно стоимость работ. Мастер приехал вовремя, работа выполнена качественно. Спасибо!', 5, 'Февраль 2026', '👩', 3);