import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import AddressForm from "@/components/AddressForm";
import ProjectStageCard, { type ProjectStage } from "@/components/designer/ProjectStageCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_URL = "https://functions.poehali.dev/638dfd86-50f0-4ec4-a850-6feb9fa7797e";

const DEFAULT_STAGES: ProjectStage[] = [
  { id: "planning", number: 1, title: "Планировочное решение", description: "Зонирование, расстановка мебели, перегородки и функциональные зоны помещений", icon: "LayoutDashboard", status: "not_started" },
  { id: "drawings", number: 2, title: "Чертежи и схемы помещений", description: "Обмерный план, развёртки стен, планы полов и потолков с размерами", icon: "Ruler", status: "not_started" },
  { id: "visualization", number: 3, title: "Визуализации интерьеров", description: "3D-визуализации каждого помещения с выбранным стилем и цветовой палитрой", icon: "Eye", status: "not_started" },
  { id: "materials", number: 4, title: "Выбор материалов и отделки", description: "Подбор напольных покрытий, плитки, обоев, краски и декоративных панелей", icon: "Palette", status: "not_started" },
  { id: "electrical", number: 5, title: "Электроразводка и освещение", description: "Схема розеток, выключателей, светильников, электрощита и сценариев света", icon: "Zap", status: "not_started" },
  { id: "plumbing", number: 6, title: "Сантехнические работы", description: "Разводка труб, расположение смесителей, унитаза, ванны, душа и полотенцесушителей", icon: "Droplets", status: "not_started" },
  { id: "decor", number: 7, title: "Декорирование", description: "Текстиль, шторы, картины, аксессуары, растения и финальная стилизация пространства", icon: "Flower2", status: "not_started" },
];

const styles = [
  { id: "modern", name: "Современный" },
  { id: "minimalism", name: "Минимализм" },
  { id: "scandinavian", name: "Скандинавский" },
  { id: "loft", name: "Лофт" },
  { id: "classic", name: "Классический" },
  { id: "eclectic", name: "Эклектика" },
];

interface SavedProject {
  id: number;
  name: string;
  style: string;
  total_area: number;
  room_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StageResult {
  stage_id: string;
  status: string;
  ai_result: string | null;
  checklist_state: number[];
}

export default function Designer() {
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState<number | null>(() => {
    const saved = localStorage.getItem("avangard_project_id");
    return saved ? parseInt(saved) : null;
  });
  const [projectName, setProjectName] = useState("Мой дизайн-проект");
  const [roomCount, setRoomCount] = useState("2");
  const [totalArea, setTotalArea] = useState([60]);
  const [style, setStyle] = useState("modern");
  const [stages, setStages] = useState<ProjectStage[]>(DEFAULT_STAGES);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [showProjectList, setShowProjectList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (projectId) {
        await loadProject(projectId);
      } else {
        await loadProjectList();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectList = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setSavedProjects(data.projects || []);
        if (data.projects?.length > 0 && !projectId) {
          setShowProjectList(true);
        }
      }
    } catch (e) {
      console.error("Error loading projects:", e);
    }
  };

  const loadProject = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}?project_id=${id}`);
      if (!res.ok) {
        localStorage.removeItem("avangard_project_id");
        setProjectId(null);
        await loadProjectList();
        return;
      }
      const data = await res.json();
      const p = data.project;
      setProjectName(p.name || "Мой дизайн-проект");
      setStyle(p.style || "modern");
      setRoomCount(String(p.room_count || 2));
      setTotalArea([p.total_area || 60]);

      const stageResults: StageResult[] = data.stages || [];
      const stageMap = new Map(stageResults.map((s: StageResult) => [s.stage_id, s]));

      setStages(DEFAULT_STAGES.map((ds) => {
        const saved = stageMap.get(ds.id);
        if (!saved) return ds;
        return {
          ...ds,
          status: (saved.status as ProjectStage["status"]) || "not_started",
        };
      }));

      setLastSaved(p.updated_at ? new Date(p.updated_at).toLocaleString("ru-RU") : null);
    } catch (e) {
      console.error("Error loading project:", e);
      localStorage.removeItem("avangard_project_id");
      setProjectId(null);
    }
  };

  const createProject = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          style,
          room_count: parseInt(roomCount),
          total_area: totalArea[0],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newId = data.project.id;
        setProjectId(newId);
        localStorage.setItem("avangard_project_id", String(newId));
        setShowProjectList(false);
        setShowSettings(false);
        setLastSaved(new Date().toLocaleString("ru-RU"));
      }
    } catch (e) {
      console.error("Error creating project:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const openProject = async (id: number) => {
    setProjectId(id);
    localStorage.setItem("avangard_project_id", String(id));
    setShowProjectList(false);
    setIsLoading(true);
    await loadProject(id);
    setIsLoading(false);
  };

  const handleStageClick = (stageId: string) => {
    if (!projectId) {
      createProject().then(() => {
        const savedId = localStorage.getItem("avangard_project_id");
        if (savedId) navigate(`/designer/${stageId}?project=${savedId}`);
      });
      return;
    }
    navigate(`/designer/${stageId}?project=${projectId}`);
  };

  const handleNewProject = () => {
    setProjectId(null);
    localStorage.removeItem("avangard_project_id");
    setProjectName("Мой дизайн-проект");
    setRoomCount("2");
    setTotalArea([60]);
    setStyle("modern");
    setStages(DEFAULT_STAGES);
    setShowSettings(true);
    setShowProjectList(false);
    setLastSaved(null);
  };

  const completedCount = stages.filter((s) => s.status === "completed").length;
  const inProgressCount = stages.filter((s) => s.status === "in_progress").length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Загрузка проекта...</p>
        </div>
      </div>
    );
  }

  if (showProjectList && savedProjects.length > 0 && !projectId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Breadcrumbs items={[{ label: "Главная", path: "/" }, { label: "Конструктор", path: "/designer" }]} />
        <header className="bg-white border-b shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Конструктор дизайн-проекта</h1>
                <p className="text-sm text-gray-600">Выберите проект или создайте новый</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Ваши проекты</h2>
            <Button onClick={handleNewProject}>
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Новый проект
            </Button>
          </div>

          <Card
            className="p-5 mb-6 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent"
            onClick={() => openProject(4)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src="https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/f88f632e-0c35-4529-a23f-f52566284ed5.jpg"
                    alt="Демо-проект"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Двухкомнатная квартира на Пресне</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Пример</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>Современный</span>
                    <span>·</span>
                    <span>65 м²</span>
                    <span>·</span>
                    <span>3 комн.</span>
                    <span>·</span>
                    <span className="text-green-600 font-medium">7/7 этапов</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <span className="text-sm font-medium hidden sm:block">Посмотреть</span>
                <Icon name="ChevronRight" className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <h3 className="text-sm font-medium text-gray-500 mb-3">Ваши проекты</h3>
          <div className="space-y-3">
            {savedProjects.filter((p) => p.id !== 4).map((p) => (
              <Card
                key={p.id}
                className="p-5 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
                onClick={() => openProject(p.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name="FileText" className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{p.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{styles.find((s) => s.id === p.style)?.name || p.style}</span>
                        <span>·</span>
                        <span>{p.total_area} м²</span>
                        <span>·</span>
                        <span>{p.room_count} комн.</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {new Date(p.updated_at).toLocaleDateString("ru-RU")}
                    </div>
                    <Icon name="ChevronRight" className="h-5 w-5 text-gray-300 mt-1" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs items={[{ label: "Главная", path: "/" }, { label: "Конструктор", path: "/designer" }]} />

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
                  {lastSaved && <span className="text-gray-400 ml-2">· сохранено {lastSaved}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
                <Icon name="Settings" className="mr-2 h-4 w-4" />
                Параметры
              </Button>
              {!projectId ? (
                <Button size="sm" onClick={createProject} disabled={isSaving}>
                  {isSaving ? "Сохранение..." : "Сохранить проект"}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleNewProject}>
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Новый
                </Button>
              )}
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
                    <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Количество комнат</Label>
                    <Select value={roomCount} onValueChange={setRoomCount}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
                    <Slider value={totalArea} onValueChange={setTotalArea} min={20} max={300} step={5} className="mt-3" />
                  </div>
                  <div>
                    <Label className="mb-1 block">Стиль интерьера</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {styles.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {!projectId && (
                  <Button className="mt-4" onClick={createProject} disabled={isSaving}>
                    {isSaving ? "Создание..." : "Создать проект и начать"}
                  </Button>
                )}
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
                <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stages.map((stage) => (
                  <ProjectStageCard key={stage.id} stage={stage} onClick={handleStageClick} />
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
                  <span className="font-medium">{styles.find((s) => s.id === style)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Прогресс:</span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                {projectId && (
                  <div className="pt-2 border-t text-xs text-gray-400 flex items-center gap-1">
                    <Icon name="Cloud" className="h-3 w-3" />
                    Проект сохранён в облаке
                  </div>
                )}
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
                    <span className={s.status === "completed" ? "line-through text-gray-400" : ""}>{s.title}</span>
                  </li>
                ))}
                <li className="text-gray-400 pl-6">...и ещё {stages.length - 5} этапов</li>
              </ol>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
              <Icon name="Sparkles" className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold mb-1 text-blue-900">ИИ-помощник</h3>
              <p className="text-xs text-gray-600 mb-3">На каждом этапе ИИ подскажет оптимальные решения и поможет с раскладкой</p>
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate("/ai-chat")}>
                <Icon name="MessageSquare" className="mr-1.5 h-3.5 w-3.5" />
                Спросить ИИ
              </Button>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="MapPin" className="h-5 w-5 text-primary" />
                Адрес объекта
              </h3>
              <AddressForm userId={1} projectId={projectId} />
            </Card>

            <Button variant="outline" className="w-full" onClick={() => navigate("/calculator")}>
              <Icon name="Calculator" className="mr-2 h-4 w-4" />
              Рассчитать смету
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}