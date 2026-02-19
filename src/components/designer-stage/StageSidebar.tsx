import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { type StageConfig } from "./stageConfig";

interface StageSidebarProps {
  config: StageConfig;
  checkedItems: Set<number>;
  checkedPercent: number;
  onToggleCheck: (index: number) => void;
  currentIdx: number;
  stageKeys: string[];
  projectParam: string;
  onNavigate: (path: string) => void;
}

export default function StageSidebar({
  config,
  checkedItems,
  checkedPercent,
  onToggleCheck,
  currentIdx,
  stageKeys,
  projectParam,
  onNavigate,
}: StageSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Icon name="ListChecks" className="h-5 w-5 text-primary" />Чеклист</h3>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
          <div className="bg-green-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${checkedPercent}%` }} />
        </div>
        <div className="space-y-2">
          {config.checklistItems.map((item, index) => (
            <label key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input type="checkbox" checked={checkedItems.has(index)} onChange={() => onToggleCheck(index)} className="w-4 h-4 rounded flex-shrink-0" />
              <span className={`text-sm ${checkedItems.has(index) ? "line-through text-gray-400" : "text-gray-700"}`}>{item}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Icon name="Lightbulb" className="h-5 w-5 text-yellow-500" />Советы</h3>
        <ul className="space-y-2">
          {config.tips.map((tip, index) => (
            <li key={index} className="flex gap-2 text-xs text-gray-600"><Icon name="ChevronRight" className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" /><span>{tip}</span></li>
          ))}
        </ul>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Icon name="Sparkles" className="h-7 w-7 text-blue-600 mb-2" />
        <h3 className="font-semibold text-sm mb-1 text-blue-900">Как это работает</h3>
        <ol className="text-xs text-gray-600 space-y-1.5 mt-2">
          <li className="flex gap-2"><span className="font-bold text-blue-600">1.</span>Опишите помещение</li>
          <li className="flex gap-2"><span className="font-bold text-blue-600">2.</span>Нажмите "Сгенерировать"</li>
          <li className="flex gap-2"><span className="font-bold text-blue-600">3.</span>ИИ создаст детальный план</li>
          <li className="flex gap-2"><span className="font-bold text-blue-600">4.</span>Данные сохраняются автоматически</li>
        </ol>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 text-sm" onClick={() => { if (currentIdx > 0) onNavigate(`/designer/${stageKeys[currentIdx - 1]}${projectParam}`); }} disabled={currentIdx === 0}>
          <Icon name="ArrowLeft" className="mr-1 h-4 w-4" />Назад
        </Button>
        <Button className="flex-1 text-sm" onClick={() => { if (currentIdx < stageKeys.length - 1) onNavigate(`/designer/${stageKeys[currentIdx + 1]}${projectParam}`); }} disabled={currentIdx === stageKeys.length - 1}>
          Далее<Icon name="ArrowRight" className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
