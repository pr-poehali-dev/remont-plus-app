import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate } from "react-router-dom";

interface ShowroomItem {
  id: number;
  title: string;
  description: string;
  room: string;
  style: string;
  area: string;
  materials: string[];
  image: string;
  designer: string;
  features: string[];
}

const showroomItems: ShowroomItem[] = [
  {
    id: 1,
    title: "Ванная «Каррара Люкс»",
    description: "Элегантная ванная комната с отделкой под белый мрамор каррара. Отдельно стоящая ванна, деревянные акценты, тёплое освещение создают атмосферу спа-салона.",
    room: "Ванная",
    style: "Современная классика",
    area: "12 м²",
    materials: ["Керамогранит под мрамор", "Дерево", "Стекло"],
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/ff28cef9-67bd-4b14-9e9f-93ebdba0c933.jpg",
    designer: "Студия АВАНГАРД",
    features: ["Тёплый пол", "LED-подсветка", "Отдельно стоящая ванна"],
  },
  {
    id: 2,
    title: "Душевая «Минимал Грей»",
    description: "Минималистичная ванная с крупноформатным серым керамогранитом. Душевая зона с безбарьерным входом, парящая тумба, матовая чёрная фурнитура.",
    room: "Ванная",
    style: "Минимализм",
    area: "8 м²",
    materials: ["Крупноформатный керамогранит", "Стекло", "Металл"],
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/9c1c6dc4-35b0-48bb-9ce6-50cd5b558f8f.jpg",
    designer: "Студия АВАНГАРД",
    features: ["Walk-in душ", "Парящая тумба", "Зеркало с подсветкой"],
  },
  {
    id: 3,
    title: "Кухня «Белый Остров»",
    description: "Просторная кухня с островом из белого мрамора. Современная фурнитура, подвесные светильники, фартук ёлочкой. Светлое и воздушное пространство для кулинарного творчества.",
    room: "Кухня",
    style: "Современный",
    area: "18 м²",
    materials: ["Мрамор", "МДФ эмаль", "Плитка ёлочка"],
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/fa96d38b-7c7f-4c12-bcf0-f0851ac3fb89.jpg",
    designer: "Студия АВАНГАРД",
    features: ["Остров с мойкой", "Подвесные светильники", "Скрытая техника"],
  },
  {
    id: 4,
    title: "Гостиная «Сканди Лайт»",
    description: "Уютная гостиная в скандинавском стиле. Светлое дерево, мягкий серый текстиль, живые растения и максимум естественного света. Идеальное пространство для отдыха.",
    room: "Гостиная",
    style: "Скандинавский",
    area: "22 м²",
    materials: ["Паркетная доска дуб", "Текстиль", "Натуральный камень"],
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/1e63e4d1-2bae-4cd9-b5a9-e1d2c1de71f8.jpg",
    designer: "Студия АВАНГАРД",
    features: ["Панорамные окна", "Камин", "Зонирование"],
  },
  {
    id: 5,
    title: "Ванная «Индустриал Коппер»",
    description: "Брутальная ванная в стиле лофт с бетонными стенами, медной фурнитурой и террацо на полу. Открытая кирпичная кладка и индустриальные светильники.",
    room: "Ванная",
    style: "Лофт",
    area: "10 м²",
    materials: ["Бетон", "Террацо", "Медь", "Кирпич"],
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/1b39c79d-0800-4557-91cb-bbc95ed02511.jpg",
    designer: "Студия АВАНГАРД",
    features: ["Медная фурнитура", "Террацо пол", "Кирпичный акцент"],
  },
  {
    id: 6,
    title: "Спальня «Тёплый Уют»",
    description: "Спальня в тёплых бежевых тонах с мягким изголовьем, текстурными стеновыми панелями и подвесными прикроватными светильниками. Максимум комфорта для сна.",
    room: "Спальня",
    style: "Современный",
    area: "16 м²",
    materials: ["Стеновые панели", "Текстиль", "Ковровое покрытие"],
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/47121012-bd97-447b-8d2c-e03e3ca50936.jpg",
    designer: "Студия АВАНГАРД",
    features: ["Мягкое изголовье", "Подвесные светильники", "Шумоизоляция"],
  },
];

const rooms = ["Все", "Ванная", "Кухня", "Гостиная", "Спальня"];
const styles = ["Все", "Современная классика", "Минимализм", "Современный", "Скандинавский", "Лофт"];

interface ExampleImage {
  src: string;
  label: string;
  spec?: { title: string; items: string[] };
}

interface ExampleProject {
  id: string;
  title: string;
  description: string;
  style: string;
  area: string;
  rooms: string;
  stagesCompleted: string;
  link: string;
  gradient: string;
  images: ExampleImage[];
}

const CDN = "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files";

const exampleProjects: ExampleProject[] = [
  {
    id: "presnya",
    title: "Двухкомнатная квартира на Пресне",
    description: "Полный дизайн-проект в современном стиле: планировка, визуализации, чертежи, подбор материалов и декор. Посмотрите, как выглядит готовый результат работы конструктора.",
    style: "Современный",
    area: "65 м²",
    rooms: "3 комнаты",
    stagesCompleted: "7/7",
    link: "/designer/planning?project=4",
    gradient: "from-primary/5 to-transparent",
    images: [
      { src: `${CDN}/3f5cdd85-5e28-42db-b3e9-9b0aaf22f014.jpg`, label: "Планировка квартиры", spec: { title: "Планировка 65 м²", items: ["Гостиная-кухня — 30 м² (открытая планировка)", "Спальня — 18 м² (с гардеробной 6 м²)", "Детская — 12 м² (игровая + рабочая зона)", "Коридор — 5 м² (хранение обуви и одежды)", "Высота потолков — 270 см", "Количество окон — 6"] } },
      { src: `${CDN}/9c5c44d2-3b32-4726-bd3d-a5c7407609aa.jpg`, label: "Обмерный план", spec: { title: "Обмерный план гостиной-кухни", items: ["Размеры помещения — 650 × 450 см", "Дверь — 90 × 200 см (стена 450 см, отступ 20 см)", "Окно — 150 × 120 см (стена 650 см, отступ 50 см)", "Остров — 120 × 200 см в центре кухни", "Кухонный гарнитур — 300 см вдоль стены", "Угловой диван — 250 см"] } },
      { src: `${CDN}/cc6db2bb-f7f5-4887-997d-19b6e85bb6d0.jpg`, label: "Развёртки стен", spec: { title: "Развёртки 4 стен", items: ["Стена 1 (650 см) — ниша для техники 150 × 100 см, h=70 см", "Стена 2 (450 см) — окно 150 см на высоте 120 см", "Стена 3 (650 см) — встроенный шкаф 200 × 250 см", "Стена 4 (450 см) — дверь 90 см + ниша 90 см", "Стены 1, 3 — гипсокартон, краска светло-серая", "Стены 2, 4 — кирпич, светлый керамогранит"] } },
      { src: `${CDN}/3060929a-c3ef-4250-a1d8-ca6a11941a9a.jpg`, label: "План полов", spec: { title: "План полов 29,25 м²", items: ["Гостиная (15 м²) — ламинат дуб, 8 мм", "Кухня (14,25 м²) — серый керамогранит, 10 мм", "Уровень пола — 0 см (единый)", "Ламинат — 700 ₽/м², итого 10 500 ₽", "Керамогранит — 1 200 ₽/м², итого 17 100 ₽"] } },
      { src: `${CDN}/1ffc9cb4-7cc3-4211-be53-34be2dfae7cb.jpg`, label: "План потолков", spec: { title: "План потолков и освещения", items: ["Высота потолка — 300 см", "Гостиная — LED-лента по периметру, споты через 150 см", "Кухня — 4 светильника 10W над рабочей зоной, h=250 см", "Светильники — 500 ₽/шт × 8 = 4 000 ₽", "Сценарии: общий, рабочий, акцентный"] } },
      { src: `${CDN}/22bc782e-0d01-4df3-8b54-6ae74e5f5013.jpg`, label: "Гостиная-кухня", spec: { title: "Визуализация гостиной-кухни", items: ["Белые матовые фасады, кварцевая столешница под мрамор", "Остров с барными стульями в сером велюре", "Фартук — плитка «кабанчик», серая затирка", "Серый угловой диван, мраморный журнальный стол", "ТВ-стена — дубовые рейки + LED-подсветка", "Палитра: белый 60%, дуб 20%, серый 15%, олива 5%"] } },
      { src: `${CDN}/2d494533-7d67-4ff7-bc58-928ee67818bb.jpg`, label: "Спальня", spec: { title: "Визуализация спальни", items: ["Мягкое текстильное изголовье", "Подвесные светильники-шары у кровати", "Стена за кроватью — декоративная штукатурка под бетон", "Шкаф-купе — зеркальные + дубовые фасады", "Шторы: тюль + портьеры тёплый серый", "Зона — 12 м² спальная + 6 м² гардеробная"] } },
      { src: `${CDN}/3efc0c0a-883a-421c-abc3-3af796d9855d.jpg`, label: "Детская", spec: { title: "Визуализация детской", items: ["Кровать-чердак из массива берёзы", "Рабочий стол с полками внизу", "Стена с меловой краской для рисования", "Стеллаж с яркими корзинами", "Пол — пробка + ковёр с геометрией", "Акценты: жёлтый и мятный"] } },
    ],
  },
  {
    id: "loft",
    title: "Лофт-апартаменты на Красном Октябре",
    description: "Брутальный индустриальный интерьер: кирпичные стены, бетонные потолки, медная фурнитура и тёплое дерево. Открытая планировка с зонированием светом.",
    style: "Лофт",
    area: "85 м²",
    rooms: "3 комнаты",
    stagesCompleted: "7/7",
    link: "/designer/planning?project=4",
    gradient: "from-orange-50 to-transparent",
    images: [
      { src: `${CDN}/5d4f9fe1-5f57-46e0-94b1-2d9b1cfc933d.jpg`, label: "Планировка квартиры", spec: { title: "Планировка 85 м²", items: ["Гостиная-кухня-столовая — 40 м² (open space)", "Спальня — 20 м² (с собственным санузлом)", "Кабинет — 15 м² (домашний офис)", "Ванная — 5 м² (душ + террацо)", "Коридор — 5 м²", "Фабричные окна на одной стене"] } },
      { src: `${CDN}/6d9c9c75-d535-4c6f-bfa5-2cc67da38468.jpg`, label: "Развёртки стен", spec: { title: "Развёртки стен лофта", items: ["Стена 1 (800 см) — стальные фабричные окна 300 × 200 см, кирпич", "Стена 2 (500 см) — открытый кирпич, стеллаж 250 см", "Стена 3 (800 см) — бетон, камин 120 см + ТВ выше", "Стена 4 (500 см) — дверь 100 см, воздуховоды на потолке", "Высота потолков — 350 см (открытые балки)"] } },
      { src: `${CDN}/c67a2309-ea68-45bd-af44-0bbaab7078fc.jpg`, label: "План полов", spec: { title: "План полов 85 м²", items: ["Гостиная — тёмный дуб, широкая доска", "Кухня — полированный бетон", "Спальни — тёмное дерево", "Ванная — террацо", "Коридор — бетон"] } },
      { src: `${CDN}/f0466bfa-1632-4ea3-83b4-249cd59f2cf5.jpg`, label: "План потолков", spec: { title: "План потолков лофта", items: ["Бетонный потолок без подвесов, h=350 см", "Видимые воздуховоды и стальные балки", "Трек-система освещения вдоль балок", "Кластеры подвесов Edison над островом и столовой", "Встроенные споты в спальнях", "Влагозащищённые даунлайты в ванной"] } },
      { src: `${CDN}/5c0be636-117c-46d6-a72d-5ef01d3bbfff.jpg`, label: "Гостиная-кухня", spec: { title: "Визуализация гостиной-кухни", items: ["Кирпичные стены + бетонный потолок со стальными балками", "Чёрная кухня с бетонными столешницами", "Остров с кластером ламп Edison", "Кожаный диван Chesterfield, металлический кофейный стол", "Камин с ТВ на бетонной стене", "Фабричные окна с видом на город"] } },
      { src: `${CDN}/8cf060f1-c9a4-43e0-9e09-953a2a6ffa8a.jpg`, label: "Спальня", spec: { title: "Визуализация спальни", items: ["Кирпичная акцентная стена за кроватью", "Чёрная металлическая кровать, тёмный лён", "Бетонный пол с винтажным персидским ковром", "Промышленные светильники-клетки у кровати", "Высокие фабричные окна", "Тёмный деревянный гардероб с металлическими ручками"] } },
      { src: `${CDN}/b1abea58-792d-47c2-b640-1062febb0de1.jpg`, label: "Кабинет", spec: { title: "Визуализация кабинета", items: ["Открытый кирпич, большой чёрный металлический стол", "Винтажная латунная настольная лампа", "Кожаное офисное кресло", "Металлический стеллаж от пола до потолка с книгами", "Видимые медные трубы на потолке", "Промышленные бра на стенах"] } },
      { src: `${CDN}/1d9230e3-116b-488c-aa54-4a6f00e6bea9.jpg`, label: "Ванная", spec: { title: "Визуализация ванной", items: ["Полированный бетон на стенах", "Матовый чёрный дождевой душ со стеклом", "Медные открытые трубы — вешалка для полотенец", "Террацо на полу", "Бетонная раковина с медным смесителем", "Круглое зеркало в чёрной раме, бра Edison"] } },
    ],
  },
  {
    id: "scandi",
    title: "Студия на Патриарших",
    description: "Светлая и воздушная квартира в скандинавском стиле: натуральное дерево, белые стены, живые растения и максимум естественного света. Уют в каждой детали.",
    style: "Скандинавский",
    area: "50 м²",
    rooms: "Студия",
    stagesCompleted: "7/7",
    link: "/designer/planning?project=4",
    gradient: "from-emerald-50 to-transparent",
    images: [
      { src: `${CDN}/6c8a51ed-c8e2-4d9c-8c8d-4ac796bb3737.jpg`, label: "Планировка студии", spec: { title: "Планировка студии 50 м²", items: ["Гостиная-кухня-спальня — 30 м² (open space)", "Спальная ниша — отделена шторой-карнизом", "Ванная — 6 м² (душ + раковина)", "Прихожая — 4 м² (хранение)", "Балкон — 5 м² (зона отдыха)", "Большие окна на южную сторону"] } },
      { src: `${CDN}/5c499e1e-b308-426a-bc7e-345e2aa1369a.jpg`, label: "Развёртки стен", spec: { title: "Развёртки стен студии", items: ["Стена 1 (700 см) — два окна 140 × 160 см, белые стены", "Стена 2 (500 см) — кухня 90 см + открытые полки выше", "Стена 3 (700 см) — ниша для сна 200 см, стеллажи по бокам", "Стена 4 (500 см) — дверь 90 см + шкаф-купе 180 см", "Высота потолков — 270 см"] } },
      { src: `${CDN}/b13a26e0-a1b9-4b0e-899c-c6c21f293c3d.jpg`, label: "План полов", spec: { title: "План полов 50 м²", items: ["Жилая зона — светлый дуб, паркет ёлочкой", "Кухонная зона — белая шестиугольная плитка", "Ванная — светло-серая керамическая плитка", "Прихожая — дуб (как в жилой зоне)", "Балкон — деревянный декинг"] } },
      { src: `${CDN}/9668a086-85bd-4be0-8c85-d56281aa7159.jpg`, label: "План потолков", spec: { title: "План потолков студии", items: ["Высота — 270 см, плоский белый потолок", "Гостиная — большой круглый бумажный подвес", "Кухня — 3 маленьких подвеса в ряд над стойкой", "Спальная ниша — скрытая LED-лента вдоль карниза", "Ванная — 2 влагозащищённых даунлайта", "Прихожая — плоский потолочный светильник"] } },
      { src: `${CDN}/72f4b5b9-3dfe-4a53-8749-cc9288127e27.jpg`, label: "Гостиная-кухня", spec: { title: "Визуализация гостиной-кухни", items: ["Белые стены, дубовый паркет ёлочкой", "Кухня — белые шкафы, деревянная столешница", "Открытые полки с керамикой, белый фартук subway", "3 подвеса над стойкой", "Серый льняной диван, круглый деревянный столик", "Комнатные растения на подоконниках"] } },
      { src: `${CDN}/a8bb3b59-e187-46dd-89f5-5be61dbbf9e3.jpg`, label: "Спальная зона", spec: { title: "Визуализация спальной ниши", items: ["Уютная ниша в алькове, стеллажи по бокам", "Белое льняное постельное бельё, вязаный плед", "Льняная штора на карнизе для приватности", "Скрытая LED-подсветка за карнизом", "Настенный бра для чтения", "Нейтральная тёплая палитра"] } },
      { src: `${CDN}/72bd879c-0696-4e1a-b60d-3c3e4f7d01ab.jpg`, label: "Ванная", spec: { title: "Визуализация ванной", items: ["Белая плитка subway на стенах", "Светло-серая керамика на полу", "Деревянная тумба с накладной раковиной", "Круглое зеркало в тонкой чёрной раме", "Матовые чёрные смесители", "Эвкалипт в горшке, 2 встроенных даунлайта"] } },
      { src: `${CDN}/f5baf965-d46c-441a-b685-e5a5518e3988.jpg`, label: "Балкон", spec: { title: "Визуализация балкона", items: ["Деревянный декинг на полу", "Белый металлический бистро-столик и 2 стула", "Горшечные травы и растения", "Гирлянда-лампочки над головой", "Вид на зелёный двор", "Уютный уголок для чтения с подушкой"] } },
    ],
  },
];

function ExampleProjectCard({ project, navigate }: { project: ExampleProject; navigate: (path: string) => void }) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showSpec, setShowSpec] = useState(false);
  const images = project.images;
  const currentSpec = images[activeImg]?.spec;
  const lightboxSpec = lightbox !== null ? images[lightbox]?.spec : null;

  return (
    <>
      <Card className="overflow-hidden border-primary/20 hover:shadow-lg transition-shadow">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 relative">
            <div className="aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => setLightbox(activeImg)}>
              <img
                src={images[activeImg].src}
                alt={images[activeImg].label}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-primary text-white border-0">{images[activeImg].label}</Badge>
              {currentSpec && (
                <Badge
                  className="bg-white/90 text-gray-700 border-0 backdrop-blur-sm cursor-pointer hover:bg-white"
                  onClick={(e) => { e.stopPropagation(); setShowSpec(!showSpec); }}
                >
                  <Icon name="Info" className="h-3 w-3 mr-1" />
                  Спецификация
                </Badge>
              )}
            </div>
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm cursor-pointer" onClick={() => setLightbox(activeImg)}>
                <Icon name="ZoomIn" className="h-3 w-3 mr-1" />
                Увеличить
              </Badge>
            </div>
            {showSpec && currentSpec && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowSpec(false)}>
                <div className="bg-white rounded-xl p-5 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Icon name="FileText" className="h-4 w-4 text-primary" />
                      {currentSpec.title}
                    </h4>
                    <button onClick={() => setShowSpec(false)} className="text-gray-400 hover:text-gray-600">
                      <Icon name="X" className="h-4 w-4" />
                    </button>
                  </div>
                  <ul className="space-y-1.5">
                    {currentSpec.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <Icon name="ChevronRight" className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="flex gap-1.5 p-3 overflow-x-auto bg-white">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveImg(idx); setShowSpec(false); }}
                  className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all relative ${activeImg === idx ? "border-primary ring-1 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                  {img.spec && (
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="Info" className="h-2 w-2 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className={`p-6 lg:w-1/2 flex flex-col justify-center bg-gradient-to-r ${project.gradient}`}>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary/10 text-primary border-0 font-medium">Пример проекта</Badge>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">{project.stagesCompleted} этапов</Badge>
            </div>
            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{project.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1"><Icon name="Ruler" className="h-3.5 w-3.5" /> {project.area}</span>
              <span className="flex items-center gap-1"><Icon name="DoorOpen" className="h-3.5 w-3.5" /> {project.rooms}</span>
              <span className="flex items-center gap-1"><Icon name="Palette" className="h-3.5 w-3.5" /> {project.style}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5 text-center">
              <div className="p-2.5 bg-white rounded-lg border">
                <Icon name="LayoutDashboard" className="h-5 w-5 text-primary mx-auto mb-1" />
                <span className="text-xs text-gray-600">Планировка</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border">
                <Icon name="Ruler" className="h-5 w-5 text-primary mx-auto mb-1" />
                <span className="text-xs text-gray-600">Чертежи</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border">
                <Icon name="Eye" className="h-5 w-5 text-primary mx-auto mb-1" />
                <span className="text-xs text-gray-600">Визуализации</span>
              </div>
            </div>
            <Button className="w-fit" onClick={() => navigate(project.link)}>
              <Icon name="Eye" className="mr-2 h-4 w-4" />
              Открыть проект
            </Button>
          </div>
        </div>
      </Card>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10" onClick={() => setLightbox(null)}>
            <Icon name="X" className="h-8 w-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length); }}
          >
            <Icon name="ChevronLeft" className="h-10 w-10" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length); }}
          >
            <Icon name="ChevronRight" className="h-10 w-10" />
          </button>
          <div className="flex gap-6 max-w-6xl max-h-[90vh] px-12 items-start" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 min-w-0">
              <img src={images[lightbox].src} alt={images[lightbox].label} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
              <p className="text-white text-center mt-3 text-sm">{images[lightbox].label} — {lightbox + 1} / {images.length}</p>
            </div>
            {lightboxSpec && (
              <div className="w-72 flex-shrink-0 bg-white/95 backdrop-blur rounded-xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Icon name="FileText" className="h-4 w-4 text-primary" />
                  {lightboxSpec.title}
                </h4>
                <ul className="space-y-2">
                  {lightboxSpec.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <Icon name="ChevronRight" className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function Showroom() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState("Все");
  const [selectedStyle, setSelectedStyle] = useState("Все");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = showroomItems.filter((item) => {
    if (selectedRoom !== "Все" && item.room !== selectedRoom) return false;
    if (selectedStyle !== "Все" && item.style !== selectedStyle) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">ШОУРУМ</h1>
                <p className="text-sm text-gray-600">Готовые дизайнерские решения для вашего ремонта</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/suppliers")}>
                <Icon name="Store" className="mr-2 h-4 w-4" />
                Каталог
              </Button>
              <Button onClick={() => navigate("/ai-chat")}>
                <Icon name="Sparkles" className="mr-2 h-4 w-4" />
                Создать свой проект
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Breadcrumbs
        items={[
          { label: "Главная", path: "/" },
          { label: "Шоурум", path: "/showroom" },
        ]}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-3">Вдохновитесь готовыми решениями</h2>
            <p className="text-white/85 text-lg">
              Подборка визуализаций интерьеров от наших дизайнеров. Выберите стиль, который вам нравится,
              и мы поможем воплотить его в вашем доме.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 mr-4">
            <Icon name="DoorOpen" className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Помещение:</span>
          </div>
          {rooms.map((room) => (
            <Button
              key={room}
              variant={selectedRoom === room ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRoom(room)}
            >
              {room}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2 mr-4">
            <Icon name="Palette" className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Стиль:</span>
          </div>
          {styles.map((style) => (
            <Button
              key={style}
              variant={selectedStyle === style ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStyle(style)}
            >
              {style}
            </Button>
          ))}
        </div>

        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Icon name="FolderOpen" className="h-5 w-5 text-primary" />
            Примеры дизайн-проектов
          </h2>
          {exampleProjects.map((project) => (
            <ExampleProjectCard key={project.id} project={project} navigate={navigate} />
          ))}
        </div>

        <p className="text-gray-500 mb-6">Найдено решений: {filtered.length}</p>

        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="Image" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Нет решений по фильтрам</h3>
            <p className="text-gray-600 mb-4">Попробуйте изменить фильтры</p>
            <Button onClick={() => { setSelectedRoom("Все"); setSelectedStyle("Все"); }}>
              Сбросить фильтры
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm">
                      {item.room}
                    </Badge>
                    <Badge className="bg-white/80 text-gray-800 border-0 backdrop-blur-sm">
                      {item.style}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge variant="secondary" className="backdrop-blur-sm">
                      <Icon name="Maximize2" className="h-3 w-3 mr-1" />
                      {item.area}
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.features.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>

                  {expandedId === item.id && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3 animate-in fade-in duration-300">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Материалы</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.materials.map((m) => (
                            <Badge key={m} variant="secondary" className="text-xs">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Дизайнер</span>
                        <span className="font-medium">{item.designer}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Площадь</span>
                        <span className="font-medium">{item.area}</span>
                      </div>
                      <Button className="w-full mt-2" onClick={() => navigate("/ai-chat")}>
                        <Icon name="Sparkles" className="h-4 w-4 mr-2" />
                        Хочу такой проект
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    {expandedId === item.id ? (
                      <>Свернуть <Icon name="ChevronUp" className="h-4 w-4 ml-2" /></>
                    ) : (
                      <>Подробнее <Icon name="ChevronDown" className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}