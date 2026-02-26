import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "./BathHouseFormShared";
import type { BathHouseConfig } from "./BathHouseTypes";

interface Props {
  config: BathHouseConfig;
  onChange: (patch: Partial<BathHouseConfig>) => void;
}

export default function BathHouseFormExtras({ config, onChange }: Props) {
  return (
    <>
      <SectionTitle icon="PlusCircle">Дополнительно</SectionTitle>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border-2 border-gray-200 hover:border-amber-300 transition-all">
          <input type="checkbox" checked={config.window_pvc} onChange={e => onChange({ window_pvc: e.target.checked })} className="accent-amber-500" />
          <div>
            <span className="text-sm font-medium text-gray-700">ПВХ-окна</span>
            <span className="text-xs text-gray-400 block">(снять галочку — деревянные окна)</span>
          </div>
        </label>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-gray-600 w-32 shrink-0">Кол-во окон</Label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => onChange({ windowCount: n })}
                className={`w-9 h-9 rounded-xl border-2 text-sm font-bold transition-all ${
                  config.windowCount === n ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 hover:border-amber-300"
                }`}>{n}</button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border-2 border-gray-200 hover:border-amber-300 transition-all">
          <input type="checkbox" checked={config.chimney} onChange={e => onChange({ chimney: e.target.checked })} className="accent-amber-500" />
          <div>
            <span className="text-sm font-medium text-gray-700">Дымоход (сэндвич-труба)</span>
            <span className="text-xs text-gray-400 block">~30 800 ₽</span>
          </div>
        </label>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-gray-600 w-36 shrink-0">Бак для воды, л</Label>
          <div className="flex gap-1.5">
            {[0, 100, 150, 200, 300].map(v => (
              <button key={v} type="button" onClick={() => onChange({ tankVolume: v })}
                className={`px-2.5 h-9 rounded-xl border-2 text-xs font-bold transition-all ${
                  config.tankVolume === v ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 hover:border-amber-300"
                }`}>{v === 0 ? "Нет" : `${v}л`}</button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border-2 border-gray-200 hover:border-amber-300 transition-all">
          <input type="checkbox" checked={config.terrace} onChange={e => onChange({ terrace: e.target.checked })} className="accent-amber-500" />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700">Терраса / веранда</span>
          </div>
          {config.terrace && (
            <Input type="number" min={4} max={50} value={config.terraceArea}
              onChange={e => onChange({ terraceArea: parseFloat(e.target.value) || 0 })}
              className="w-20 h-8 text-sm" placeholder="м²" />
          )}
        </label>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium">Управление объектом</p>
          <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border-2 border-gray-200 hover:border-amber-300 transition-all">
            <input type="checkbox" checked={config.foremanIncluded} onChange={e => onChange({ foremanIncluded: e.target.checked })} className="accent-amber-500" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Прораб</span>
              <span className="text-xs text-gray-400 block">Надзор, координация, контроль качества</span>
            </div>
            {config.foremanIncluded && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Input type="number" min={1} max={50} value={config.foremanPct}
                  onChange={e => onChange({ foremanPct: Math.max(1, Math.min(50, parseFloat(e.target.value) || 10)) })}
                  className="w-16 h-8 text-sm text-center" />
                <span className="text-xs text-gray-400">%</span>
              </div>
            )}
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border-2 border-gray-200 hover:border-amber-300 transition-all">
            <input type="checkbox" checked={config.supplierIncluded} onChange={e => onChange({ supplierIncluded: e.target.checked })} className="accent-amber-500" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Снабженец</span>
              <span className="text-xs text-gray-400 block">Закупка материалов, логистика, склад</span>
            </div>
            {config.supplierIncluded && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Input type="number" min={1} max={30} value={config.supplierPct}
                  onChange={e => onChange({ supplierPct: Math.max(1, Math.min(30, parseFloat(e.target.value) || 5)) })}
                  className="w-16 h-8 text-sm text-center" />
                <span className="text-xs text-gray-400">%</span>
              </div>
            )}
          </label>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium">Электрика</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={!config.electricalBasic && !config.electricalFull} onChange={() => onChange({ electricalBasic: false, electricalFull: false })} className="accent-amber-500" />
            <span className="text-sm text-gray-700">Без электрики</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={config.electricalBasic && !config.electricalFull} onChange={() => onChange({ electricalBasic: true, electricalFull: false })} className="accent-amber-500" />
            <span className="text-sm text-gray-700">Базовая (освещение + розетки)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={config.electricalFull} onChange={() => onChange({ electricalBasic: false, electricalFull: true })} className="accent-amber-500" />
            <span className="text-sm text-gray-700">Полная (щиток + разводка + автоматика)</span>
          </label>
        </div>
      </div>
    </>
  );
}