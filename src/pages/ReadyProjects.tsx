import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface Material {
  name: string;
  article?: string;
  qty: string;
  unit: string;
  pricePerUnit: number;
}

interface EstimateSection {
  title: string;
  items: { name: string; qty: string; unit: string; price: number }[];
}

interface Project {
  id: string;
  title: string;
  area: number;
  style: string;
  rooms: string;
  image: string;
  accentColor: string;
  totalBudget: number;
  description: string;
  tags: string[];
  materials: Material[];
  estimate: EstimateSection[];
}

const PROJECTS: Project[] = [
  {
    id: "studio-46",
    title: "Скандинавская студия",
    area: 46,
    style: "Скандинавский",
    rooms: "Студия + санузел",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0f811ec7-9d65-4386-bd57-b66969c73916.jpg",
    accentColor: "from-sky-400 to-blue-600",
    totalBudget: 1_420_000,
    description:
      "Функциональная квартира-студия в скандинавском стиле. Светлая цветовая гамма, натуральные материалы и продуманное зонирование делают пространство визуально просторнее. Кухня, гостиная и рабочая зона гармонично объединены.",
    tags: ["Студия", "Скандинавский", "Светлый", "Открытая кухня"],
    materials: [
      { name: "Ламинат Egger PRO 33 класс, дуб сонома", qty: "42", unit: "м²", pricePerUnit: 1_890 },
      { name: "Керамогранит Kerama Marazzi 60×60 белый мат", qty: "8", unit: "м²", pricePerUnit: 2_100 },
      { name: "Краска Caparol Indeko-plus белая, 10 л", qty: "4", unit: "шт", pricePerUnit: 3_800 },
      { name: "Обои флизелиновые GRANDECO однотонные светло-серые", qty: "24", unit: "м²", pricePerUnit: 650 },
      { name: "Карниз потолочный профиль 2 м", qty: "12", unit: "шт", pricePerUnit: 420 },
      { name: "Плинтус МДФ белый 60 мм", qty: "28", unit: "пог.м", pricePerUnit: 310 },
      { name: "Шпаклёвка финишная Knauf Finish 25 кг", qty: "6", unit: "мешок", pricePerUnit: 890 },
      { name: "Грунтовка Ceresit CT17 10 л", qty: "3", unit: "шт", pricePerUnit: 1_200 },
    ],
    estimate: [
      {
        title: "Демонтажные работы",
        items: [
          { name: "Снятие старого покрытия пола", qty: "46", unit: "м²", price: 150 },
          { name: "Демонтаж перегородок", qty: "1", unit: "ед.", price: 8_000 },
          { name: "Вывоз строительного мусора", qty: "3", unit: "м³", price: 3_500 },
        ],
      },
      {
        title: "Стены и потолки",
        items: [
          { name: "Выравнивание стен штукатуркой", qty: "112", unit: "м²", price: 650 },
          { name: "Финишная шпаклёвка стен", qty: "112", unit: "м²", price: 380 },
          { name: "Покраска потолка 2 слоя", qty: "46", unit: "м²", price: 320 },
          { name: "Поклейка обоев", qty: "24", unit: "м²", price: 450 },
        ],
      },
      {
        title: "Полы",
        items: [
          { name: "Стяжка полусухая", qty: "46", unit: "м²", price: 900 },
          { name: "Укладка ламината", qty: "38", unit: "м²", price: 700 },
          { name: "Укладка керамогранита", qty: "8", unit: "м²", price: 1_400 },
          { name: "Установка плинтусов", qty: "28", unit: "пог.м", price: 250 },
        ],
      },
      {
        title: "Электрика",
        items: [
          { name: "Замена проводки (скрытая)", qty: "46", unit: "м²", price: 850 },
          { name: "Установка розеток и выключателей", qty: "22", unit: "шт", price: 450 },
          { name: "Монтаж светильников", qty: "12", unit: "шт", price: 600 },
          { name: "Щиток и автоматы", qty: "1", unit: "компл.", price: 18_000 },
        ],
      },
      {
        title: "Сантехника",
        items: [
          { name: "Замена труб горячего и холодного водоснабжения", qty: "1", unit: "компл.", price: 28_000 },
          { name: "Установка унитаза", qty: "1", unit: "шт", price: 4_500 },
          { name: "Установка душевой кабины", qty: "1", unit: "шт", price: 6_000 },
          { name: "Укладка плитки в санузле", qty: "14", unit: "м²", price: 1_600 },
        ],
      },
    ],
  },
  {
    id: "flat-65",
    title: "Тёплый Contemporary",
    area: 65,
    style: "Contemporary",
    rooms: "2 комнаты + кухня + санузел",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/fc026756-2891-4aaf-bfa3-e57b99fe2a4d.jpg",
    accentColor: "from-amber-400 to-orange-500",
    totalBudget: 2_180_000,
    description:
      "Двухкомнатная квартира в стиле Contemporary с тёплой цветовой палитрой. Паркет ёлочкой, бархатные кресла и акцентные светильники создают уютную атмосферу. Отдельная спальня с гардеробной, просторная кухня-столовая.",
    tags: ["2 комнаты", "Contemporary", "Тёплые тона", "Паркет ёлочкой"],
    materials: [
      { name: "Паркет инженерный дуб «Орех», 15×120 мм", qty: "55", unit: "м²", pricePerUnit: 4_200 },
      { name: "Керамогранит Italon Charme Extra Floor 60×120", qty: "18", unit: "м²", pricePerUnit: 3_600 },
      { name: "Обои Atlas Concorde, структурные бежевые", qty: "80", unit: "м²", pricePerUnit: 1_100 },
      { name: "Краска Dulux Ambiance латексная белая 10 л", qty: "5", unit: "шт", pricePerUnit: 4_500 },
      { name: "Профиль для гипсокартонных конструкций", qty: "120", unit: "пог.м", pricePerUnit: 180 },
      { name: "Гипсокартон КНАУФ 12,5 мм", qty: "25", unit: "лист", pricePerUnit: 760 },
      { name: "Плинтус дубовый натуральный 80 мм", qty: "42", unit: "пог.м", pricePerUnit: 680 },
      { name: "Декоративные молдинги полиуретановые", qty: "30", unit: "пог.м", pricePerUnit: 450 },
    ],
    estimate: [
      {
        title: "Демонтажные работы",
        items: [
          { name: "Демонтаж старых покрытий пола и стен", qty: "65", unit: "м²", price: 200 },
          { name: "Демонтаж перегородок и дверей", qty: "2", unit: "ед.", price: 7_000 },
          { name: "Вывоз строительного мусора", qty: "5", unit: "м³", price: 3_500 },
        ],
      },
      {
        title: "Стены и потолки",
        items: [
          { name: "Выравнивание и штукатурка стен", qty: "168", unit: "м²", price: 700 },
          { name: "Монтаж гипсокартонных конструкций", qty: "25", unit: "м²", price: 1_200 },
          { name: "Финишная шпаклёвка + покраска потолка", qty: "65", unit: "м²", price: 600 },
          { name: "Поклейка обоев", qty: "80", unit: "м²", price: 480 },
          { name: "Монтаж молдингов", qty: "30", unit: "пог.м", price: 380 },
        ],
      },
      {
        title: "Полы",
        items: [
          { name: "Стяжка выравнивающая с самовыравнивателем", qty: "65", unit: "м²", price: 1_100 },
          { name: "Укладка инженерного паркета", qty: "47", unit: "м²", price: 1_200 },
          { name: "Укладка керамогранита", qty: "18", unit: "м²", price: 1_500 },
          { name: "Установка плинтуса", qty: "42", unit: "пог.м", price: 320 },
        ],
      },
      {
        title: "Электрика",
        items: [
          { name: "Полная замена электропроводки", qty: "65", unit: "м²", price: 900 },
          { name: "Установка розеток / выключателей", qty: "34", unit: "шт", price: 450 },
          { name: "Монтаж светильников (в т.ч. споты)", qty: "18", unit: "шт", price: 600 },
          { name: "Электрощит + автоматы", qty: "1", unit: "компл.", price: 22_000 },
        ],
      },
      {
        title: "Сантехника",
        items: [
          { name: "Разводка труб с/к и гидроизоляция", qty: "1", unit: "компл.", price: 36_000 },
          { name: "Установка ванны акриловой", qty: "1", unit: "шт", price: 7_000 },
          { name: "Установка унитаза-компакт", qty: "1", unit: "шт", price: 4_500 },
          { name: "Облицовка санузла плиткой", qty: "24", unit: "м²", price: 1_700 },
        ],
      },
      {
        title: "Межкомнатные двери и откосы",
        items: [
          { name: "Установка дверных блоков", qty: "4", unit: "шт", price: 5_500 },
          { name: "Монтаж откосов (гипсокартон)", qty: "12", unit: "пог.м", price: 900 },
        ],
      },
    ],
  },
  {
    id: "premium-98",
    title: "Премиальный Dark Lux",
    area: 98,
    style: "Лофт / Ар-деко",
    rooms: "3 комнаты + 2 санузла + гардеробная",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/aa382c8a-8c03-4a36-a2cc-c746e0670257.jpg",
    accentColor: "from-violet-500 to-purple-700",
    totalBudget: 3_950_000,
    description:
      "Трёхкомнатная квартира в стиле Dark Lux. Мраморные полы, встроенные библиотеки от пола до потолка, панорамные окна и дизайнерская подсветка создают неповторимую атмосферу. Мастер-спальня с собственным санузлом и гардеробной.",
    tags: ["3 комнаты", "Премиум", "Тёмные тона", "Мрамор", "Ар-деко"],
    materials: [
      { name: "Мрамор натуральный Nero Marquina 60×60", qty: "70", unit: "м²", pricePerUnit: 12_000 },
      { name: "Паркет дуб мореный цвет «Эбен» 20×140", qty: "28", unit: "м²", pricePerUnit: 7_800 },
      { name: "Краска Farrow & Ball «Hague Blue» 2,5 л", qty: "8", unit: "шт", pricePerUnit: 6_900 },
      { name: "Декоративная штукатурка VALPAINT Matiere 5 (тёмно-синяя)", qty: "60", unit: "м²", pricePerUnit: 2_400 },
      { name: "Профиль теневой потолочный алюминиевый", qty: "64", unit: "пог.м", pricePerUnit: 950 },
      { name: "Натяжной потолок Clipso сатин «Midnight»", qty: "98", unit: "м²", pricePerUnit: 1_800 },
      { name: "Плинтус МДФ «Invisible» высокий 120 мм, чёрный", qty: "68", unit: "пог.м", pricePerUnit: 1_200 },
      { name: "Стеклообои под покраску Wellton Classique", qty: "72", unit: "м²", pricePerUnit: 780 },
      { name: "Панели стеновые МДФ «Дворцовые» рейка 120×12", qty: "35", unit: "м²", pricePerUnit: 3_200 },
    ],
    estimate: [
      {
        title: "Демонтажные работы",
        items: [
          { name: "Полный демонтаж внутренней отделки", qty: "98", unit: "м²", price: 350 },
          { name: "Демонтаж и перепланировка перегородок", qty: "3", unit: "ед.", price: 15_000 },
          { name: "Вывоз крупного строительного мусора", qty: "8", unit: "м³", price: 4_000 },
        ],
      },
      {
        title: "Стены и потолки",
        items: [
          { name: "Штукатурка стен (лазерный уровень)", qty: "260", unit: "м²", price: 900 },
          { name: "Монтаж гипсокартона и короба под нишу TV", qty: "40", unit: "м²", price: 1_500 },
          { name: "Декоративная штукатурка VALPAINT", qty: "60", unit: "м²", price: 2_200 },
          { name: "Натяжной потолок Clipso", qty: "98", unit: "м²", price: 1_600 },
          { name: "Монтаж МДФ панелей на стены", qty: "35", unit: "м²", price: 1_800 },
        ],
      },
      {
        title: "Полы",
        items: [
          { name: "Стяжка с шумоизоляцией", qty: "98", unit: "м²", price: 1_400 },
          { name: "Укладка мраморного пола (включая порезку)", qty: "70", unit: "м²", price: 3_500 },
          { name: "Укладка паркета (в спальнях)", qty: "28", unit: "м²", price: 2_200 },
          { name: "Установка скрытых плинтусов", qty: "68", unit: "пог.м", price: 600 },
        ],
      },
      {
        title: "Электрика и умный дом",
        items: [
          { name: "Полная замена электропроводки (кабель NYM)", qty: "98", unit: "м²", price: 1_200 },
          { name: "Розетки / выключатели Legrand Valena Life", qty: "52", unit: "шт", price: 700 },
          { name: "Монтаж системы умного освещения", qty: "1", unit: "компл.", price: 85_000 },
          { name: "Щиток Legrand + автоматы + УЗО", qty: "1", unit: "компл.", price: 45_000 },
        ],
      },
      {
        title: "Сантехника (2 санузла)",
        items: [
          { name: "Разводка труб (PPR) + гидроизоляция 2 санузлов", qty: "1", unit: "компл.", price: 68_000 },
          { name: "Установка ванны отдельностоящей Knief", qty: "1", unit: "шт", price: 18_000 },
          { name: "Установка инсталляции + унитаза Geberit (×2)", qty: "2", unit: "шт", price: 16_000 },
          { name: "Укладка плитки в санузлах", qty: "48", unit: "м²", price: 2_500 },
          { name: "Тёплый пол электрический под плитку", qty: "18", unit: "м²", price: 2_800 },
        ],
      },
      {
        title: "Двери, гардеробная и прочее",
        items: [
          { name: "Двери скрытые Profil Doors с полотном под покраску", qty: "6", unit: "шт", price: 22_000 },
          { name: "Монтаж системы гардеробной (Hettich)", qty: "1", unit: "компл.", price: 95_000 },
          { name: "Установка откосов пластиковых / МДФ", qty: "18", unit: "пог.м", price: 1_100 },
        ],
      },
    ],
  },
];

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function EstimateTable({ sections }: { sections: EstimateSection[] }) {
  const total = sections.reduce(
    (sum, s) => sum + s.items.reduce((ss, i) => ss + i.price * parseFloat(i.qty), 0),
    0
  );
  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const sectionTotal = section.items.reduce(
          (sum, i) => sum + i.price * parseFloat(i.qty),
          0
        );
        return (
          <div key={section.title}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                {section.title}
              </h4>
              <span className="text-sm font-semibold text-gray-600">
                {formatPrice(sectionTotal)}
              </span>
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Наименование</th>
                    <th className="text-right px-3 py-2 text-gray-500 font-medium whitespace-nowrap">Кол-во</th>
                    <th className="text-right px-3 py-2 text-gray-500 font-medium">Ед.</th>
                    <th className="text-right px-4 py-2 text-gray-500 font-medium">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-50 hover:bg-gray-50/60">
                      <td className="px-4 py-2.5 text-gray-700">{item.name}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">{item.qty}</td>
                      <td className="px-3 py-2.5 text-right text-gray-500">{item.unit}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                        {formatPrice(item.price * parseFloat(item.qty))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between bg-gray-900 text-white rounded-xl px-5 py-4">
        <span className="font-semibold">Итого работы</span>
        <span className="text-xl font-bold">{formatPrice(total)}</span>
      </div>
    </div>
  );
}

function MaterialsTable({ materials }: { materials: Material[] }) {
  const total = materials.reduce((s, m) => s + m.pricePerUnit * parseFloat(m.qty), 0);
  return (
    <div>
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 text-gray-500 font-medium">Материал</th>
              <th className="text-right px-3 py-2 text-gray-500 font-medium">Кол-во</th>
              <th className="text-right px-3 py-2 text-gray-500 font-medium">Ед.</th>
              <th className="text-right px-4 py-2 text-gray-500 font-medium">Цена/ед.</th>
              <th className="text-right px-4 py-2 text-gray-500 font-medium">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, idx) => (
              <tr key={idx} className="border-t border-gray-50 hover:bg-gray-50/60">
                <td className="px-4 py-2.5 text-gray-700">{m.name}</td>
                <td className="px-3 py-2.5 text-right text-gray-600">{m.qty}</td>
                <td className="px-3 py-2.5 text-right text-gray-500">{m.unit}</td>
                <td className="px-4 py-2.5 text-right text-gray-600">{formatPrice(m.pricePerUnit)}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                  {formatPrice(m.pricePerUnit * parseFloat(m.qty))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between bg-gray-100 rounded-xl px-5 py-3 mt-3">
        <span className="font-semibold text-gray-700">Итого материалы</span>
        <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
      </div>
    </div>
  );
}

type TabType = "overview" | "estimate" | "materials";

function ProjectCard({ project }: { project: Project }) {
  const [tab, setTab] = useState<TabType>("overview");
  const [open, setOpen] = useState(false);

  const matTotal = project.materials.reduce((s, m) => s + m.pricePerUnit * parseFloat(m.qty), 0);
  const workTotal = project.estimate.reduce(
    (sum, s) => sum + s.items.reduce((ss, i) => ss + i.price * parseFloat(i.qty), 0),
    0
  );

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative h-64 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className={`absolute top-4 left-4 bg-gradient-to-r ${project.accentColor} text-white text-xs font-bold px-3 py-1.5 rounded-full`}>
          {project.area} м²
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-2xl font-bold">{project.title}</h3>
          <p className="text-white/80 text-sm mt-0.5">{project.rooms}</p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-5">{project.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="text-xs text-gray-400 mb-1">Работы</div>
            <div className="font-bold text-gray-900 text-base">{formatPrice(workTotal)}</div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="text-xs text-gray-400 mb-1">Материалы</div>
            <div className="font-bold text-gray-900 text-base">{formatPrice(matTotal)}</div>
          </div>
          <div className={`col-span-2 bg-gradient-to-r ${project.accentColor} rounded-2xl p-4`}>
            <div className="text-xs text-white/70 mb-1">Бюджет проекта</div>
            <div className="font-bold text-white text-xl">{formatPrice(workTotal + matTotal)}</div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <>
              <Icon name="ChevronUp" size={16} className="mr-2" />
              Свернуть подробности
            </>
          ) : (
            <>
              <Icon name="ChevronDown" size={16} className="mr-2" />
              Смета и материалы
            </>
          )}
        </Button>

        {open && (
          <div className="mt-6">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
              {(["overview", "estimate", "materials"] as TabType[]).map((t) => {
                const labels: Record<TabType, string> = {
                  overview: "Обзор",
                  estimate: "Смета работ",
                  materials: "Материалы",
                };
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${
                      tab === t
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>

            {tab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                    <Icon name="Ruler" size={20} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400">Площадь</div>
                      <div className="font-semibold text-gray-800">{project.area} м²</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                    <Icon name="Palette" size={20} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400">Стиль</div>
                      <div className="font-semibold text-gray-800">{project.style}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                    <Icon name="DoorOpen" size={20} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400">Планировка</div>
                      <div className="font-semibold text-gray-800">{project.rooms}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                    <Icon name="Layers" size={20} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400">Разделов сметы</div>
                      <div className="font-semibold text-gray-800">{project.estimate.length}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-800">
                  <span className="font-semibold">Примечание:</span> цены приведены для Москвы и МО (март 2026). В других регионах стоимость работ может быть ниже на 15–30%.
                </div>
              </div>
            )}

            {tab === "estimate" && <EstimateTable sections={project.estimate} />}
            {tab === "materials" && <MaterialsTable materials={project.materials} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReadyProjects() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="bg-[#0f0f13] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-8"
          >
            <Icon name="ArrowLeft" size={16} />
            На главную
          </button>
          <div className="max-w-2xl">
            <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Готовые решения
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Готовые дизайн-проекты
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              Три полноценных дизайн-проекта с подробными сметами работ и списком материалов. Выберите подходящий по площади и стилю — и отправьте подрядчикам на оценку.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-10 max-w-md">
            {PROJECTS.map((p) => (
              <div key={p.id} className="text-center">
                <div className={`text-3xl font-black bg-gradient-to-r ${p.accentColor} bg-clip-text text-transparent`}>
                  {p.area}
                </div>
                <div className="text-white/50 text-xs mt-1">м²</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Нужен индивидуальный проект?</h2>
          <p className="text-white/90 mb-6 max-w-lg mx-auto">
            ИИ-калькулятор рассчитает смету для вашей квартиры с учётом планировки, региона и выбранных материалов — за 5 минут.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 rounded-full px-8 font-semibold shadow-xl"
              onClick={() => navigate("/calculator")}
            >
              <Icon name="Calculator" size={18} className="mr-2" />
              Рассчитать смету
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/50 text-white hover:bg-white/20 rounded-full px-8 bg-transparent"
              onClick={() => navigate("/expert")}
            >
              <Icon name="MessageCircle" size={18} className="mr-2" />
              Спросить эксперта
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
