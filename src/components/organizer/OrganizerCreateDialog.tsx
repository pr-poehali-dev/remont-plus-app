import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

interface NewPlan {
  title: string;
  address: string;
  apartment_area: string;
  start_date: string;
  notes: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newPlan: NewPlan;
  setNewPlan: React.Dispatch<React.SetStateAction<NewPlan>>;
  onSubmit: () => void;
  saving: boolean;
}

export default function OrganizerCreateDialog({ open, onOpenChange, newPlan, setNewPlan, onSubmit, saving }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новый план ремонта</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Название объекта</label>
            <Input value={newPlan.title} onChange={e => setNewPlan(p => ({ ...p, title: e.target.value }))} placeholder="Моя квартира" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Адрес</label>
            <Input value={newPlan.address} onChange={e => setNewPlan(p => ({ ...p, address: e.target.value }))} placeholder="ул. Пушкина, д. 1, кв. 42" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Площадь (м²)</label>
              <Input type="number" value={newPlan.apartment_area} onChange={e => setNewPlan(p => ({ ...p, apartment_area: e.target.value }))} placeholder="65" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Дата начала <span className="text-gray-400 font-normal">(необязательно)</span></label>
              <Input type="date" value={newPlan.start_date} onChange={e => setNewPlan(p => ({ ...p, start_date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Примечания</label>
            <Textarea value={newPlan.notes} onChange={e => setNewPlan(p => ({ ...p, notes: e.target.value }))} placeholder="Ремонт в новостройке, без мебели" rows={2} />
          </div>
          <Button onClick={onSubmit} disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2">
            {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Plus" size={16} />}
            Создать план из шаблона
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}