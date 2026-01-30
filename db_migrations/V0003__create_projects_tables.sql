-- Таблица проектов
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    project_type VARCHAR(50) NOT NULL CHECK (project_type IN ('apartment', 'house', 'office', 'commercial')),
    area DECIMAL(10, 2),
    rooms INTEGER,
    budget DECIMAL(15, 2),
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'measurement', 'design', 'estimate', 'in_progress', 'completed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица измерений помещений
CREATE TABLE room_measurements (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    room_name VARCHAR(100) NOT NULL,
    length DECIMAL(10, 2) NOT NULL,
    width DECIMAL(10, 2) NOT NULL,
    height DECIMAL(10, 2) NOT NULL,
    area DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица фотографий проекта
CREATE TABLE project_photos (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    photo_url VARCHAR(500) NOT NULL,
    room_name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_room_measurements_project_id ON room_measurements(project_id);
CREATE INDEX idx_project_photos_project_id ON project_photos(project_id);

-- Комментарии к таблицам
COMMENT ON TABLE projects IS 'Проекты заказчиков (ремонт и дизайн)';
COMMENT ON TABLE room_measurements IS 'Измерения помещений для проектов';
COMMENT ON TABLE project_photos IS 'Фотографии объектов проектов';