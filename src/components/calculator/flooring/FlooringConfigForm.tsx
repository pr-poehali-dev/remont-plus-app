import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import {
  FLOORING_CATEGORIES, FLOORING_PRODUCTS, SUBSTRATE_OPTIONS,
  INSTALL_PATTERNS, SKIRTING_OPTIONS,
} from "./FlooringTypes";
import type { FlooringConfig, FlooringCategory } from "./FlooringTypes";

interface Props {
  cfg: FlooringConfig;
  onUpdate: (patch: Partial<Omit<FlooringConfig, "id">>) => void;
}

const STEPS = ["Помещение", "Материал", "Укладка", "Опции"];

export default function FlooringConfigForm({ cfg, onUpdate }: Props) {
  const [step, setStep] = useState(0);
  const [activeCategory, setActiveCategory] = useState<FlooringCategory>(
    FLOORING_PRODUCTS.find(p => p.id === cfg.productId)?.category ?? "laminate"
  );

  const handleDim = (l: number, w: number) => {
    const area = Math.round(l * w * 10) / 10;
    const perimeter = Math.round((l + w) * 2 * 10) / 10;
    onUpdate({ length: l, width: w, area, perimeter });
  };

  const filteredProducts = FLOORING_PRODUCTS.filter(p => p.category === activeCategory);
  const selectedProduct = FLOORING_PRODUCTS.find(p => p.id === cfg.productId);

  return (
    <div className="space-y-5">
      {/* Степпер */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className="flex items-center gap-0 group"
          >
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
              step === i ? "bg-violet-600 text-white shadow" :
              step > i ? "bg-green-500 text-white" :
              "bg-gray-100 text-gray-400"
            }`}>
              {step > i ? <Icon name="Check" size={12} /> : i + 1}
            </div>
            <span className={`hidden sm:block text-xs px-1.5 font-medium transition-colors ${
              step === i ? "text-violet-700" : step > i ? "text-green-600" : "text-gray-400"
            }`}>{s}</span>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-px mx-1 ${step > i ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </button>
        ))}
      </div>

      {/* Шаг 1: Помещение */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Название помещения</Label>
            <Input
              placeholder="Например: Гостиная"
              value={cfg.roomName}
              onChange={e => onUpdate({ roomName: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Длина, м</Label>
              <Input
                type="number" min={0.5} max={50} step={0.1}
                value={cfg.length}
                onChange={e => handleDim(parseFloat(e.target.value) || 0, cfg.width)}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Ширина, м</Label>
              <Input
                type="number" min={0.5} max={50} step={0.1}
                value={cfg.width}
                onChange={e => handleDim(cfg.length, parseFloat(e.target.value) || 0)}
                className="h-9"
              />
            </div>
          </div>
          {/* Схема комнаты */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden" style={{ height: 140 }}>
            <div
              className="bg-white border-2 border-violet-400 rounded flex items-center justify-center transition-all shadow"
              style={{
                width: `${Math.min(85, (cfg.length / Math.max(cfg.length, cfg.width)) * 85)}%`,
                height: `${Math.min(75, (cfg.width / Math.max(cfg.length, cfg.width)) * 75 + 20)}%`,
              }}
            >
              <span className="text-xs font-bold text-violet-600">{cfg.area} м²</span>
            </div>
            <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">{cfg.length} × {cfg.width} м</span>
            <span className="absolute top-2 left-3 text-[10px] text-gray-400">П = {cfg.perimeter} м</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-violet-50 rounded-lg p-2.5 text-center">
              <p className="text-xs text-gray-500">Площадь</p>
              <p className="text-lg font-bold text-violet-700">{cfg.area} м²</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5 text-center">
              <p className="text-xs text-gray-500">Периметр</p>
              <p className="text-lg font-bold text-gray-700">{cfg.perimeter} м</p>
            </div>
          </div>
          <button
            onClick={() => setStep(1)}
            className="w-full h-9 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Выбрать материал →
          </button>
        </div>
      )}

      {/* Шаг 2: Материал */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Категории */}
          <div className="flex flex-wrap gap-1.5">
            {FLOORING_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => {
                  setActiveCategory(cat.value);
                  const first = FLOORING_PRODUCTS.find(p => p.category === cat.value);
                  if (first) onUpdate({ productId: first.id });
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                  activeCategory === cat.value
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Карточки товаров */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredProducts.map(product => {
              const isSelected = cfg.productId === product.id;
              return (
                <div
                  key={product.id}
                  onClick={() => onUpdate({ productId: product.id })}
                  className={`cursor-pointer rounded-xl border p-3 transition-all ${
                    isSelected
                      ? "border-violet-400 bg-violet-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-violet-200"
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-gray-400 font-medium">{product.brand}</p>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{product.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-bold ${isSelected ? "text-violet-700" : "text-gray-700"}`}>
                            {product.pricePerM2.toLocaleString("ru-RU")} ₽/м²
                          </p>
                          <p className="text-[10px] text-gray-400">{product.wear}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {product.features.slice(0, 2).map(f => (
                          <Badge key={f} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{f}</Badge>
                        ))}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{product.thickness} мм</Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">Гарантия {product.warranty} лет</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.suitable.map(s => (
                          <span key={s} className="text-[10px] text-gray-400">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-violet-200 flex items-center justify-between text-xs text-violet-600">
                      <span className="flex items-center gap-1"><Icon name="Check" size={12} /> Выбрано</span>
                      <span>Монтаж: {product.installPrice} ₽/м²</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(0)} className="flex-1 h-9 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">← Назад</button>
            <button onClick={() => setStep(2)} className="flex-1 h-9 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors">Укладка →</button>
          </div>
        </div>
      )}

      {/* Шаг 3: Укладка */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500 mb-2 block">Схема укладки</Label>
            <div className="grid grid-cols-1 gap-2">
              {INSTALL_PATTERNS.map(p => (
                <button
                  key={p.id}
                  onClick={() => onUpdate({ patternId: p.id })}
                  className={`flex items-center justify-between rounded-lg border p-3 text-sm transition-all ${
                    cfg.patternId === p.id
                      ? "border-violet-400 bg-violet-50"
                      : "border-gray-200 bg-white hover:border-violet-200"
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.description}</p>
                  </div>
                  <Badge variant={p.wastePct <= 5 ? "secondary" : "outline"} className="shrink-0 text-xs">
                    +{p.wastePct}% отходов
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500 mb-2 block">Подложка</Label>
            <div className="grid grid-cols-1 gap-1.5">
              {SUBSTRATE_OPTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => onUpdate({ substrateId: s.id })}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all ${
                    cfg.substrateId === s.id
                      ? "border-violet-400 bg-violet-50"
                      : "border-gray-200 bg-white hover:border-violet-200"
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 shrink-0">
                    {s.pricePerM2 > 0 ? `${s.pricePerM2} ₽/м²` : "Включено"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 h-9 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">← Назад</button>
            <button onClick={() => setStep(3)} className="flex-1 h-9 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors">Опции →</button>
          </div>
        </div>
      )}

      {/* Шаг 4: Опции */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500 mb-2 block">Плинтус</Label>
            <div className="grid grid-cols-1 gap-1.5">
              {SKIRTING_OPTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => onUpdate({ skirtingId: s.id, skirtingIncluded: s.id !== "none" })}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all ${
                    cfg.skirtingId === s.id
                      ? "border-violet-400 bg-violet-50"
                      : "border-gray-200 bg-white hover:border-violet-200"
                  }`}
                >
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <span className="text-sm font-semibold text-gray-700">
                    {s.pricePerM > 0 ? `${s.pricePerM} ₽/м` : "—"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-500 block">Дополнительные работы</Label>
            <label className={`flex items-center justify-between rounded-lg border px-3 py-2.5 cursor-pointer transition-all ${cfg.demolitionIncluded ? "border-violet-400 bg-violet-50" : "border-gray-200 bg-white"}`}>
              <div>
                <p className="text-sm font-medium text-gray-900">Демонтаж старого покрытия</p>
                <p className="text-xs text-gray-400">~180 ₽/м²</p>
              </div>
              <input type="checkbox" checked={cfg.demolitionIncluded} onChange={e => onUpdate({ demolitionIncluded: e.target.checked })} className="w-4 h-4 accent-violet-600" />
            </label>

            <label className={`flex items-center justify-between rounded-lg border px-3 py-2.5 cursor-pointer transition-all ${cfg.levelingIncluded ? "border-violet-400 bg-violet-50" : "border-gray-200 bg-white"}`}>
              <div>
                <p className="text-sm font-medium text-gray-900">Стяжка / выравнивание пола</p>
                <p className="text-xs text-gray-400">~18 ₽/м²/мм</p>
              </div>
              <input type="checkbox" checked={cfg.levelingIncluded} onChange={e => onUpdate({ levelingIncluded: e.target.checked })} className="w-4 h-4 accent-violet-600" />
            </label>

            {cfg.levelingIncluded && (
              <div className="pl-3">
                <Label className="text-xs text-gray-500 mb-1 block">Толщина стяжки, мм</Label>
                <Input
                  type="number" min={10} max={150} step={5}
                  value={cfg.levelingThicknessMm}
                  onChange={e => onUpdate({ levelingThicknessMm: parseInt(e.target.value) || 30 })}
                  className="h-8 w-28 text-sm"
                />
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Порожки / переходные планки, шт.</Label>
            <Input
              type="number" min={0} max={20}
              value={cfg.thresholdCount}
              onChange={e => onUpdate({ thresholdCount: parseInt(e.target.value) || 0 })}
              className="h-9 w-24"
            />
            <p className="text-xs text-gray-400 mt-1">850 ₽/шт., учитывает монтаж</p>
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-0.5">
              <p className="font-semibold text-gray-700 mb-1">{selectedProduct.brand} {selectedProduct.name}</p>
              <p>Толщина: {selectedProduct.thickness} мм · Износостойкость: {selectedProduct.wear}</p>
              <p>Гарантия: {selectedProduct.warranty} лет</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedProduct.features.map(f => <Badge key={f} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{f}</Badge>)}
              </div>
            </div>
          )}

          <button onClick={() => setStep(0)} className="w-full h-9 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">← К началу</button>
        </div>
      )}
    </div>
  );
}
