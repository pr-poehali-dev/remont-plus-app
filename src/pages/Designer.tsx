import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProjectStageCard, { type ProjectStage } from "@/components/designer/ProjectStageCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const PROJECT_STAGES: ProjectStage[] = [
  {
    id: "general",
    number: 1,
    title: "Общий вид помещения",
    description: "Планировка, зонирование и общая концепция интерьера всех комнат",
    icon: "LayoutDashboard",
    status: "not_started",
  },
  {
    id: "walls",
    number: 2,
    title: "Раскладка помещений по стенам",
    description: "Детальная развертка каждой стены с отделочными материалами и размерами",
    icon: "PanelLeft",
    status: "not_started",
  },
  {
    id: "electrical",
    number: 3,
    title: "Электрика",
    description: "Расположение розеток, выключателей, светильников и электрощита",
    icon: "Zap",
    status: "not_started",
  },
  {
    id: "ventilation",
    number: 4,
    title: "Вентиляция",
    description: "Схема вентиляционных каналов, вытяжек и приточных клапанов",
    icon: "Wind",
    status: "not_started",
    optional: true,
  },
  {
    id: "plumbing",
    number: 5,
    title: "Водопровод и сантехника",
    description: "Расположение труб, стояков, смесителей, унитаза и ванны/душа",
    icon: "Droplets",
    status: "not_started",
  },
  {
    id: "tiles",
    number: 6,
    title: "Раскладка плитки",
    description: "Схема укладки плитки на полах и стенах с рисунком и подрезками",
    icon: "Grid3x3",
    status: "not_started",
  },
  {
    id: "furniture",
    number: 7,
    title: "Расположение мебели",
    description: "Планировка расстановки мебели во всех помещениях с размерами",
    icon: "Armchair",
    status: "not_started",
  },
  {
    id: "kitchen",
    number: 8,
    title: "Кухонный гарнитур",
    description: "Планировка кухни, расположение техники, шкафов и рабочих зон",
    icon: "CookingPot",
    status: "not_started",
  },
  {
    id: "bedroom",
    number: 9,
    title: "Спальня",
    description: "Расположение кровати, шкафов, освещения и текстиля",
    icon: "Bed",
    status: "not_started",
  },
];

export default function Designer() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("Мой дизайн-проект");
  const [roomCount, setRoomCount] = useState("2");
  const [totalArea, setTotalArea] = useState([60]);
  const [style, setStyle] = useState("modern");
  const [stages, setStages] = useState<ProjectStage[]>(PROJECT_STAGES);
  const [showSettings, setShowSettings] = useState(true);

  const styles = [
    { id: "modern", name: "Современный", icon: "Sparkles" },
    { id: "minimalism", name: "Минимализм", icon: "Minus" },
    { id: "scandinavian", name: "Скандинавский", icon: "Home" },
    { id: "loft", name: "Лофт", icon: "Building" },
    { id: "classic", name: "Классический", icon: "Crown" },
    { id: "eclectic", name: "Эклектика", icon: "Palette" },
  ];

  const completedCount = stages.filter((s) => s.status === "completed").length;
  const inProgressCount = stages.filter((s) => s.status === "in_progress").length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  const handleStageClick = (stageId: string) => {
    navigate(`/designer/${stageId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs
        items={[
          { label: "Главная", path: "/" },
          { label: "Конструктор", path: "/designer" },
        ]}
      />

      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Конструктор дизайн-проекта</h1>
                <p className="text-sm text-gray-600">
                  {completedCount} из {stages.length} этапов завершено
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Icon name="Settings" className="mr-2 h-4 w-4" />
                Параметры
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/calculator")}>
                <Icon name="Calculator" className="mr-2 h-4 w-4" />
                Смета
              </Button>
              <Button size="sm">
                <Icon name="Download" className="mr-2 h-4 w-4" />
                Экспорт PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {showSettings && (
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Icon name="Settings" className="h-5 w-5 text-primary" />
                    Параметры проекта
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                    <Icon name="X" className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Название проекта</Label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Количество комнат</Label>
                    <Select value={roomCount} onValueChange={setRoomCount}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 комната (студия)</SelectItem>
                        <SelectItem value="2">2 комнаты</SelectItem>
                        <SelectItem value="3">3 комнаты</SelectItem>
                        <SelectItem value="4">4 комнаты</SelectItem>
                        <SelectItem value="5">5+ комнат</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Общая площадь: {totalArea[0]} м²</Label>
                    <Slider
                      value={totalArea}
                      onValueChange={setTotalArea}
                      min={20}
                      max={300}
                      step={5}
                      className="mt-3"
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Стиль интерьера</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styles.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Этапы дизайн-проекта</h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Готово: {completedCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    В работе: {inProgressCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    Не начат: {stages.length - completedCount - inProgressCount}
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stages.map((stage) => (
                  <ProjectStageCard
                    key={stage.id}
                    stage={stage}
                    onClick={handleStageClick}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="FileText" className="h-5 w-5 text-primary" />
                {projectName}
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Комнат:</span>
                  <span className="font-medium">{roomCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Площадь:</span>
                  <span className="font-medium">{totalArea[0]} м²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Стиль:</span>
                  <span className="font-medium">
                    {styles.find((s) => s.id === style)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Прогресс:</span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="ListChecks" className="h-5 w-5 text-primary" />
                Порядок работы
              </h3>
              <ol className="space-y-2 text-xs text-gray-600">
                {stages.slice(0, 5).map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    {s.status === "completed" ? (
                      <Icon name="CheckCircle2" className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : s.status === "in_progress" ? (
                      <Icon name="Circle" className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <Icon name="Circle" className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={s.status === "completed" ? "line-through text-gray-400" : ""}>
                      {s.title}
                    </span>
                  </li>
                ))}
                <li className="text-gray-400 pl-6">...и ещё {stages.length - 5} этапов</li>
              </ol>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
              <Icon name="Sparkles" className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold mb-1 text-blue-900">ИИ-помощник</h3>
              <p className="text-xs text-gray-600 mb-3">
                На каждом этапе ИИ подскажет оптимальные решения и поможет с раскладкой
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate("/ai-chat")}
              >
                <Icon name="MessageSquare" className="mr-1.5 h-3.5 w-3.5" />
                Спросить ИИ
              </Button>
            </Card>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/calculator")}
            >
              <Icon name="Calculator" className="mr-2 h-4 w-4" />
              Рассчитать смету
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
