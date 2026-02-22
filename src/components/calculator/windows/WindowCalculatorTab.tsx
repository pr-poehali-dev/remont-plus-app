import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import type { EstimateItem } from "@/pages/Calculator";
import {
  CONSTRUCTION_TYPES, PROFILE_SYSTEMS, GLASS_UNITS, GLASS_COATINGS,
  LAMINATION_TYPES, HARDWARE_OPTIONS, OPENING_TYPES, WINDOW_SILLS, SLOPES,
  BASE_PRICE_PER_M2, INSTALLATION_PRICE_PER_M2,
} from "./WindowTypes";
import type { WindowConfig, ProfileMaterial, OpeningType } from "./WindowTypes";

interface Props {
  onAddToEstimate: (item: EstimateItem) => void;
}

const MAT_LABEL: Record<ProfileMaterial, string> = {
  pvc: "ПВХ",
  aluminum: "Алюминий холодный",
  aluminum_warm: "Алюминий тёплый",
};

function calcPrice(cfg: Omit<WindowConfig, "id" | "totalPrice">): number {
  const area = (cfg.width / 1000) * (cfg.height / 1000); // м²
  const profile = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
  const glass = GLASS_UNITS.find(g => g.id === cfg.glassUnitId);
  const coating = GLASS_COATINGS.find(c => c.id === cfg.glassCoatingId);
  const lam = LAMINATION_TYPES.find(l => l.id === cfg.laminationId);
  const hw = HARDWARE_OPTIONS.find(h => h.id === cfg.hardwareId);
  const sill = WINDOW_SILLS.find(s => s.id === cfg.windowSillId);
  const slope = SLOPES.find(s => s.id === cfg.slopeId);
  const opening = OPENING_TYPES.find(o => o.value === (cfg.openingTypes[0] ?? "tilt_swing"));

  if (!profile || !glass) return 0;

  const baseMat = BASE_PRICE_PER_M2[profile.material];
  let price = baseMat * profile.priceCoeff * glass.priceCoeff * area;

  // Тип открывания (усредняем по всем створкам)
  const avgOpenCoeff = cfg.openingTypes.length > 0
    ? cfg.openingTypes.reduce((s, ov) => {
        const opt = OPENING_TYPES.find(o => o.value === ov);
        return s + (opt?.priceCoeff ?? 1);
      }, 0) / cfg.openingTypes.length
    : (opening?.priceCoeff ?? 1);
  price *= avgOpenCoeff;

  // Покрытие стекла
  price += (coating?.priceAdd ?? 0) * area;

  // Ламинация (периметр профиля × коэф)
  const perim = 2 * ((cfg.width + cfg.height) / 1000);
  price += (lam?.priceAdd ?? 0) * perim;

  // Фурнитура (кол-во открывающихся створок)
  const openSashes = cfg.openingTypes.filter(o => o !== "fixed").length || 1;
  price += (hw?.pricePerSash ?? 0) * openSashes;

  // Подоконник
  const sillLen = cfg.windowSillWidth > 0 ? cfg.width / 1000 : 0;
  price += (sill?.pricePerMeter ?? 0) * sillLen;

  // Откосы
  price += (slope?.pricePerMeter ?? 0) * cfg.slopePerimeter;

  // Монтаж
  if (cfg.installationIncluded) price += INSTALLATION_PRICE_PER_M2 * area;

  return Math.round(price * cfg.quantity);
}

const DEFAULT_CONFIG: Omit<WindowConfig, "id" | "totalPrice"> = {
  constructionType: "window_double",
  width: 1400,
  height: 1400,
  quantity: 1,
  profileSystemId: "rehau_euro60",
  glassUnitId: "2ch_4_10_4_10_4",
  glassCoatingId: "none",
  laminationId: "none",
  hardwareId: "maco_multi",
  openingTypes: ["tilt_swing", "fixed"],
  windowSillId: "pvc_white",
  windowSillWidth: 300,
  slopeId: "pvc_white",
  slopePerimeter: 5,
  installationIncluded: true,
  note: "",
};

function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export default function WindowCalculatorTab({ onAddToEstimate }: Props) {
  const [cfg, setCfg] = useState<Omit<WindowConfig, "id" | "totalPrice">>(DEFAULT_CONFIG);
  const [configs, setConfigs] = useState<WindowConfig[]>([]);
  const [matFilter, setMatFilter] = useState<ProfileMaterial | "all">("all");

  const update = (patch: Partial<typeof cfg>) => setCfg(prev => ({ ...prev, ...patch }));

  const selectedProfile = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
  const selectedConstruction = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);
  const price = calcPrice(cfg);

  const handleSashOpeningChange = (idx: number, val: OpeningType) => {
    const arr = [...cfg.openingTypes];
    arr[idx] = val;
    update({ openingTypes: arr });
  };

  const syncSashes = (type: typeof cfg.constructionType) => {
    const ct = CONSTRUCTION_TYPES.find(c => c.value === type);
    const n = ct?.sashes ?? 1;
    const arr: OpeningType[] = Array.from({ length: n }, (_, i) =>
      i === n - 1 && n > 1 ? "fixed" : "tilt_swing"
    );
    return arr;
  };

  const handleAdd = () => {
    const id = `win-${Date.now()}`;
    const total = price;
    const newCfg: WindowConfig = { ...cfg, id, totalPrice: total };
    setConfigs(prev => [...prev, newCfg]);

    const area = ((cfg.width / 1000) * (cfg.height / 1000) * cfg.quantity).toFixed(2);
    const profile = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
    const ct = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);
    const lam = LAMINATION_TYPES.find(l => l.id === cfg.laminationId);
    const glass = GLASS_UNITS.find(g => g.id === cfg.glassUnitId);

    const name = [
      ct?.label,
      `${cfg.width}×${cfg.height} мм`,
      profile ? `${profile.brand} ${profile.series}` : "",
      glass?.name,
      lam?.id !== "none" ? lam?.name : "",
    ].filter(Boolean).join(", ");

    onAddToEstimate({
      id,
      category: "Окна и остекление",
      name,
      unit: "шт.",
      quantity: cfg.quantity,
      price: Math.round(total / cfg.quantity),
      total,
    });
  };

  const removeConfig = (id: string) => setConfigs(prev => prev.filter(c => c.id !== id));

  const filteredProfiles = matFilter === "all"
    ? PROFILE_SYSTEMS
    : PROFILE_SYSTEMS.filter(p => p.material === matFilter);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Расчёт окон и остекления</h3>
          <p className="text-sm text-gray-500">ПВХ и алюминиевые конструкции любых производителей</p>
        </div>
        {configs.length > 0 && (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            {configs.length} позиц. в смете
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Форма конфигуратора ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Тип конструкции */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Тип конструкции</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONSTRUCTION_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => update({ constructionType: ct.value, openingTypes: syncSashes(ct.value) })}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium transition-all text-center ${
                    cfg.constructionType === ct.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Icon name={ct.icon as "Square"} size={18} />
                  {ct.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Размеры */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Размеры и количество</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Ширина, мм</Label>
                <Input type="number" min={200} max={5000} step={10}
                  value={cfg.width} onChange={e => update({ width: +e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Высота, мм</Label>
                <Input type="number" min={200} max={3000} step={10}
                  value={cfg.height} onChange={e => update({ height: +e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Кол-во, шт.</Label>
                <Input type="number" min={1} max={100}
                  value={cfg.quantity} onChange={e => update({ quantity: +e.target.value })} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Площадь одной конструкции: {((cfg.width / 1000) * (cfg.height / 1000)).toFixed(2)} м²
            </p>
          </Card>

          {/* Тип открывания по створкам */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Тип открывания ({selectedConstruction?.sashes ?? 1} створк{(selectedConstruction?.sashes ?? 1) === 1 ? "а" : "и"})
            </p>
            <div className="space-y-2">
              {cfg.openingTypes.map((ot, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 shrink-0">Створка {idx + 1}</span>
                  <Select value={ot} onValueChange={v => handleSashOpeningChange(idx, v as OpeningType)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPENING_TYPES.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </Card>

          {/* Профильная система */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Профильная система</p>
            <div className="flex gap-1 mb-3 flex-wrap">
              {([["all", "Все"], ["pvc", "ПВХ"], ["aluminum", "Алюминий холодный"], ["aluminum_warm", "Алюминий тёплый"]] as const).map(([v, label]) => (
                <button key={v}
                  onClick={() => setMatFilter(v as typeof matFilter)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    matFilter === v ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {filteredProfiles.map(p => (
                <button key={p.id}
                  onClick={() => update({ profileSystemId: p.id })}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                    cfg.profileSystemId === p.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-gray-900">{p.brand} {p.series}</span>
                      <span className="ml-2 text-gray-400">{MAT_LABEL[p.material]}</span>
                      <p className="text-gray-500 mt-0.5">{p.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {p.material === "pvc" && <p className="text-gray-600">{p.chambers} камер. / {p.depth}мм</p>}
                      <Badge variant="outline" className="text-[10px]">
                        {p.priceCoeff < 1 ? "эконом" : p.priceCoeff > 1.7 ? "премиум" : p.priceCoeff > 1.2 ? "комфорт" : "стандарт"}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Стеклопакет */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Стеклопакет</p>
            <div className="grid grid-cols-1 gap-1.5">
              {GLASS_UNITS.filter(g => g.thickness <= (selectedProfile?.glassThicknessMax ?? 52)).map(g => (
                <button key={g.id}
                  onClick={() => update({ glassUnitId: g.id })}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    cfg.glassUnitId === g.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <span className="font-semibold">{g.name}</span>
                  <span className="ml-2 text-gray-500">{g.description}</span>
                  <span className="ml-2 text-gray-400">{g.thickness} мм</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Покрытие стекла */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Покрытие стекла</p>
            <div className="grid grid-cols-2 gap-1.5">
              {GLASS_COATINGS.map(c => (
                <button key={c.id}
                  onClick={() => update({ glassCoatingId: c.id })}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    cfg.glassCoatingId === c.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <p className="text-gray-500 mt-0.5">{c.description}</p>
                  {c.priceAdd > 0 && <p className="text-blue-600 mt-0.5">+{fmt(c.priceAdd)} ₽/м²</p>}
                </button>
              ))}
            </div>
          </Card>

          {/* Ламинирование */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ламинирование профиля</p>
            <div className="grid grid-cols-2 gap-1.5">
              {LAMINATION_TYPES.map(l => (
                <button key={l.id}
                  onClick={() => update({ laminationId: l.id })}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    cfg.laminationId === l.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{l.name}</p>
                  {l.priceAdd > 0 && <p className="text-blue-600">+{fmt(l.priceAdd)} ₽/пм</p>}
                </button>
              ))}
            </div>
          </Card>

          {/* Фурнитура */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Фурнитура</p>
            <div className="space-y-1.5">
              {HARDWARE_OPTIONS.map(h => (
                <button key={h.id}
                  onClick={() => update({ hardwareId: h.id })}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                    cfg.hardwareId === h.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <span className="font-semibold">{h.brand} {h.series}</span>
                  <span className="ml-2 text-gray-500">{h.description}</span>
                  <span className="ml-2 text-blue-600">{fmt(h.pricePerSash)} ₽/створку</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Подоконник */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Подоконник</p>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {WINDOW_SILLS.map(s => (
                <button key={s.id}
                  onClick={() => update({ windowSillId: s.id })}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    cfg.windowSillId === s.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{s.material}</p>
                  {s.brand !== "—" && <p className="text-gray-400">{s.brand}</p>}
                  {s.pricePerMeter > 0 && <p className="text-blue-600">{fmt(s.pricePerMeter)} ₽/м</p>}
                </button>
              ))}
            </div>
            {cfg.windowSillId !== "none" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Глубина подоконника, мм</Label>
                <Input type="number" min={100} max={800} step={10}
                  value={cfg.windowSillWidth} onChange={e => update({ windowSillWidth: +e.target.value })} />
              </div>
            )}
          </Card>

          {/* Откосы */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Откосы</p>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {SLOPES.map(s => (
                <button key={s.id}
                  onClick={() => update({ slopeId: s.id })}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    cfg.slopeId === s.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  {s.pricePerMeter > 0 && <p className="text-blue-600">{fmt(s.pricePerMeter)} ₽/пм</p>}
                </button>
              ))}
            </div>
            {cfg.slopeId !== "none" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Периметр откосов, пм</Label>
                <Input type="number" min={0} max={50} step={0.5}
                  value={cfg.slopePerimeter} onChange={e => update({ slopePerimeter: +e.target.value })} />
              </div>
            )}
          </Card>

          {/* Монтаж */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="install"
                checked={cfg.installationIncluded}
                onCheckedChange={v => update({ installationIncluded: !!v })}
              />
              <Label htmlFor="install" className="cursor-pointer">
                <span className="font-medium">Включить монтаж</span>
                <span className="text-gray-400 text-xs ml-2">{fmt(INSTALLATION_PRICE_PER_M2)} ₽/м² — демонтаж + установка + пена + герметик</span>
              </Label>
            </div>
          </Card>
        </div>

        {/* ── Итоговая панель ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="sticky top-20">
            <Card className="p-5 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Итог по конструкции</p>

              <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Тип</span>
                  <span className="font-medium text-gray-900 text-right">{selectedConstruction?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Размер</span>
                  <span className="font-medium text-gray-900">{cfg.width}×{cfg.height} мм</span>
                </div>
                <div className="flex justify-between">
                  <span>Площадь</span>
                  <span className="font-medium text-gray-900">
                    {((cfg.width / 1000) * (cfg.height / 1000)).toFixed(2)} м²
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Профиль</span>
                  <span className="font-medium text-gray-900 text-right">
                    {PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId)?.brand}{" "}
                    {PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId)?.series}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Стеклопакет</span>
                  <span className="font-medium text-gray-900">
                    {GLASS_UNITS.find(g => g.id === cfg.glassUnitId)?.name}
                  </span>
                </div>
                {cfg.glassCoatingId !== "none" && (
                  <div className="flex justify-between">
                    <span>Покрытие</span>
                    <span className="font-medium text-gray-900">
                      {GLASS_COATINGS.find(c => c.id === cfg.glassCoatingId)?.name}
                    </span>
                  </div>
                )}
                {cfg.laminationId !== "none" && (
                  <div className="flex justify-between">
                    <span>Ламинация</span>
                    <span className="font-medium text-gray-900">
                      {LAMINATION_TYPES.find(l => l.id === cfg.laminationId)?.name}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Количество</span>
                  <span className="font-medium text-gray-900">{cfg.quantity} шт.</span>
                </div>
              </div>

              <div className="border-t border-blue-200 pt-3 mb-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-gray-600">Цена за 1 шт.</span>
                  <span className="text-lg font-bold text-gray-900">{fmt(Math.round(price / cfg.quantity))} ₽</span>
                </div>
                {cfg.quantity > 1 && (
                  <div className="flex justify-between items-end mt-1">
                    <span className="text-sm text-gray-600">Итого {cfg.quantity} шт.</span>
                    <span className="text-2xl font-bold text-blue-700">{fmt(price)} ₽</span>
                  </div>
                )}
                {cfg.quantity === 1 && (
                  <div className="flex justify-between items-end mt-1">
                    <span className="text-sm text-gray-600">Итого</span>
                    <span className="text-2xl font-bold text-blue-700">{fmt(price)} ₽</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleAdd}
                disabled={price === 0}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить в смету
              </Button>
              <p className="text-[11px] text-center text-gray-400 mt-2">
                Расчёт ориентировочный. Точная цена — после замера.
              </p>
            </Card>

            {/* Список добавленных конструкций */}
            {configs.length > 0 && (
              <Card className="p-4 mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Добавлено в смету
                </p>
                <div className="space-y-2">
                  {configs.map((c) => {
                    const ct = CONSTRUCTION_TYPES.find(x => x.value === c.constructionType);
                    const pf = PROFILE_SYSTEMS.find(x => x.id === c.profileSystemId);
                    return (
                      <div key={c.id} className="flex items-start justify-between gap-2 text-xs border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{ct?.label}</p>
                          <p className="text-gray-500">{c.width}×{c.height} · {pf?.brand} · {c.quantity} шт.</p>
                          <p className="text-blue-600 font-semibold">{fmt(c.totalPrice)} ₽</p>
                        </div>
                        <button
                          onClick={() => removeConfig(c.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                        >
                          <Icon name="Trash2" size={13} />
                        </button>
                      </div>
                    );
                  })}
                  <div className="flex justify-between font-bold text-sm pt-1 border-t">
                    <span>Итого окна</span>
                    <span className="text-blue-700">
                      {fmt(configs.reduce((s, c) => s + c.totalPrice, 0))} ₽
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
