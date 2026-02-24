import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { CONTRACT_TYPES, STATUSES, CONTRACT_TEMPLATES, EMPTY } from "./LegalTypes";
import type { Contract } from "./LegalTypes";

interface Props {
  open: boolean;
  editing: Contract | null;
  form: Omit<Contract, "id" | "created_at" | "updated_at">;
  tagsInput: string;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (f: Omit<Contract, "id" | "created_at" | "updated_at">) => void;
  onTagsChange: (v: string) => void;
}

export default function LegalContractForm({
  open, editing, form, tagsInput, saving,
  onClose, onSave, onFormChange, onTagsChange,
}: Props) {
  const set = (patch: Partial<Omit<Contract, "id" | "created_at" | "updated_at">>) =>
    onFormChange({ ...form, ...patch });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Редактировать договор" : "Новый договор"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Шаблоны — только при создании */}
          {!editing && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Icon name="Zap" size={11} />
                Быстрый старт — выбери шаблон
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CONTRACT_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      onFormChange({ ...EMPTY, ...tpl.defaults });
                      onTagsChange(tpl.tags);
                    }}
                    className="flex items-start gap-2 p-2.5 border border-gray-200 rounded-xl text-left hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name={tpl.icon} size={14} className="text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-tight">{tpl.label}</p>
                      <p className="text-[11px] text-gray-400 leading-tight mt-0.5 truncate">{tpl.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-3" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label className="text-xs">Название договора *</Label>
              <Input
                value={form.title}
                onChange={e => set({ title: e.target.value })}
                placeholder="Договор оказания услуг с ООО Ромашка"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Номер договора</Label>
              <Input
                value={form.contract_number}
                onChange={e => set({ contract_number: e.target.value })}
                placeholder="2025-01/П"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Тип договора</Label>
              <select
                value={form.contract_type}
                onChange={e => set({ contract_type: e.target.value })}
                className="mt-1 w-full h-9 text-sm border border-gray-200 rounded-md px-2 bg-white"
              >
                {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Контрагент *</Label>
              <Input
                value={form.counterparty_name}
                onChange={e => set({ counterparty_name: e.target.value })}
                placeholder="ООО Ромашка"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">ИНН контрагента</Label>
              <Input
                value={form.counterparty_inn}
                onChange={e => set({ counterparty_inn: e.target.value })}
                placeholder="7700000000"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Тип контрагента</Label>
              <select
                value={form.counterparty_type}
                onChange={e => set({ counterparty_type: e.target.value })}
                className="mt-1 w-full h-9 text-sm border border-gray-200 rounded-md px-2 bg-white"
              >
                <option value="company">Юридическое лицо</option>
                <option value="individual">ИП</option>
                <option value="person">Физическое лицо</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Статус</Label>
              <select
                value={form.status}
                onChange={e => set({ status: e.target.value })}
                className="mt-1 w-full h-9 text-sm border border-gray-200 rounded-md px-2 bg-white"
              >
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Сумма договора</Label>
              <Input
                type="number" min={0}
                value={form.amount ?? ""}
                onChange={e => set({ amount: e.target.value ? Number(e.target.value) : null })}
                placeholder="0"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Валюта</Label>
              <select
                value={form.currency}
                onChange={e => set({ currency: e.target.value })}
                className="mt-1 w-full h-9 text-sm border border-gray-200 rounded-md px-2 bg-white"
              >
                <option value="RUB">RUB — Рубли</option>
                <option value="USD">USD — Доллары</option>
                <option value="EUR">EUR — Евро</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Дата подписания</Label>
              <Input
                type="date"
                value={form.signed_at || ""}
                onChange={e => set({ signed_at: e.target.value || null })}
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Начало действия</Label>
              <Input
                type="date"
                value={form.valid_from || ""}
                onChange={e => set({ valid_from: e.target.value || null })}
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Окончание действия</Label>
              <Input
                type="date"
                value={form.valid_until || ""}
                onChange={e => set({ valid_until: e.target.value || null })}
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Ответственный</Label>
              <Input
                value={form.responsible_person}
                onChange={e => set({ responsible_person: e.target.value })}
                placeholder="Иванов Иван"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Ссылка на файл</Label>
              <Input
                value={form.file_url}
                onChange={e => set({ file_url: e.target.value })}
                placeholder="https://..."
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Предмет договора</Label>
              <Textarea
                value={form.subject}
                onChange={e => set({ subject: e.target.value })}
                placeholder="Оказание услуг по..."
                rows={2}
                className="mt-1 text-sm resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Примечания</Label>
              <Textarea
                value={form.notes}
                onChange={e => set({ notes: e.target.value })}
                placeholder="Дополнительные условия, важные детали..."
                rows={2}
                className="mt-1 text-sm resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Теги (через запятую)</Label>
              <Input
                value={tagsInput}
                onChange={e => onTagsChange(e.target.value)}
                placeholder="поставщик, ремонт, 2025"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="auto_renewal"
                checked={form.auto_renewal}
                onChange={e => set({ auto_renewal: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="auto_renewal" className="text-sm cursor-pointer">Автопролонгация</Label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onSave}
              disabled={saving || !form.title || !form.counterparty_name}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {saving
                ? <Icon name="Loader2" size={14} className="animate-spin mr-1.5" />
                : <Icon name="Save" size={14} className="mr-1.5" />}
              {editing ? "Сохранить" : "Создать договор"}
            </Button>
            <Button variant="outline" onClick={onClose}>Отмена</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}