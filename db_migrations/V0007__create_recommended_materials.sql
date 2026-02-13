CREATE TABLE t_p46588937_remont_plus_app.recommended_materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(100) NOT NULL,
    category VARCHAR(100) DEFAULT 'Отделочные',
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p46588937_remont_plus_app.recommended_materials (name, price, category, sort_order) VALUES
('Ламинат Premium', '1 200 ₽/м²', 'Напольные покрытия', 1),
('Керамогранит', '2 500 ₽/м²', 'Напольные покрытия', 2),
('Краска латексная', '450 ₽/л', 'Краски', 3),
('Обои виниловые', '850 ₽/рул', 'Обои', 4);