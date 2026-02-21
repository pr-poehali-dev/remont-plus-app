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
  scaleTemplateItems,
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  type SavedTemplate,
} from "@/lib/estimate-templates";
import type { EstimateItem, PriceCategory } from "@/pages/Calculator";

interface TemplatesDialogProps {
  open: boolean;
  onClose: () => void;
  currentItems: EstimateItem[];
  priceCatalog?: PriceCategory[];
  onApply: (items: EstimateItem[], mode: "replace" | "append") => void;
}

interface PendingTemplate {
  name: string;
  items: EstimateItem[];
}

function ApplyModePrompt({
  pending,
  hasExisting,
  onReplace,
  onAppend,
  onCancel,
}: {
  pending: PendingTemplate;
  hasExisting: boolean;
  onReplace: () => void;
  onAppend: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-4 border border-primary/20 rounded-xl p-4 bg-primary/5 space-y-3">
      <div className="flex items-center gap-2">
        <Icon name="LayoutTemplate" size={16} className="text-primary" />
        <span className="font-semibold text-sm">Применить «{pending.name}»</span>
        <Badge variant="outline" className="text-[10px]">{pending.items.length} позиций</Badge>
      </div>
      {hasExisting ? (
        <>
          <p className="text-xs text-gray-500">В смете уже есть позиции. Как применить шаблон?</p>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={onAppend}>
              <Icon name="Plus" size={14} className="mr-1.5" />
              Добавить к текущей
            </Button>
            <Button size="sm" variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={onReplace}>
              <Icon name="RefreshCw" size={14} className="mr-1.5" />
              Заменить смету
            </Button>
            <Button size="sm" variant="ghost" className="px-2" onClick={onCancel}>
              <Icon name="X" size={14} />
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-gray-500">Смета пуста — шаблон будет загружен сразу.</p>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={onReplace}>
              <Icon name="CheckCircle" size={14} className="mr-1.5" />
              Загрузить шаблон
            </Button>
            <Button size="sm" variant="ghost" className="px-2" onClick={onCancel}>
              <Icon name="X" size={14} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
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

function resolvePrice(name: string, fallbackPrice: number, priceCatalog: PriceCategory[]): number {
  for (const cat of priceCatalog) {
    for (const item of cat.items) {
      if (item.name.toLowerCase() === name.toLowerCase()) return item.price;
    }
  }
  return fallbackPrice;
}

export default function TemplatesDialog({ open, onClose, currentItems, priceCatalog = [], onApply }: TemplatesDialogProps) {
  const [tab, setTab] = useState<Tab>("presets");
  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [customTemplates, setCustomTemplates] = useState<SavedTemplate[]>(getCustomTemplates);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState<PendingTemplate | null>(null);
  const [areaInputs, setAreaInputs] = useState<Record<string, string>>({});

  const toEstimateItems = (raw: { category: string; name: string; unit: string; quantity: number; price: number }[]): EstimateItem[] =>
    raw.map((item) => {
      const price = item.category === "Работы"
        ? resolvePrice(item.name, item.price, priceCatalog)
        : item.price;
      return {
        ...item,
        price,
        id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        total: price * item.quantity,
      };
    });

  const handleApplyPreset = (tpl: typeof PRESET_TEMPLATES[0]) => {
    let sourceItems = tpl.items;
    if (tpl.baseArea) {
      const userArea = parseFloat(areaInputs[tpl.id] || "");
      if (userArea > 0 && userArea !== tpl.baseArea) {
        sourceItems = scaleTemplateItems(tpl.items, tpl.baseArea, userArea);
      }
    }
    setPending({ name: tpl.name, items: toEstimateItems(sourceItems) });
  };

  const handleApplyCustom = (tplName: string, items: EstimateItem[]) => {
    const newItems = items.map((item) => ({
      ...item,
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }));
    setPending({ name: tplName, items: newItems });
  };

  const commitApply = (mode: "replace" | "append") => {
    if (!pending) return;
    onApply(pending.items, mode);
    setPending(null);
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

        {priceCatalog.length === 0 && tab === "presets" && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Icon name="AlertCircle" size={13} className="shrink-0" />
            Цены загружаются — дождитесь загрузки прайса для точных цифр
          </div>
        )}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {tab === "presets" && (
            <>
              {["bathroom", "kitchen", "room", "full"].map((cat) => (
                <div key={cat}>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2 mt-3">{CATEGORY_LABELS[cat]}</p>
                  <div className="space-y-2">
                    {PRESET_TEMPLATES.filter((t) => t.category === cat).map((tpl) => {
                      const userArea = parseFloat(areaInputs[tpl.id] || "");
                      const effectiveArea = userArea > 0 ? userArea : tpl.baseArea;
                      const scaledItems = tpl.baseArea && effectiveArea && effectiveArea !== tpl.baseArea
                        ? scaleTemplateItems(tpl.items, tpl.baseArea, effectiveArea)
                        : tpl.items;
                      const total = scaledItems.reduce((s, i) => {
                        const p = i.category === "Работы" ? resolvePrice(i.name, i.price, priceCatalog) : i.price;
                        return s + p * i.quantity;
                      }, 0);
                      return (
                        <div key={tpl.id} className="rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-colors group">
                          <div className="flex items-start gap-3 p-3">
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
                                <span className="font-semibold text-gray-700">{fmt(total)} ₽</span>
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleApplyPreset(tpl)}
                            >
                              Применить
                            </Button>
                          </div>
                          {tpl.baseArea && (
                            <div className="px-3 pb-3 flex items-center gap-2">
                              <Icon name="Ruler" size={14} className="text-gray-400 shrink-0" />
                              <span className="text-xs text-gray-500 shrink-0">Площадь квартиры:</span>
                              <div className="relative w-28">
                                <Input
                                  type="number"
                                  min={10}
                                  max={500}
                                  placeholder={String(tpl.baseArea)}
                                  value={areaInputs[tpl.id] || ""}
                                  onChange={(e) =>
                                    setAreaInputs((prev) => ({ ...prev, [tpl.id]: e.target.value }))
                                  }
                                  className="h-7 text-sm pr-8"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">м²</span>
                              </div>
                              {userArea > 0 && userArea !== tpl.baseArea && (
                                <span className="text-xs text-primary font-medium">
                                  Пересчитано под {userArea} м²
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                          onClick={() => handleApplyCustom(tpl.name, tpl.items)}
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
          {pending && (
            <ApplyModePrompt
              pending={pending}
              hasExisting={currentItems.length > 0}
              onReplace={() => commitApply("replace")}
              onAppend={() => commitApply("append")}
              onCancel={() => setPending(null)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}