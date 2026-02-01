CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.ai_chat_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p46588937_remont_plus_app.users(id),
  session_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.ai_chat_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) REFERENCES t_p46588937_remont_plus_app.ai_chat_sessions(session_id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.design_projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p46588937_remont_plus_app.users(id),
  name VARCHAR(255) NOT NULL,
  room_type VARCHAR(50),
  style VARCHAR(50),
  area DECIMAL(10,2),
  budget DECIMAL(15,2),
  ceiling_height DECIMAL(5,2),
  windows_count INTEGER,
  visualization_url TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.design_materials (
  id SERIAL PRIMARY KEY,
  design_project_id INTEGER REFERENCES t_p46588937_remont_plus_app.design_projects(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(20),
  quantity DECIMAL(10,2),
  price DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.estimates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p46588937_remont_plus_app.users(id),
  design_project_id INTEGER REFERENCES t_p46588937_remont_plus_app.design_projects(id),
  name VARCHAR(255) NOT NULL,
  total_materials DECIMAL(15,2) DEFAULT 0,
  total_works DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.estimate_items (
  id SERIAL PRIMARY KEY,
  estimate_id INTEGER REFERENCES t_p46588937_remont_plus_app.estimates(id),
  category VARCHAR(50) NOT NULL CHECK (category IN ('Материалы', 'Работы')),
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.contractors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p46588937_remont_plus_app.users(id),
  company_name VARCHAR(255) NOT NULL,
  description TEXT,
  experience_years INTEGER,
  projects_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  location VARCHAR(255),
  specializations TEXT[],
  price_from DECIMAL(15,2),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.suppliers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p46588937_remont_plus_app.users(id),
  company_name VARCHAR(255) NOT NULL,
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  location VARCHAR(255),
  categories TEXT[],
  delivery_info VARCHAR(500),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.project_contractors (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES t_p46588937_remont_plus_app.projects(id),
  contractor_id INTEGER REFERENCES t_p46588937_remont_plus_app.contractors(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  budget_offer DECIMAL(15,2),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p46588937_remont_plus_app.reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p46588937_remont_plus_app.users(id),
  contractor_id INTEGER REFERENCES t_p46588937_remont_plus_app.contractors(id),
  project_id INTEGER REFERENCES t_p46588937_remont_plus_app.projects(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session ON t_p46588937_remont_plus_app.ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_design_projects_user ON t_p46588937_remont_plus_app.design_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_estimates_user ON t_p46588937_remont_plus_app.estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_contractors_user ON t_p46588937_remont_plus_app.contractors(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_user ON t_p46588937_remont_plus_app.suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_contractor ON t_p46588937_remont_plus_app.reviews(contractor_id);