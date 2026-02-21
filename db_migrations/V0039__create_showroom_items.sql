CREATE TABLE IF NOT EXISTS showroom_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    room VARCHAR(100),
    style VARCHAR(100),
    area VARCHAR(50),
    materials TEXT[],
    image VARCHAR(500),
    designer VARCHAR(255),
    features TEXT[],
    aspect_ratio VARCHAR(20),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO showroom_items (title, description, room, style, area, materials, image, designer, features, aspect_ratio, color, sort_order) VALUES
('Минималистичная гостиная', 'Светлая гостиная с диваном B&B Italia Charles, кофейным столиком Knoll и светильником Flos Arco на паркете Dinesen дуб', 'Гостиная', 'Минимализм', '35 м²', ARRAY['Диван B&B Italia Charles (белый букле)', 'Столик Knoll Platner (золото)', 'Светильник Flos Arco', 'Паркет Dinesen дуб', 'Ковёр Kvadrat'], 'https://cdn.poehali.dev/projects/YCAJErqsEtNWqMzCONLAHU/bucket/c889585e-72b6-4f9a-a33b-9911d7b85475.jpg', 'Студия АВАНГАРД', ARRAY['B&B Italia диван', 'Flos Arco торшер', 'Knoll Platner столик', 'Паркет Dinesen'], 'wide', '#e8e4de', 1),
('Кухня-студия', 'Кухня в стиле минимализм с фасадами Bulthaup b3, столешницей из каррарского мрамора и техникой Gaggenau', 'Кухня', 'Минимализм', '22 м²', ARRAY['Кухня Bulthaup b3 (матовый белый)', 'Столешница каррарский мрамор', 'Техника Gaggenau', 'Смеситель Vola', 'Стулья Muuto Fiber'], 'https://cdn.poehali.dev/projects/YCAJErqsEtNWqMzCONLAHU/bucket/305989de-d66d-4672-a8a8-02e1cd0f725b.jpg', 'Студия АВАНГАРД', ARRAY['Bulthaup b3', 'Каррарский мрамор', 'Gaggenau техника', 'Vola смеситель'], 'square', '#f0ede8', 2),
('Дзен-ванная', 'Ванная в стиле japandi с отдельно стоящей ванной Bette Lux Shape, плиткой Ragno Realstone и золотой фурнитурой Axor Montreux', 'Ванная', 'Japandi', '14 м²', ARRAY['Ragno Realstone Slate 120×240 см', 'Ванна Bette Lux Shape', 'Смеситель Axor Montreux brushed gold', 'Тумба Duravit из дерева'], 'https://cdn.poehali.dev/projects/YCAJErqsEtNWqMzCONLAHU/bucket/c077ca52-8340-4dad-ad8d-f71f18dfcfa4.jpg', 'Студия АВАНГАРД', ARRAY['Отдельно стоящая ванна', 'Золотая фурнитура Axor', 'Spa-атмосфера', 'Тёплый пол'], 'tall', '#d4c8b8', 3),
('Ваби-саби спальня', 'Спальня в стиле wabi-sabi с матрасом Vispring Signatory, бельгийским льном Libeco и светильником Flos IC Light', 'Спальня', 'Japandi', '20 м²', ARRAY['Матрас Vispring Signatory', 'Постельное бельё Libeco Belgian linen', 'Светильник Flos IC Light', 'Паркет Barlinek дуб ёлочка', 'Травертиновые столешницы'], 'https://cdn.poehali.dev/projects/YCAJErqsEtNWqMzCONLAHU/bucket/c889585e-72b6-4f9a-a33b-9911d7b85475.jpg', 'Студия АВАНГАРД', ARRAY['Матрас Vispring', 'Barlinek дуб ёлочка', 'Льняной текстиль Libeco', 'Известковая штукатурка'], 'wide', '#d8d0c4', 4),
('Арт-деко гостиная', 'Гостиная в стиле арт-деко с изумрудным диваном Poliform Bellport, столиком Eichholtz и светильником Artemide Tolomeo', 'Гостиная', 'Современная классика', '38 м²', ARRAY['Диван Poliform Bellport (изумрудный бархат)', 'Столик Eichholtz Cartlon (латунь)', 'Светильник Artemide Tolomeo', 'Паркет Kahrs дуб шеврон', 'Ковёр Brabbu геометрика'], 'https://cdn.poehali.dev/projects/YCAJErqsEtNWqMzCONLAHU/bucket/305989de-d66d-4672-a8a8-02e1cd0f725b.jpg', 'Студия АВАНГАРД', ARRAY['Poliform Bellport', 'Латунные акценты Eichholtz', 'Паркет шеврон Kahrs', 'Мраморный камин'], 'tall', '#2d5a3d', 5);
