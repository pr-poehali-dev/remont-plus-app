import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "./FrameHouseFormShared";
import type { FrameHouseConfig } from "./FrameHouseTypes";

interface Props {
  config: FrameHouseConfig;
  onChange: (patch: Partial<FrameHouseConfig>) => void;
}

export default function FrameHouseFormExtras({ config, onChange }: Props) {
  return (
    <>
      {/* Инженерия */}
      <SectionTitle icon="Zap">Инженерные системы</SectionTitle>
      <div className="space-y-2">
        <label className="flex items-center justify-between gap-2 cursor-pointer">
          <div>
            <span className="text-sm text-gray-700 font-medium">Электрика (разводка под ключ)</span>
            <p className="text-xs text-gray-400">Щиток, кабель, розетки, выключатели, освещение</p>
          </div>
          <input
            type="checkbox"
            checked={config.electricalIncluded}
            onChange={e => onChange({ electricalIncluded: e.target.checked })}
            className="w-4 h-4 accent-green-600 shrink-0"
          />
        </label>
        <label className="flex items-center justify-between gap-2 cursor-pointer">
          <div>
            <span className="text-sm text-gray-700 font-medium">Водоснабжение</span>
            <p className="text-xs text-gray-400">Разводка холодной/горячей воды, санузел</p>
          </div>
          <input
            type="checkbox"
            checked={config.plumbingIncluded}
            onChange={e => onChange({ plumbingIncluded: e.target.checked })}
            className="w-4 h-4 accent-green-600 shrink-0"
          />
        </label>
        <label className="flex items-center justify-between gap-2 cursor-pointer">
          <div>
            <span className="text-sm text-gray-700 font-medium">Канализация / Септик</span>
            <p className="text-xs text-gray-400">Автономная канализация, выгреб или септик</p>
          </div>
          <input
            type="checkbox"
            checked={config.sewageIncluded}
            onChange={e => onChange({ sewageIncluded: e.target.checked })}
            className="w-4 h-4 accent-green-600 shrink-0"
          />
        </label>
      </div>

      {/* Терраса */}
      <SectionTitle icon="Armchair">Терраса / веранда</SectionTitle>
      <label className="flex items-center gap-2 cursor-pointer mb-2">
        <input
          type="checkbox"
          checked={config.terrace}
          onChange={e => onChange({ terrace: e.target.checked, terraceArea: e.target.checked ? 12 : 0 })}
          className="w-4 h-4 accent-green-600"
        />
        <span className="text-sm text-gray-700">Включить террасу</span>
      </label>
      {config.terrace && (
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Площадь террасы, м²</Label>
          <Input
            type="number" min={4} max={100} value={config.terraceArea}
            onChange={e => onChange({ terraceArea: parseFloat(e.target.value) || 12 })}
            className="h-9 text-sm w-28"
          />
        </div>
      )}

      {/* Гараж */}
      <SectionTitle icon="Car">Гараж</SectionTitle>
      <label className="flex items-center gap-2 cursor-pointer mb-2">
        <input
          type="checkbox"
          checked={config.garage}
          onChange={e => onChange({ garage: e.target.checked, garageArea: e.target.checked ? 20 : 0 })}
          className="w-4 h-4 accent-green-600"
        />
        <span className="text-sm text-gray-700">Включить гараж</span>
      </label>
      {config.garage && (
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Площадь гаража, м²</Label>
          <Input
            type="number" min={12} max={100} value={config.garageArea}
            onChange={e => onChange({ garageArea: parseFloat(e.target.value) || 20 })}
            className="h-9 text-sm w-28"
          />
        </div>
      )}

      {/* Управление проектом */}
      <SectionTitle icon="Users">Управление проектом</SectionTitle>
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.foremanIncluded}
            onChange={e => onChange({ foremanIncluded: e.target.checked })}
            className="w-4 h-4 mt-0.5 accent-green-600 shrink-0"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">Прораб — технический надзор</div>
            <p className="text-xs text-gray-500">Координация бригады, контроль качества, приёмка этапов</p>
            {config.foremanIncluded && (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number" min={5} max={30} value={config.foremanPct}
                  onChange={e => onChange({ foremanPct: parseFloat(e.target.value) || 10 })}
                  className="h-8 w-16 text-sm"
                />
                <span className="text-xs text-gray-500">% от стоимости проекта</span>
              </div>
            )}
          </div>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.supplierIncluded}
            onChange={e => onChange({ supplierIncluded: e.target.checked })}
            className="w-4 h-4 mt-0.5 accent-green-600 shrink-0"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">Снабженец — закупка материалов</div>
            <p className="text-xs text-gray-500">Поиск поставщиков, контроль качества, доставка на объект</p>
            {config.supplierIncluded && (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number" min={2} max={15} value={config.supplierPct}
                  onChange={e => onChange({ supplierPct: parseFloat(e.target.value) || 5 })}
                  className="h-8 w-16 text-sm"
                />
                <span className="text-xs text-gray-500">% от стоимости материалов</span>
              </div>
            )}
          </div>
        </label>
      </div>
    </>
  );
}
