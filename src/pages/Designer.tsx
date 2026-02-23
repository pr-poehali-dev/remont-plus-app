import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProjectStageCard, { type ProjectStage } from "@/components/designer/ProjectStageCard";
import DesignerProjectList from "@/components/designer/DesignerProjectList";
import DesignerSettings from "@/components/designer/DesignerSettings";
import DesignerSidebar from "@/components/designer/DesignerSidebar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMeta } from "@/hooks/useMeta";

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

interface StageResult {
  stage_id: string;
  status: string;
  ai_result: string | null;
  checklist_state: number[];
}

export default function Designer() {
  useMeta({
    title: "ИИ Дизайнер интерьера — создайте дизайн-проект онлайн",
    description: "Создайте полный дизайн-проект квартиры с помощью искусственного интеллекта: планировка, чертежи, визуализации, выбор материалов и смета.",
    keywords: "дизайн-проект интерьера онлайн, ИИ дизайнер, планировка квартиры, визуализация интерьера",
    canonical: "/designer",
  });

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
  const [savedProjects, setSavedProjects] = useState<{ id: number; name: string; style: string; total_area: number; room_count: number; status: string; created_at: string; updated_at: string }[]>([]);
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
      <DesignerProjectList
        savedProjects={savedProjects}
        styles={styles}
        onOpenProject={openProject}
        onNewProject={handleNewProject}
        onBack={() => navigate("/")}
      />
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
              <DesignerSettings
                projectId={projectId}
                projectName={projectName}
                roomCount={roomCount}
                totalArea={totalArea}
                style={style}
                styles={styles}
                isSaving={isSaving}
                onProjectNameChange={setProjectName}
                onRoomCountChange={setRoomCount}
                onTotalAreaChange={setTotalArea}
                onStyleChange={setStyle}
                onClose={() => setShowSettings(false)}
                onCreateProject={createProject}
              />
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

          <DesignerSidebar
            projectId={projectId}
            projectName={projectName}
            roomCount={roomCount}
            totalArea={totalArea}
            style={style}
            styles={styles}
            stages={stages}
            completedCount={completedCount}
            progressPercent={progressPercent}
            onNavigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}