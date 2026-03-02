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
  MATERIALS_SUPPLY,
  fmtPrice,
} from "./officeCalcTypes";
import OfficeExportPanel, { OfficeExportState, makeExportState } from "./OfficeExportPanel";
import SalesAdvisor from "@/components/SalesAdvisor";
import { REGIONS } from "./officeCalcTypes";

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
  regionId: string;
  onSelectZone: (id: string) => void;
}

export default function OfficeSidebar({ zones, activeId, totalAll, markupPct, regionId, onSelectZone }: Props) {
  const [exportState, setExportState] = useState<OfficeExportState>(makeExportState);
  const handleExportChange = (patch: Partial<OfficeExportState>) =>
    setExportState(prev => ({ ...prev, ...patch }));

  const activeZone = zones.find(z => z.id === activeId) ?? zones[0];
  const az = activeZone;

  const matSupply = MATERIALS_SUPPLY.find(m => m.id === az.materialsSupply) ?? MATERIALS_SUPPLY[0];

  // Базовая сумма работ для расчёта % персонала (приблизительно, без региона)
  const laborBase =
    (az.blockFinish ? FINISH_LEVELS.find(f => f.id === az.finishLevel)!.pricePerM2 * az.area * (ROOM_TYPES.find(r => r.id === az.roomType)?.coeff ?? 1) : 0) +
    (az.blockFlooring ? FLOORING_OPTIONS.find(f => f.id === az.flooring)!.pricePerM2 * az.area : 0) +
    (az.blockCeiling ? CEILING_OPTIONS.find(c => c.id === az.ceiling)!.pricePerM2 * az.area : 0) +
    (az.blockPartitions ? PARTITION_OPTIONS.find(p => p.id === az.partitions)!.pricePerLM * az.partitionLinearM : 0) +
    (az.blockHeating ? HEATING_OPTIONS.find(h => h.id === az.heating)!.pricePerM2 * az.area : 0) +
    (az.blockVentilation ? VENT_OPTIONS.find(v => v.id === az.ventilation)!.pricePerM2 * az.area + az.airConditioners * 28000 : 0) +
    (az.blockElectric ? az.electricPoints * 3500 + (az.lighting ? az.area * 1800 : 0) + (az.ups ? 85000 : 0) : 0) +
    (az.blockNetwork ? NETWORK_OPTIONS.find(n => n.id === az.networkType)!.pricePerM2 * az.area : 0) +
    (az.blockAlarm ? ALARM_OPTIONS.find(a => a.id === az.alarmType)!.priceBase + az.alarmSensors * 4500 : 0) +
    (az.blockCCTV && az.cctvType !== "none" ? CCTV_OPTIONS.find(c => c.id === az.cctvType)!.dvr + CCTV_OPTIONS.find(c => c.id === az.cctvType)!.pricePerCamera * az.cctvCameras : 0) +
    (az.blockAccess && az.accessType !== "none" ? ACCESS_OPTIONS.find(a => a.id === az.accessType)!.panel + ACCESS_OPTIONS.find(a => a.id === az.accessType)!.pricePerDoor * az.accessDoors : 0) +
    (az.blockFire ? (az.fireSignaling ? 45000 + az.fireSensors * 2800 : 0) + az.fireExtinguishers * 3500 + FIRE_PROTECTION_OPTIONS.find(f => f.id === az.fireProtection)!.base + FIRE_PROTECTION_OPTIONS.find(f => f.id === az.fireProtection)!.pricePerHead * az.fireSprinklerHeads + METAL_FIREPROOF_OPTIONS.find(m => m.id === az.metalFireProof)!.pricePerM2 * az.metalFireProofM2 + WOOD_FIREPROOF_OPTIONS.find(w => w.id === az.woodFireProof)!.pricePerM2 * az.woodFireProofM2 + az.fireDoors * 38000 + (az.fireHydrantCheck ? 8500 + az.fireHydrantCount * 3200 : 0) : 0);

  const foremanVal = az.blockStaff ? laborBase * az.foremanPct / 100 : 0;
  const supplyVal  = az.blockStaff ? laborBase * az.supplyPct / 100 : 0;

  const materialsVal = az.blockMaterials && matSupply.coeff > 0
    ? laborBase * matSupply.coeff * az.materialsCoeffCustom
    : 0;

  const breakdown = [
    { label: "Базовая отделка",       enabled: az.blockFinish,      val: FINISH_LEVELS.find(f => f.id === az.finishLevel)!.pricePerM2 * az.area * (ROOM_TYPES.find(r => r.id === az.roomType)?.coeff ?? 1) },
    { label: "Полы",                  enabled: az.blockFlooring,    val: FLOORING_OPTIONS.find(f => f.id === az.flooring)!.pricePerM2 * az.area },
    { label: "Потолок",               enabled: az.blockCeiling,     val: CEILING_OPTIONS.find(c => c.id === az.ceiling)!.pricePerM2 * az.area },
    { label: "Перегородки",           enabled: az.blockPartitions,  val: PARTITION_OPTIONS.find(p => p.id === az.partitions)!.pricePerLM * az.partitionLinearM },
    { label: "Отопление",             enabled: az.blockHeating,     val: HEATING_OPTIONS.find(h => h.id === az.heating)!.pricePerM2 * az.area },
    { label: "Вентиляция + сплиты",   enabled: az.blockVentilation, val: VENT_OPTIONS.find(v => v.id === az.ventilation)!.pricePerM2 * az.area + az.airConditioners * 28000 },
    { label: "Электрика",             enabled: az.blockElectric,    val: az.electricPoints * 3500 + (az.lighting ? az.area * 1800 : 0) + (az.ups ? 85000 : 0) },
    { label: "Сети (СКС)",            enabled: az.blockNetwork,     val: NETWORK_OPTIONS.find(n => n.id === az.networkType)!.pricePerM2 * az.area },
    { label: "Сигнализация",          enabled: az.blockAlarm,       val: ALARM_OPTIONS.find(a => a.id === az.alarmType)!.priceBase + az.alarmSensors * 4500 },
    { label: "Видеонаблюдение",       enabled: az.blockCCTV && az.cctvType !== "none", val: az.cctvType !== "none" ? CCTV_OPTIONS.find(c => c.id === az.cctvType)!.dvr + CCTV_OPTIONS.find(c => c.id === az.cctvType)!.pricePerCamera * az.cctvCameras : 0 },
    { label: "СКУД",                  enabled: az.blockAccess && az.accessType !== "none", val: az.accessType !== "none" ? ACCESS_OPTIONS.find(a => a.id === az.accessType)!.panel + ACCESS_OPTIONS.find(a => a.id === az.accessType)!.pricePerDoor * az.accessDoors : 0 },
    { label: "Пожарная безопасность", enabled: az.blockFire, val: (az.fireSignaling ? 45000 + az.fireSensors * 2800 : 0) + az.fireExtinguishers * 3500 + FIRE_PROTECTION_OPTIONS.find(f => f.id === az.fireProtection)!.base + FIRE_PROTECTION_OPTIONS.find(f => f.id === az.fireProtection)!.pricePerHead * az.fireSprinklerHeads + METAL_FIREPROOF_OPTIONS.find(m => m.id === az.metalFireProof)!.pricePerM2 * az.metalFireProofM2 + WOOD_FIREPROOF_OPTIONS.find(w => w.id === az.woodFireProof)!.pricePerM2 * az.woodFireProofM2 + az.fireDoors * 38000 + (az.fireHydrantCheck ? 8500 + az.fireHydrantCount * 3200 : 0) },
    { label: `Прораб (${az.foremanPct}%)`,    enabled: az.blockStaff && az.foremanPct > 0, val: foremanVal },
    { label: `Снабженец (${az.supplyPct}%)`,  enabled: az.blockStaff && az.supplyPct > 0,  val: supplyVal },
    { label: `Материалы (${matSupply.label.toLowerCase()})`, enabled: az.blockMaterials && matSupply.coeff > 0, val: materialsVal },
  ].filter(r => r.enabled && r.val > 0);

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
          <span className="font-semibold text-gray-800 text-sm">«{az.name}» — детали</span>
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
            <span className="text-blue-600">{fmtPrice(az.totalPrice)}</span>
          </div>
        </div>
      </Card>

      {/* Экспорт / Смета / КП */}
      <OfficeExportPanel
        exportState={exportState}
        onChange={handleExportChange}
        zones={zones}
        totalAll={totalAll}
        regionId={regionId}
        markupPct={markupPct}
      />

      {/* Советник по продажам — Алексей */}
      <SalesAdvisor
        context={{
          calcType: "Офисный ремонт",
          totalPrice: totalAll,
          regionLabel: REGIONS.find(r => r.id === regionId)?.label,
          zones: zones.map(z => ({ name: z.name, area: z.area, price: z.totalPrice })),
          details: markupPct > 0 ? `Наценка ${markupPct}%` : undefined,
        }}
      />

      {/* Форма заявки */}
      <LeadForm totalPrice={totalAll} />

      <p className="text-xs text-center text-gray-400">
        Расчёт ориентировочный. Точную стоимость определит выезд специалиста.
      </p>
    </div>
  );
}