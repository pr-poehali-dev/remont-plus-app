import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Icon from "@/components/ui/icon";

interface DesignerSettingsProps {
  projectId: number | null;
  projectName: string;
  roomCount: string;
  totalArea: number[];
  style: string;
  styles: { id: string; name: string }[];
  isSaving: boolean;
  onProjectNameChange: (value: string) => void;
  onRoomCountChange: (value: string) => void;
  onTotalAreaChange: (value: number[]) => void;
  onStyleChange: (value: string) => void;
  onClose: () => void;
  onCreateProject: () => void;
}

export default function DesignerSettings({
  projectId,
  projectName,
  roomCount,
  totalArea,
  style,
  styles,
  isSaving,
  onProjectNameChange,
  onRoomCountChange,
  onTotalAreaChange,
  onStyleChange,
  onClose,
  onCreateProject,
}: DesignerSettingsProps) {
  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon name="Settings" className="h-5 w-5 text-primary" />
          Параметры проекта
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label>Название проекта</Label>
          <Input value={projectName} onChange={(e) => onProjectNameChange(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Количество комнат</Label>
          <Select value={roomCount} onValueChange={onRoomCountChange}>
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
          <Slider value={totalArea} onValueChange={onTotalAreaChange} min={20} max={300} step={5} className="mt-3" />
        </div>
        <div>
          <Label className="mb-1 block">Стиль интерьера</Label>
          <Select value={style} onValueChange={onStyleChange}>
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
        <Button className="mt-4" onClick={onCreateProject} disabled={isSaving}>
          {isSaving ? "Создание..." : "Создать проект и начать"}
        </Button>
      )}
    </Card>
  );
}
