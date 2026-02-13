import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

export interface ProjectStage {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  status: "not_started" | "in_progress" | "completed";
  optional?: boolean;
}

interface ProjectStageCardProps {
  stage: ProjectStage;
  onClick: (stageId: string) => void;
}

const statusConfig = {
  not_started: { label: "Не начат", variant: "outline" as const, color: "text-gray-400" },
  in_progress: { label: "В работе", variant: "default" as const, color: "text-blue-500" },
  completed: { label: "Готово", variant: "secondary" as const, color: "text-green-500" },
};

export default function ProjectStageCard({ stage, onClick }: ProjectStageCardProps) {
  const config = statusConfig[stage.status];

  return (
    <Card
      className={`p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-2 ${
        stage.status === "completed"
          ? "border-green-200 bg-green-50/50"
          : stage.status === "in_progress"
          ? "border-blue-200 bg-blue-50/50"
          : "border-gray-100"
      }`}
      onClick={() => onClick(stage.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          stage.status === "completed"
            ? "bg-green-100"
            : stage.status === "in_progress"
            ? "bg-blue-100"
            : "bg-gray-100"
        }`}>
          <Icon name={stage.icon} className={`h-5 w-5 ${config.color}`} />
        </div>
        <div className="flex items-center gap-2">
          {stage.optional && (
            <Badge variant="outline" className="text-xs">опционально</Badge>
          )}
          <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs text-gray-400 font-medium mb-1">Этап {stage.number}</div>
        <h3 className="font-semibold text-sm leading-tight">{stage.title}</h3>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed mb-4">{stage.description}</p>

      <Button
        variant={stage.status === "not_started" ? "outline" : "default"}
        size="sm"
        className="w-full text-xs"
      >
        <Icon
          name={stage.status === "completed" ? "Eye" : stage.status === "in_progress" ? "Pencil" : "Play"}
          className="mr-1.5 h-3.5 w-3.5"
        />
        {stage.status === "completed" ? "Просмотреть" : stage.status === "in_progress" ? "Продолжить" : "Начать"}
      </Button>
    </Card>
  );
}
