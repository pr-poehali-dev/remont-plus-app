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
  accentText: string;
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
    rooms: "Студия + санузел 6 м²",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/7e2f316a-c808-49e8-b8ae-16ae1e9680ca.jpg",
    accentFrom: "from-sky-400",
    accentTo: "to-blue-600",
    accentText: "text-sky-700",
    description:
      "Светлая квартира-студия с умным зонированием. Кухня, гостиная и рабочая зона объединены в единое пространство без лишних перегородок. Скандинавский стиль: натуральное дерево, белый, серый и тёплый бежевый. Максимальная функциональность при минимуме площади — каждый сантиметр продуман.",
    tags: ["Студия", "Скандинавский", "Светлый", "Открытая кухня", "Рабочая зона"],
    features: [
      "Зонирование светом и текстурами без перегородок — визуально расширяет пространство",
      "Встроенные системы хранения в прихожей и над кроватью (7 пог.м встроенных шкафов)",
      "Рабочий уголок у окна с индивидуальным освещением и кабель-каналами",
      "Тёплый пол электрический в санузле + программируемый термостат",
      "Кухонный остров на колёсиках — трансформируется в обеденный стол",
      "LED-подсветка по периметру потолка на диммере — 3 сценария освещения",
    ],
    workSections: [
      {
        icon: "Hammer",
        title: "Демонтаж и подготовка",
        items: [
          { name: "Снятие старого напольного покрытия (линолеум/паркет)", qty: 46, unit: "м²", pricePerUnit: 120 },
          { name: "Демонтаж обоев и зачистка стен", qty: 110, unit: "м²", pricePerUnit: 80 },
          { name: "Демонтаж сантехники (унитаз, раковина, ванна)", qty: 1, unit: "компл.", pricePerUnit: 8_000 },
          { name: "Демонтаж старой проводки", qty: 46, unit: "м²", pricePerUnit: 180 },
          { name: "Вывоз строительного мусора (контейнер 5 м³)", qty: 1, unit: "шт", pricePerUnit: 14_000 },
        ],
      },
      {
        icon: "PaintBucket",
        title: "Стены и потолки",
        items: [
          { name: "Штукатурка стен машинная Knauf Rotband", qty: 110, unit: "м²", pricePerUnit: 580 },
          { name: "Финишная шпаклёвка стен под покраску", qty: 110, unit: "м²", pricePerUnit: 320 },
          { name: "Шпаклёвка и выравнивание потолка", qty: 46, unit: "м²", pricePerUnit: 350 },
          { name: "Покраска потолка 2 слоя (Dulux белый)", qty: 46, unit: "м²", pricePerUnit: 280 },
          { name: "Покраска стен в 2 слоя (кухня + санузел)", qty: 28, unit: "м²", pricePerUnit: 320 },
          { name: "Поклейка флизелиновых обоев (гостиная + спальная зона)", qty: 64, unit: "м²", pricePerUnit: 420 },
          { name: "Монтаж гипсокартонного короба для LED-подсветки", qty: 18, unit: "пог.м", pricePerUnit: 980 },
        ],
      },
      {
        icon: "Layers",
        title: "Полы",
        items: [
          { name: "Полусухая стяжка М300, толщина 50 мм", qty: 46, unit: "м²", pricePerUnit: 850 },
          { name: "Укладка ламината 33 кл. (дуб натуральный)", qty: 40, unit: "м²", pricePerUnit: 650 },
          { name: "Подложка под ламинат Isoplaat 3 мм", qty: 40, unit: "м²", pricePerUnit: 120 },
          { name: "Укладка керамогранита в санузле 60×60", qty: 6, unit: "м²", pricePerUnit: 1_300 },
          { name: "Монтаж тёплого пола электрического (санузел)", qty: 6, unit: "м²", pricePerUnit: 2_200 },
          { name: "Установка плинтусов МДФ 60 мм", qty: 26, unit: "пог.м", pricePerUnit: 220 },
          { name: "Установка порожков переходных", qty: 2, unit: "шт", pricePerUnit: 350 },
        ],
      },
      {
        icon: "Zap",
        title: "Электрика",
        items: [
          { name: "Замена проводки скрытая (кабель NYM 3×2.5)", qty: 46, unit: "м²", pricePerUnit: 780 },
          { name: "Монтаж кабеля для варочной поверхности 6 мм²", qty: 1, unit: "компл.", pricePerUnit: 3_200 },
          { name: "Установка розеток Legrand Valena", qty: 14, unit: "шт", pricePerUnit: 420 },
          { name: "Установка выключателей Legrand Valena", qty: 6, unit: "шт", pricePerUnit: 420 },
          { name: "Монтаж точечных светильников (споты LED)", qty: 8, unit: "шт", pricePerUnit: 550 },
          { name: "Монтаж LED-ленты в короб (5 м)", qty: 1, unit: "компл.", pricePerUnit: 4_500 },
          { name: "Монтаж люстры / подвесного светильника", qty: 2, unit: "шт", pricePerUnit: 650 },
          { name: "Щиток Legrand + автоматы ABB + УЗО", qty: 1, unit: "компл.", pricePerUnit: 16_000 },
        ],
      },
      {
        icon: "Droplets",
        title: "Сантехника",
        items: [
          { name: "Разводка ХВС и ГВС труба PPR Ø20", qty: 1, unit: "компл.", pricePerUnit: 18_000 },
          { name: "Гидроизоляция пола санузла обмазочная 2 слоя", qty: 6, unit: "м²", pricePerUnit: 850 },
          { name: "Установка душевого поддона 90×90 + смеситель", qty: 1, unit: "шт", pricePerUnit: 7_000 },
          { name: "Установка инсталляции Grohe + унитаза", qty: 1, unit: "шт", pricePerUnit: 9_500 },
          { name: "Установка раковины подвесной + смесителя", qty: 1, unit: "шт", pricePerUnit: 5_500 },
          { name: "Установка зеркального шкафа с подсветкой", qty: 1, unit: "шт", pricePerUnit: 3_200 },
          { name: "Облицовка стен санузла плиткой 30×60", qty: 22, unit: "м²", pricePerUnit: 1_500 },
          { name: "Облицовка пола санузла керамогранитом", qty: 6, unit: "м²", pricePerUnit: 1_300 },
        ],
      },
      {
        icon: "DoorOpen",
        title: "Двери, окна и откосы",
        items: [
          { name: "Установка входной двери (в т.ч. демонтаж)", qty: 1, unit: "шт", pricePerUnit: 6_000 },
          { name: "Установка межкомнатной двери (санузел)", qty: 1, unit: "шт", pricePerUnit: 4_500 },
          { name: "Откосы пластиковые на окна (2 окна)", qty: 2, unit: "компл.", pricePerUnit: 4_200 },
          { name: "Монтаж подоконников ПВХ", qty: 2, unit: "шт", pricePerUnit: 2_800 },
          { name: "Монтаж карнизного крепления (гардины)", qty: 2, unit: "шт", pricePerUnit: 1_200 },
        ],
      },
    ],
    materials: [
      { category: "Полы", name: "Ламинат 33 кл., дуб натуральный, 1285×192мм", brand: "Egger PRO EPL149", qty: 44, unit: "м²", pricePerUnit: 1_850 },
      { category: "Полы", name: "Керамогранит 60×60 белый матовый", brand: "Kerama Marazzi Трамплин", qty: 7, unit: "м²", pricePerUnit: 2_100 },
      { category: "Полы", name: "Подложка под ламинат 3 мм хвойная", brand: "Isoplaat", qty: 44, unit: "м²", pricePerUnit: 180 },
      { category: "Полы", name: "Тёплый пол кабельный 900 Вт, 6 м²", brand: "Devi Devilmat 150T", qty: 1, unit: "компл.", pricePerUnit: 14_500 },
      { category: "Полы", name: "Термостат программируемый", brand: "Danfoss ECtemp 500", qty: 1, unit: "шт", pricePerUnit: 4_800 },
      { category: "Полы", name: "Плинтус МДФ белый 60 мм", brand: "Dollken SL60", qty: 28, unit: "пог.м", pricePerUnit: 290 },
      { category: "Стены", name: "Обои флизелиновые однотонные серо-бежевые", brand: "Grandeco Inspiration Wall", qty: 18, unit: "рулон", pricePerUnit: 1_100 },
      { category: "Стены", name: "Краска интерьерная матовая белая 10 л", brand: "Dulux Bindo 7", qty: 3, unit: "шт", pricePerUnit: 3_400 },
      { category: "Стены", name: "Штукатурка гипсовая машинная 30 кг", brand: "Knauf Rotband", qty: 12, unit: "мешок", pricePerUnit: 980 },
      { category: "Стены", name: "Шпаклёвка финишная полимерная 20 кг", brand: "Knauf Finish", qty: 8, unit: "мешок", pricePerUnit: 820 },
      { category: "Стены", name: "Грунтовка глубокого проникновения 10 л", brand: "Knauf Tiefengrund", qty: 4, unit: "шт", pricePerUnit: 780 },
      { category: "Плитка санузел", name: "Плитка стеновая 30×60 белая глянец", brand: "Kerama Marazzi Авеллино", qty: 24, unit: "м²", pricePerUnit: 1_640 },
      { category: "Плитка санузел", name: "Затирка для швов белая 2 кг", brand: "Ceresit CE 33", qty: 4, unit: "шт", pricePerUnit: 320 },
      { category: "Плитка санузел", name: "Клей для плитки С2 25 кг", brand: "Ceresit CM 17", qty: 6, unit: "мешок", pricePerUnit: 980 },
      { category: "Сантехника", name: "Душевой поддон 90×90 белый антислип", brand: "Radaway Giaros", qty: 1, unit: "шт", pricePerUnit: 18_500 },
      { category: "Сантехника", name: "Смеситель для душа однорычажный хром", brand: "Grohe Eurosmart", qty: 1, unit: "шт", pricePerUnit: 9_800 },
      { category: "Сантехника", name: "Инсталляция + унитаз безободковый + кнопка", brand: "Grohe Rapid SL + Grohe Essence", qty: 1, unit: "компл.", pricePerUnit: 38_000 },
      { category: "Сантехника", name: "Раковина подвесная 50 см", brand: "Roca Gap", qty: 1, unit: "шт", pricePerUnit: 7_200 },
      { category: "Сантехника", name: "Смеситель для раковины высокий хром", brand: "Grohe BauLoop", qty: 1, unit: "шт", pricePerUnit: 7_400 },
      { category: "Сантехника", name: "Зеркальный шкаф с подсветкой 60 см", brand: "Aquanet TH-800", qty: 1, unit: "шт", pricePerUnit: 11_500 },
      { category: "Электрика", name: "Розетки одинарные с заземлением", brand: "Legrand Valena Life", qty: 14, unit: "шт", pricePerUnit: 480 },
      { category: "Электрика", name: "Выключатели одноклавишные", brand: "Legrand Valena Life", qty: 6, unit: "шт", pricePerUnit: 380 },
      { category: "Электрика", name: "LED-лента 2700К 12 В 14.4 Вт/м", brand: "Arlight iLED", qty: 6, unit: "м", pricePerUnit: 580 },
      { category: "Электрика", name: "Профиль алюминиевый угловой для LED", brand: "Arlight", qty: 6, unit: "пог.м", pricePerUnit: 320 },
      { category: "Двери", name: "Входная дверь металл, МДФ отделка", brand: "Гардиан 65 XL Vinil", qty: 1, unit: "шт", pricePerUnit: 32_000 },
      { category: "Двери", name: "Дверь межкомнатная скрытого монтажа", brand: "Profildoors P-6 Белый матовый", qty: 1, unit: "шт", pricePerUnit: 22_000 },
    ],
    interiorElements: [
      { zone: "Гостиная / Гостиная зона", name: "Диван 2-местный тканевый бежевый 190 см", brand: "IKEA", model: "SÖDERHAMN 2-местный", qty: 1, price: 42_000 },
      { zone: "Гостиная / Гостиная зона", name: "Журнальный столик дуб/чёрный 70×70", brand: "IKEA", model: "VITTSJÖ", qty: 1, price: 8_500 },
      { zone: "Гостиная / Гостиная зона", name: "Ковёр шерстяной 160×230, серо-белый", brand: "Bougari", model: "Nordic Storm", qty: 1, price: 18_000 },
      { zone: "Гостиная / Гостиная зона", name: "ТВ-стойка с открытыми полками дуб", brand: "IKEA", model: "BESTÅ Дуб", qty: 1, price: 24_000 },
      { zone: "Гостиная / Гостиная зона", name: "Напольный светильник хлопок / натуральный", brand: "Loft Concept", model: "Scandic Floor Lamp", qty: 1, price: 12_000 },
      { zone: "Гостиная / Гостиная зона", name: "Декоративные подушки 45×45 (2 шт)", brand: "H&M Home", model: "Cozy Linen", qty: 2, price: 1_800 },
      { zone: "Кухонная зона", name: "Кухонный гарнитур L-образный 2.8 м", brand: "Леруа Мерлен", model: "Квадро Белый + столешница дуб", qty: 1, price: 95_000 },
      { zone: "Кухонная зона", name: "Кухонный остров на колёсиках 80×60", brand: "IKEA", model: "STENSTORP", qty: 1, price: 24_500 },
      { zone: "Кухонная зона", name: "Индукционная варочная поверхность 60 см", brand: "Bosch", model: "PVS631FB5E", qty: 1, price: 24_000 },
      { zone: "Кухонная зона", name: "Вытяжка встраиваемая 60 см стекло", brand: "Elica", model: "Elibloc 6 F 60 BL", qty: 1, price: 18_500 },
      { zone: "Кухонная зона", name: "Посудомоечная машина встраиваемая 45 см", brand: "Bosch", model: "SPV2IKX10E", qty: 1, price: 32_000 },
      { zone: "Кухонная зона", name: "Смеситель для кухни поворотный хром", brand: "Grohe", model: "BauLoop", qty: 1, price: 8_900 },
      { zone: "Спальная зона", name: "Кровать 160×200 с деревянным изголовьем", brand: "IKEA", model: "MALM береза", qty: 1, price: 32_000 },
      { zone: "Спальная зона", name: "Матрас 160×200, средняя жёсткость", brand: "Орматек", model: "Optima Classic Spring", qty: 1, price: 38_000 },
      { zone: "Спальная зона", name: "Система хранения над кроватью (2 шкафа)", brand: "IKEA", model: "PAX 50×60×35 белый", qty: 2, price: 12_000 },
      { zone: "Спальная зона", name: "Прикроватная тумба с ящиком", brand: "IKEA", model: "HEMNES берёза", qty: 1, price: 8_500 },
      { zone: "Спальная зона", name: "Бра настенное двойное LED", brand: "Eglo", model: "Cardillio 2 хром", qty: 1, price: 6_200 },
      { zone: "Рабочая зона", name: "Рабочий стол 120×60 белый", brand: "IKEA", model: "ALEX белый", qty: 1, price: 18_500 },
      { zone: "Рабочая зона", name: "Кресло эргономичное сетчатое чёрное", brand: "Hoff", model: "Comfort Pro Mesh", qty: 1, price: 22_000 },
      { zone: "Рабочая зона", name: "Настольная лампа LED на прищепке", brand: "IKEA", model: "JANSJÖ", qty: 1, price: 1_500 },
      { zone: "Прихожая", name: "Шкаф-купе встроенный 200×60×220 белый", brand: "IKEA", model: "PAX с зеркальным фасадом", qty: 1, price: 38_000 },
      { zone: "Прихожая", name: "Зеркало с подсветкой 60×80", brand: "IKEA", model: "STORJORM", qty: 1, price: 9_500 },
      { zone: "Прихожая", name: "Вешалка настенная 5 крючков нержавейка", brand: "Umbra", model: "Trigg Wall", qty: 1, price: 4_200 },
      { zone: "Прихожая", name: "Обувница на 12 пар откидная", brand: "Hoff", model: "Basic Flip", qty: 1, price: 7_800 },
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
    rooms: "2 комнаты + кухня-столовая + санузел 8 м²",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/a2fbe211-d0d5-4557-8951-884aa6342a3c.jpg",
    accentFrom: "from-amber-400",
    accentTo: "to-orange-500",
    accentText: "text-amber-700",
    description:
      "Двухкомнатная квартира в стиле contemporary с неоклассическими деталями. Паркет ёлочкой, лепные молдинги, тёплые цвета терракоты и горчицы создают уютную атмосферу. Открытая кухня-столовая объединена с гостиной аркой, в спальне — гардеробная система и мягкое изголовье.",
    tags: ["2 комнаты", "Contemporary", "Паркет ёлочкой", "Молдинги", "Тёплые тона"],
    features: [
      "Паркет инженерный «дуб Орех» 15×120 мм, укладка ёлочкой в гостиной и столовой",
      "Лепные полиуретановые молдинги Orac Decor по периметру в гостиной и спальне",
      "Арочный проём гипсокартон + декоративный наличник между кухней и гостиной",
      "Двойная мойка и встроенная техника Bosch в кухонном гарнитуре L-образном",
      "Гардеробная система Hettich 240 см в спальне — раздвижные двери с зеркалом",
      "LED-подсветка в парящих коробах по периметру потолка на диммере 0–100%",
    ],
    workSections: [
      {
        icon: "Hammer",
        title: "Демонтаж и перепланировка",
        items: [
          { name: "Демонтаж старых покрытий пола и стен", qty: 65, unit: "м²", pricePerUnit: 180 },
          { name: "Снос межкомнатной стены (перегородка)", qty: 1, unit: "ед.", pricePerUnit: 28_000 },
          { name: "Устройство арочного проёма гипсокартон", qty: 1, unit: "ед.", pricePerUnit: 18_000 },
          { name: "Демонтаж сантехники и старой проводки", qty: 1, unit: "компл.", pricePerUnit: 18_000 },
          { name: "Вывоз мусора (контейнер 7 м³)", qty: 1, unit: "шт", pricePerUnit: 19_000 },
        ],
      },
      {
        icon: "PaintBucket",
        title: "Стены и потолки",
        items: [
          { name: "Штукатурка стен машинная Knauf Rotband", qty: 168, unit: "м²", pricePerUnit: 620 },
          { name: "Финишная шпаклёвка стен под покраску", qty: 168, unit: "м²", pricePerUnit: 320 },
          { name: "Монтаж гипсокартонных коробов с LED-подсветкой", qty: 38, unit: "пог.м", pricePerUnit: 1_200 },
          { name: "Шпаклёвка и покраска потолка 2 слоя", qty: 65, unit: "м²", pricePerUnit: 580 },
          { name: "Поклейка обоев флизелиновых (гостиная + спальня)", qty: 96, unit: "м²", pricePerUnit: 460 },
          { name: "Монтаж декоративных молдингов Orac Decor", qty: 42, unit: "пог.м", pricePerUnit: 520 },
          { name: "Шпаклёвка и покраска кухни в 2 слоя", qty: 28, unit: "м²", pricePerUnit: 380 },
          { name: "Монтаж декоративной арки из гипсокартона", qty: 1, unit: "ед.", pricePerUnit: 12_000 },
        ],
      },
      {
        icon: "Layers",
        title: "Полы",
        items: [
          { name: "Стяжка самовыравнивающаяся Knauf, 10–40 мм", qty: 65, unit: "м²", pricePerUnit: 950 },
          { name: "Укладка инженерного паркета ёлочкой (15×120)", qty: 48, unit: "м²", pricePerUnit: 1_400 },
          { name: "Шлифовка и лакировка паркета 2 слоя", qty: 48, unit: "м²", pricePerUnit: 680 },
          { name: "Укладка керамогранита 60×60 (кухня + санузел)", qty: 17, unit: "м²", pricePerUnit: 1_500 },
          { name: "Установка дубового плинтуса 80 мм", qty: 52, unit: "пог.м", pricePerUnit: 380 },
          { name: "Монтаж тёплого пола в санузле", qty: 8, unit: "м²", pricePerUnit: 2_200 },
        ],
      },
      {
        icon: "Zap",
        title: "Электрика",
        items: [
          { name: "Полная замена проводки скрытая (NYM 3×2.5)", qty: 65, unit: "м²", pricePerUnit: 820 },
          { name: "Кабель к варочной поверхности 6 мм² + духовке", qty: 1, unit: "компл.", pricePerUnit: 4_800 },
          { name: "Установка розеток Legrand Valena Life", qty: 24, unit: "шт", pricePerUnit: 450 },
          { name: "Установка выключателей + диммеров", qty: 10, unit: "шт", pricePerUnit: 520 },
          { name: "Монтаж точечных светильников LED", qty: 18, unit: "шт", pricePerUnit: 600 },
          { name: "Монтаж LED-ленты в парящие короба (14 м)", qty: 1, unit: "компл.", pricePerUnit: 8_200 },
          { name: "Подвес люстр + установка (2 шт)", qty: 2, unit: "шт", pricePerUnit: 800 },
          { name: "Щиток Legrand + автоматы ABB + 2×УЗО", qty: 1, unit: "компл.", pricePerUnit: 28_000 },
        ],
      },
      {
        icon: "Droplets",
        title: "Сантехника",
        items: [
          { name: "Разводка ХВС / ГВС + гидроизоляция санузла", qty: 1, unit: "компл.", pricePerUnit: 32_000 },
          { name: "Установка ванны акриловой 170×70 + экран", qty: 1, unit: "шт", pricePerUnit: 7_500 },
          { name: "Установка смесителя для ванны", qty: 1, unit: "шт", pricePerUnit: 4_200 },
          { name: "Установка инсталляции Geberit + унитаза Rimfree", qty: 1, unit: "шт", pricePerUnit: 12_000 },
          { name: "Установка тумбы с раковиной 90 см + смеситель", qty: 1, unit: "компл.", pricePerUnit: 9_800 },
          { name: "Установка полотенцесушителя водяного", qty: 1, unit: "шт", pricePerUnit: 4_500 },
          { name: "Облицовка стен санузла плиткой 30×90", qty: 36, unit: "м²", pricePerUnit: 1_700 },
          { name: "Укладка плитки пол санузла 60×60", qty: 8, unit: "м²", pricePerUnit: 1_500 },
        ],
      },
      {
        icon: "DoorOpen",
        title: "Двери и откосы",
        items: [
          { name: "Установка входной двери МДФ с замком", qty: 1, unit: "шт", pricePerUnit: 7_500 },
          { name: "Межкомнатные двери скрытого монтажа (3 шт)", qty: 3, unit: "шт", pricePerUnit: 9_500 },
          { name: "Монтаж дверных откосов гипсокартон + краска", qty: 22, unit: "пог.м", pricePerUnit: 900 },
          { name: "Монтаж подоконников + откосов на окна (3 окна)", qty: 3, unit: "компл.", pricePerUnit: 5_200 },
        ],
      },
    ],
    materials: [
      { category: "Полы", name: "Паркет инженерный дуб «Орех» 15×120 мм", brand: "Barlinek Senses", qty: 52, unit: "м²", pricePerUnit: 4_200 },
      { category: "Полы", name: "Керамогранит Charme Extra 60×120 натуральный", brand: "Italon", qty: 19, unit: "м²", pricePerUnit: 3_600 },
      { category: "Полы", name: "Клей для паркета однокомпонентный 14 кг", brand: "Bostik MCS Flex", qty: 6, unit: "шт", pricePerUnit: 4_200 },
      { category: "Полы", name: "Плинтус дубовый натуральный 80 мм", brand: "Tarkett Plinto", qty: 54, unit: "пог.м", pricePerUnit: 680 },
      { category: "Полы", name: "Тёплый пол кабельный 1200 Вт (санузел)", brand: "Devi Devilmat 150T", qty: 1, unit: "компл.", pricePerUnit: 18_500 },
      { category: "Стены", name: "Обои структурные бежевые под покраску", brand: "Atlas Wallcoverings", qty: 28, unit: "рулон", pricePerUnit: 1_400 },
      { category: "Стены", name: "Краска интерьерная тёплый белый 10 л", brand: "Dulux Ambiance Pearl", qty: 5, unit: "шт", pricePerUnit: 4_500 },
      { category: "Стены", name: "Молдинги декоративные полиуретан 110 мм", brand: "Orac Decor C330", qty: 42, unit: "пог.м", pricePerUnit: 680 },
      { category: "Стены", name: "Штукатурка гипсовая машинная 30 кг", brand: "Knauf Rotband", qty: 18, unit: "мешок", pricePerUnit: 980 },
      { category: "Стены", name: "Шпаклёвка финишная полимерная 20 кг", brand: "Knauf Finish", qty: 12, unit: "мешок", pricePerUnit: 820 },
      { category: "Стены", name: "Грунтовка универсальная 10 л", brand: "Knauf Tiefengrund", qty: 5, unit: "шт", pricePerUnit: 780 },
      { category: "Плитка санузел", name: "Плитка стеновая 30×90 Sahara Bianco", brand: "Italon Charme Evo", qty: 38, unit: "м²", pricePerUnit: 3_200 },
      { category: "Плитка санузел", name: "Керамогранит пол 60×60 белый matt", brand: "Italon Charme Extra", qty: 9, unit: "м²", pricePerUnit: 3_400 },
      { category: "Плитка санузел", name: "Затирка Caramel 5 кг", brand: "Ceresit CE 40 Aquastatic", qty: 3, unit: "шт", pricePerUnit: 520 },
      { category: "Сантехника", name: "Ванна акриловая 170×70 Sensation", brand: "Roca", qty: 1, unit: "шт", pricePerUnit: 28_000 },
      { category: "Сантехника", name: "Смеситель для ванны с душем хром", brand: "Grohe Grohtherm 1000", qty: 1, unit: "шт", pricePerUnit: 18_500 },
      { category: "Сантехника", name: "Инсталляция + унитаз Rimfree + кнопка", brand: "Geberit + Roca Meridian N", qty: 1, unit: "компл.", pricePerUnit: 52_000 },
      { category: "Сантехника", name: "Тумба с раковиной 90 см + 2 ящика", brand: "Aquanet Palatino 90", qty: 1, unit: "шт", pricePerUnit: 28_000 },
      { category: "Сантехника", name: "Зеркало с подсветкой 90×70 см", brand: "Aquanet Сan 90", qty: 1, unit: "шт", pricePerUnit: 18_000 },
      { category: "Сантехника", name: "Полотенцесушитель водяной П-образный", brand: "Mario Classico 40×80", qty: 1, unit: "шт", pricePerUnit: 8_500 },
      { category: "Электрика", name: "Розетки с заземлением", brand: "Legrand Valena Life", qty: 24, unit: "шт", pricePerUnit: 580 },
      { category: "Электрика", name: "Выключатели + диммеры", brand: "Legrand Valena Life", qty: 10, unit: "шт", pricePerUnit: 680 },
      { category: "Электрика", name: "LED-лента 2700К 14.4 Вт/м 12 В", brand: "Arlight iLED Lux", qty: 16, unit: "м", pricePerUnit: 680 },
      { category: "Двери", name: "Входная дверь металл МДФ шпон венге", brand: "Гардиан 51 Veneer", qty: 1, unit: "шт", pricePerUnit: 48_000 },
      { category: "Двери", name: "Двери скрытого монтажа ПВХ белый", brand: "Profildoors P-6 Белый", qty: 3, unit: "шт", pricePerUnit: 28_000 },
    ],
    interiorElements: [
      { zone: "Гостиная", name: "Диван секционный угловой ткань терракота 280 см", brand: "Rolf", model: "Grenada", qty: 1, price: 98_000 },
      { zone: "Гостиная", name: "Кресло бархатное горчица 82 см", brand: "La Forma", model: "Jarrod Velvet Mustard", qty: 2, price: 38_000 },
      { zone: "Гостиная", name: "Журнальный стол мрамор / латунь 90×50", brand: "Desondo", model: "Romano Marble", qty: 1, price: 28_000 },
      { zone: "Гостиная", name: "Ковёр 200×290 шерсть, тёплый бежевый", brand: "Zala", model: "Nordic Warmth", qty: 1, price: 42_000 },
      { zone: "Гостиная", name: "ТВ-стойка 200 см дуб / чёрный металл", brand: "ИКЕА", model: "BESTÅ + EKET", qty: 1, price: 36_000 },
      { zone: "Гостиная", name: "Напольный светильник «дуга» золото", brand: "Loft Concept", model: "Arc Gold 2.2 m", qty: 1, price: 22_000 },
      { zone: "Гостиная", name: "Люстра подвесная 6 плафонов латунь", brand: "Maytoni", model: "Zaragoza MOD541-06-G", qty: 1, price: 18_500 },
      { zone: "Столовая", name: "Стол обеденный 140×80 дуб / чёрный металл", brand: "IKEA", model: "MÖRBYLÅNGA", qty: 1, price: 34_000 },
      { zone: "Столовая", name: "Стул обеденный с мягким сиденьем бежевый", brand: "La Forma", model: "Satomi", qty: 4, price: 16_000 },
      { zone: "Столовая", name: "Подвесной светильник рифлёное стекло 40 см", brand: "Eglo", model: "Combarelles 39987", qty: 1, price: 12_000 },
      { zone: "Кухня", name: "Кухонный гарнитур L-образный 3.2+1.6 м крем", brand: "Леруа Мерлен", model: "Квадро Крем + столешница мрамор", qty: 1, price: 128_000 },
      { zone: "Кухня", name: "Встраиваемая духовка 60 см нержавейка", brand: "Bosch", model: "HBF534ES0", qty: 1, price: 42_000 },
      { zone: "Кухня", name: "Индукционная варочная поверхность 60 см", brand: "Bosch", model: "PVS651FC5E", qty: 1, price: 38_000 },
      { zone: "Кухня", name: "Холодильник двухдверный 190 см нерж.", brand: "Bosch", model: "KGN56VI20R", qty: 1, price: 78_000 },
      { zone: "Кухня", name: "Вытяжка наклонная 90 см стекло/нерж.", brand: "Elica", model: "Kleos A 90 ix", qty: 1, price: 32_000 },
      { zone: "Спальня", name: "Кровать 180×200 мягкое изголовье ткань бежевая", brand: "Ashley Furniture", model: "Chime Upholstered", qty: 1, price: 68_000 },
      { zone: "Спальня", name: "Матрас 180×200 независимые пружины", brand: "Орматек", model: "Active Duo S", qty: 1, price: 62_000 },
      { zone: "Спальня", name: "Система гардеробной 240×60 с раздвижными зеркальными дверьми", brand: "Hettich", model: "InnoTech Atira Premium", qty: 1, price: 68_000 },
      { zone: "Спальня", name: "Прикроватные тумбы (2 шт) дуб/латунь", brand: "Desondo", model: "Notte Bedside", qty: 2, price: 18_000 },
      { zone: "Спальня", name: "Бра настенные (2 шт) латунь", brand: "Maytoni", model: "Calvin MOD527-WL-01-G", qty: 2, price: 8_500 },
      { zone: "Прихожая", name: "Шкаф-купе 200×60×240 зеркальный фасад", brand: "IKEA", model: "PAX + Auli зеркало", qty: 1, price: 58_000 },
      { zone: "Прихожая", name: "Консоль с ящиками дуб/чёрный 100 см", brand: "Desondo", model: "Entry Console", qty: 1, price: 22_000 },
      { zone: "Прихожая", name: "Зеркало с подсветкой 80×120 овальное", brand: "Мирзеркало", model: "Oval LED Gold", qty: 1, price: 14_500 },
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
    rooms: "3 комнаты + 2 санузла + гардеробная 8 м²",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/8745757e-34a3-4da5-8895-30f4dec98106.jpg",
    accentFrom: "from-violet-500",
    accentTo: "to-purple-700",
    accentText: "text-violet-700",
    description:
      "Трёхкомнатная квартира в стиле Dark Luxury с элементами ар-деко. Мраморный пол Nero Marquina в гостиной и коридоре, тёмно-синие стены с латунными молдингами, встроенные библиотеки от пола до потолка и система умного освещения Philips Hue создают неповторимую атмосферу. Мастер-спальня с собственным санузлом и гардеробной 8 м².",
    tags: ["3 комнаты", "Премиум", "Тёмные тона", "Мрамор", "Ар-деко", "Умный дом"],
    features: [
      "Мраморный пол Nero Marquina 60×60 полированный в гостиной и коридоре (62 м²)",
      "Встроенные библиотеки от пола до потолка МДФ шпон дуба в гостиной (3 секции 3.6 м)",
      "Мастер-спальня: собственный санузел 5 м² + гардеробная 8 м² система Hettich",
      "Умное освещение Philips Hue Bridge + диммеры в каждой зоне (5 сценариев)",
      "Натяжной потолок Clipso сатин «Midnight» в гостиной — имитирует звёздное небо",
      "МДФ-панели с латунными вставками 3 мм на акцентных стенах гостиной и коридора",
    ],
    workSections: [
      {
        icon: "Hammer",
        title: "Демонтаж и перепланировка",
        items: [
          { name: "Полный демонтаж внутренней отделки пол/стены/потолок", qty: 98, unit: "м²", pricePerUnit: 320 },
          { name: "Снос перегородки (расширение гостиной)", qty: 1, unit: "ед.", pricePerUnit: 32_000 },
          { name: "Возведение новых перегородок ГКЛ (гардеробная + перепланировка)", qty: 2, unit: "ед.", pricePerUnit: 24_000 },
          { name: "Демонтаж старой сантехники (2 санузла)", qty: 2, unit: "компл.", pricePerUnit: 12_000 },
          { name: "Вывоз строительного мусора (2 контейнера 10 м³)", qty: 2, unit: "шт", pricePerUnit: 22_000 },
        ],
      },
      {
        icon: "PaintBucket",
        title: "Стены и потолки",
        items: [
          { name: "Штукатурка стен лазерная геометрия", qty: 256, unit: "м²", pricePerUnit: 900 },
          { name: "Декоративная штукатурка VALPAINT Matiere (гостиная)", qty: 72, unit: "м²", pricePerUnit: 2_400 },
          { name: "Монтаж МДФ-панелей шпон дуба с латунными вставками", qty: 45, unit: "м²", pricePerUnit: 3_800 },
          { name: "Окраска стен тёмно-синяя 2 слоя Farrow & Ball (спальни)", qty: 120, unit: "м²", pricePerUnit: 680 },
          { name: "Натяжной потолок Clipso сатин Midnight (гостиная)", qty: 42, unit: "м²", pricePerUnit: 2_200 },
          { name: "Натяжной потолок Clipso белый (спальни, кухня)", qty: 56, unit: "м²", pricePerUnit: 1_800 },
          { name: "Монтаж встроенных книжных стеллажей МДФ (гостиная)", qty: 1, unit: "компл.", pricePerUnit: 185_000 },
          { name: "Монтаж гипсокартонных коробов и ниш для LED", qty: 48, unit: "пог.м", pricePerUnit: 1_500 },
        ],
      },
      {
        icon: "Layers",
        title: "Полы",
        items: [
          { name: "Стяжка с шумоизоляцией Rockwool Акустик Баттс", qty: 98, unit: "м²", pricePerUnit: 1_500 },
          { name: "Укладка мрамора Nero Marquina 60×60 полированный", qty: 62, unit: "м²", pricePerUnit: 5_200 },
          { name: "Укладка паркета мореный дуб 22×120 (спальни)", qty: 36, unit: "м²", pricePerUnit: 2_400 },
          { name: "Шлифовка и лакировка паркета 3 слоя масло Osmo", qty: 36, unit: "м²", pricePerUnit: 850 },
          { name: "Укладка керамогранита под мрамор (2 санузла)", qty: 18, unit: "м²", pricePerUnit: 2_200 },
          { name: "Тёплый пол кабельный в обоих санузлах", qty: 13, unit: "м²", pricePerUnit: 2_500 },
          { name: "Монтаж плинтуса дубового 100 мм тонированного", qty: 68, unit: "пог.м", pricePerUnit: 680 },
        ],
      },
      {
        icon: "Zap",
        title: "Электрика и умный дом",
        items: [
          { name: "Полная замена проводки (NYM 3×2.5 + 4.0 + 6.0)", qty: 98, unit: "м²", pricePerUnit: 1_100 },
          { name: "Монтаж шины умного дома Philips Hue Bridge", qty: 1, unit: "компл.", pricePerUnit: 28_000 },
          { name: "Установка умных выключателей Philips Hue (зоны)", qty: 18, unit: "шт", pricePerUnit: 1_800 },
          { name: "Установка розеток Legrand Celiane (серия Gold)", qty: 38, unit: "шт", pricePerUnit: 1_200 },
          { name: "Монтаж точечных светильников LED Philips Hue", qty: 32, unit: "шт", pricePerUnit: 850 },
          { name: "Монтаж LED-ленты в ниши + парящие короба (22 м)", qty: 1, unit: "компл.", pricePerUnit: 18_000 },
          { name: "Подключение подвесных люстр + бра (7 точек)", qty: 7, unit: "шт", pricePerUnit: 1_200 },
          { name: "Щиток ABB 36 позиций + автоматы + УЗО 3 шт", qty: 1, unit: "компл.", pricePerUnit: 58_000 },
        ],
      },
      {
        icon: "Droplets",
        title: "Сантехника (2 санузла)",
        items: [
          { name: "Разводка ХВС/ГВС Uponor PPR на 2 санузла", qty: 1, unit: "компл.", pricePerUnit: 68_000 },
          { name: "Гидроизоляция полимерная обмазочная 2 санузла", qty: 18, unit: "м²", pricePerUnit: 1_200 },
          { name: "Установка ванны отдельностоящей овальной 180×80", brand: "Jacuzzi", qty: 1, unit: "шт", pricePerUnit: 18_000 },
          { name: "Монтаж душевого пространства без поддона (мастер)", qty: 1, unit: "компл.", pricePerUnit: 28_000 },
          { name: "Установка 2×инсталляций + унитазов", qty: 2, unit: "компл.", pricePerUnit: 14_000 },
          { name: "Установка 2×тумб с раковинами + смесители", qty: 2, unit: "компл.", pricePerUnit: 12_000 },
          { name: "Установка 2×полотенцесушителей дизайнерских", qty: 2, unit: "шт", pricePerUnit: 5_500 },
          { name: "Облицовка стен обоих санузлов 30×90 под мрамор", qty: 52, unit: "м²", pricePerUnit: 2_200 },
          { name: "Монтаж ниши в стене для шампуня (мастер-санузел)", qty: 1, unit: "ед.", pricePerUnit: 8_500 },
        ],
      },
      {
        icon: "DoorOpen",
        title: "Двери и специальная отделка",
        items: [
          { name: "Установка бронированной входной двери", qty: 1, unit: "шт", pricePerUnit: 12_000 },
          { name: "Двери скрытого монтажа шпон дуба (5 шт)", qty: 5, unit: "шт", pricePerUnit: 14_000 },
          { name: "Откосы и наличники гипсокартон + штукатурка", qty: 36, unit: "пог.м", pricePerUnit: 1_100 },
          { name: "Монтаж подоконников мрамор (4 окна)", qty: 4, unit: "шт", pricePerUnit: 8_500 },
          { name: "Монтаж карнизного крепления скрытого (тяжёлые шторы)", qty: 4, unit: "шт", pricePerUnit: 3_200 },
        ],
      },
    ],
    materials: [
      { category: "Полы — мрамор", name: "Мрамор Nero Marquina 60×60 полированный", brand: "Italon Stellaris Carbon", qty: 66, unit: "м²", pricePerUnit: 9_800 },
      { category: "Полы — мрамор", name: "Клей эпоксидный двухкомпонентный для мрамора", brand: "Litokol Litoflex K80", qty: 12, unit: "мешок", pricePerUnit: 1_800 },
      { category: "Полы — мрамор", name: "Затирка для мрамора Charcoal 5 кг", brand: "Mapei Ultracolor Plus", qty: 8, unit: "шт", pricePerUnit: 680 },
      { category: "Полы — паркет", name: "Паркет мореный дуб 22×120 мм масло", brand: "Coswick Smoked", qty: 40, unit: "м²", pricePerUnit: 8_400 },
      { category: "Полы — паркет", name: "Масло для паркета Intensive Ebony 1 л", brand: "Osmo Hardwax-Oil", qty: 4, unit: "шт", pricePerUnit: 3_800 },
      { category: "Полы — паркет", name: "Плинтус дубовый тонированный 100 мм", brand: "Barlinek Plinto 100", qty: 70, unit: "пог.м", pricePerUnit: 1_200 },
      { category: "Стены", name: "Краска глубокого тона «Hague Blue» 5 л", brand: "Farrow & Ball Estate", qty: 6, unit: "шт", pricePerUnit: 6_800 },
      { category: "Стены", name: "Декоративная штукатурка Concrete Effect", brand: "VALPAINT Matiere S", qty: 12, unit: "кг", pricePerUnit: 2_400 },
      { category: "Стены", name: "МДФ-панель шпон дуба дымчатого 2800×1220", brand: "Kronospan Prestige", qty: 28, unit: "шт", pricePerUnit: 4_200 },
      { category: "Стены", name: "Латунный профиль-вставка 3 мм для МДФ", brand: "Progress Profiles", qty: 180, unit: "пог.м", pricePerUnit: 320 },
      { category: "Стены", name: "Штукатурка гипсовая машинная 30 кг", brand: "Knauf Rotband", qty: 28, unit: "мешок", pricePerUnit: 980 },
      { category: "Стены", name: "Шпаклёвка финишная 20 кг", brand: "Knauf Finish", qty: 18, unit: "мешок", pricePerUnit: 820 },
      { category: "Плитка санузлы", name: "Керамогранит Marmi Imperiali 30×90 полир.", brand: "Italon Charme Advance", qty: 56, unit: "м²", pricePerUnit: 5_200 },
      { category: "Плитка санузлы", name: "Керамогранит пол 60×60 под мрамор Gold", brand: "Italon Charme Extra", qty: 20, unit: "м²", pricePerUnit: 4_800 },
      { category: "Плитка санузлы", name: "Затирка Charcoal для тёмных швов", brand: "Mapei Ultracolor Plus", qty: 6, unit: "шт", pricePerUnit: 680 },
      { category: "Сантехника", name: "Ванна отдельностоящая овальная 180×80", brand: "Jacuzzi Folia", qty: 1, unit: "шт", pricePerUnit: 285_000 },
      { category: "Сантехника", name: "Смеситель для ванны напольный чёрный матовый", brand: "Gessi Emporio 38089", qty: 1, unit: "шт", pricePerUnit: 68_000 },
      { category: "Сантехника", name: "Инсталляция + унитаз Rimfree чёрный (×2)", brand: "Geberit Duofix + Laufen Pro", qty: 2, unit: "компл.", pricePerUnit: 98_000 },
      { category: "Сантехника", name: "Тумба с раковиной 120 см чёрный мат (×2)", brand: "Laufen Base", qty: 2, unit: "шт", pricePerUnit: 142_000 },
      { category: "Сантехника", name: "Полотенцесушитель дизайнерский чёрный (×2)", brand: "Emco Schakel", qty: 2, unit: "шт", pricePerUnit: 32_000 },
      { category: "Сантехника", name: "Дождевая лейка потолочная 30×30 чёрная", brand: "Gessi Rettangolo", qty: 1, unit: "шт", pricePerUnit: 42_000 },
      { category: "Умный дом", name: "Шлюз Philips Hue Bridge v3", brand: "Philips Hue", qty: 1, unit: "шт", pricePerUnit: 8_200 },
      { category: "Умный дом", name: "Умный выключатель + диммер (×18)", brand: "Philips Hue Dimmer Switch", qty: 18, unit: "шт", pricePerUnit: 3_200 },
      { category: "Умный дом", name: "LED-лента Gradient Lightstrip Plus 2 м", brand: "Philips Hue", qty: 12, unit: "шт", pricePerUnit: 8_500 },
      { category: "Двери", name: "Входная дверь бронированная МДФ шпон", brand: "Torex Snegir Pro 100 Venge", qty: 1, unit: "шт", pricePerUnit: 128_000 },
      { category: "Двери", name: "Двери скрытого монтажа шпон дуба (×5)", brand: "Profildoors U21 Дуб", qty: 5, unit: "шт", pricePerUnit: 68_000 },
    ],
    interiorElements: [
      { zone: "Гостиная", name: "Диван трёхместный бархат тёмно-синий 280 см", brand: "Poliform", model: "Bristol 3-seater Velvet", qty: 1, price: 485_000 },
      { zone: "Гостиная", name: "Кресло ар-деко бархат изумруд + латунные ножки", brand: "Desondo", model: "Gatsby Emerald", qty: 2, price: 68_000 },
      { zone: "Гостиная", name: "Журнальный стол мрамор черный + латунь Ø90 см", brand: "Flou", model: "Atoll Black Marble", qty: 1, price: 185_000 },
      { zone: "Гостиная", name: "Ковёр 300×400 шерсть цвет Champagne", brand: "Zala Interiors", model: "Art Deco Champagne", qty: 1, price: 280_000 },
      { zone: "Гостиная", name: "Встроенная библиотека МДФ шпон дуба, 3 секции", brand: "Custom Craft", model: "Floor-to-ceiling", qty: 1, price: 280_000 },
      { zone: "Гостиная", name: "Люстра подвесная ар-деко 12 плафонов латунь/хрусталь", brand: "Maytoni", model: "Palace 12 Gold Crystal", qty: 1, price: 145_000 },
      { zone: "Гостиная", name: "Консоль за диваном мрамор/латунь 200 см", brand: "Flou", model: "Gloria Console", qty: 1, price: 128_000 },
      { zone: "Кухня", name: "Кухня из MDF шпон венге + латунные ручки", brand: "Leicht", model: "GTX-PG Custom Dark", qty: 1, price: 780_000 },
      { zone: "Кухня", name: "Духовой шкаф + СВЧ-колонна", brand: "Miele", model: "H7260B + M7244TC Dark", qty: 1, price: 168_000 },
      { zone: "Кухня", name: "Индукционная варочная поверхность 90 см", brand: "Miele", model: "KM7677 FL", qty: 1, price: 125_000 },
      { zone: "Кухня", name: "Холодильник Side-by-Side 91 см кремовый", brand: "Smeg", model: "FQ60NDF", qty: 1, price: 295_000 },
      { zone: "Кухня", name: "Вытяжка островная 90 см чёрный/латунь", brand: "Miele", model: "DA 6998 W", qty: 1, price: 185_000 },
      { zone: "Мастер-спальня", name: "Кровать 200×200 мягкое изголовье 160 см бархат", brand: "Poliform", model: "Letto Onda King", qty: 1, price: 385_000 },
      { zone: "Мастер-спальня", name: "Матрас 200×200 premium латекс + конский волос", brand: "Hypnos", model: "Elite Cashmere", qty: 1, price: 285_000 },
      { zone: "Мастер-спальня", name: "Гардеробная система 8 м² + раздвижные зеркала", brand: "Hettich", model: "InnoTech Atira XL", qty: 1, price: 385_000 },
      { zone: "Мастер-спальня", name: "Прикроватные тумбы (2 шт) лак чёрный + латунь", brand: "Flou", model: "Air Night", qty: 2, price: 82_000 },
      { zone: "Мастер-спальня", name: "Бра настенные (2 шт) хрусталь + золото", brand: "Maytoni", model: "Palace Arm Gold", qty: 2, price: 28_000 },
      { zone: "Детская / гостевая", name: "Кровать-чердак с рабочим местом 90×200", brand: "IKEA", model: "STORÅ Premium", qty: 1, price: 42_000 },
      { zone: "Детская / гостевая", name: "Шкаф платяной 200 см белый глянец", brand: "IKEA", model: "PAX Grimo зеркало", qty: 1, price: 38_000 },
      { zone: "Детская / гостевая", name: "Письменный стол 120 см дуб", brand: "IKEA", model: "ALEX Дуб", qty: 1, price: 22_000 },
      { zone: "Прихожая", name: "Консоль и зеркало 120 см чёрный + латунь", brand: "Desondo", model: "Palazzo Grand", qty: 1, price: 125_000 },
      { zone: "Прихожая", name: "Шкаф встроенный зеркальные фасады 300 см", brand: "Poliform", model: "Senzafine Mirror 300", qty: 1, price: 520_000 },
      { zone: "Прихожая", name: "Скамья с мягким сиденьем бархат тёмно-синий", brand: "Desondo", model: "Entrance Bench", qty: 1, price: 38_000 },
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
// ВКЛАДКА: РАБОТЫ
// ─────────────────────────────────────────────
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
              <table className="w-full text-sm min-w-[540px]">
                <thead className="bg-gray-50 text-gray-400 text-xs font-semibold">
                  <tr>
                    <th className="text-left px-4 py-3">Наименование работы</th>
                    <th className="text-right px-3 py-3">Кол-во</th>
                    <th className="text-right px-3 py-3">Ед.</th>
                    <th className="text-right px-3 py-3">Цена/ед.</th>
                    <th className="text-right px-4 py-3">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.items.map((item, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-700 leading-snug">{item.name}</td>
                      <td className="px-3 py-3 text-right text-gray-600 tabular-nums">{item.qty}</td>
                      <td className="px-3 py-3 text-right text-gray-400 text-xs">{item.unit}</td>
                      <td className="px-3 py-3 text-right text-gray-500 tabular-nums">{fmt(item.pricePerUnit)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
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
      <div className="flex items-center justify-between bg-gray-900 text-white rounded-2xl px-6 py-5">
        <div>
          <div className="text-white/60 text-xs mb-0.5">Стоимость всех работ</div>
          <span className="font-bold text-lg">Итого работы</span>
        </div>
        <span className="text-2xl font-black">{fmt(total)}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ВКЛАДКА: МАТЕРИАЛЫ
// ─────────────────────────────────────────────
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
              <table className="w-full text-sm min-w-[580px]">
                <thead className="bg-gray-50 text-gray-400 text-xs font-semibold">
                  <tr>
                    <th className="text-left px-4 py-3">Наименование</th>
                    <th className="text-left px-3 py-3">Бренд / Модель</th>
                    <th className="text-right px-3 py-3">Кол-во</th>
                    <th className="text-right px-3 py-3">Ед.</th>
                    <th className="text-right px-3 py-3">Цена/ед.</th>
                    <th className="text-right px-4 py-3">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-700 leading-snug">{m.name}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs leading-snug">{m.brand}</td>
                      <td className="px-3 py-3 text-right text-gray-600 tabular-nums">{m.qty}</td>
                      <td className="px-3 py-3 text-right text-gray-400 text-xs">{m.unit}</td>
                      <td className="px-3 py-3 text-right text-gray-500 tabular-nums">{fmt(m.pricePerUnit)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
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
      <div className="flex items-center justify-between bg-gray-100 rounded-2xl px-6 py-5">
        <div>
          <div className="text-gray-500 text-xs mb-0.5">Строительные и отделочные материалы</div>
          <span className="font-bold text-gray-900 text-lg">Итого материалы</span>
        </div>
        <span className="text-2xl font-black text-gray-900">{fmt(total)}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ВКЛАДКА: ИНТЕРЬЕР И МЕБЕЛЬ
// ─────────────────────────────────────────────
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
              <table className="w-full text-sm min-w-[480px]">
                <thead className="bg-gray-50 text-gray-400 text-xs font-semibold">
                  <tr>
                    <th className="text-left px-4 py-3">Элемент</th>
                    <th className="text-left px-3 py-3">Бренд / Модель</th>
                    <th className="text-right px-3 py-3">Кол-во</th>
                    <th className="text-right px-4 py-3">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-700 leading-snug">{e.name}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs">{e.brand} {e.model}</td>
                      <td className="px-3 py-3 text-right text-gray-600 tabular-nums">{e.qty}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
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
      <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl px-6 py-5">
        <div>
          <div className="text-amber-600 text-xs mb-0.5">Мебель, техника и декор</div>
          <span className="font-bold text-gray-900 text-lg">Итого интерьер</span>
        </div>
        <span className="text-2xl font-black text-gray-900">{fmt(total)}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ВКЛАДКА: ОБЗОР
// ─────────────────────────────────────────────
function OverviewTab({ project }: { project: Project }) {
  const workTotal = calcWorkTotal(project);
  const matTotal = calcMaterialsTotal(project);
  const intTotal = calcInteriorTotal(project);
  const grand = workTotal + matTotal + intTotal;

  const totalPositions =
    project.workSections.reduce((s, sec) => s + sec.items.length, 0) +
    project.materials.length +
    project.interiorElements.length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: "Ruler", label: "Площадь", value: `${project.area} м²` },
          { icon: "Palette", label: "Стиль", value: project.style },
          { icon: "DoorOpen", label: "Планировка", value: project.rooms },
          { icon: "ListChecks", label: "Позиций в смете", value: String(totalPositions) },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
            <Icon name={item.icon as never} size={20} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
              <div className="font-bold text-gray-900 text-sm leading-snug">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl p-5">
        <h4 className="font-semibold text-gray-700 text-xs mb-3 uppercase tracking-wider">
          Ключевые особенности проекта
        </h4>
        <ul className="space-y-2.5">
          {project.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
              <Icon name="CheckCircle2" size={16} className="text-green-500 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-3">Итоговый бюджет</h4>
        <div className="space-y-0">
          {[
            { label: "Стоимость работ", value: workTotal, sub: `${project.workSections.reduce((s, sec) => s + sec.items.length, 0)} позиций` },
            { label: "Строительные материалы", value: matTotal, sub: `${project.materials.length} позиций` },
            { label: "Мебель, техника и декор", value: intTotal, sub: `${project.interiorElements.length} позиций` },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <div className="text-gray-700 text-sm font-medium">{row.label}</div>
                <div className="text-gray-400 text-xs">{row.sub}</div>
              </div>
              <span className="font-semibold text-gray-900 tabular-nums">{fmt(row.value)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4">
          <div>
            <div className="font-black text-gray-900 text-xl">Всего</div>
            <div className="text-gray-400 text-xs">Москва и МО, март 2026</div>
          </div>
          <span className="font-black text-3xl text-gray-900 tabular-nums">{fmt(grand)}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 leading-relaxed">
        <span className="font-semibold">Примечание:</span> цены указаны для Москвы и МО (март 2026). В регионах стоимость работ ниже на 15–30%. Мебель и материалы — средние рыночные цены на март 2026.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// КАРТОЧКА ПРОЕКТА
// ─────────────────────────────────────────────
type Tab = "overview" | "work" | "materials" | "interior";

function ProjectCard({ project }: { project: Project }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [open, setOpen] = useState(false);

  const workTotal = calcWorkTotal(project);
  const matTotal = calcMaterialsTotal(project);
  const intTotal = calcInteriorTotal(project);
  const grand = workTotal + matTotal + intTotal;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Обзор", icon: "LayoutDashboard" },
    { id: "work", label: "Смета работ", icon: "Hammer" },
    { id: "materials", label: "Материалы", icon: "Package" },
    { id: "interior", label: "Мебель", icon: "Sofa" },
  ];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-72 overflow-hidden">
        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div
          className={`absolute top-4 left-4 bg-gradient-to-r ${project.accentFrom} ${project.accentTo} text-white text-sm font-black px-4 py-1.5 rounded-full shadow-lg`}
        >
          {project.area} м²
        </div>
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
          {project.style}
        </div>
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-white/70 text-xs font-medium mb-1">{project.subtitle}</p>
          <h3 className="text-white text-2xl font-black leading-tight">{project.title}</h3>
          <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5">
            <Icon name="DoorOpen" size={12} />
            {project.rooms}
          </p>
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
            { label: "Работы", value: workTotal, icon: "Hammer" },
            { label: "Материалы", value: matTotal, icon: "Package" },
            { label: "Мебель", value: intTotal, icon: "Sofa" },
          ].map((cell) => (
            <div key={cell.label} className="bg-gray-50 rounded-2xl p-3 text-center">
              <Icon name={cell.icon as never} size={14} className="text-gray-300 mx-auto mb-1" />
              <div className="text-xs text-gray-400 mb-1">{cell.label}</div>
              <div className="font-bold text-gray-900 text-xs leading-tight tabular-nums">{fmt(cell.value)}</div>
            </div>
          ))}
        </div>

        <div
          className={`bg-gradient-to-r ${project.accentFrom} ${project.accentTo} rounded-2xl p-4 flex items-center justify-between mb-5 shadow-sm`}
        >
          <div>
            <div className="text-white/70 text-xs mb-0.5">Полный бюджет</div>
            <div className="text-white/90 text-xs">работы + материалы + мебель</div>
          </div>
          <div className="text-white text-xl font-black tabular-nums">{fmt(grand)}</div>
        </div>

        <Button
          variant={open ? "default" : "outline"}
          className={`w-full rounded-xl ${open ? "bg-gray-900 text-white hover:bg-gray-800" : ""}`}
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <><Icon name="ChevronUp" size={16} className="mr-2" />Свернуть</>
          ) : (
            <><Icon name="FileText" size={16} className="mr-2" />Открыть полную смету</>
          )}
        </Button>

        {open && (
          <div className="mt-6">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 flex-1 text-xs py-2.5 px-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    tab === t.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon name={t.icon as never} size={13} />
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

  const totals = PROJECTS.map((p) => ({
    id: p.id,
    work: calcWorkTotal(p),
    mat: calcMaterialsTotal(p),
    int: calcInteriorTotal(p),
    grand: calcWorkTotal(p) + calcMaterialsTotal(p) + calcInteriorTotal(p),
  }));

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Шапка */}
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
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed mb-10">
            Три полноценных проекта со сметами работ, спецификацией материалов с брендами и подборкой мебели. Используйте как основу для своего ремонта или для запроса подрядчикам.
          </p>

          {/* Сводка по проектам */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PROJECTS.map((p, i) => {
              const t = totals[i];
              return (
                <div
                  key={p.id}
                  className={`bg-gradient-to-br ${p.accentFrom} ${p.accentTo} rounded-2xl p-5`}
                >
                  <div className="text-white font-black text-xl mb-0.5">{p.area} м²</div>
                  <div className="text-white/90 font-semibold text-sm mb-3">{p.title}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-white/70 text-xs">
                      <span>Работы</span>
                      <span className="tabular-nums">{fmt(t.work)}</span>
                    </div>
                    <div className="flex justify-between text-white/70 text-xs">
                      <span>Материалы</span>
                      <span className="tabular-nums">{fmt(t.mat)}</span>
                    </div>
                    <div className="flex justify-between text-white/70 text-xs">
                      <span>Мебель</span>
                      <span className="tabular-nums">{fmt(t.int)}</span>
                    </div>
                    <div className="border-t border-white/20 mt-2 pt-2 flex justify-between text-white font-black text-sm">
                      <span>Итого</span>
                      <span className="tabular-nums">{fmt(t.grand)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Карточки проектов */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>

        {/* CTA */}
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
