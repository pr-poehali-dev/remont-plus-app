import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { trackCalcEvent } from "@/hooks/useCalcTracking";
import {
  ZoneConfig,
  ROOM_TYPES, FINISH_LEVELS, FLOORING_OPTIONS, CEILING_OPTIONS, PARTITION_OPTIONS,
  HEATING_OPTIONS, VENT_OPTIONS, ALARM_OPTIONS, CCTV_OPTIONS, ACCESS_OPTIONS,
  FIRE_PROTECTION_OPTIONS, METAL_FIREPROOF_OPTIONS, WOOD_FIREPROOF_OPTIONS, NETWORK_OPTIONS,
  fmtPrice,
} from "./officeCalcTypes";

// ─── LEAD FORM ────────────────────────────────────────────────────────────────

function LeadForm({ totalPrice }: { totalPrice: number }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!phone) return;
    setLoading(true);
    trackCalcEvent("office", "lead");
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <Card className="p-6 text-center border-green-200 bg-green-50">
        <Icon name="CheckCircle" size={40} className="text-green-500 mx-auto mb-3" />
        <div className="font-semibold text-gray-800 mb-1">Заявка отправлена!</div>
        <div className="text-sm text-gray-500">Наш специалист свяжется с вами в течение 30 минут</div>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="PhoneCall" size={16} className="text-blue-600" />
        <span className="font-semibold text-gray-800">Получить коммерческое предложение</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Наш сметчик перезвонит и уточнит детали — итоговая цена может отличаться
      </p>
      <div className="space-y-2.5">
        <Input placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} className="bg-white" />
        <Input placeholder="Телефон *" value={phone} onChange={e => setPhone(e.target.value)} className="bg-white" required />
        <Input placeholder="Комментарий (адрес объекта, сроки...)" value={comment} onChange={e => setComment(e.target.value)} className="bg-white" />
        <Button onClick={handleSend} disabled={!phone || loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : null}
          Отправить заявку — {fmtPrice(totalPrice)}
        </Button>
      </div>
    </Card>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

interface Props {
  zones: ZoneConfig[];
  activeId: string;
  totalAll: number;
  markupPct: number;
  onSelectZone: (id: string) => void;
}

export default function OfficeSidebar({ zones, activeId, totalAll, markupPct, onSelectZone }: Props) {
  const activeZone = zones.find(z => z.id === activeId) ?? zones[0];

  const breakdown = [
    { label: "Базовая отделка", val: FINISH_LEVELS.find(f => f.id === activeZone.finishLevel)!.pricePerM2 * activeZone.area * (ROOM_TYPES.find(r => r.id === activeZone.roomType)?.coeff ?? 1) },
    { label: "Полы", val: FLOORING_OPTIONS.find(f => f.id === activeZone.flooring)!.pricePerM2 * activeZone.area },
    { label: "Потолок", val: CEILING_OPTIONS.find(c => c.id === activeZone.ceiling)!.pricePerM2 * activeZone.area },
    { label: "Перегородки", val: PARTITION_OPTIONS.find(p => p.id === activeZone.partitions)!.pricePerLM * activeZone.partitionLinearM },
    { label: "Отопление", val: HEATING_OPTIONS.find(h => h.id === activeZone.heating)!.pricePerM2 * activeZone.area },
    { label: "Вентиляция", val: VENT_OPTIONS.find(v => v.id === activeZone.ventilation)!.pricePerM2 * activeZone.area },
    { label: "Сплиты", val: activeZone.airConditioners * 28000 },
    { label: "Электрика", val: activeZone.electricPoints * 3500 + (activeZone.lighting ? activeZone.area * 1800 : 0) + (activeZone.ups ? 85000 : 0) },
    { label: "Сети (СКС)", val: NETWORK_OPTIONS.find(n => n.id === activeZone.networkType)!.pricePerM2 * activeZone.area },
    { label: "Сигнализация", val: ALARM_OPTIONS.find(a => a.id === activeZone.alarmType)!.priceBase + activeZone.alarmSensors * 4500 },
    { label: "Видеонаблюдение", val: activeZone.cctvType !== "none" ? (CCTV_OPTIONS.find(c => c.id === activeZone.cctvType)!.dvr + CCTV_OPTIONS.find(c => c.id === activeZone.cctvType)!.pricePerCamera * activeZone.cctvCameras) : 0 },
    { label: "СКУД", val: activeZone.accessType !== "none" ? (ACCESS_OPTIONS.find(a => a.id === activeZone.accessType)!.panel + ACCESS_OPTIONS.find(a => a.id === activeZone.accessType)!.pricePerDoor * activeZone.accessDoors) : 0 },
    { label: "Пожарная сигнализация", val: activeZone.fireSignaling ? (45000 + activeZone.fireSensors * 2800) : 0 },
    { label: "Огнетушители", val: activeZone.fireExtinguishers * 3500 },
    { label: "Пожаротушение", val: FIRE_PROTECTION_OPTIONS.find(f => f.id === activeZone.fireProtection)!.base + FIRE_PROTECTION_OPTIONS.find(f => f.id === activeZone.fireProtection)!.pricePerHead * activeZone.fireSprinklerHeads },
    { label: "Огнезащита металла", val: METAL_FIREPROOF_OPTIONS.find(m => m.id === activeZone.metalFireProof)!.pricePerM2 * activeZone.metalFireProofM2 },
    { label: "Огнезащита дерева", val: WOOD_FIREPROOF_OPTIONS.find(w => w.id === activeZone.woodFireProof)!.pricePerM2 * activeZone.woodFireProofM2 },
    { label: "Прот/пож. двери", val: activeZone.fireDoors * 38000 },
    { label: "Проверка кранов/гидрантов", val: activeZone.fireHydrantCheck ? (8500 + activeZone.fireHydrantCount * 3200) : 0 },
  ].filter(r => r.val > 0);

  return (
    <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">

      {/* Итог по зонам */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="BarChart3" size={15} className="text-gray-400" />
          <span className="font-semibold text-gray-800 text-sm">Сводка по объекту</span>
        </div>
        <div className="space-y-2">
          {zones.map(z => (
            <div key={z.id} onClick={() => onSelectZone(z.id)}
              className={`flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeId === z.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
              }`}>
              <div>
                <div className="text-sm font-medium text-gray-800">{z.name}</div>
                <div className="text-xs text-gray-400">{z.area} м² · {ROOM_TYPES.find(r => r.id === z.roomType)?.label}</div>
              </div>
              <div className="text-sm font-bold text-blue-600">{fmtPrice(z.totalPrice)}</div>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between items-center">
          <span className="font-bold text-gray-800">ИТОГО</span>
          <span className="text-xl font-bold text-blue-600">{fmtPrice(totalAll)}</span>
        </div>
        {markupPct > 0 && (
          <div className="text-xs text-amber-600 text-right mt-1">вкл. наценку {markupPct}%</div>
        )}
      </Card>

      {/* Разбивка активной зоны */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="List" size={15} className="text-gray-400" />
          <span className="font-semibold text-gray-800 text-sm">«{activeZone.name}» — детали</span>
        </div>
        <div className="space-y-1 text-xs">
          {breakdown.map(r => (
            <div key={r.label} className="flex justify-between text-gray-600">
              <span>{r.label}</span>
              <span className="font-medium">{fmtPrice(Math.round(r.val))}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-gray-800">
            <span>Итого зона</span>
            <span className="text-blue-600">{fmtPrice(activeZone.totalPrice)}</span>
          </div>
        </div>
      </Card>

      {/* Форма заявки */}
      <LeadForm totalPrice={totalAll} />

      <p className="text-xs text-center text-gray-400">
        Расчёт ориентировочный. Точную стоимость определит выезд специалиста.
      </p>
    </div>
  );
}
