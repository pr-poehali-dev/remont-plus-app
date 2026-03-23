import { useState, Suspense, useCallback, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import type { RoomDimensions, WallOpening, PlacedFurniture, WallStyle, RoomProject } from "@/components/room-designer/types";
import { DEFAULT_WALL_STYLES } from "@/components/room-designer/types";
import { FURNITURE_CATALOG } from "@/components/room-designer/furnitureCatalog";
import DesignerSidebar from "@/components/room-designer/DesignerSidebar";

const Room3DSceneLazy = lazy(() => import("@/components/room-designer/Room3DScene"));

const PROJECTS_KEY = "room_designer_projects";
const MODEL_MAP_KEY = "furniture-model-map";

function loadProjects(): RoomProject[] {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]");
  } catch { return []; }
}

function saveProjects(projects: RoomProject[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

function loadModelMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(MODEL_MAP_KEY) || "{}");
  } catch { return {}; }
}

function saveModelMap(map: Record<string, string>) {
  localStorage.setItem(MODEL_MAP_KEY, JSON.stringify(map));
}

export default function RoomDesigner() {
  const navigate = useNavigate();

  useMeta({
    title: "Virtual Room Designer — 3D конструктор комнат",
    description: "Создайте 3D-модель вашей комнаты, расставьте мебель и подберите отделку. Бесплатный онлайн конструктор интерьеров.",
  });

  const [dimensions, setDimensions] = useState<RoomDimensions>({ width: 5, length: 4, height: 2.7 });
  const [openings, setOpenings] = useState<WallOpening[]>([]);
  const [furniture, setFurniture] = useState<PlacedFurniture[]>([]);
  const [wallStyles, setWallStyles] = useState<WallStyle[]>([...DEFAULT_WALL_STYLES]);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState<RoomProject[]>(loadProjects);
  const [projectName, setProjectName] = useState("Новая комната");
  const [modelMap, setModelMap] = useState<Record<string, string>>(loadModelMap);

  const handleAddOpening = useCallback((o: WallOpening) => {
    setOpenings(prev => [...prev, o]);
  }, []);

  const handleRemoveOpening = useCallback((id: string) => {
    setOpenings(prev => prev.filter(o => o.id !== id));
  }, []);

  const handleAddFurniture = useCallback((catalogId: string) => {
    const item = FURNITURE_CATALOG.find(f => f.id === catalogId);
    if (!item) return;
    const placed: PlacedFurniture = {
      id: `fur-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      catalogId,
      x: 0,
      z: 0,
      rotation: 0,
      color: item.defaultColor,
    };
    setFurniture(prev => [...prev, placed]);
    setSelectedFurnitureId(placed.id);
  }, []);

  const handleRemoveFurniture = useCallback((id: string) => {
    setFurniture(prev => prev.filter(f => f.id !== id));
    if (selectedFurnitureId === id) setSelectedFurnitureId(null);
  }, [selectedFurnitureId]);

  const handleUpdateFurniture = useCallback((id: string, patch: Partial<PlacedFurniture>) => {
    setFurniture(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  }, []);

  const handleUpdateWallStyle = useCallback((wall: string, patch: Partial<WallStyle>) => {
    setWallStyles(prev => prev.map(s => s.wall === wall ? { ...s, ...patch } : s));
  }, []);

  const handleModelAttached = useCallback((catalogId: string, modelUrl: string | null) => {
    setModelMap(prev => {
      const next = { ...prev };
      if (modelUrl) {
        next[catalogId] = modelUrl;
      } else {
        delete next[catalogId];
      }
      saveModelMap(next);
      return next;
    });
  }, []);

  const handleSaveProject = () => {
    const project: RoomProject = {
      id: `proj-${Date.now()}`,
      name: projectName,
      dimensions,
      openings,
      furniture,
      wallStyles,
      createdAt: new Date().toISOString(),
    };
    const updated = [project, ...projects.filter(p => p.name !== projectName)].slice(0, 20);
    setProjects(updated);
    saveProjects(updated);
  };

  const handleLoadProject = (p: RoomProject) => {
    setDimensions(p.dimensions);
    setOpenings(p.openings);
    setFurniture(p.furniture);
    setWallStyles(p.wallStyles);
    setProjectName(p.name);
    setSelectedFurnitureId(null);
    setShowProjects(false);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
  };

  const handleNewProject = () => {
    setDimensions({ width: 5, length: 4, height: 2.7 });
    setOpenings([]);
    setFurniture([]);
    setWallStyles([...DEFAULT_WALL_STYLES]);
    setSelectedFurnitureId(null);
    setProjectName("Новая комната");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b px-4 py-2 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div>
            <h1 className="text-sm font-bold flex items-center gap-1.5">
              <Icon name="Box" size={16} className="text-blue-600" />
              Virtual Room Designer
            </h1>
            <p className="text-[11px] text-gray-400">3D конструктор интерьеров</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            className="h-7 text-xs border rounded px-2 w-36 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleNewProject}>
            <Icon name="FilePlus" size={13} className="mr-1" />Новый
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSaveProject}>
            <Icon name="Save" size={13} className="mr-1" />Сохранить
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowProjects(!showProjects)}>
            <Icon name="FolderOpen" size={13} className="mr-1" />
            Проекты
            {projects.length > 0 && (
              <span className="ml-1 bg-blue-100 text-blue-700 text-[10px] px-1 rounded">{projects.length}</span>
            )}
          </Button>
        </div>
      </header>

      {showProjects && (
        <div className="bg-white border-b px-4 py-3 shrink-0 z-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">Сохранённые проекты</p>
            <button onClick={() => setShowProjects(false)} className="text-gray-400 hover:text-gray-600">
              <Icon name="X" size={16} />
            </button>
          </div>
          {projects.length === 0 ? (
            <p className="text-xs text-gray-400">Нет сохранённых проектов</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {projects.map(p => (
                <div key={p.id} className="shrink-0 border rounded-lg p-2.5 w-48 hover:border-blue-300 transition-all">
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {p.dimensions.width}×{p.dimensions.length}×{p.dimensions.height} м
                    · {p.furniture.length} предм.
                  </p>
                  <p className="text-[10px] text-gray-300">{new Date(p.createdAt).toLocaleDateString("ru-RU")}</p>
                  <div className="flex gap-1 mt-1.5">
                    <Button size="sm" variant="outline" className="h-5 text-[10px] px-1.5 flex-1" onClick={() => handleLoadProject(p)}>
                      Открыть
                    </Button>
                    <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1 text-red-400" onClick={() => handleDeleteProject(p.id)}>
                      <Icon name="Trash2" size={10} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Icon name="Loader2" size={32} className="animate-spin text-blue-500 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Загрузка 3D-сцены...</p>
              </div>
            </div>
          }>
            <Room3DSceneLazy
              dimensions={dimensions}
              openings={openings}
              furniture={furniture}
              wallStyles={wallStyles}
              selectedFurnitureId={selectedFurnitureId}
              onSelectFurniture={setSelectedFurnitureId}
              modelMap={modelMap}
            />
          </Suspense>

          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-2 text-[11px] text-gray-500 shadow-sm">
            <p>Мышь: вращение · Колесо: масштаб · ПКМ: перемещение</p>
          </div>

          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg px-3 py-2 shadow-sm">
            <p className="text-xs font-medium text-gray-700">
              {dimensions.width}×{dimensions.length} м · h={dimensions.height} м
            </p>
            <p className="text-[11px] text-gray-400">
              {(dimensions.width * dimensions.length).toFixed(1)} м² · {furniture.length} предм. · {openings.length} проёмов
            </p>
          </div>
        </div>

        <DesignerSidebar
          dimensions={dimensions}
          onDimensionsChange={setDimensions}
          openings={openings}
          onAddOpening={handleAddOpening}
          onRemoveOpening={handleRemoveOpening}
          furniture={furniture}
          onAddFurniture={handleAddFurniture}
          onRemoveFurniture={handleRemoveFurniture}
          onUpdateFurniture={handleUpdateFurniture}
          selectedFurnitureId={selectedFurnitureId}
          wallStyles={wallStyles}
          onUpdateWallStyle={handleUpdateWallStyle}
          modelMap={modelMap}
          onModelAttached={handleModelAttached}
        />
      </div>
    </div>
  );
}

