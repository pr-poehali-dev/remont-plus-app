import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";

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

interface DesignerProjectListProps {
  savedProjects: SavedProject[];
  styles: { id: string; name: string }[];
  onOpenProject: (id: number) => void;
  onNewProject: () => void;
  onBack: () => void;
}

export default function DesignerProjectList({
  savedProjects,
  styles,
  onOpenProject,
  onNewProject,
  onBack,
}: DesignerProjectListProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs items={[{ label: "Главная", path: "/" }, { label: "Конструктор", path: "/designer" }]} />
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
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
          <Button onClick={onNewProject}>
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            Новый проект
          </Button>
        </div>

        <Card
          className="p-5 mb-6 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent"
          onClick={() => onOpenProject(4)}
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
              onClick={() => onOpenProject(p.id)}
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
