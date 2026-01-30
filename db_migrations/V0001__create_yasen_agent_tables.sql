-- Создание таблиц для ИИ-агента ЯСЕН

-- Таблица нарядов-заказов
CREATE TABLE IF NOT EXISTS work_orders (
    id SERIAL PRIMARY KEY,
    customer_phone VARCHAR(20) NOT NULL,
    contractor_phone VARCHAR(20),
    work_description TEXT NOT NULL,
    price DECIMAL(10,2),
    deadline DATE,
    conversation_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_customer ON work_orders(customer_phone);
CREATE INDEX idx_work_orders_contractor ON work_orders(contractor_phone);

-- Таблица записей разговоров
CREATE TABLE IF NOT EXISTS conversation_recordings (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL,
    audio_url TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    participants TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recordings_conversation ON conversation_recordings(conversation_id);

COMMENT ON TABLE work_orders IS 'Наряды-заказы, сформированные ИИ-агентом ЯСЕН';
COMMENT ON TABLE conversation_recordings IS 'Записи голосовых разговоров для контроля и изменений';
