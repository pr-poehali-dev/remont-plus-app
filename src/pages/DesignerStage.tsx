import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

interface StageConfig {
  title: string;
  icon: string;
  description: string;
  tips: string[];
  checklistItems: string[];
  aiPromptHint: string;
}

const STAGE_CONFIG: Record<string, StageConfig> = {
  general: {
    title: "Общий вид помещения",
    icon: "LayoutDashboard",
    description: "Определите планировку, зонирование и общую концепцию интерьера. На этом этапе формируется \"скелет\" вашего проекта.",
    tips: [
      "Начните с обмерного плана — точные размеры всех помещений",
      "Определите функциональные зоны: отдых, работа, хранение",
      "Учитывайте естественное освещение и расположение окон",
      "Продумайте маршруты передвижения между зонами",
    ],
    checklistItems: [
      "Обмерный план с размерами",
      "Схема зонирования",
      "Расположение дверей и окон",
      "Направление открывания дверей",
      "Высота потолков",
      "Несущие стены отмечены",
    ],
    aiPromptHint: "Опишите квартиру: площадь, количество комнат, кто будет жить, пожелания по зонированию",
  },
  walls: {
    title: "Раскладка помещений по стенам",
    icon: "PanelLeft",
    description: "Детальная развертка каждой стены с указанием отделочных материалов, размеров и декоративных элементов.",
    tips: [
      "Разверните каждую стену отдельно с размерами",
      "Укажите материал отделки для каждого участка",
      "Отметьте ниши, короба и выступы",
      "Обозначьте высоту подрезки и стыков материалов",
    ],
    checklistItems: [
      "Развертка стены A (северная)",
      "Развертка стены B (восточная)",
      "Развертка стены C (южная)",
      "Развертка стены D (западная)",
      "Материалы отделки указаны",
      "Декоративные элементы размещены",
    ],
    aiPromptHint: "Опишите комнату, для которой нужна развертка стен, укажите материалы и пожелания по декору",
  },
  electrical: {
    title: "Электрика",
    icon: "Zap",
    description: "Схема расположения розеток, выключателей, светильников и электрощита. Основа комфорта в каждой комнате.",
    tips: [
      "Планируйте розетки исходя из расстановки мебели",
      "Предусмотрите отдельные группы для кухни и ванной",
      "Проходные выключатели — для коридоров и спален",
      "Не забудьте USB-розетки у рабочих мест и прикроватных тумб",
    ],
    checklistItems: [
      "Розетки в каждой комнате",
      "Выключатели (проходные/обычные)",
      "Потолочное освещение",
      "Подсветка рабочих зон",
      "Электрощит — автоматы и УЗО",
      "Слаботочные сети (интернет, ТВ)",
    ],
    aiPromptHint: "Опишите комнату и расположение мебели — ИИ предложит оптимальную схему электрики",
  },
  ventilation: {
    title: "Вентиляция",
    icon: "Wind",
    description: "Схема вентиляционных каналов, вытяжек и приточных клапанов. Обеспечьте свежий воздух в каждом помещении.",
    tips: [
      "Не перекрывайте существующие вентканалы",
      "Кухонная вытяжка — отдельный канал или рециркуляция",
      "Приточные клапаны — в спальне и гостиной",
      "В ванной — принудительная вытяжка с таймером",
    ],
    checklistItems: [
      "Существующие вентканалы отмечены",
      "Кухонная вытяжка",
      "Вытяжка в ванной",
      "Приточные клапаны",
      "Кондиционирование (если нужно)",
    ],
    aiPromptHint: "Укажите тип дома (панельный, кирпичный), этаж и требования к вентиляции",
  },
  plumbing: {
    title: "Водопровод и сантехника",
    icon: "Droplets",
    description: "Расположение труб, стояков, точек подключения смесителей, унитаза, ванны и стиральной машины.",
    tips: [
      "Минимизируйте расстояние от стояков до точек подключения",
      "Учитывайте уклон канализационных труб",
      "Предусмотрите доступ к счётчикам и запорной арматуре",
      "Гидроизоляция — обязательна в мокрых зонах",
    ],
    checklistItems: [
      "Стояки ХВС и ГВС",
      "Точки подключения смесителей",
      "Унитаз / инсталляция",
      "Ванна или душевая",
      "Стиральная машина",
      "Посудомоечная машина",
      "Полотенцесушитель",
    ],
    aiPromptHint: "Опишите санузел: размеры, что хотите разместить (ванна/душ, стиралка и т.д.)",
  },
  tiles: {
    title: "Раскладка плитки",
    icon: "Grid3x3",
    description: "Схема укладки плитки на полах и стенах — с рисунком, подрезками и расчётом количества.",
    tips: [
      "Начинайте раскладку от видимых углов",
      "Подрезки — в невидимых зонах (за мебелью, дверью)",
      "Учитывайте ширину швов при расчёте",
      "Запас плитки — минимум 10% от расчётного количества",
    ],
    checklistItems: [
      "Раскладка пола",
      "Раскладка стен (каждая стена)",
      "Декоративные вставки / бордюры",
      "Подрезки минимизированы",
      "Расчёт количества плитки",
      "Расчёт затирки и клея",
    ],
    aiPromptHint: "Укажите размер плитки, размеры помещения и желаемый рисунок укладки",
  },
  furniture: {
    title: "Расположение мебели",
    icon: "Armchair",
    description: "Планировка расстановки мебели во всех помещениях с учётом эргономики и проходов.",
    tips: [
      "Минимальная ширина прохода — 60 см, оптимально 80 см",
      "Диван — не ближе 2,5 м от ТВ",
      "Рабочий стол — у окна для естественного света",
      "Не загораживайте радиаторы мебелью",
    ],
    checklistItems: [
      "Гостиная: диван, столик, ТВ-зона",
      "Спальня: кровать, тумбы, шкаф",
      "Кухня: стол, стулья",
      "Прихожая: шкаф, обувница",
      "Детская: кровать, стол, шкаф",
      "Проходы проверены (мин. 60 см)",
    ],
    aiPromptHint: "Опишите комнату и список мебели, которую нужно разместить",
  },
  kitchen: {
    title: "Кухонный гарнитур",
    icon: "CookingPot",
    description: "Детальная планировка кухни: расположение шкафов, техники, рабочего треугольника и систем хранения.",
    tips: [
      "Рабочий треугольник: холодильник → мойка → плита",
      "Между мойкой и плитой — минимум 60 см рабочей поверхности",
      "Верхние шкафы — на высоте 50-60 см от столешницы",
      "Розетки для техники — за шкафами на высоте 110 см",
    ],
    checklistItems: [
      "Нижние шкафы (с размерами)",
      "Верхние шкафы",
      "Холодильник",
      "Варочная панель / плита",
      "Духовой шкаф",
      "Мойка",
      "Посудомоечная машина",
      "Вытяжка",
      "Фартук — материал и размер",
    ],
    aiPromptHint: "Укажите размеры кухни, тип планировки (линейная, угловая, П-образная) и список техники",
  },
  bedroom: {
    title: "Спальня",
    icon: "Bed",
    description: "Планировка спальни: расположение кровати, систем хранения, освещения и текстильного оформления.",
    tips: [
      "Кровать — изголовьем к глухой стене, не напротив двери",
      "По бокам кровати — минимум 50 см для прохода",
      "Светильники у кровати — на высоте 120-160 см",
      "Шторы blackout — для качественного сна",
    ],
    checklistItems: [
      "Кровать (размер и расположение)",
      "Прикроватные тумбы",
      "Шкаф / гардеробная",
      "Туалетный столик",
      "Освещение: основное + прикроватное",
      "Шторы / жалюзи",
      "Розетки у кровати",
    ],
    aiPromptHint: "Опишите спальню: размеры, кто спит, нужен ли гардероб, рабочее место",
  },
};

export default function DesignerStage() {
  const { stageId } = useParams<{ stageId: string }>();
  const navigate = useNavigate();

  const config = stageId ? STAGE_CONFIG[stageId] : null;

  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState("");

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Icon name="AlertCircle" className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Этап не найден</h2>
          <p className="text-gray-600 mb-4">Такого этапа дизайн-проекта не существует</p>
          <Button onClick={() => navigate("/designer")}>Вернуться к проекту</Button>
        </Card>
      </div>
    );
  }

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const checkedPercent = config.checklistItems.length > 0
    ? Math.round((checkedItems.size / config.checklistItems.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs
        items={[
          { label: "Главная", path: "/" },
          { label: "Конструктор", path: "/designer" },
          { label: config.title, path: `/designer/${stageId}` },
        ]}
      />

      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/designer")}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name={config.icon} className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">{config.title}</h1>
                  <p className="text-sm text-gray-500">Чеклист: {checkedPercent}% выполнено</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/ai-chat")}
              >
                <Icon name="Sparkles" className="mr-2 h-4 w-4" />
                Спросить ИИ
              </Button>
              <Button size="sm">
                <Icon name="Save" className="mr-2 h-4 w-4" />
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <p className="text-gray-700 leading-relaxed mb-6">{config.description}</p>

              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Icon name={config.icon} className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-500 mb-2">Рабочая область</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Здесь будет схема / визуализация этого этапа
                  </p>
                  <Button>
                    <Icon name="Sparkles" className="mr-2 h-4 w-4" />
                    Сгенерировать с помощью ИИ
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <Icon name="Plus" className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="StickyNote" className="h-5 w-5 text-primary" />
                Заметки
              </h3>
              <textarea
                className="w-full min-h-[120px] px-3 py-2 border rounded-lg text-sm resize-y"
                placeholder="Запишите свои идеи, размеры, пожелания..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="ListChecks" className="h-5 w-5 text-primary" />
                Чеклист
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${checkedPercent}%` }}
                />
              </div>
              <div className="space-y-2">
                {config.checklistItems.map((item, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems.has(index)}
                      onChange={() => toggleCheck(index)}
                      className="w-4 h-4 rounded flex-shrink-0"
                    />
                    <span
                      className={`text-sm ${
                        checkedItems.has(index) ? "line-through text-gray-400" : "text-gray-700"
                      }`}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="Lightbulb" className="h-5 w-5 text-yellow-500" />
                Советы
              </h3>
              <ul className="space-y-2">
                {config.tips.map((tip, index) => (
                  <li key={index} className="flex gap-2 text-xs text-gray-600">
                    <Icon name="ChevronRight" className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
              <Icon name="Sparkles" className="h-7 w-7 text-blue-600 mb-2" />
              <h3 className="font-semibold text-sm mb-1 text-blue-900">Подсказка для ИИ</h3>
              <p className="text-xs text-gray-600 mb-3">{config.aiPromptHint}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate("/ai-chat")}
              >
                <Icon name="MessageSquare" className="mr-1.5 h-3.5 w-3.5" />
                Открыть чат с ИИ
              </Button>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-sm"
                onClick={() => {
                  const keys = Object.keys(STAGE_CONFIG);
                  const idx = keys.indexOf(stageId || "");
                  if (idx > 0) navigate(`/designer/${keys[idx - 1]}`);
                }}
                disabled={Object.keys(STAGE_CONFIG).indexOf(stageId || "") === 0}
              >
                <Icon name="ArrowLeft" className="mr-1 h-4 w-4" />
                Назад
              </Button>
              <Button
                className="flex-1 text-sm"
                onClick={() => {
                  const keys = Object.keys(STAGE_CONFIG);
                  const idx = keys.indexOf(stageId || "");
                  if (idx < keys.length - 1) navigate(`/designer/${keys[idx + 1]}`);
                }}
                disabled={Object.keys(STAGE_CONFIG).indexOf(stageId || "") === Object.keys(STAGE_CONFIG).length - 1}
              >
                Далее
                <Icon name="ArrowRight" className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
