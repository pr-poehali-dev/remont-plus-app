import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

// ─────────────────────────────────────────────
// ТИПЫ
// ─────────────────────────────────────────────
interface WorkItem {
  name: string;
  qty: number;
  unit: string;
  pricePerUnit: number;
}

interface WorkSection {
  icon: string;
  title: string;
  items: WorkItem[];
}

interface Material {
  category: string;
  name: string;
  brand: string;
  qty: number;
  unit: string;
  pricePerUnit: number;
}

interface InteriorElement {
  zone: string;
  name: string;
  brand: string;
  model: string;
  qty: number;
  price: number;
}

interface Project {
  id: string;
  area: number;
  title: string;
  subtitle: string;
  style: string;
  rooms: string;
  image: string;
  accentFrom: string;
  accentTo: string;
  description: string;
  tags: string[];
  features: string[];
  workSections: WorkSection[];
  materials: Material[];
  interiorElements: InteriorElement[];
}

// ─────────────────────────────────────────────
// ДАННЫЕ ПРОЕКТОВ
// ─────────────────────────────────────────────
const PROJECTS: Project[] = [
  // ════════════════════════════════════════════
  // ПРОЕКТ 1: 46 м² — Скандинавская студия
  // ════════════════════════════════════════════
  {
    id: "studio-46",
    area: 46,
    title: "Скандинавская студия",
    subtitle: "Минимализм и функциональность",
    style: "Скандинавский минимализм",
    rooms: "Студия + санузел",
    image:
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/7e2f316a-c808-49e8-b8ae-16ae1e9680ca.jpg",
    accentFrom: "from-sky-400",
    accentTo: "to-blue-600",
    description:
      "Светлая квартира-студия с умным зонированием. Кухня, гостиная и рабочая зона объединены в единое пространство без лишних перегородок. Скандинавский стиль: натуральное дерево, белый, серый и тёплый бежевый.",
    tags: ["Студия", "Скандинавский", "Светлый", "Открытая кухня", "Рабочая зона"],
    features: [
      "Зонирование светом и текстурами без перегородок",
      "Встроенные системы хранения в прихожей и над кроватью",
      "Рабочий уголок у окна с индивидуальным освещением",
      "Тёплый пол в санузле 6 м²",
    ],
    workSections: [
      {
        icon: "Hammer",
        title: "Демонтаж",
        items: [
          { name: "Снятие старого напольного покрытия", qty: 46, unit: "м²", pricePerUnit: 120 },
          { name: "Демонтаж сантехники", qty: 1, unit: "компл.", pricePerUnit: 8_000 },
          { name: "Вывоз строительного мусора (контейнер 5 м³)", qty: 1, unit: "шт", pricePerUnit: 14_000 },
        ],
      },
      {
        icon: "PaintBucket",
        title: "Стены и потолки",
        items: [
          { name: "Штукатурка стен машинная", qty: 110, unit: "м²", pricePerUnit: 580 },
          { name: "Финишная шпаклёвка стен + потолка", qty: 156, unit: "м²", pricePerUnit: 350 },
          { name: "Покраска потолка 2 слоя (Dulux)", qty: 46, unit: "м²", pricePerUnit: 280 },
          { name: "Поклейка обоев флизелиновых", qty: 64, unit: "м²", pricePerUnit: 420 },
        ],
      },
      {
        icon: "Layers",
        title: "Полы",
        items: [
          { name: "Стяжка полусухая M300, толщина 50 мм", qty: 46, unit: "м²", pricePerUnit: 850 },
          { name: "Укладка ламината 33 класс", qty: 40, unit: "м²", pricePerUnit: 650 },
          { name: "Укладка керамогранита в санузле", qty: 6, unit: "м²", pricePerUnit: 1_300 },
          { name: "Тёплый пол электрический в санузле", qty: 6, unit: "м²", pricePerUnit: 2_200 },
          { name: "Установка плинтусов МДФ", qty: 26, unit: "пог.м", pricePerUnit: 220 },
        ],
      },
      {
        icon: "Zap",
        title: "Электрика",
        items: [
          { name: "Замена проводки (скрытая, кабель NYM 3×2.5)", qty: 46, unit: "м²", pricePerUnit: 780 },
          { name: "Установка розеток / выключателей", qty: 18, unit: "шт", pricePerUnit: 420 },
          { name: "Монтаж светильников (в т.ч. споты)", qty: 10, unit: "шт", pricePerUnit: 550 },
          { name: "Щиток + автоматы + УЗО", qty: 1, unit: "компл.", pricePerUnit: 16_000 },
        ],
      },
      {
        icon: "Droplets",
        title: "Сантехника",
        items: [
          { name: "Разводка ХВС и ГВС (PPR труба)", qty: 1, unit: "компл.", pricePerUnit: 22_000 },
          { name: "Установка душевого поддона + смесителя", qty: 1, unit: "шт", pricePerUnit: 7_000 },
          { name: "Установка инсталляции + унитаза", qty: 1, unit: "шт", pricePerUnit: 9_500 },
          { name: "Облицовка санузла плиткой (стены + пол)", qty: 28, unit: "м²", pricePerUnit: 1_500 },
        ],
      },
      {
        icon: "DoorOpen",
        title: "Двери и откосы",
        items: [
          { name: "Установка входной двери", qty: 1, unit: "шт", pricePerUnit: 6_000 },
          { name: "Установка межкомнатной двери (санузел)", qty: 1, unit: "шт", pricePerUnit: 4_500 },
          { name: "Откосы гипсокартон + шпаклёвка", qty: 8, unit: "пог.м", pricePerUnit: 850 },
        ],
      },
    ],
    materials: [
      { category: "Полы", name: "Ламинат 33 кл., дуб натуральный", brand: "Egger PRO", qty: 44, unit: "м²", pricePerUnit: 1_850 },
      { category: "Полы", name: "Керамогранит 60×60 белый мат", brand: "Kerama Marazzi", qty: 7, unit: "м²", pricePerUnit: 2_100 },
      { category: "Полы", name: "Подложка под ламинат 3 мм", brand: "Isoplaat", qty: 44, unit: "м²", pricePerUnit: 180 },
      { category: "Полы", name: "Плинтус МДФ белый 60 мм", brand: "Dollken", qty: 26, unit: "пог.м", pricePerUnit: 290 },
      { category: "Стены", name: "Краска интерьерная белая 10 л", brand: "Dulux Bindo 7", qty: 3, unit: "шт", pricePerUnit: 3_400 },
      { category: "Стены", name: "Обои флизелин однотонные, серо-бежевые", brand: "Grandeco", qty: 18, unit: "рулон", pricePerUnit: 1_100 },
      { category: "Стены", name: "Штукатурка машинная 30 кг", brand: "Knauf Rotband", qty: 10, unit: "мешок", pricePerUnit: 980 },
      { category: "Стены", name: "Шпаклёвка финишная 20 кг", brand: "Knauf Finish", qty: 8, unit: "мешок", pricePerUnit: 820 },
      { category: "Сантехника", name: "Душевой поддон 90×90 белый", brand: "Radaway", qty: 1, unit: "шт", pricePerUnit: 18_500 },
      { category: "Сантехника", name: "Инсталляция + унитаз безободковый", brand: "Grohe Rapid SL", qty: 1, unit: "компл.", pricePerUnit: 32_000 },
      { category: "Электрика", name: "Тёплый пол кабельный 900 Вт", brand: "Devi", qty: 1, unit: "компл.", pricePerUnit: 14_500 },
      { category: "Электрика", name: "Розетки / выключатели (серия)", brand: "Legrand Valena", qty: 18, unit: "шт", pricePerUnit: 480 },
    ],
    interiorElements: [
      { zone: "Гостиная", name: "Диван 2-местный, ткань бежевая", brand: "IKEA", model: "SÖDERHAMN", qty: 1, price: 42_000 },
      { zone: "Гостиная", name: "Кофейный столик, дуб / металл", brand: "IKEA", model: "VITTSJÖ", qty: 1, price: 8_500 },
      { zone: "Гостиная", name: "Напольный светильник", brand: "Loft Concept", model: "Scandic Floor", qty: 1, price: 12_000 },
      { zone: "Кухня", name: "Кухонный гарнитур П-образный 3 м", brand: "Leroy Merlin", model: "Квадро Белый", qty: 1, price: 85_000 },
      { zone: "Кухня", name: "Смеситель для кухни хром", brand: "Grohe", model: "BauLoop", qty: 1, price: 8_900 },
      { zone: "Кухня", name: "Встраиваемая варочная поверхность", brand: "Bosch", model: "PVS631FB5E", qty: 1, price: 24_000 },
      { zone: "Спальная зона", name: "Кровать 160×200 с основанием", brand: "IKEA", model: "MALM", qty: 1, price: 32_000 },
      { zone: "Спальная зона", name: "Матрас 160×200 средней жёсткости", brand: "Орматек", model: "Optima Classic", qty: 1, price: 38_000 },
      { zone: "Рабочая зона", name: "Рабочий стол 120×60", brand: "IKEA", model: "ALEX", qty: 1, price: 18_500 },
      { zone: "Рабочая зона", name: "Кресло эргономичное", brand: "Hoff", model: "Comfort Pro", qty: 1, price: 22_000 },
      { zone: "Прихожая", name: "Зеркало с подсветкой 60×80", brand: "IKEA", model: "STORJORM", qty: 1, price: 9_500 },
      { zone: "Прихожая", name: "Вешалка настенная (5 крючков)", brand: "Umbra", model: "Trigg", qty: 1, price: 4_200 },
    ],
  },

  // ════════════════════════════════════════════
  // ПРОЕКТ 2: 65 м² — Тёплый Contemporary
  // ════════════════════════════════════════════
  {
    id: "flat-65",
    area: 65,
    title: "Тёплый Contemporary",
    subtitle: "Уют и современный дизайн",
    style: "Contemporary / Неоклассика",
    rooms: "2 комнаты + кухня-столовая + санузел",
    image:
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/a2fbe211-d0d5-4557-8951-884aa6342a3c.jpg",
    accentFrom: "from-amber-400",
    accentTo: "to-orange-500",
    description:
      "Двухкомнатная квартира в стиле Contemporary с тёплой терракотово-бежевой палитрой. Паркет ёлочкой, арочный проём между гостиной и кухней, бархатные кресла и акцентные светильники создают уютную, «журнальную» атмосферу.",
    tags: ["2 комнаты", "Contemporary", "Тёплые тона", "Паркет ёлочкой", "Арка"],
    features: [
      "Арочный проём между гостиной и кухней-столовой",
      "Паркет инженерный ёлочкой во всех комнатах",
      "Гардеробная в спальне 2.4 м²",
      "Двойная система хранения на кухне с пеналом",
    ],
    workSections: [
      {
        icon: "Hammer",
        title: "Демонтаж и перепланировка",
        items: [
          { name: "Демонтаж старых покрытий пола и стен", qty: 65, unit: "м²", pricePerUnit: 180 },
          { name: "Устройство арочного проёма (гипсокартон)", qty: 1, unit: "ед.", pricePerUnit: 18_000 },
          { name: "Вывоз мусора (контейнер 7 м³)", qty: 1, unit: "шт", pricePerUnit: 19_000 },
        ],
      },
      {
        icon: "PaintBucket",
        title: "Стены и потолки",
        items: [
          { name: "Штукатурка стен машинная", qty: 168, unit: "м²", pricePerUnit: 620 },
          { name: "Монтаж гипсокартонных коробов (подсветка)", qty: 32, unit: "м²", pricePerUnit: 1_400 },
          { name: "Финишная шпаклёвка + покраска потолка", qty: 65, unit: "м²", pricePerUnit: 580 },
          { name: "Поклейка обоев (гостиная, спальня)", qty: 96, unit: "м²", pricePerUnit: 460 },
          { name: "Декоративный молдинг — монтаж", qty: 36, unit: "пог.м", pricePerUnit: 420 },
        ],
      },
      {
        icon: "Layers",
        title: "Полы",
        items: [
          { name: "Стяжка самовыравнивающаяся", qty: 65, unit: "м²", pricePerUnit: 950 },
          { name: "Укладка инженерного паркета ёлочкой", qty: 52, unit: "м²", pricePerUnit: 1_400 },
          { name: "Укладка керамогранита (кухня + санузел)", qty: 13, unit: "м²", pricePerUnit: 1_500 },
          { name: "Установка дубового плинтуса 80 мм", qty: 46, unit: "пог.м", pricePerUnit: 380 },
        ],
      },
      {
        icon: "Zap",
        title: "Электрика",
        items: [
          { name: "Полная замена проводки (NYM 3×2.5)", qty: 65, unit: "м²", pricePerUnit: 820 },
          { name: "Установка розеток / выключателей", qty: 28, unit: "шт", pricePerUnit: 450 },
          { name: "Монтаж светильников и LED-подсветки", qty: 22, unit: "шт", pricePerUnit: 600 },
          { name: "Щиток Legrand + автоматы ABB", qty: 1, unit: "компл.", pricePerUnit: 24_000 },
        ],
      },
      {
        icon: "Droplets",
        title: "Сантехника",
        items: [
          { name: "Разводка ХВС / ГВС + гидроизоляция санузла", qty: 1, unit: "компл.", pricePerUnit: 32_000 },
          { name: "Установка ванны акриловой 170×70", qty: 1, unit: "шт", pricePerUnit: 7_500 },
          { name: "Установка инсталляции + унитаза", qty: 1, unit: "шт", pricePerUnit: 10_000 },
          { name: "Установка двойной раковины + тумбы", qty: 1, unit: "шт", pricePerUnit: 6_500 },
          { name: "Облицовка санузла плиткой", qty: 32, unit: "м²", pricePerUnit: 1_700 },
        ],
      },
      {
        icon: "DoorOpen",
        title: "Двери и откосы",
        items: [
          { name: "Установка входной двери МДФ", qty: 1, unit: "шт", pricePerUnit: 6_500 },
          { name: "Межкомнатные двери скрытые (3 шт)", qty: 3, unit: "шт", pricePerUnit: 8_500 },
          { name: "Монтаж дверных откосов", qty: 18, unit: "пог.м", pricePerUnit: 900 },
        ],
      },
    ],
    materials: [
      { category: "Полы", name: "Паркет инженерный, дуб «Орех» 15×120", brand: "Barlinek", qty: 57, unit: "м²", pricePerUnit: 4_200 },
      { category: "Полы", name: "Керамогранит Charme Extra 60×120", brand: "Italon", qty: 15, unit: "м²", pricePerUnit: 3_600 },
      { category: "Полы", name: "Плинтус дубовый натуральный 80 мм", brand: "Tarkett", qty: 46, unit: "пог.м", pricePerUnit: 680 },
      { category: "Стены", name: "Обои структурные бежевые", brand: "Atlas Wallcoverings", qty: 26, unit: "рулон", pricePerUnit: 1_400 },
      { category: "Стены", name: "Краска интерьерная тёплый белый 10 л", brand: "Dulux Ambiance", qty: 4, unit: "шт", pricePerUnit: 4_500 },
      { category: "Стены", name: "Молдинги декоративные полиуретан", brand: "Orac Decor", qty: 36, unit: "пог.м", pricePerUnit: 480 },
      { category: "Стены", name: "Штукатурка машинная 30 кг", brand: "Knauf Rotband", qty: 16, unit: "мешок", pricePerUnit: 980 },
      { category: "Сантехника", name: "Ванна акриловая 170×70", brand: "Roca", qty: 1, unit: "шт", pricePerUnit: 28_000 },
      { category: "Сантехника", name: "Инсталляция + унитаз Rimfree", brand: "Geberit", qty: 1, unit: "компл.", pricePerUnit: 45_000 },
      { category: "Сантехника", name: "Тумба с раковиной 90 см", brand: "Aquanet", qty: 1, unit: "шт", pricePerUnit: 22_000 },
      { category: "Электрика", name: "Розетки / выключатели серия Life", brand: "Legrand Valena", qty: 28, unit: "шт", pricePerUnit: 580 },
      { category: "Электрика", name: "LED профиль алюминиевый угловой", brand: "Arlight", qty: 18, unit: "пог.м", pricePerUnit: 420 },
    ],
    interiorElements: [
      { zone: "Гостиная", name: "Диван секционный, ткань терракота", brand: "Rolf", model: "Grenada", qty: 1, price: 98_000 },
      { zone: "Гостиная", name: "Кресло бархатное, горчица", brand: "La Forma", model: "Jarrod", qty: 2, price: 38_000 },
      { zone: "Гостиная", name: "Журнальный стол мрамор / латунь", brand: "Desondo", model: "Romano", qty: 1, price: 28_000 },
      { zone: "Гостиная", name: "Напольный светильник дуга", brand: "Loft Concept", model: "Arc Gold", qty: 1, price: 18_500 },
      { zone: "Столовая", name: "Обеденный стол 120×80, дуб / чёрный", brand: "IKEA", model: "MÖRBYLÅNGA", qty: 1, price: 32_000 },
      { zone: "Столовая", name: "Стул обеденный, бежевая ткань", brand: "La Forma", model: "Satomi", qty: 4, price: 18_000 },
      { zone: "Кухня", name: "Кухонный гарнитур L-образный 3.2 м", brand: "Леруа Мерлен", model: "Квадро Крем", qty: 1, price: 115_000 },
      { zone: "Кухня", name: "Встраиваемая духовка 60 см", brand: "Bosch", model: "HBF534ES0", qty: 1, price: 42_000 },
      { zone: "Кухня", name: "Индукционная варочная поверхность", brand: "Bosch", model: "PVS651FC5E", qty: 1, price: 38_000 },
      { zone: "Спальня", name: "Кровать 180×200, мягкое изголовье", brand: "Ashley Furniture", model: "Chime", qty: 1, price: 68_000 },
      { zone: "Спальня", name: "Матрас 180×200, независимые пружины", brand: "Орматек", model: "Active Duo", qty: 1, price: 62_000 },
      { zone: "Спальня", name: "Система гардеробной 240×60", brand: "Hettich", model: "InnoTech Atira", qty: 1, price: 48_000 },
      { zone: "Прихожая", name: "Шкаф-купе 200×60×240", brand: "IKEA", model: "PAX с зеркалом", qty: 1, price: 54_000 },
      { zone: "Прихожая", name: "Консоль с ящиками", brand: "Desondo", model: "Entry", qty: 1, price: 16_500 },
    ],
  },

  // ════════════════════════════════════════════
  // ПРОЕКТ 3: 98 м² — Премиальный Dark Lux
  // ════════════════════════════════════════════
  {
    id: "premium-98",
    area: 98,
    title: "Премиальный Dark Lux",
    subtitle: "Роскошь и архитектурный масштаб",
    style: "Ар-деко / Dark Luxury",
    rooms: "3 комнаты + 2 санузла + гардеробная",
    image:
      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/8745757e-34a3-4da5-8895-30f4dec98106.jpg",
    accentFrom: "from-violet-500",
    accentTo: "to-purple-700",
    description:
      "Трёхкомнатная квартира в стиле Dark Luxury с элементами ар-деко. Мраморный пол, тёмно-синие стены с латунными молдингами, встроенные библиотеки от пола до потолка и система умного освещения создают неповторимую атмосферу.",
    tags: ["3 комнаты", "Премиум", "Тёмные тона", "Мрамор", "Ар-деко", "Умный дом"],
    features: [
      "Мраморный пол Nero Marquina в гостиной и коридоре",
      "Встроенные библиотеки от пола до потолка в гостиной",
      "Мастер-спальня с собственным санузлом и гардеробной 8 м²",
      "Умное освещение Philips Hue + диммеры в каждой зоне",
    ],
    workSections: [
      {
        icon: "Hammer",
        title: "Демонтаж и перепланировка",
        items: [
          { name: "Полный демонтаж внутренней отделки", qty: 98, unit: "м²", pricePerUnit: 320 },
          { name: "Снос и возведение перегородок", qty: 3, unit: "ед.", pricePerUnit: 22_000 },
          { name: "Вывоз строительного мусора (2 контейнера)", qty: 2, unit: "шт", pricePerUnit: 20_000 },
        ],
      },
      {
        icon: "PaintBucket",
        title: "Стены и потолки",
        items: [
          { name: "Штукатурка стен лазерная геометрия", qty: 256, unit: "м²", pricePerUnit: 900 },
          { name: "Декоративная штукатурка VALPAINT Matiere", qty: 72, unit: "м²", pricePerUnit: 2_400 },
          { name: "Монтаж МДФ-панелей с латунными вставками", qty: 45, unit: "м²", pricePerUnit: 3_200 },
          { name: "Натяжной потолок Clipso сатин «Midnight»", qty: 98, unit: "м²", pricePerUnit: 1_800 },
          { name: "Монтаж встроенных книжных стеллажей (МДФ)", qty: 1, unit: "компл.", pricePerUnit: 185_000 },
        ],
      },
      {
        icon: "Layers",
        title: "Полы",
        items: [
          { name: "Стяжка с шумоизоляцией Rockwool", qty: 98, unit: "м²", pricePerUnit: 1_500 },
          { name: "Укладка мрамора Nero Marquina 60×60", qty: 62, unit: "м²", pricePerUnit: 4_800 },
          { name: "Укладка паркета мореный дуб (спальни)", qty: 36, unit: "м²", pricePerUnit: 2_800 },
          { name: "Монтаж скрытого плинтуса «Invisible»", qty: 72, unit: "пог.м", pricePerUnit: 750 },
        ],
      },
      {
        icon: "Zap",
        title: "Электрика и умный дом",
        items: [
          { name: "Замена проводки (кабель NYM 3×4, 3×2.5)", qty: 98, unit: "м²", pricePerUnit: 1_300 },
          { name: "Розетки / выключатели Legrand Celiane", qty: 58, unit: "шт", pricePerUnit: 850 },
          { name: "Монтаж системы умного освещения Philips Hue", qty: 1, unit: "компл.", pricePerUnit: 95_000 },
          { name: "Электрощит Legrand XL³ + автоматы АВВ", qty: 1, unit: "компл.", pricePerUnit: 58_000 },
          { name: "Монтаж системы «Умный дом» (базовый)", qty: 1, unit: "компл.", pricePerUnit: 120_000 },
        ],
      },
      {
        icon: "Droplets",
        title: "Сантехника (2 санузла)",
        items: [
          { name: "Разводка ХВС / ГВС + гидроизоляция 2 с/у", qty: 1, unit: "компл.", pricePerUnit: 75_000 },
          { name: "Ванна отдельностоящая овал + смеситель", qty: 1, unit: "шт", pricePerUnit: 22_000 },
          { name: "Инсталляция + унитаз Geberit (×2)", qty: 2, unit: "компл.", pricePerUnit: 18_000 },
          { name: "Тёплый пол электрический под плитку", qty: 22, unit: "м²", pricePerUnit: 3_200 },
          { name: "Облицовка 2 санузлов плиткой", qty: 56, unit: "м²", pricePerUnit: 2_800 },
        ],
      },
      {
        icon: "DoorOpen",
        title: "Двери, гардеробная и прочее",
        items: [
          { name: "Скрытые двери с полотном под окраску (6 шт)", qty: 6, unit: "шт", pricePerUnit: 28_000 },
          { name: "Гардеробная система Hettich 8 м²", qty: 1, unit: "компл.", pricePerUnit: 145_000 },
          { name: "Монтаж откосов МДФ под покраску", qty: 22, unit: "пог.м", pricePerUnit: 1_200 },
        ],
      },
    ],
    materials: [
      { category: "Полы", name: "Мрамор Nero Marquina 60×60 полированный", brand: "Italstone", qty: 68, unit: "м²", pricePerUnit: 12_000 },
      { category: "Полы", name: "Паркет дуб мореный «Эбен» 20×140", brand: "Coswick", qty: 40, unit: "м²", pricePerUnit: 8_500 },
      { category: "Полы", name: "Плинтус скрытый алюминий «Invisible»", brand: "Profilpas", qty: 72, unit: "пог.м", pricePerUnit: 1_400 },
      { category: "Стены", name: "Декоративная штукатурка Matiere 5", brand: "VALPAINT", qty: 72, unit: "м²", pricePerUnit: 2_800 },
      { category: "Стены", name: "МДФ-панели с латунными вставками", brand: "Kronospan", qty: 45, unit: "м²", pricePerUnit: 4_200 },
      { category: "Стены", name: "Натяжной потолок сатин «Midnight»", brand: "Clipso", qty: 98, unit: "м²", pricePerUnit: 2_200 },
      { category: "Сантехника", name: "Ванна отдельностоящая Monolith", brand: "Knief", qty: 1, unit: "шт", pricePerUnit: 185_000 },
      { category: "Сантехника", name: "Инсталляция Sigma 8 + унитаз Rimfree", brand: "Geberit", qty: 2, unit: "компл.", pricePerUnit: 68_000 },
      { category: "Сантехника", name: "Смеситель для раковины высокий", brand: "Hansgrohe Metropol", qty: 3, unit: "шт", pricePerUnit: 22_000 },
      { category: "Электрика", name: "Розетки / выключатели Céliane", brand: "Legrand", qty: 58, unit: "шт", pricePerUnit: 1_200 },
      { category: "Электрика", name: "Умное освещение (стартовый набор)", brand: "Philips Hue", qty: 1, unit: "компл.", pricePerUnit: 68_000 },
      { category: "Электрика", name: "Кабель ВВГнг-LS 3×2.5 (бухта)", brand: "Кабельный завод", qty: 8, unit: "бухта", pricePerUnit: 4_800 },
    ],
    interiorElements: [
      { zone: "Гостиная", name: "Диван угловой тёмно-зелёный бархат", brand: "Cassina", model: "Maralunga", qty: 1, price: 380_000 },
      { zone: "Гостиная", name: "Кресло кожаное, чёрное + латунь", brand: "Poltrona Frau", model: "Archibald", qty: 2, price: 220_000 },
      { zone: "Гостиная", name: "Журнальный стол мрамор / латунь", brand: "Desondo", model: "Atlas Brass", qty: 1, price: 68_000 },
      { zone: "Гостиная", name: "Люстра Art Deco, латунь + хрусталь", brand: "Possoni", model: "Cristalli 1445", qty: 1, price: 185_000 },
      { zone: "Столовая", name: "Обеденный стол раздвижной 200×90", brand: "Minotti", model: "Maki", qty: 1, price: 245_000 },
      { zone: "Столовая", name: "Стулья обеденные, тёмно-синие", brand: "Meridiani", model: "Harry", qty: 6, price: 68_000 },
      { zone: "Кухня", name: "Кухня из MDF + шпон венге", brand: "Leicht", model: "GTX-PG", qty: 1, price: 680_000 },
      { zone: "Кухня", name: "Духовой шкаф + СВЧ-колонна", brand: "Miele", model: "H7260B + M7244TC", qty: 1, price: 148_000 },
      { zone: "Кухня", name: "Холодильник Side-by-Side", brand: "Smeg", model: "FQ60NDF", qty: 1, price: 185_000 },
      { zone: "Мастер-спальня", name: "Кровать 200×200 с мягким изголовьем", brand: "Poliform", model: "Letto Onda", qty: 1, price: 245_000 },
      { zone: "Мастер-спальня", name: "Матрас 200×200 премиум", brand: "Hypnos", model: "Elite Cashmere", qty: 1, price: 185_000 },
      { zone: "Мастер-спальня", name: "Гардеробная система premium", brand: "Hettich", model: "InnoTech Atira XL", qty: 1, price: 245_000 },
      { zone: "Детская / гостевая", name: "Кровать-чердак с рабочим местом", brand: "IKEA", model: "STORÅ", qty: 1, price: 32_000 },
      { zone: "Прихожая", name: "Консоль и зеркало, чёрное + латунь", brand: "Desondo", model: "Palazzo", qty: 1, price: 85_000 },
      { zone: "Прихожая", name: "Шкаф встроенный с зеркальными фасадами", brand: "Poliform", model: "Senzafine", qty: 1, price: 320_000 },
    ],
  },
];

// ─────────────────────────────────────────────
// УТИЛИТЫ
// ─────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function calcWorkTotal(p: Project) {
  return p.workSections.reduce(
    (s, sec) => s + sec.items.reduce((ss, i) => ss + i.qty * i.pricePerUnit, 0),
    0
  );
}

function calcMaterialsTotal(p: Project) {
  return p.materials.reduce((s, m) => s + m.qty * m.pricePerUnit, 0);
}

function calcInteriorTotal(p: Project) {
  return p.interiorElements.reduce((s, e) => s + e.qty * e.price, 0);
}

// ─────────────────────────────────────────────
// КОМПОНЕНТЫ ВКЛАДОК
// ─────────────────────────────────────────────
type Tab = "overview" | "work" | "materials" | "interior";

function WorkTab({ sections }: { sections: WorkSection[] }) {
  const total = sections.reduce(
    (s, sec) => s + sec.items.reduce((ss, i) => ss + i.qty * i.pricePerUnit, 0),
    0
  );
  return (
    <div className="space-y-6">
      {sections.map((sec) => {
        const secTotal = sec.items.reduce((s, i) => s + i.qty * i.pricePerUnit, 0);
        return (
          <div key={sec.title}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name={sec.icon as never} size={16} className="text-gray-400" />
                <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                  {sec.title}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-700">{fmt(secTotal)}</span>
            </div>
            <div className="rounded-2xl border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead className="bg-gray-50 text-gray-400 font-medium">
                  <tr>
                    <th className="text-left px-4 py-2.5">Наименование</th>
                    <th className="text-right px-3 py-2.5">Кол-во</th>
                    <th className="text-right px-3 py-2.5">Ед.</th>
                    <th className="text-right px-3 py-2.5">Цена/ед.</th>
                    <th className="text-right px-4 py-2.5">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.items.map((item, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/60">
                      <td className="px-4 py-2.5 text-gray-700">{item.name}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">{item.qty}</td>
                      <td className="px-3 py-2.5 text-right text-gray-500">{item.unit}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">{fmt(item.pricePerUnit)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                        {fmt(item.qty * item.pricePerUnit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between bg-gray-900 text-white rounded-2xl px-5 py-4">
        <span className="font-semibold text-lg">Итого работы</span>
        <span className="text-2xl font-black">{fmt(total)}</span>
      </div>
    </div>
  );
}

function MaterialsTab({ materials }: { materials: Material[] }) {
  const categories = [...new Set(materials.map((m) => m.category))];
  const total = materials.reduce((s, m) => s + m.qty * m.pricePerUnit, 0);
  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const items = materials.filter((m) => m.category === cat);
        const catTotal = items.reduce((s, m) => s + m.qty * m.pricePerUnit, 0);
        return (
          <div key={cat}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{cat}</span>
              <span className="text-sm font-bold text-gray-700">{fmt(catTotal)}</span>
            </div>
            <div className="rounded-2xl border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="bg-gray-50 text-gray-400 font-medium">
                  <tr>
                    <th className="text-left px-4 py-2.5">Материал</th>
                    <th className="text-left px-3 py-2.5">Бренд</th>
                    <th className="text-right px-3 py-2.5">Кол-во</th>
                    <th className="text-right px-3 py-2.5">Ед.</th>
                    <th className="text-right px-3 py-2.5">Цена/ед.</th>
                    <th className="text-right px-4 py-2.5">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/60">
                      <td className="px-4 py-2.5 text-gray-700">{m.name}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{m.brand}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">{m.qty}</td>
                      <td className="px-3 py-2.5 text-right text-gray-500">{m.unit}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">{fmt(m.pricePerUnit)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                        {fmt(m.qty * m.pricePerUnit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between bg-gray-100 rounded-2xl px-5 py-4">
        <span className="font-semibold text-gray-800 text-lg">Итого материалы</span>
        <span className="text-2xl font-black text-gray-900">{fmt(total)}</span>
      </div>
    </div>
  );
}

function InteriorTab({ elements }: { elements: InteriorElement[] }) {
  const zones = [...new Set(elements.map((e) => e.zone))];
  const total = elements.reduce((s, e) => s + e.qty * e.price, 0);
  return (
    <div className="space-y-6">
      {zones.map((zone) => {
        const items = elements.filter((e) => e.zone === zone);
        const zoneTotal = items.reduce((s, e) => s + e.qty * e.price, 0);
        return (
          <div key={zone}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{zone}</span>
              <span className="text-sm font-bold text-gray-700">{fmt(zoneTotal)}</span>
            </div>
            <div className="rounded-2xl border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm min-w-[460px]">
                <thead className="bg-gray-50 text-gray-400 font-medium">
                  <tr>
                    <th className="text-left px-4 py-2.5">Элемент</th>
                    <th className="text-left px-3 py-2.5">Бренд / Модель</th>
                    <th className="text-right px-3 py-2.5">Кол-во</th>
                    <th className="text-right px-4 py-2.5">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/60">
                      <td className="px-4 py-2.5 text-gray-700">{e.name}</td>
                      <td className="px-3 py-2.5 text-gray-500">{e.brand} {e.model}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">{e.qty} шт</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                        {fmt(e.qty * e.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
        <span className="font-semibold text-amber-900 text-lg">Итого мебель и интерьер</span>
        <span className="text-2xl font-black text-amber-900">{fmt(total)}</span>
      </div>
    </div>
  );
}

function OverviewTab({ project }: { project: Project }) {
  const workTotal = calcWorkTotal(project);
  const matTotal = calcMaterialsTotal(project);
  const intTotal = calcInteriorTotal(project);
  const grand = workTotal + matTotal + intTotal;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: "Ruler", label: "Площадь", value: `${project.area} м²` },
          { icon: "Palette", label: "Стиль", value: project.style },
          { icon: "DoorOpen", label: "Планировка", value: project.rooms },
          {
            icon: "ListChecks",
            label: "Позиций в смете",
            value: String(
              project.workSections.reduce((s, sec) => s + sec.items.length, 0) +
                project.materials.length +
                project.interiorElements.length
            ),
          },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
            <Icon name={item.icon as never} size={20} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
              <div className="font-bold text-gray-900">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-2xl p-5">
        <h4 className="font-semibold text-gray-700 text-sm mb-3 uppercase tracking-wide">
          Особенности проекта
        </h4>
        <ul className="space-y-2">
          {project.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
              <Icon name="CheckCircle2" size={16} className="text-green-500 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-1.5">
        <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">Итоговый бюджет</h4>
        {[
          { label: "Стоимость работ", value: workTotal },
          { label: "Строительные материалы", value: matTotal },
          { label: "Мебель и интерьер", value: intTotal },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-gray-100">
            <span className="text-gray-600 text-sm">{row.label}</span>
            <span className="font-semibold text-gray-900">{fmt(row.value)}</span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-3">
          <span className="font-bold text-gray-900 text-lg">Всего</span>
          <span className="font-black text-2xl text-gray-900">{fmt(grand)}</span>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800">
        <span className="font-semibold">Примечание:</span> цены указаны для Москвы и МО (март 2026). В регионах стоимость работ ниже на 15–30%. Мебель и материалы — средние рыночные цены.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// КАРТОЧКА ПРОЕКТА
// ─────────────────────────────────────────────
function ProjectCard({ project }: { project: Project }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [open, setOpen] = useState(false);

  const workTotal = calcWorkTotal(project);
  const matTotal = calcMaterialsTotal(project);
  const intTotal = calcInteriorTotal(project);
  const grand = workTotal + matTotal + intTotal;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Обзор" },
    { id: "work", label: "Работы" },
    { id: "materials", label: "Материалы" },
    { id: "interior", label: "Интерьер" },
  ];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative h-72 overflow-hidden">
        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div
          className={`absolute top-4 left-4 bg-gradient-to-r ${project.accentFrom} ${project.accentTo} text-white text-sm font-black px-4 py-1.5 rounded-full`}
        >
          {project.area} м²
        </div>
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-white/70 text-xs font-medium mb-1">{project.subtitle}</p>
          <h3 className="text-white text-2xl font-black leading-tight">{project.title}</h3>
          <p className="text-white/60 text-sm mt-1">{project.rooms}</p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.map((t) => (
            <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{t}</span>
          ))}
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-5">{project.description}</p>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Работы", value: workTotal },
            { label: "Материалы", value: matTotal },
            { label: "Интерьер", value: intTotal },
          ].map((cell) => (
            <div key={cell.label} className="bg-gray-50 rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">{cell.label}</div>
              <div className="font-bold text-gray-900 text-xs leading-tight">{fmt(cell.value)}</div>
            </div>
          ))}
        </div>

        <div
          className={`bg-gradient-to-r ${project.accentFrom} ${project.accentTo} rounded-2xl p-4 flex items-center justify-between mb-5`}
        >
          <div className="text-white/80 text-sm font-medium">Полный бюджет</div>
          <div className="text-white text-xl font-black">{fmt(grand)}</div>
        </div>

        <Button variant="outline" className="w-full rounded-xl" onClick={() => setOpen(!open)}>
          {open ? (
            <><Icon name="ChevronUp" size={16} className="mr-2" />Свернуть подробности</>
          ) : (
            <><Icon name="ChevronDown" size={16} className="mr-2" />Смета, материалы и интерьер</>
          )}
        </Button>

        {open && (
          <div className="mt-6">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 text-sm py-2 px-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                    tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {tab === "overview" && <OverviewTab project={project} />}
            {tab === "work" && <WorkTab sections={project.workSections} />}
            {tab === "materials" && <MaterialsTab materials={project.materials} />}
            {tab === "interior" && <InteriorTab elements={project.interiorElements} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ГЛАВНАЯ СТРАНИЦА
// ─────────────────────────────────────────────
export default function ReadyProjects() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="bg-[#0f0f13] text-white">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-8"
          >
            <Icon name="ArrowLeft" size={16} />
            На главную
          </button>
          <span className="inline-block bg-white/10 text-white/70 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            Готовые решения
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Готовые дизайн-проекты
          </h1>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
            Три полноценных проекта — со сметами работ, списками материалов и подборкой мебели.
            Используйте как основу для своего ремонта или запроса подрядчикам.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-10 max-w-sm">
            {PROJECTS.map((p) => (
              <div key={p.id} className="text-center">
                <div className={`text-4xl font-black bg-gradient-to-b ${p.accentFrom} ${p.accentTo} bg-clip-text text-transparent`}>
                  {p.area}
                </div>
                <div className="text-white/40 text-xs mt-1">м²</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-52 h-52 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Нужен индивидуальный проект?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
              Калькулятор рассчитает точную смету для вашей квартиры — с учётом площади, региона и выбранных материалов. Займёт 5 минут.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 rounded-full px-8 font-bold shadow-xl text-base"
                onClick={() => navigate("/calculator")}
              >
                <Icon name="Calculator" size={18} className="mr-2" />
                Рассчитать смету
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/50 text-white hover:bg-white/20 rounded-full px-8 text-base bg-transparent"
                onClick={() => navigate("/expert")}
              >
                <Icon name="MessageCircle" size={18} className="mr-2" />
                Спросить ИИ-эксперта
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
