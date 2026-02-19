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

        <div className="space-y-3">
          {savedProjects.map((p) => (
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