-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'contractor')),
    specialization VARCHAR(255),
    experience INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица SMS кодов для верификации
CREATE TABLE sms_codes (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_sms_codes_phone ON sms_codes(phone);
CREATE INDEX idx_sms_codes_expires ON sms_codes(expires_at);

-- Комментарии к таблицам
COMMENT ON TABLE users IS 'Пользователи системы (заказчики и исполнители)';
COMMENT ON TABLE sms_codes IS 'SMS коды для верификации телефонов';