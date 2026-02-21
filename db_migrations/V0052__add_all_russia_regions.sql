-- Расширение географии: все регионы России включая Крым и новые регионы

INSERT INTO service_regions (name, code, price_coefficient, sort_order, is_active) VALUES

-- Города-миллионники и крупные центры
('Омск', 'omsk', 0.85, 16, true),
('Уфа', 'ufa', 0.88, 17, true),
('Пермь', 'perm', 0.88, 18, true),
('Волгоград', 'volgograd', 0.85, 19, true),
('Саратов', 'saratov', 0.82, 20, true),
('Красноярский край', 'krasnoyarsk_region', 0.92, 21, true),
('Иркутск', 'irkutsk', 0.90, 22, true),
('Томск', 'tomsk', 0.88, 23, true),
('Барнаул', 'barnaul', 0.82, 24, true),
('Владивосток', 'vladivostok', 1.10, 25, true),
('Хабаровск', 'khabarovsk', 1.08, 26, true),
('Якутск', 'yakutsk', 1.25, 27, true),

-- Центральная Россия
('Тверь', 'tver', 0.88, 28, true),
('Ярославль', 'yaroslavl', 0.90, 29, true),
('Иваново', 'ivanovo', 0.82, 30, true),
('Кострома', 'kostroma', 0.82, 31, true),
('Рязань', 'ryazan', 0.85, 32, true),
('Тула', 'tula', 0.88, 33, true),
('Орёл', 'orel', 0.80, 34, true),
('Курск', 'kursk', 0.82, 35, true),
('Брянск', 'bryansk', 0.80, 36, true),
('Смоленск', 'smolensk', 0.82, 37, true),
('Калуга', 'kaluga', 0.88, 38, true),
('Владимир', 'vladimir', 0.87, 39, true),
('Липецк', 'lipetsk', 0.83, 40, true),
('Тамбов', 'tambov', 0.80, 41, true),
('Пенза', 'penza', 0.80, 42, true),
('Ульяновск', 'ulyanovsk', 0.82, 43, true),

-- Поволжье и Урал
('Астрахань', 'astrakhan', 0.83, 44, true),
('Оренбург', 'orenburg', 0.82, 45, true),
('Ижевск', 'izhevsk', 0.85, 46, true),
('Чебоксары', 'cheboksary', 0.80, 47, true),
('Йошкар-Ола', 'yoshkar_ola', 0.78, 48, true),
('Саранск', 'saransk', 0.78, 49, true),
('Киров', 'kirov', 0.82, 50, true),
('Нижний Тагил', 'nizhny_tagil', 0.85, 51, true),
('Магнитогорск', 'magnitogorsk', 0.83, 52, true),
('Курган', 'kurgan', 0.78, 53, true),

-- Северо-Запад
('Мурманск', 'murmansk', 1.10, 54, true),
('Архангельск', 'arkhangelsk', 1.05, 55, true),
('Вологда', 'vologda', 0.85, 56, true),
('Псков', 'pskov', 0.82, 57, true),
('Великий Новгород', 'novgorod', 0.83, 58, true),
('Петрозаводск', 'petrozavodsk', 0.90, 59, true),
('Калининград', 'kaliningrad', 0.95, 60, true),
('Сыктывкар', 'syktyvkar', 0.90, 61, true),

-- Юг России
('Сочи', 'sochi', 1.10, 62, true),
('Новороссийск', 'novorossiysk', 0.95, 63, true),
('Ставрополь', 'stavropol', 0.85, 64, true),
('Краснодар', 'krasnodar_city', 1.00, 65, true),
('Пятигорск', 'pyatigorsk', 0.85, 66, true),
('Нальчик', 'nalchik', 0.80, 67, true),
('Махачкала', 'makhachkala', 0.82, 68, true),
('Грозный', 'grozny', 0.85, 69, true),
('Владикавказ', 'vladikavkaz', 0.80, 70, true),

-- Крым
('Республика Крым', 'crimea', 0.90, 71, true),
('Севастополь', 'sevastopol', 0.92, 72, true),
('Симферополь', 'simferopol', 0.88, 73, true),
('Ялта', 'yalta', 0.95, 74, true),
('Феодосия', 'feodosiya', 0.85, 75, true),
('Керчь', 'kerch', 0.83, 76, true),

-- Новые регионы
('ДНР (Донецк)', 'dnr_donetsk', 0.85, 77, true),
('ДНР (Мариуполь)', 'dnr_mariupol', 0.82, 78, true),
('ЛНР (Луганск)', 'lnr_lugansk', 0.82, 79, true),
('Запорожская область', 'zaporozhye_region', 0.80, 80, true),
('Херсонская область', 'kherson_region', 0.80, 81, true),

-- Сибирь и Дальний Восток
('Новосибирская область', 'novosibirsk_region', 0.87, 82, true),
('Кемерово', 'kemerovo', 0.85, 83, true),
('Новокузнецк', 'novokuznetsk', 0.83, 84, true),
('Абакан', 'abakan', 0.82, 85, true),
('Улан-Удэ', 'ulan_ude', 0.85, 86, true),
('Чита', 'chita', 0.85, 87, true),
('Благовещенск', 'blagoveshchensk', 0.90, 88, true),
('Комсомольск-на-Амуре', 'komsomolsk', 0.95, 89, true),
('Южно-Сахалинск', 'yuzhno_sakhalinsk', 1.20, 90, true),
('Петропавловск-Камчатский', 'petropavlovsk', 1.25, 91, true),
('Магадан', 'magadan', 1.30, 92, true),
('Норильск', 'norilsk', 1.35, 93, true),
('Сургут', 'surgut', 1.10, 94, true),
('Нефтеюганск', 'nefteyugansk', 1.08, 95, true),
('Нижневартовск', 'nizhnevartovsk', 1.10, 96, true),
('Ханты-Мансийск', 'khanty_mansiysk', 1.12, 97, true),
('Салехард', 'salekhard', 1.20, 98, true);

-- Обновляем sort_order у "Другой регион" чтобы всегда был последним
UPDATE service_regions SET sort_order = 999 WHERE code = 'other';
