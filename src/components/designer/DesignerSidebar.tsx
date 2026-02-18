import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import AddressForm from "@/components/AddressForm";
import { type ProjectStage } from "@/components/designer/ProjectStageCard";

interface DesignerSidebarProps {
  projectId: number | null;
  projectName: string;
  roomCount: string;
  totalArea: number[];
  style: string;
  styles: { id: string; name: string }[];
  stages: ProjectStage[];
  completedCount: number;
  progressPercent: number;
  onNavigate: (path: string) => void;
}

export default function DesignerSidebar({
  projectId,
  projectName,
  roomCount,
  totalArea,
  style,
  styles,
  stages,
  completedCount,
  progressPercent,
  onNavigate,
}: DesignerSidebarProps) {
  return (
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
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => onNavigate("/ai-chat")}>
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

      <Button variant="outline" className="w-full" onClick={() => onNavigate("/calculator")}>
        <Icon name="Calculator" className="mr-2 h-4 w-4" />
        Рассчитать смету
      </Button>
    </div>
  );
}
