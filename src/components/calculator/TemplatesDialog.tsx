import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import {
  PRESET_TEMPLATES,
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  type SavedTemplate,
} from "@/lib/estimate-templates";
import type { EstimateItem } from "@/pages/Calculator";

interface TemplatesDialogProps {
  open: boolean;
  onClose: () => void;
  currentItems: EstimateItem[];
  onApply: (items: EstimateItem[]) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  bathroom: "Ванная",
  kitchen: "Кухня",
  room: "Комната",
  full: "Квартира",
  custom: "Мои шаблоны",
};

const CATEGORY_COLORS: Record<string, string> = {
  bathroom: "bg-blue-100 text-blue-700",
  kitchen: "bg-orange-100 text-orange-700",
  room: "bg-green-100 text-green-700",
  full: "bg-purple-100 text-purple-700",
  custom: "bg-amber-100 text-amber-700",
};

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

type Tab = "presets" | "custom" | "save";

export default function TemplatesDialog({ open, onClose, currentItems, onApply }: TemplatesDialogProps) {
  const [tab, setTab] = useState<Tab>("presets");
  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [customTemplates, setCustomTemplates] = useState<SavedTemplate[]>(getCustomTemplates);
  const [saved, setSaved] = useState(false);

  const handleApplyPreset = (templateItems: typeof PRESET_TEMPLATES[0]["items"]) => {
    const newItems: EstimateItem[] = templateItems.map((item) => ({
      ...item,
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      total: item.price * item.quantity,
    }));
    onApply(newItems);
    onClose();
  };

  const handleApplyCustom = (items: EstimateItem[]) => {
    const newItems = items.map((item) => ({
      ...item,
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }));
    onApply(newItems);
    onClose();
  };

  const handleSave = () => {
    if (!saveName.trim() || currentItems.length === 0) return;
    saveCustomTemplate(saveName.trim(), saveDesc.trim(), currentItems);
    setCustomTemplates(getCustomTemplates());
    setSaved(true);
    setSaveName("");
    setSaveDesc("");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (id: string) => {
    deleteCustomTemplate(id);
    setCustomTemplates(getCustomTemplates());
  };

  const presetTotal = (items: typeof PRESET_TEMPLATES[0]["items"]) =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="LayoutTemplate" className="h-5 w-5 text-primary" />
            Шаблоны смет
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 border-b pb-3">
          {([
            { key: "presets", label: "Готовые шаблоны", icon: "Star" },
            { key: "custom", label: `Мои шаблоны${customTemplates.length > 0 ? ` (${customTemplates.length})` : ""}`, icon: "FolderOpen" },
            { key: "save", label: "Сохранить текущую", icon: "Save" },
          ] as { key: Tab; label: string; icon: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {tab === "presets" && (
            <>
              {["bathroom", "kitchen", "room", "full"].map((cat) => (
                <div key={cat}>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2 mt-3">{CATEGORY_LABELS[cat]}</p>
                  <div className="space-y-2">
                    {PRESET_TEMPLATES.filter((t) => t.category === cat).map((tpl) => (
                      <div key={tpl.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-colors group">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <Icon name={tpl.icon} size={18} className="text-gray-500 group-hover:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{tpl.name}</span>
                            <Badge className={`text-[10px] px-1.5 py-0 ${CATEGORY_COLORS[tpl.category]}`}>
                              {CATEGORY_LABELS[tpl.category]}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{tpl.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {tpl.items.length} позиций · от{" "}
                            <span className="font-semibold text-gray-700">{fmt(presetTotal(tpl.items))} ₽</span>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleApplyPreset(tpl.items)}
                        >
                          Применить
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "custom" && (
            <>
              {customTemplates.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Icon name="FolderOpen" className="mx-auto h-10 w-10 mb-3 opacity-40" />
                  <p className="font-medium">Нет сохранённых шаблонов</p>
                  <p className="text-sm mt-1">Составьте смету и сохраните её как шаблон</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setTab("save")}>
                    Сохранить текущую смету
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {customTemplates.map((tpl) => (
                    <div key={tpl.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/50 transition-colors group">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Icon name="Star" size={18} className="text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{tpl.name}</span>
                          <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700">Мой шаблон</Badge>
                        </div>
                        {tpl.description && <p className="text-xs text-gray-400 mt-0.5">{tpl.description}</p>}
                        <p className="text-xs text-gray-500 mt-1">
                          {tpl.items.length} позиций · Сохранено {tpl.savedAt}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleApplyCustom(tpl.items)}
                        >
                          Применить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(tpl.id)}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "save" && (
            <div className="space-y-4 mt-2">
              {currentItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Icon name="ClipboardList" className="mx-auto h-10 w-10 mb-3 opacity-40" />
                  <p className="font-medium">Смета пуста</p>
                  <p className="text-sm mt-1">Добавьте позиции в смету, чтобы сохранить шаблон</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                    В шаблон войдёт <strong>{currentItems.length} позиций</strong> на сумму{" "}
                    <strong>{fmt(currentItems.reduce((s, i) => s + i.total, 0))} ₽</strong>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Название шаблона *</label>
                    <Input
                      placeholder="Например: Ванная 6м² эконом"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Описание <span className="text-gray-400 font-normal">(необязательно)</span></label>
                    <Input
                      placeholder="Короткое описание состава сметы"
                      value={saveDesc}
                      onChange={(e) => setSaveDesc(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!saveName.trim() || saved}
                    onClick={handleSave}
                  >
                    {saved ? (
                      <><Icon name="CheckCircle" size={16} className="mr-2" />Сохранено!</>
                    ) : (
                      <><Icon name="Save" size={16} className="mr-2" />Сохранить шаблон</>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
