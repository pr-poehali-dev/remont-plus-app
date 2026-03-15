import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import {
  PROFILE_SYSTEMS, GLASS_UNITS, GLASS_COATINGS, LAMINATION_TYPES,
  HARDWARE_OPTIONS, WINDOW_SILLS, SLOPES,
} from "./WindowTypes";
import type { PriceOverrides } from "./windowUtils";
import { getDefaultOverrides, fmt, MAT_LABEL } from "./windowUtils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  overrides: PriceOverrides;
  onSave: (o: PriceOverrides) => void;
  onReset: () => void;
}

export default function WindowPriceSettings({ open, onOpenChange, overrides, onSave, onReset }: Props) {
  const [draft, setDraft] = useState<PriceOverrides>(overrides);
  const defaults = getDefaultOverrides();

  const handleOpen = (v: boolean) => {
    if (v) setDraft(overrides);
    onOpenChange(v);
  };

  const handleSave = () => {
    onSave(draft);
    onOpenChange(false);
  };

  const handleReset = () => {
    const d = getDefaultOverrides();
    setDraft(d);
    onReset();
    onOpenChange(false);
  };

  const isChanged = JSON.stringify(draft) !== JSON.stringify(defaults);

  const numInput = (
    value: number,
    onChange: (v: number) => void,
    defaultVal: number,
    opts?: { min?: number; step?: number; suffix?: string }
  ) => {
    const changed = value !== defaultVal;
    return (
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min={opts?.min ?? 0}
          step={opts?.step ?? 1}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className={`h-7 text-xs w-24 text-right ${changed ? "border-orange-400 bg-orange-50" : ""}`}
        />
        {opts?.suffix && <span className="text-xs text-gray-400 whitespace-nowrap">{opts.suffix}</span>}
        {changed && (
          <button
            onClick={() => onChange(defaultVal)}
            className="text-gray-300 hover:text-gray-500"
            title="Сбросить по умолчанию"
          >
            <Icon name="RotateCcw" size={12} />
          </button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon name="Settings" size={18} />
            Настройка цен на материалы
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          <Tabs defaultValue="base" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4 h-8">
              <TabsTrigger value="base" className="text-xs">Базовые</TabsTrigger>
              <TabsTrigger value="profiles" className="text-xs">Профили</TabsTrigger>
              <TabsTrigger value="glass" className="text-xs">Стекло</TabsTrigger>
              <TabsTrigger value="accessories" className="text-xs">Доп.</TabsTrigger>
            </TabsList>

            <TabsContent value="base" className="space-y-4 mt-0">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium mb-0.5">Базовые цены за м² конструкции</p>
                <p className="text-[11px] text-blue-500">Основа расчёта, умножается на коэффициенты профиля и стеклопакета</p>
              </div>
              <div className="space-y-2">
                {(["pvc", "aluminum", "aluminum_warm"] as const).map(mat => (
                  <div key={mat} className="flex items-center justify-between">
                    <Label className="text-xs">{MAT_LABEL[mat]}</Label>
                    {numInput(
                      draft.basePricePerM2[mat],
                      v => setDraft(d => ({ ...d, basePricePerM2: { ...d.basePricePerM2, [mat]: v } })),
                      defaults.basePricePerM2[mat],
                      { suffix: "₽/м²" }
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Прочее</p>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Монтаж</Label>
                  {numInput(
                    draft.installationPricePerM2,
                    v => setDraft(d => ({ ...d, installationPricePerM2: v })),
                    defaults.installationPricePerM2,
                    { suffix: "₽/м²" }
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Доплата за фрамугу</Label>
                  {numInput(
                    draft.transomAddon,
                    v => setDraft(d => ({ ...d, transomAddon: v })),
                    defaults.transomAddon,
                    { suffix: "₽" }
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profiles" className="space-y-3 mt-0">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium mb-0.5">Ценовые коэффициенты профилей</p>
                <p className="text-[11px] text-blue-500">Множитель к базовой цене за м². Например 1.15 = +15% к базе</p>
              </div>
              <div className="space-y-1.5">
                {PROFILE_SYSTEMS.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                    <div className="min-w-0">
                      <span className="text-xs font-medium">{p.brand} {p.series}</span>
                      <span className="text-[11px] text-gray-400 ml-1.5">{MAT_LABEL[p.material]}</span>
                    </div>
                    {numInput(
                      draft.profileCoeffs[p.id] ?? p.priceCoeff,
                      v => setDraft(d => ({ ...d, profileCoeffs: { ...d.profileCoeffs, [p.id]: v } })),
                      defaults.profileCoeffs[p.id],
                      { step: 0.01, suffix: "×" }
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="glass" className="space-y-4 mt-0">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Стеклопакеты (коэффициент)</p>
                <div className="space-y-1.5">
                  {GLASS_UNITS.map(g => (
                    <div key={g.id} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                      <div>
                        <span className="text-xs font-medium">{g.name}</span>
                        <span className="text-[11px] text-gray-400 ml-1.5">{g.description}</span>
                      </div>
                      {numInput(
                        draft.glassCoeffs[g.id] ?? g.priceCoeff,
                        v => setDraft(d => ({ ...d, glassCoeffs: { ...d.glassCoeffs, [g.id]: v } })),
                        defaults.glassCoeffs[g.id],
                        { step: 0.01, suffix: "×" }
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Покрытие стекла (₽/м²)</p>
                <div className="space-y-1.5">
                  {GLASS_COATINGS.filter(c => c.id !== "none").map(c => (
                    <div key={c.id} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                      <span className="text-xs">{c.name}</span>
                      {numInput(
                        draft.coatingPrices[c.id] ?? c.priceAdd,
                        v => setDraft(d => ({ ...d, coatingPrices: { ...d.coatingPrices, [c.id]: v } })),
                        defaults.coatingPrices[c.id],
                        { suffix: "₽/м²" }
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="accessories" className="space-y-4 mt-0">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Фурнитура (₽/створку)</p>
                <div className="space-y-1.5">
                  {HARDWARE_OPTIONS.map(h => (
                    <div key={h.id} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                      <span className="text-xs">{h.brand} {h.series}</span>
                      {numInput(
                        draft.hardwarePrices[h.id] ?? h.pricePerSash,
                        v => setDraft(d => ({ ...d, hardwarePrices: { ...d.hardwarePrices, [h.id]: v } })),
                        defaults.hardwarePrices[h.id],
                        { suffix: "₽" }
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Ламинирование (₽/пм)</p>
                <div className="space-y-1.5">
                  {LAMINATION_TYPES.filter(l => l.id !== "none").map(l => (
                    <div key={l.id} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                      <span className="text-xs">{l.name}</span>
                      {numInput(
                        draft.laminationPrices[l.id] ?? l.priceAdd,
                        v => setDraft(d => ({ ...d, laminationPrices: { ...d.laminationPrices, [l.id]: v } })),
                        defaults.laminationPrices[l.id],
                        { suffix: "₽" }
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Подоконники (₽/м)</p>
                <div className="space-y-1.5">
                  {WINDOW_SILLS.filter(s => s.id !== "none").map(s => (
                    <div key={s.id} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                      <span className="text-xs">{s.material}</span>
                      {numInput(
                        draft.sillPrices[s.id] ?? s.pricePerMeter,
                        v => setDraft(d => ({ ...d, sillPrices: { ...d.sillPrices, [s.id]: v } })),
                        defaults.sillPrices[s.id],
                        { suffix: "₽" }
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Откосы (₽/пм)</p>
                <div className="space-y-1.5">
                  {SLOPES.filter(s => s.id !== "none").map(s => (
                    <div key={s.id} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                      <span className="text-xs">{s.name}</span>
                      {numInput(
                        draft.slopePrices[s.id] ?? s.pricePerMeter,
                        v => setDraft(d => ({ ...d, slopePrices: { ...d.slopePrices, [s.id]: v } })),
                        defaults.slopePrices[s.id],
                        { suffix: "₽" }
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex items-center justify-between pt-4 border-t mt-2">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Icon name="RotateCcw" size={14} className="mr-1.5" />
            Сбросить всё
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Icon name="Check" size={14} className="mr-1.5" />
              Сохранить
            </Button>
          </div>
        </div>

        {isChanged && (
          <p className="text-[11px] text-orange-500 text-center">
            Поля с оранжевой рамкой отличаются от значений по умолчанию
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
