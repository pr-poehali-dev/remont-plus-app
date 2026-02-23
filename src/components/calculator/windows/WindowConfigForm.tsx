import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import {
  CONSTRUCTION_TYPES, PROFILE_SYSTEMS, GLASS_UNITS, GLASS_COATINGS,
  LAMINATION_TYPES, HARDWARE_OPTIONS, OPENING_TYPES, WINDOW_SILLS, SLOPES,
  INSTALLATION_PRICE_PER_M2, WINDOW_REGIONS,
} from "./WindowTypes";
import type { WindowConfig, ProfileMaterial, OpeningType } from "./WindowTypes";
import { MAT_LABEL, fmt } from "./windowUtils";

interface Props {
  cfg: Omit<WindowConfig, "id" | "totalPrice">;
  matFilter: ProfileMaterial | "all";
  onUpdate: (patch: Partial<Omit<WindowConfig, "id" | "totalPrice">>) => void;
  onMatFilterChange: (v: ProfileMaterial | "all") => void;
  onSashOpeningChange: (idx: number, val: OpeningType) => void;
  onSyncSashes: (type: WindowConfig["constructionType"]) => void;
}

export default function WindowConfigForm({
  cfg, matFilter, onUpdate, onMatFilterChange, onSashOpeningChange, onSyncSashes,
}: Props) {
  const selectedProfile = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
  const selectedConstruction = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);

  const filteredProfiles = matFilter === "all"
    ? PROFILE_SYSTEMS
    : PROFILE_SYSTEMS.filter(p => p.material === matFilter);

  return (
    <div className="space-y-4">

      {/* Регион */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Icon name="MapPin" size={13} />
          Регион
        </p>
        <Select value={cfg.regionId} onValueChange={v => onUpdate({ regionId: v })}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WINDOW_REGIONS.map(r => (
              <SelectItem key={r.id} value={r.id} className="text-sm">
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Тип конструкции */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Тип конструкции</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CONSTRUCTION_TYPES.map(ct => (
            <button
              key={ct.value}
              onClick={() => onSyncSashes(ct.value)}
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
              value={cfg.width} onChange={e => onUpdate({ width: +e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Высота, мм</Label>
            <Input type="number" min={200} max={3000} step={10}
              value={cfg.height} onChange={e => onUpdate({ height: +e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Кол-во, шт.</Label>
            <Input type="number" min={1} max={100}
              value={cfg.quantity} onChange={e => onUpdate({ quantity: +e.target.value })} />
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
              <Select value={ot} onValueChange={v => onSashOpeningChange(idx, v as OpeningType)}>
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
              onClick={() => onMatFilterChange(v as ProfileMaterial | "all")}
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
              onClick={() => onUpdate({ profileSystemId: p.id })}
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
              onClick={() => onUpdate({ glassUnitId: g.id })}
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
              onClick={() => onUpdate({ glassCoatingId: c.id })}
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
              onClick={() => onUpdate({ laminationId: l.id })}
              className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                cfg.laminationId === l.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <p className="font-semibold text-gray-900">{l.name}</p>
              {l.priceAdd > 0 && <p className="text-blue-600">+{fmt(l.priceAdd)} ₽/пм</p>}
            </button>
          ))}
        </div>
        {cfg.laminationId !== "none" && (
          <div className="mt-3 pt-3 border-t flex items-center gap-3">
            <Checkbox
              id="lam-both"
              checked={cfg.laminationBothSides}
              onCheckedChange={v => onUpdate({ laminationBothSides: !!v })}
            />
            <Label htmlFor="lam-both" className="cursor-pointer text-xs">
              <span className="font-medium">Ламинирование с двух сторон</span>
              <span className="text-gray-400 ml-2">×2 к стоимости ламинации</span>
            </Label>
          </div>
        )}
      </Card>

      {/* Фурнитура */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Фурнитура</p>
        <div className="space-y-1.5">
          {HARDWARE_OPTIONS.map(h => (
            <button key={h.id}
              onClick={() => onUpdate({ hardwareId: h.id })}
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
              onClick={() => onUpdate({ windowSillId: s.id })}
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
              value={cfg.windowSillWidth} onChange={e => onUpdate({ windowSillWidth: +e.target.value })} />
          </div>
        )}
      </Card>

      {/* Откосы */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Откосы</p>
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {SLOPES.map(s => (
            <button key={s.id}
              onClick={() => onUpdate({ slopeId: s.id })}
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
              value={cfg.slopePerimeter} onChange={e => onUpdate({ slopePerimeter: +e.target.value })} />
          </div>
        )}
      </Card>

      {/* Монтаж */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="install"
            checked={cfg.installationIncluded}
            onCheckedChange={v => onUpdate({ installationIncluded: !!v })}
          />
          <Label htmlFor="install" className="cursor-pointer">
            <span className="font-medium">Включить монтаж</span>
            <span className="text-gray-400 text-xs ml-2">{fmt(INSTALLATION_PRICE_PER_M2)} ₽/м² — демонтаж + установка + пена + герметик</span>
          </Label>
        </div>
      </Card>
    </div>
  );
}