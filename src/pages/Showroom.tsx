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

const exampleImages = [
  { src: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/f88f632e-0c35-4529-a23f-f52566284ed5.jpg", label: "Общий вид" },
  { src: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/16e555dc-a476-40ff-ae5c-7b157607113c.jpg", label: "Планировка" },
  { src: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/c2d40848-a52f-4fd5-bc91-c6e2d603725a.jpg", label: "Чертёж" },
  { src: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/68e0468f-b3f7-474f-a153-ea618b47d70e.jpg", label: "Гостиная" },
  { src: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/9b6b4808-eab8-41d8-9ef9-f9a11604c813.jpg", label: "Спальня" },
  { src: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0b93d17c-d851-49a1-82a4-8bbe1339a747.jpg", label: "Кухня" },
];

function ExampleProjectCard({ navigate }: { navigate: (path: string) => void }) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      <Card className="mb-8 overflow-hidden border-primary/30">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 relative">
            <div className="aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => setLightbox(activeImg)}>
              <img
                src={exampleImages[activeImg].src}
                alt={exampleImages[activeImg].label}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary text-white border-0">{exampleImages[activeImg].label}</Badge>
            </div>
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm cursor-pointer" onClick={() => setLightbox(activeImg)}>
                <Icon name="ZoomIn" className="h-3 w-3 mr-1" />
                Увеличить
              </Badge>
            </div>
            <div className="flex gap-1.5 p-3 overflow-x-auto bg-white">
              {exampleImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImg === idx ? "border-primary ring-1 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 lg:w-1/2 flex flex-col justify-center bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary/10 text-primary border-0 font-medium">Пример проекта</Badge>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">7/7 этапов</Badge>
            </div>
            <h3 className="text-xl font-bold mb-2">Двухкомнатная квартира на Пресне</h3>
            <p className="text-sm text-gray-600 mb-4">
              Полный дизайн-проект в современном стиле: планировка, визуализации, чертежи, подбор материалов и декор. Посмотрите, как выглядит готовый результат работы конструктора.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1"><Icon name="Ruler" className="h-3.5 w-3.5" /> 65 м²</span>
              <span className="flex items-center gap-1"><Icon name="DoorOpen" className="h-3.5 w-3.5" /> 3 комнаты</span>
              <span className="flex items-center gap-1"><Icon name="Palette" className="h-3.5 w-3.5" /> Современный</span>
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
            <Button className="w-fit" onClick={() => navigate("/designer/planning?project=4")}>
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
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + exampleImages.length) % exampleImages.length); }}
          >
            <Icon name="ChevronLeft" className="h-10 w-10" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % exampleImages.length); }}
          >
            <Icon name="ChevronRight" className="h-10 w-10" />
          </button>
          <div className="max-w-5xl max-h-[90vh] px-12" onClick={(e) => e.stopPropagation()}>
            <img src={exampleImages[lightbox].src} alt={exampleImages[lightbox].label} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <p className="text-white text-center mt-3 text-sm">{exampleImages[lightbox].label} — {lightbox + 1} / {exampleImages.length}</p>
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

        <ExampleProjectCard navigate={navigate} />

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