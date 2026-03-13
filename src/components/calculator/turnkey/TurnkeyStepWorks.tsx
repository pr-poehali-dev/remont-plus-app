import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FLOOR_TYPES, CEILING_TYPES, BATHROOM_LEVELS } from "./TurnkeyTypes";
import type { TurnkeyConfig } from "./TurnkeyTypes";
import { fmt } from "./turnkeyUtils";
import { Counter, ToggleRow } from "./TurnkeyFormControls";

interface Props {
  cfg: TurnkeyConfig;
  onUpdate: (patch: Partial<Omit<TurnkeyConfig, "id">>) => void;
  step: 3 | 4;
  onBack: () => void;
  onNext?: () => void;
}

export default function TurnkeyStepWorks({ cfg, onUpdate, step, onBack, onNext }: Props) {
  if (step === 3) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Черновые работы</p>
        <ToggleRow
          label="Демонтаж"
          description="Снятие старой отделки, вывоз мусора — 1 600 ₽/м²"
          checked={cfg.demolitionIncluded}
          onChange={v => onUpdate({ demolitionIncluded: v })}
        />
        <div className="ml-4 space-y-2">
          <ToggleRow
            label="Демонтаж сантехнической кабины"
            description="Снос стен ванной и туалета — работа + вывоз мусора"
            checked={cfg.bathroomCabinDemolition}
            onChange={v => onUpdate({
              bathroomCabinDemolition: v,
              bathroomCabinConstruction: v ? cfg.bathroomCabinConstruction : false,
            })}
          />
          {cfg.bathroomCabinDemolition && (
            <ToggleRow
              label="Возведение сантехнической кабины"
              description="Кладка перегородок: пеноблоки / ПГБ, клей, армирование"
              checked={cfg.bathroomCabinConstruction}
              onChange={v => onUpdate({ bathroomCabinConstruction: v })}
            />
          )}
        </div>
        <ToggleRow
          label="Электромонтаж"
          description="Разводка кабелей, щиток, розетки, выключатели — 1 300 ₽/м²"
          checked={cfg.electricsIncluded}
          onChange={v => onUpdate({ electricsIncluded: v })}
        />
        <ToggleRow
          label="Сантехника (разводка)"
          description="Трубы ХВС/ГВС/канализация — 800 ₽/м² + 25 000 ₽ за санузел"
          checked={cfg.plumbingIncluded}
          onChange={v => onUpdate({ plumbingIncluded: v })}
        />
        <ToggleRow
          label="Штукатурка и стяжка"
          description="Выравнивание стен и пола по всей квартире"
          checked={cfg.plastersIncluded}
          onChange={v => onUpdate({ plastersIncluded: v })}
        />

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onBack}
            className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            ← Назад
          </button>
          <button type="button" onClick={onNext}
            className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
            Далее: чистовые →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Напольное покрытие</p>
      <ToggleRow
        label="Укладка полов"
        description="Финишное напольное покрытие по всей квартире"
        checked={cfg.floorsIncluded}
        onChange={v => onUpdate({ floorsIncluded: v })}
      />
      {cfg.floorsIncluded && (
        <div className="ml-4">
          <Label className="text-xs text-gray-500 mb-1 block">Тип покрытия</Label>
          <Select value={cfg.floorType} onValueChange={v => onUpdate({ floorType: v })}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FLOOR_TYPES.map(ft => (
                <SelectItem key={ft.id} value={ft.id}>
                  {ft.label} — {fmt(ft.priceM2)} ₽/м²
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Потолки</p>
      <ToggleRow
        label="Отделка потолков"
        description="Финишная отделка потолков по всей квартире"
        checked={cfg.ceilingsIncluded}
        onChange={v => onUpdate({ ceilingsIncluded: v })}
      />
      {cfg.ceilingsIncluded && (
        <div className="ml-4">
          <Label className="text-xs text-gray-500 mb-1 block">Тип потолков</Label>
          <Select value={cfg.ceilingType} onValueChange={v => onUpdate({ ceilingType: v })}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CEILING_TYPES.map(ct => (
                <SelectItem key={ct.id} value={ct.id}>
                  {ct.label} — {fmt(ct.priceM2)} ₽/м²
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Санузлы и кухня</p>
      <ToggleRow
        label="Ремонт санузлов (под ключ)"
        description="Плитка, гидроизоляция, сантехника, аксессуары"
        checked={cfg.bathroomIncluded}
        onChange={v => onUpdate({ bathroomIncluded: v })}
      />
      {cfg.bathroomIncluded && (
        <div className="ml-4">
          <Label className="text-xs text-gray-500 mb-1 block">Уровень санузлов</Label>
          <Select value={cfg.bathroomLevel} onValueChange={v => onUpdate({ bathroomLevel: v })}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BATHROOM_LEVELS.map(bl => (
                <SelectItem key={bl.id} value={bl.id}>
                  {bl.label} — {fmt(bl.pricePerUnit)} ₽/санузел
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <ToggleRow
        label="Монтаж кухни"
        description="Сборка и установка кухонного гарнитура — 16 000 ₽"
        checked={cfg.kitchenIncluded}
        onChange={v => onUpdate({ kitchenIncluded: v })}
      />

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Двери и откосы</p>
      <ToggleRow
        label="Установка дверей"
        description="Межкомнатные двери с установкой — 12 000 ₽/шт"
        checked={cfg.doorsIncluded}
        onChange={v => onUpdate({ doorsIncluded: v })}
      />
      {cfg.doorsIncluded && (
        <div className="ml-4 rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-1">
            <Counter label="Количество дверей" value={cfg.doorsCount} onChange={v => onUpdate({ doorsCount: v })} max={15} />
          </div>
        </div>
      )}
      <ToggleRow
        label="Откосы окон"
        description="Откосы на все окна и балконные двери — 3 200 ₽/проём"
        checked={cfg.windowslopeIncluded}
        onChange={v => onUpdate({ windowslopeIncluded: v })}
      />

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Дополнительно</p>
      <ToggleRow
        label="Сборка мебели"
        description="Сборка и навеска всей мебели — 500 ₽/м² площади"
        checked={cfg.furnitureAssembly}
        onChange={v => onUpdate({ furnitureAssembly: v })}
      />
      <ToggleRow
        label="Финальная уборка"
        description="Генеральная уборка после ремонта — 180 ₽/м²"
        checked={cfg.cleaningIncluded}
        onChange={v => onUpdate({ cleaningIncluded: v })}
      />

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Управление объектом</p>
      <ToggleRow
        label="Прораб"
        description="Технический надзор, координация бригад, контроль качества"
        checked={cfg.foremanIncluded}
        onChange={v => onUpdate({ foremanIncluded: v })}
      />
      {cfg.foremanIncluded && (
        <div className="ml-4 flex items-center gap-3">
          <Label className="text-xs text-gray-500 whitespace-nowrap">% от работ</Label>
          <Input
            type="number" min={1} max={50} step={1}
            value={cfg.foremanPct}
            onChange={e => onUpdate({ foremanPct: Math.max(1, Math.min(50, parseFloat(e.target.value) || 10)) })}
            className="h-9 w-24"
          />
          <span className="text-xs text-gray-400">обычно 8–15%</span>
        </div>
      )}
      <ToggleRow
        label="Снабженец"
        description="Закупка материалов, логистика, складской учёт"
        checked={cfg.supplierIncluded}
        onChange={v => onUpdate({ supplierIncluded: v })}
      />
      {cfg.supplierIncluded && (
        <div className="ml-4 flex items-center gap-3">
          <Label className="text-xs text-gray-500 whitespace-nowrap">% от работ</Label>
          <Input
            type="number" min={1} max={30} step={1}
            value={cfg.supplierPct}
            onChange={e => onUpdate({ supplierPct: Math.max(1, Math.min(30, parseFloat(e.target.value) || 5)) })}
            className="h-9 w-24"
          />
          <span className="text-xs text-gray-400">обычно 3–7%</span>
        </div>
      )}
      <ToggleRow
        label="Доставка материалов + подъём на этаж"
        description={`Доставка до подъезда и подъём на ${cfg.floorNumber || 1}-й этаж (расчёт по весу материалов)`}
        checked={cfg.deliveryIncluded}
        onChange={v => onUpdate({ deliveryIncluded: v })}
      />

      <div>
        <Label className="text-xs text-gray-500 mb-1 block">Примечания</Label>
        <textarea
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-emerald-400 transition-colors"
          placeholder="Особые пожелания, специфика объекта..."
          value={cfg.note}
          onChange={e => onUpdate({ note: e.target.value })}
        />
      </div>

      <button type="button" onClick={onBack}
        className="w-full h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
        ← Назад
      </button>
    </div>
  );
}
