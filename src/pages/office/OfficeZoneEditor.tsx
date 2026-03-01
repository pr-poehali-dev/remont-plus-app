import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { Section, OptionGrid, NumRow, Toggle } from "./OfficeCalcUI";
import {
  ZoneConfig,
  ROOM_TYPES, FINISH_LEVELS, FLOORING_OPTIONS, CEILING_OPTIONS, PARTITION_OPTIONS,
  HEATING_OPTIONS, VENT_OPTIONS, ALARM_OPTIONS, CCTV_OPTIONS, ACCESS_OPTIONS,
  FIRE_PROTECTION_OPTIONS, METAL_FIREPROOF_OPTIONS, WOOD_FIREPROOF_OPTIONS, NETWORK_OPTIONS,
  MATERIALS_SUPPLY,
  fmtPrice,
} from "./officeCalcTypes";

interface Props {
  zone: ZoneConfig;
  onChange: (patch: Partial<Omit<ZoneConfig, "id" | "totalPrice">>) => void;
}

// Переключатель включения/выключения блока
function BlockToggle({
  enabled, onToggle, title, icon, children,
}: {
  enabled: boolean;
  onToggle: () => void;
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border transition-all ${enabled ? "border-gray-200 bg-white" : "border-dashed border-gray-200 bg-gray-50 opacity-60"}`}>
      {/* Заголовок с переключателем */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          enabled ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"
        }`}>
          {enabled && <Icon name="Check" size={11} className="text-white" />}
        </div>
        <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={15} className={enabled ? "text-blue-600" : "text-gray-400"} />
        <span className={`font-semibold text-sm uppercase tracking-wide ${enabled ? "text-gray-800" : "text-gray-400"}`}>{title}</span>
        {!enabled && <span className="ml-auto text-xs text-gray-400">выключен из расчёта</span>}
      </button>
      {/* Содержимое блока (скрываем если выключен) */}
      {enabled && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

export default function OfficeZoneEditor({ zone, onChange }: Props) {
  return (
    <Card className="p-5 space-y-3">

      {/* Тип помещения — всегда виден */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Icon name="Building2" size={15} className="text-blue-600" />
          <span className="font-semibold text-sm uppercase tracking-wide text-gray-800">Тип помещения</span>
        </div>
        <div className="px-4 pb-4 pt-3 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ROOM_TYPES.map(rt => (
              <button key={rt.id} type="button"
                onClick={() => onChange({ roomType: rt.id })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  zone.roomType === rt.id ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 hover:border-blue-400"
                }`}>
                <Icon name={rt.icon as Parameters<typeof Icon>[0]["name"]} size={15} />
                {rt.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Площадь, м²</Label>
              <Input type="number" value={zone.area} min={10} max={50000}
                onChange={e => onChange({ area: Number(e.target.value) || 10 })} />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Высота потолков, м</Label>
              <Input type="number" value={zone.height} min={2.5} max={20} step={0.1}
                onChange={e => onChange({ height: Number(e.target.value) || 3 })} />
            </div>
          </div>
        </div>
      </div>

      {/* ОТДЕЛКА */}
      <BlockToggle enabled={zone.blockFinish} onToggle={() => onChange({ blockFinish: !zone.blockFinish })}
        title="Базовая отделка" icon="Paintbrush">
        <OptionGrid options={FINISH_LEVELS} value={zone.finishLevel} onChange={v => onChange({ finishLevel: v })} />
      </BlockToggle>

      {/* ПОЛЫ */}
      <BlockToggle enabled={zone.blockFlooring} onToggle={() => onChange({ blockFlooring: !zone.blockFlooring })}
        title="Напольное покрытие" icon="Layers">
        <OptionGrid options={FLOORING_OPTIONS} value={zone.flooring} onChange={v => onChange({ flooring: v })} />
      </BlockToggle>

      {/* ПОТОЛОК */}
      <BlockToggle enabled={zone.blockCeiling} onToggle={() => onChange({ blockCeiling: !zone.blockCeiling })}
        title="Потолок" icon="PanelTop">
        <OptionGrid options={CEILING_OPTIONS} value={zone.ceiling} onChange={v => onChange({ ceiling: v })} />
      </BlockToggle>

      {/* ПЕРЕГОРОДКИ */}
      <BlockToggle enabled={zone.blockPartitions} onToggle={() => onChange({ blockPartitions: !zone.blockPartitions })}
        title="Перегородки" icon="Columns2">
        <OptionGrid options={PARTITION_OPTIONS} value={zone.partitions} onChange={v => onChange({ partitions: v })} />
        {zone.partitions !== "none" && (
          <NumRow label="Длина перегородок, п.м." value={zone.partitionLinearM}
            onChange={v => onChange({ partitionLinearM: v })} min={1} max={5000} />
        )}
      </BlockToggle>

      {/* ОТОПЛЕНИЕ */}
      <BlockToggle enabled={zone.blockHeating} onToggle={() => onChange({ blockHeating: !zone.blockHeating })}
        title="Отопление" icon="Thermometer">
        <OptionGrid options={HEATING_OPTIONS} value={zone.heating} onChange={v => onChange({ heating: v })} />
      </BlockToggle>

      {/* ВЕНТИЛЯЦИЯ */}
      <BlockToggle enabled={zone.blockVentilation} onToggle={() => onChange({ blockVentilation: !zone.blockVentilation })}
        title="Вентиляция и кондиционирование" icon="Wind">
        <OptionGrid options={VENT_OPTIONS} value={zone.ventilation} onChange={v => onChange({ ventilation: v })} />
        <NumRow label="Сплит-системы (доп., шт.)" value={zone.airConditioners}
          onChange={v => onChange({ airConditioners: v })} max={200} />
      </BlockToggle>

      {/* ЭЛЕКТРИКА */}
      <BlockToggle enabled={zone.blockElectric} onToggle={() => onChange({ blockElectric: !zone.blockElectric })}
        title="Электрика" icon="Zap">
        <NumRow label="Электроточки (розетки, выключатели)" value={zone.electricPoints}
          onChange={v => onChange({ electricPoints: v })} min={0} max={1000} />
        <Toggle label="Освещение (монтаж + светильники)" value={zone.lighting}
          onChange={v => onChange({ lighting: v })} description={`~${fmtPrice(zone.area * 1800)}`} />
        <Toggle label="ИБП (источник бесперебойного питания)" value={zone.ups}
          onChange={v => onChange({ ups: v })} description="~85 000 ₽ комплект" />
      </BlockToggle>

      {/* СЕТИ */}
      <BlockToggle enabled={zone.blockNetwork} onToggle={() => onChange({ blockNetwork: !zone.blockNetwork })}
        title="Сети (СКС / LAN)" icon="Network">
        <OptionGrid options={NETWORK_OPTIONS} value={zone.networkType} onChange={v => onChange({ networkType: v })} />
      </BlockToggle>

      {/* ОХРАННАЯ СИГНАЛИЗАЦИЯ */}
      <BlockToggle enabled={zone.blockAlarm} onToggle={() => onChange({ blockAlarm: !zone.blockAlarm })}
        title="Охранная сигнализация" icon="ShieldAlert">
        <OptionGrid options={ALARM_OPTIONS} value={zone.alarmType} onChange={v => onChange({ alarmType: v })} />
        {zone.alarmType !== "none" && (
          <NumRow label="Датчики движения/вибрации, шт." value={zone.alarmSensors}
            onChange={v => onChange({ alarmSensors: v })} min={1} max={500} />
        )}
      </BlockToggle>

      {/* ВИДЕОНАБЛЮДЕНИЕ */}
      <BlockToggle enabled={zone.blockCCTV} onToggle={() => onChange({ blockCCTV: !zone.blockCCTV })}
        title="Видеонаблюдение (CCTV)" icon="Camera">
        <OptionGrid options={CCTV_OPTIONS} value={zone.cctvType} onChange={v => onChange({ cctvType: v })} />
        {zone.cctvType !== "none" && (
          <NumRow label="Камеры, шт." value={zone.cctvCameras}
            onChange={v => onChange({ cctvCameras: v })} min={1} max={500} />
        )}
      </BlockToggle>

      {/* СКУД */}
      <BlockToggle enabled={zone.blockAccess} onToggle={() => onChange({ blockAccess: !zone.blockAccess })}
        title="Контроль доступа (СКУД)" icon="KeyRound">
        <OptionGrid options={ACCESS_OPTIONS} value={zone.accessType} onChange={v => onChange({ accessType: v })} />
        {zone.accessType !== "none" && (
          <NumRow label="Дверей с контролем доступа" value={zone.accessDoors}
            onChange={v => onChange({ accessDoors: v })} min={1} max={200} />
        )}
      </BlockToggle>

      {/* ПОЖАРНАЯ БЕЗОПАСНОСТЬ */}
      <div className={`rounded-xl border-2 transition-all ${zone.blockFire ? "border-red-200 bg-red-50/40" : "border-dashed border-red-100 bg-gray-50 opacity-60"}`}>
        <button
          type="button"
          onClick={() => onChange({ blockFire: !zone.blockFire })}
          className="w-full flex items-center gap-3 px-4 py-3 text-left"
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            zone.blockFire ? "bg-red-600 border-red-600" : "border-gray-300 bg-white"
          }`}>
            {zone.blockFire && <Icon name="Check" size={11} className="text-white" />}
          </div>
          <Icon name="Flame" size={16} className={zone.blockFire ? "text-red-600" : "text-gray-400"} />
          <span className={`font-bold text-sm uppercase tracking-wide ${zone.blockFire ? "text-red-700" : "text-gray-400"}`}>
            Пожарная безопасность
          </span>
          {!zone.blockFire && <span className="ml-auto text-xs text-gray-400">выключена из расчёта</span>}
        </button>

        {zone.blockFire && (
          <div className="px-4 pb-4 space-y-5 border-t border-red-100 pt-3">
            <Section title="Пожарная сигнализация (АПС)" icon="BellRing">
              <Toggle label="Монтаж автоматической пожарной сигнализации"
                value={zone.fireSignaling} onChange={v => onChange({ fireSignaling: v })}
                description="Пульт, прибор, разводка кабелей" />
              {zone.fireSignaling && (
                <NumRow label="Пожарные датчики (дымовые/тепловые), шт." value={zone.fireSensors}
                  onChange={v => onChange({ fireSensors: v })} min={1} max={2000} />
              )}
            </Section>

            <Section title="Система пожаротушения" icon="Droplets">
              <OptionGrid options={FIRE_PROTECTION_OPTIONS} value={zone.fireProtection}
                onChange={v => onChange({ fireProtection: v })} />
              {(zone.fireProtection === "sprinkler" || zone.fireProtection === "gas" || zone.fireProtection === "powder") && (
                <NumRow label="Насадки/головки/модули, шт." value={zone.fireSprinklerHeads}
                  onChange={v => onChange({ fireSprinklerHeads: v })} min={1} max={5000} />
              )}
            </Section>

            <Section title="Огнезащита металлических конструкций" icon="Shield">
              <p className="text-xs text-gray-500 -mt-1">Покрытие несущих конструкций, балок, ферм огнезащитным составом (ГОСТ Р 53295)</p>
              <OptionGrid options={METAL_FIREPROOF_OPTIONS.slice(0, 4)} value={zone.metalFireProof}
                onChange={v => onChange({ metalFireProof: v })} />
              <OptionGrid options={METAL_FIREPROOF_OPTIONS.slice(4)} value={zone.metalFireProof}
                onChange={v => onChange({ metalFireProof: v })} cols={3} />
              {zone.metalFireProof !== "none" && (
                <NumRow label="Площадь металлоконструкций, м²" value={zone.metalFireProofM2}
                  onChange={v => onChange({ metalFireProofM2: v })} min={1} max={50000} />
              )}
            </Section>

            <Section title="Огнезащита деревянных конструкций" icon="TreePine">
              <p className="text-xs text-gray-500 -mt-1">Обработка стропил, перекрытий, элементов кровли огнебиозащитным составом</p>
              <OptionGrid options={WOOD_FIREPROOF_OPTIONS} value={zone.woodFireProof}
                onChange={v => onChange({ woodFireProof: v })} cols={3} />
              {zone.woodFireProof !== "none" && (
                <NumRow label="Площадь деревянных конструкций, м²" value={zone.woodFireProofM2}
                  onChange={v => onChange({ woodFireProofM2: v })} min={1} max={50000} />
              )}
            </Section>

            <Section title="Противопожарные двери и краны" icon="DoorOpen">
              <NumRow label="Противопожарные двери (EI60/EI90), шт." value={zone.fireDoors}
                onChange={v => onChange({ fireDoors: v })} min={0} max={200} />
              <NumRow label="Огнетушители (порошковые/углекислотные)" value={zone.fireExtinguishers}
                onChange={v => onChange({ fireExtinguishers: v })} min={0} max={500} />
              <Toggle label="Проверка и перезарядка пожарных кранов и гидрантов"
                value={zone.fireHydrantCheck} onChange={v => onChange({ fireHydrantCheck: v })}
                description="Испытание, составление актов" />
              {zone.fireHydrantCheck && (
                <NumRow label="Пожарные краны / гидранты, шт." value={zone.fireHydrantCount}
                  onChange={v => onChange({ fireHydrantCount: v })} min={1} max={200} />
              )}
            </Section>
          </div>
        )}
      </div>

      {/* МАТЕРИАЛЫ */}
      <BlockToggle enabled={zone.blockMaterials} onToggle={() => onChange({ blockMaterials: !zone.blockMaterials })}
        title="Материалы" icon="Package">
        <p className="text-xs text-gray-500 -mt-1 mb-1">Кто поставляет материалы — влияет на итоговую сумму</p>
        <div className="space-y-2">
          {MATERIALS_SUPPLY.map(m => (
            <button key={m.id} type="button"
              onClick={() => onChange({ materialsSupply: m.id })}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                zone.materialsSupply === m.id ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 hover:border-blue-400"
              }`}>
              <div className="flex-1">
                <div className="text-sm font-medium">{m.label}</div>
                <div className={`text-xs mt-0.5 ${zone.materialsSupply === m.id ? "text-blue-100" : "text-gray-400"}`}>{m.description}</div>
              </div>
              {m.coeff > 0 && (
                <span className={`text-xs font-bold mt-0.5 ${zone.materialsSupply === m.id ? "text-white" : "text-blue-600"}`}>
                  +{Math.round(m.coeff * 100)}%
                </span>
              )}
            </button>
          ))}
        </div>
        {zone.materialsSupply !== "labor_only" && zone.materialsSupply !== "customer" && (
          <div className="flex items-center gap-3 pt-1">
            <span className="text-sm text-gray-600 flex-1">Коэффициент материалов</span>
            <Input
              type="number" value={zone.materialsCoeffCustom} min={0.5} max={3} step={0.05}
              onChange={e => onChange({ materialsCoeffCustom: Math.max(0.5, Math.min(3, Number(e.target.value) || 1)) })}
              className="w-20 h-7 text-center text-sm"
            />
          </div>
        )}
      </BlockToggle>

      {/* ПРОРАБ И СНАБЖЕНЕЦ */}
      <BlockToggle enabled={zone.blockStaff} onToggle={() => onChange({ blockStaff: !zone.blockStaff })}
        title="Прораб и снабженец" icon="HardHat">
        <p className="text-xs text-gray-500 -mt-1 mb-2">Затраты на управление и снабжение — % от суммы работ</p>
        <NumRow
          label="Прораб (технадзор), %"
          value={zone.foremanPct}
          onChange={v => onChange({ foremanPct: v })}
          min={0} max={30}
        />
        <NumRow
          label="Снабженец (логистика), %"
          value={zone.supplyPct}
          onChange={v => onChange({ supplyPct: v })}
          min={0} max={20}
        />
        <div className="text-xs text-gray-400 bg-gray-50 rounded px-3 py-2 mt-1">
          Типовые значения: прораб 5–15%, снабженец 3–8% от стоимости работ
        </div>
      </BlockToggle>

    </Card>
  );
}