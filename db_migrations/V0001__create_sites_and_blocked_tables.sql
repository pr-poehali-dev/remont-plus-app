
CREATE TABLE sites (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  favicon TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blocked_sites (
  id SERIAL PRIMARY KEY,
  url_pattern TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sites_title ON sites USING gin(to_tsvector('russian', title));
CREATE INDEX idx_sites_description ON sites USING gin(to_tsvector('russian', description));

INSERT INTO sites (url, title, description, tags) VALUES
  ('https://ru.wikipedia.org', 'Википедия', 'Свободная энциклопедия, которую может редактировать каждый', ARRAY['энциклопедия', 'знания', 'статьи']),
  ('https://habr.com', 'Хабр', 'Крупнейшая площадка для IT-специалистов и разработчиков', ARRAY['технологии', 'it', 'программирование', 'разработка']),
  ('https://stackoverflow.com', 'Stack Overflow', 'Вопросы и ответы для программистов со всего мира', ARRAY['программирование', 'код', 'вопросы', 'разработка']),
  ('https://github.com', 'GitHub', 'Платформа для хостинга кода и совместной разработки', ARRAY['код', 'git', 'разработка', 'open-source']),
  ('https://developer.mozilla.org', 'MDN Web Docs', 'Документация для веб-разработчиков от Mozilla', ARRAY['документация', 'веб', 'html', 'css', 'javascript']),
  ('https://www.youtube.com', 'YouTube', 'Видеоплатформа для просмотра и загрузки видео', ARRAY['видео', 'стриминг', 'развлечения', 'обучение']),
  ('https://docs.python.org', 'Python Docs', 'Официальная документация языка Python', ARRAY['python', 'документация', 'программирование']),
  ('https://react.dev', 'React', 'Библиотека для создания пользовательских интерфейсов', ARRAY['react', 'javascript', 'фронтенд', 'ui']);
