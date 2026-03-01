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
  fmtPrice,
} from "./officeCalcTypes";

interface Props {
  zone: ZoneConfig;
  onChange: (patch: Partial<Omit<ZoneConfig, "id" | "totalPrice">>) => void;
}

export default function OfficeZoneEditor({ zone, onChange }: Props) {
  return (
    <Card className="p-5 space-y-6">

      {/* Тип помещения */}
      <Section title="Тип помещения" icon="Building2">
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
        <div className="grid grid-cols-2 gap-3 mt-2">
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
      </Section>

      {/* Уровень отделки */}
      <Section title="Уровень отделки" icon="Paintbrush">
        <OptionGrid options={FINISH_LEVELS} value={zone.finishLevel} onChange={v => onChange({ finishLevel: v })} />
      </Section>

      {/* Полы */}
      <Section title="Напольное покрытие" icon="Layers">
        <OptionGrid options={FLOORING_OPTIONS} value={zone.flooring} onChange={v => onChange({ flooring: v })} />
      </Section>

      {/* Потолок */}
      <Section title="Потолок" icon="PanelTop">
        <OptionGrid options={CEILING_OPTIONS} value={zone.ceiling} onChange={v => onChange({ ceiling: v })} />
      </Section>

      {/* Перегородки */}
      <Section title="Перегородки" icon="Columns2">
        <OptionGrid options={PARTITION_OPTIONS} value={zone.partitions} onChange={v => onChange({ partitions: v })} />
        {zone.partitions !== "none" && (
          <NumRow label="Длина перегородок, п.м." value={zone.partitionLinearM}
            onChange={v => onChange({ partitionLinearM: v })} min={1} max={5000} />
        )}
      </Section>

      {/* Отопление */}
      <Section title="Отопление" icon="Thermometer">
        <OptionGrid options={HEATING_OPTIONS} value={zone.heating} onChange={v => onChange({ heating: v })} />
      </Section>

      {/* Вентиляция и кондиционирование */}
      <Section title="Вентиляция и кондиционирование" icon="Wind">
        <OptionGrid options={VENT_OPTIONS} value={zone.ventilation} onChange={v => onChange({ ventilation: v })} />
        <NumRow label="Сплит-системы (доп., шт.)" value={zone.airConditioners}
          onChange={v => onChange({ airConditioners: v })} max={200} />
      </Section>

      {/* Электрика */}
      <Section title="Электрика и сети" icon="Zap">
        <NumRow label="Электроточки (розетки, выключатели)" value={zone.electricPoints}
          onChange={v => onChange({ electricPoints: v })} min={0} max={1000} />
        <Toggle label="Освещение (монтаж + светильники)" value={zone.lighting}
          onChange={v => onChange({ lighting: v })} description={`~${fmtPrice(zone.area * 1800)}`} />
        <Toggle label="ИБП (источник бесперебойного питания)" value={zone.ups}
          onChange={v => onChange({ ups: v })} description="~85 000 ₽ комплект" />
        <Label className="text-xs text-gray-500 block mt-2">Структурированная кабельная сеть (СКС)</Label>
        <OptionGrid options={NETWORK_OPTIONS} value={zone.networkType} onChange={v => onChange({ networkType: v })} />
      </Section>

      {/* Охранная сигнализация */}
      <Section title="Охранная сигнализация" icon="ShieldAlert">
        <OptionGrid options={ALARM_OPTIONS} value={zone.alarmType} onChange={v => onChange({ alarmType: v })} />
        {zone.alarmType !== "none" && (
          <NumRow label="Датчики движения/вибрации, шт." value={zone.alarmSensors}
            onChange={v => onChange({ alarmSensors: v })} min={1} max={500} />
        )}
      </Section>

      {/* Видеонаблюдение */}
      <Section title="Видеонаблюдение (CCTV)" icon="Camera">
        <OptionGrid options={CCTV_OPTIONS} value={zone.cctvType} onChange={v => onChange({ cctvType: v })} />
        {zone.cctvType !== "none" && (
          <NumRow label="Камеры, шт." value={zone.cctvCameras}
            onChange={v => onChange({ cctvCameras: v })} min={1} max={500} />
        )}
      </Section>

      {/* СКУД */}
      <Section title="Контроль доступа (СКУД)" icon="KeyRound">
        <OptionGrid options={ACCESS_OPTIONS} value={zone.accessType} onChange={v => onChange({ accessType: v })} />
        {zone.accessType !== "none" && (
          <NumRow label="Дверей с контролем доступа" value={zone.accessDoors}
            onChange={v => onChange({ accessDoors: v })} min={1} max={200} />
        )}
      </Section>

      {/* ПОЖАРНАЯ БЕЗОПАСНОСТЬ */}
      <div className="rounded-xl border-2 border-red-200 bg-red-50/40 p-4 space-y-5">
        <div className="flex items-center gap-2">
          <Icon name="Flame" size={18} className="text-red-600" />
          <span className="font-bold text-red-700 uppercase tracking-wide text-sm">Пожарная безопасность</span>
        </div>

        {/* Пожарная сигнализация */}
        <Section title="Пожарная сигнализация (АПС)" icon="BellRing">
          <Toggle label="Монтаж автоматической пожарной сигнализации"
            value={zone.fireSignaling} onChange={v => onChange({ fireSignaling: v })}
            description="Пульт, прибор, разводка кабелей" />
          {zone.fireSignaling && (
            <NumRow label="Пожарные датчики (дымовые/тепловые), шт." value={zone.fireSensors}
              onChange={v => onChange({ fireSensors: v })} min={1} max={2000} />
          )}
        </Section>

        {/* Пожаротушение */}
        <Section title="Система пожаротушения" icon="Droplets">
          <OptionGrid options={FIRE_PROTECTION_OPTIONS} value={zone.fireProtection}
            onChange={v => onChange({ fireProtection: v })} />
          {(zone.fireProtection === "sprinkler" || zone.fireProtection === "gas" || zone.fireProtection === "powder") && (
            <NumRow label="Насадки/головки/модули, шт." value={zone.fireSprinklerHeads}
              onChange={v => onChange({ fireSprinklerHeads: v })} min={1} max={5000} />
          )}
        </Section>

        {/* Огнезащита металла */}
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

        {/* Огнезащита дерева */}
        <Section title="Огнезащита деревянных конструкций" icon="TreePine">
          <p className="text-xs text-gray-500 -mt-1">Обработка стропил, перекрытий, элементов кровли огнебиозащитным составом</p>
          <OptionGrid options={WOOD_FIREPROOF_OPTIONS} value={zone.woodFireProof}
            onChange={v => onChange({ woodFireProof: v })} cols={3} />
          {zone.woodFireProof !== "none" && (
            <NumRow label="Площадь деревянных конструкций, м²" value={zone.woodFireProofM2}
              onChange={v => onChange({ woodFireProofM2: v })} min={1} max={50000} />
          )}
        </Section>

        {/* Двери и гидранты */}
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

    </Card>
  );
}
