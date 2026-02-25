import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Stage, STATUS_CONFIG, fmt } from "./OrganizerTypes";

function SummaryCard({ icon, label, value, color, sub, subPositive }: { icon: string; label: string; value: string; color: string; sub?: string; subPositive?: boolean }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600", purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <Card className="p-3">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon name={icon} size={16} />
      </div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-base font-bold text-gray-900">{value}</p>
      {sub && <p className={`text-xs font-medium mt-0.5 ${subPositive ? "text-green-600" : "text-red-600"}`}>{sub}</p>}
    </Card>
  );
}

export { SummaryCard };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editStage: Stage | null;
  setEditStage: React.Dispatch<React.SetStateAction<Stage | null>>;
  onSave: () => void;
  saving: boolean;
}

export default function OrganizerStageDialog({ open, onOpenChange, editStage, setEditStage, onSave, saving }: Props) {
  if (!editStage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Этап: {editStage.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Статус</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setEditStage(s => s ? { ...s, status: key } : s)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${editStage.status === key ? val.color + " border-current" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                >
                  <Icon name={val.icon} size={14} />
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Контрольные точки</label>
            <div className="space-y-1.5">
              {(editStage.checkpoints || []).map((cp, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-1.5">
                  <Icon name="CheckSquare" size={14} className="text-green-500 shrink-0" />
                  <span className="flex-1">{cp}</span>
                </div>
              ))}
            </div>
          </div>

          <hr />

          <p className="text-sm font-semibold text-gray-700">Плановые показатели</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Дней (план)</label>
              <Input type="number" value={editStage.plan_days ?? ""} onChange={e => setEditStage(s => s ? { ...s, plan_days: e.target.value ? parseInt(e.target.value) : null } : s)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Сумма (план), ₽</label>
              <Input type="number" value={editStage.plan_amount ?? ""} onChange={e => setEditStage(s => s ? { ...s, plan_amount: e.target.value ? parseFloat(e.target.value) : null } : s)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Дата начала (план)</label>
              <Input type="date" value={editStage.planned_start ?? ""} onChange={e => setEditStage(s => s ? { ...s, planned_start: e.target.value || null } : s)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Дата окончания (план)</label>
              <Input type="date" value={editStage.planned_end ?? ""} onChange={e => setEditStage(s => s ? { ...s, planned_end: e.target.value || null } : s)} />
            </div>
          </div>

          <hr />

          <p className="text-sm font-semibold text-gray-700">Фактические показатели</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Дней (факт)</label>
              <Input type="number" value={editStage.fact_days ?? ""} onChange={e => setEditStage(s => s ? { ...s, fact_days: e.target.value ? parseInt(e.target.value) : null } : s)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Сумма (факт), ₽</label>
              <Input type="number" value={editStage.fact_amount ?? ""} onChange={e => setEditStage(s => s ? { ...s, fact_amount: e.target.value ? parseFloat(e.target.value) : null } : s)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Дата начала (факт)</label>
              <Input type="date" value={editStage.actual_start ?? ""} onChange={e => setEditStage(s => s ? { ...s, actual_start: e.target.value || null } : s)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Дата окончания (факт)</label>
              <Input type="date" value={editStage.actual_end ?? ""} onChange={e => setEditStage(s => s ? { ...s, actual_end: e.target.value || null } : s)} />
            </div>
          </div>

          {(editStage.plan_amount != null && editStage.fact_amount != null) && (
            <div className={`rounded-lg px-4 py-3 ${editStage.plan_amount >= editStage.fact_amount ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <p className="text-sm font-semibold text-gray-800 mb-1">Итог по этапу</p>
              <div className="flex gap-6 text-sm">
                <span className="text-gray-600">Бюджет: {fmt(editStage.plan_amount)} → {fmt(editStage.fact_amount)}</span>
                <span className={editStage.plan_amount >= editStage.fact_amount ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
                  {editStage.plan_amount >= editStage.fact_amount ? "Экономия" : "Перерасход"} {fmt(Math.abs(editStage.plan_amount - editStage.fact_amount))}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Комментарий</label>
            <Textarea value={editStage.comment ?? ""} onChange={e => setEditStage(s => s ? { ...s, comment: e.target.value } : s)} placeholder="Заметки по этапу: что сделано, кто выполнял..." rows={3} />
          </div>

          <Button onClick={onSave} disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2">
            {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Save" size={16} />}
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
