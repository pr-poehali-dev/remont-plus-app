import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import { trackCalcEvent } from "@/hooks/useCalcTracking";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type RoomType = "office" | "warehouse" | "retail" | "restaurant" | "medical" | "production";
type FinishLevel = "economy" | "standard" | "premium" | "luxury";
type HeatingType = "none" | "radiator" | "underfloor" | "vrf" | "fancoil";
type VentType = "none" | "supply_exhaust" | "hvac" | "split" | "precision";
type AlarmType = "none" | "basic" | "gsm" | "smart" | "perimeter";
type FireProtectionType = "none" | "signaling" | "sprinkler" | "gas" | "powder";
type MetalFireProofType = "none" | "R15" | "R30" | "R45" | "R60" | "R90" | "R120";
type WoodFireProofType = "none" | "group1" | "group2" | "group3";
type NetworkType = "none" | "basic_lan" | "structured" | "enterprise";
type AccessType = "none" | "card" | "biometric" | "multi_zone";
type CCTVType = "none" | "basic" | "ip_hd" | "ip_4k" | "analytics";
type FlooringType = "none" | "linoleum" | "carpet" | "porcelain" | "epoxy" | "raised_floor";
type CeilingType = "none" | "armstrong" | "stretch" | "gypsum" | "grillato" | "exposed";
type PartitionType = "none" | "gypsum" | "glass" | "glass_full" | "mobile";

interface ZoneConfig {
  id: string;
  name: string;
  roomType: RoomType;
  area: number;
  height: number;
  finishLevel: FinishLevel;
  // Отделка
  flooring: FlooringType;
  ceiling: CeilingType;
  partitions: PartitionType;
  partitionLinearM: number;
  // Инженерные
  heating: HeatingType;
  ventilation: VentType;
  airConditioners: number;
  // Электрика
  electricPoints: number;
  lighting: boolean;
  ups: boolean;
  networkType: NetworkType;
  // Безопасность
  alarmType: AlarmType;
  alarmSensors: number;
  cctvType: CCTVType;
  cctvCameras: number;
  accessType: AccessType;
  accessDoors: number;
  // Противопожарка
  fireSignaling: boolean;
  fireSensors: number;
  fireExtinguishers: number;
  fireProtection: FireProtectionType;
  fireSprinklerHeads: number;
  metalFireProof: MetalFireProofType;
  metalFireProofM2: number;
  woodFireProof: WoodFireProofType;
  woodFireProofM2: number;
  fireDoors: number;
  fireHydrantCheck: boolean;
  fireHydrantCount: number;
  // Итог
  totalPrice: number;
}

// ─── СПРАВОЧНИКИ ──────────────────────────────────────────────────────────────

const ROOM_TYPES: { id: RoomType; label: string; icon: string; coeff: number }[] = [
  { id: "office", label: "Офис", icon: "Briefcase", coeff: 1.0 },
  { id: "warehouse", label: "Склад", icon: "Warehouse", coeff: 0.75 },
  { id: "retail", label: "Торговый зал", icon: "ShoppingBag", coeff: 1.1 },
  { id: "restaurant", label: "Ресторан/кафе", icon: "UtensilsCrossed", coeff: 1.25 },
  { id: "medical", label: "Медицинский", icon: "Stethoscope", coeff: 1.4 },
  { id: "production", label: "Производство", icon: "Factory", coeff: 0.85 },
];

const FINISH_LEVELS: { id: FinishLevel; label: string; pricePerM2: number }[] = [
  { id: "economy", label: "Эконом", pricePerM2: 3500 },
  { id: "standard", label: "Стандарт", pricePerM2: 6500 },
  { id: "premium", label: "Премиум", pricePerM2: 12000 },
  { id: "luxury", label: "Люкс", pricePerM2: 22000 },
];

const FLOORING_OPTIONS: { id: FlooringType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без полов", pricePerM2: 0 },
  { id: "linoleum", label: "Линолеум коммерческий", pricePerM2: 850 },
  { id: "carpet", label: "Ковролин", pricePerM2: 1100 },
  { id: "porcelain", label: "Керамогранит", pricePerM2: 2400 },
  { id: "epoxy", label: "Наливной эпоксидный пол", pricePerM2: 3200 },
  { id: "raised_floor", label: "Фальш-пол (raised floor)", pricePerM2: 5500 },
];

const CEILING_OPTIONS: { id: CeilingType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без потолка", pricePerM2: 0 },
  { id: "armstrong", label: "Армстронг (подвесной)", pricePerM2: 1200 },
  { id: "stretch", label: "Натяжной потолок", pricePerM2: 1800 },
  { id: "gypsum", label: "ГКЛ (гипсокартон)", pricePerM2: 2100 },
  { id: "grillato", label: "Грильято (решётчатый)", pricePerM2: 2800 },
  { id: "exposed", label: "Открытый (без отделки)", pricePerM2: 400 },
];

const PARTITION_OPTIONS: { id: PartitionType; label: string; pricePerLM: number }[] = [
  { id: "none", label: "Без перегородок", pricePerLM: 0 },
  { id: "gypsum", label: "Гипсокартон", pricePerLM: 4500 },
  { id: "glass", label: "Стеклянная (рамочная)", pricePerLM: 18000 },
  { id: "glass_full", label: "Стеклянная (цельная)", pricePerLM: 28000 },
  { id: "mobile", label: "Мобильная (складная)", pricePerLM: 35000 },
];

const HEATING_OPTIONS: { id: HeatingType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без отопления", pricePerM2: 0 },
  { id: "radiator", label: "Радиаторное", pricePerM2: 1800 },
  { id: "underfloor", label: "Тёплый пол электрический", pricePerM2: 2500 },
  { id: "fancoil", label: "Фанкойлы (2-трубные)", pricePerM2: 4200 },
  { id: "vrf", label: "VRF/VRV-система", pricePerM2: 7500 },
];

const VENT_OPTIONS: { id: VentType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без вентиляции", pricePerM2: 0 },
  { id: "supply_exhaust", label: "Приточно-вытяжная", pricePerM2: 2200 },
  { id: "hvac", label: "Центральный кондиционер (HVAC)", pricePerM2: 4800 },
  { id: "split", label: "Сплит-системы", pricePerM2: 1600 },
  { id: "precision", label: "Прецизионное кондиционирование", pricePerM2: 9500 },
];

const ALARM_OPTIONS: { id: AlarmType; label: string; priceBase: number }[] = [
  { id: "none", label: "Без сигнализации", priceBase: 0 },
  { id: "basic", label: "Базовая охранная", priceBase: 25000 },
  { id: "gsm", label: "GSM-сигнализация", priceBase: 45000 },
  { id: "smart", label: "Smart (с приложением)", priceBase: 75000 },
  { id: "perimeter", label: "Периметровая охрана", priceBase: 120000 },
];

const CCTV_OPTIONS: { id: CCTVType; label: string; pricePerCamera: number; dvr: number }[] = [
  { id: "none", label: "Без видеонаблюдения", pricePerCamera: 0, dvr: 0 },
  { id: "basic", label: "Аналоговое (AHD)", pricePerCamera: 5500, dvr: 15000 },
  { id: "ip_hd", label: "IP-камеры HD (2 Мп)", pricePerCamera: 9000, dvr: 25000 },
  { id: "ip_4k", label: "IP-камеры 4K (8 Мп)", pricePerCamera: 18000, dvr: 45000 },
  { id: "analytics", label: "IP + видеоаналитика", pricePerCamera: 28000, dvr: 65000 },
];

const ACCESS_OPTIONS: { id: AccessType; label: string; pricePerDoor: number; panel: number }[] = [
  { id: "none", label: "Без СКУД", pricePerDoor: 0, panel: 0 },
  { id: "card", label: "Карточный доступ (RFID)", pricePerDoor: 18000, panel: 35000 },
  { id: "biometric", label: "Биометрический (отпечаток)", pricePerDoor: 35000, panel: 45000 },
  { id: "multi_zone", label: "Многозонный + интеграция", pricePerDoor: 55000, panel: 80000 },
];

const FIRE_PROTECTION_OPTIONS: { id: FireProtectionType; label: string; pricePerHead: number; base: number }[] = [
  { id: "none", label: "Без пожаротушения", pricePerHead: 0, base: 0 },
  { id: "signaling", label: "Только сигнализация", pricePerHead: 0, base: 55000 },
  { id: "sprinkler", label: "Водяное спринклерное", pricePerHead: 4500, base: 80000 },
  { id: "gas", label: "Газовое пожаротушение", pricePerHead: 12000, base: 150000 },
  { id: "powder", label: "Порошковое (склады)", pricePerHead: 8000, base: 90000 },
];

const METAL_FIREPROOF_OPTIONS: { id: MetalFireProofType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без огнезащиты металла", pricePerM2: 0 },
  { id: "R15", label: "R15 — 15 минут (покрытие)", pricePerM2: 280 },
  { id: "R30", label: "R30 — 30 минут", pricePerM2: 420 },
  { id: "R45", label: "R45 — 45 минут", pricePerM2: 620 },
  { id: "R60", label: "R60 — 60 минут (ГОСТ)", pricePerM2: 850 },
  { id: "R90", label: "R90 — 90 минут", pricePerM2: 1200 },
  { id: "R120", label: "R120 — 120 минут (max)", pricePerM2: 1700 },
];

const WOOD_FIREPROOF_OPTIONS: { id: WoodFireProofType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без огнезащиты дерева", pricePerM2: 0 },
  { id: "group1", label: "I группа — огнезащищённые (трудносгораемые)", pricePerM2: 380 },
  { id: "group2", label: "II группа — трудновоспламеняемые", pricePerM2: 220 },
  { id: "group3", label: "III группа — трудновоспламеняемая обработка", pricePerM2: 140 },
];

const NETWORK_OPTIONS: { id: NetworkType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без СКС", pricePerM2: 0 },
  { id: "basic_lan", label: "Базовая сеть (Cat5e)", pricePerM2: 800 },
  { id: "structured", label: "СКС Cat6a + патч-панели", pricePerM2: 1600 },
  { id: "enterprise", label: "Enterprise (Cat7 + WiFi 6)", pricePerM2: 3200 },
];

const REGIONS: { id: string; label: string; coeff: number }[] = [
  { id: "moscow", label: "Москва и МО", coeff: 1.0 },
  { id: "spb", label: "Санкт-Петербург", coeff: 0.92 },
  { id: "krasnodar", label: "Краснодарский край", coeff: 0.78 },
  { id: "ekb", label: "Екатеринбург", coeff: 0.82 },
  { id: "nsk", label: "Новосибирск", coeff: 0.76 },
  { id: "kazan", label: "Казань", coeff: 0.8 },
  { id: "other", label: "Другой регион", coeff: 0.75 },
];

// ─── CALCULATION ──────────────────────────────────────────────────────────────

function calcPrice(z: ZoneConfig, regionId: string, markupPct: number): number {
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[0];
  const room = ROOM_TYPES.find(r => r.id === z.roomType) ?? ROOM_TYPES[0];
  const finish = FINISH_LEVELS.find(f => f.id === z.finishLevel) ?? FINISH_LEVELS[1];
  const flooring = FLOORING_OPTIONS.find(f => f.id === z.flooring) ?? FLOORING_OPTIONS[0];
  const ceiling = CEILING_OPTIONS.find(c => c.id === z.ceiling) ?? CEILING_OPTIONS[0];
  const partition = PARTITION_OPTIONS.find(p => p.id === z.partitions) ?? PARTITION_OPTIONS[0];
  const heating = HEATING_OPTIONS.find(h => h.id === z.heating) ?? HEATING_OPTIONS[0];
  const vent = VENT_OPTIONS.find(v => v.id === z.ventilation) ?? VENT_OPTIONS[0];
  const alarm = ALARM_OPTIONS.find(a => a.id === z.alarmType) ?? ALARM_OPTIONS[0];
  const cctv = CCTV_OPTIONS.find(c => c.id === z.cctvType) ?? CCTV_OPTIONS[0];
  const access = ACCESS_OPTIONS.find(a => a.id === z.accessType) ?? ACCESS_OPTIONS[0];
  const fireProt = FIRE_PROTECTION_OPTIONS.find(f => f.id === z.fireProtection) ?? FIRE_PROTECTION_OPTIONS[0];
  const metalFP = METAL_FIREPROOF_OPTIONS.find(m => m.id === z.metalFireProof) ?? METAL_FIREPROOF_OPTIONS[0];
  const woodFP = WOOD_FIREPROOF_OPTIONS.find(w => w.id === z.woodFireProof) ?? WOOD_FIREPROOF_OPTIONS[0];
  const network = NETWORK_OPTIONS.find(n => n.id === z.networkType) ?? NETWORK_OPTIONS[0];

  let total = 0;

  // Базовая отделка
  total += finish.pricePerM2 * z.area * room.coeff;
  // Полы
  total += flooring.pricePerM2 * z.area;
  // Потолок
  total += ceiling.pricePerM2 * z.area;
  // Перегородки
  total += partition.pricePerLM * z.partitionLinearM;
  // Отопление
  total += heating.pricePerM2 * z.area;
  // Вентиляция
  total += vent.pricePerM2 * z.area;
  // Кондиционеры (сплиты доп.)
  total += z.airConditioners * 28000;
  // Электрика — точки
  total += z.electricPoints * 3500;
  // Освещение
  if (z.lighting) total += z.area * 1800;
  // ИБП
  if (z.ups) total += 85000;
  // СКС / сеть
  total += network.pricePerM2 * z.area;
  // Охранная сигнализация
  total += alarm.priceBase + z.alarmSensors * 4500;
  // Видеонаблюдение
  if (z.cctvType !== "none") total += cctv.dvr + cctv.pricePerCamera * z.cctvCameras;
  // СКУД
  if (z.accessType !== "none") total += access.panel + access.pricePerDoor * z.accessDoors;
  // Пожарная сигнализация (датчики)
  if (z.fireSignaling) total += 45000 + z.fireSensors * 2800;
  // Огнетушители
  total += z.fireExtinguishers * 3500;
  // Система пожаротушения
  total += fireProt.base + fireProt.pricePerHead * z.fireSprinklerHeads;
  // Огнезащита металла
  total += metalFP.pricePerM2 * z.metalFireProofM2;
  // Огнезащита дерева
  total += woodFP.pricePerM2 * z.woodFireProofM2;
  // Противопожарные двери
  total += z.fireDoors * 38000;
  // Проверка пожарных кранов/гидрантов
  if (z.fireHydrantCheck) total += 8500 + z.fireHydrantCount * 3200;

  // Регион
  total *= region.coeff;
  // Наценка
  total *= 1 + markupPct / 100;

  return Math.round(total);
}

function makeZone(name = ""): ZoneConfig {
  return {
    id: `off-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    roomType: "office",
    area: 100,
    height: 3,
    finishLevel: "standard",
    flooring: "porcelain",
    ceiling: "armstrong",
    partitions: "gypsum",
    partitionLinearM: 20,
    heating: "radiator",
    ventilation: "supply_exhaust",
    airConditioners: 2,
    electricPoints: 20,
    lighting: true,
    ups: false,
    networkType: "structured",
    alarmType: "gsm",
    alarmSensors: 8,
    cctvType: "ip_hd",
    cctvCameras: 4,
    accessType: "card",
    accessDoors: 2,
    fireSignaling: true,
    fireSensors: 10,
    fireExtinguishers: 4,
    fireProtection: "signaling",
    fireSprinklerHeads: 0,
    metalFireProof: "none",
    metalFireProofM2: 0,
    woodFireProof: "none",
    woodFireProofM2: 0,
    fireDoors: 1,
    fireHydrantCheck: false,
    fireHydrantCount: 0,
    totalPrice: 0,
  };
}

function fmtPrice(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}

// ─── SECTION COMPONENT ────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b">
        <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={16} className="text-blue-600" />
        <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{title}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function OptionGrid<T extends string>({
  options, value, onChange, cols = 2,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  cols?: 2 | 3;
}) {
  return (
    <div className={`grid gap-2 ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {options.map(o => (
        <button
          key={o.id} type="button"
          onClick={() => onChange(o.id)}
          className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all ${
            value === o.id
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-400"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function NumRow({ label, value, onChange, min = 0, max = 9999 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-600 flex-1">{label}</span>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm">−</button>
        <Input
          type="number" value={value} min={min} max={max}
          onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
          className="w-16 h-7 text-center text-sm px-1"
        />
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm">+</button>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange, description }: {
  label: string; value: boolean; onChange: (v: boolean) => void; description?: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
        value ? "bg-blue-50 border-blue-400" : "bg-white border-gray-200 hover:border-blue-300"
      }`}>
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
        value ? "bg-blue-600 border-blue-600" : "border-gray-300"
      }`}>
        {value && <Icon name="Check" size={10} className="text-white" />}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {description && <div className="text-xs text-gray-400">{description}</div>}
      </div>
    </button>
  );
}

// ─── LEAD FORM ────────────────────────────────────────────────────────────────

function LeadForm({ totalPrice, zones }: { totalPrice: number; zones: ZoneConfig[] }) {
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const MARKUP_KEY = "office_calc_markup";
const REGION_KEY = "office_calc_region";

export default function OfficeCalc() {
  const navigate = useNavigate();
  useEffect(() => { trackCalcEvent("office", "open"); }, []);

  useMeta({
    title: "Калькулятор отделки офиса, склада — ОФИС",
    description: "Расчёт стоимости ремонта и оснащения коммерческих помещений: офисов, складов, торговых залов. Вентиляция, сигнализация, пожарная безопасность, огнезащита.",
    keywords: "калькулятор офис ремонт, стоимость отделки офиса, огнезащита металлоконструкций, пожарная сигнализация офис, СКУД расчёт",
    canonical: "/office",
  });

  const [regionId, setRegionId] = useState(() => localStorage.getItem(REGION_KEY) || "moscow");
  const [markupPct, setMarkupPct] = useState(() => {
    const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
    return isNaN(v) ? 0 : v;
  });
  const [showMarkup, setShowMarkup] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const [zones, setZones] = useState<ZoneConfig[]>(() => {
    const z = makeZone("Офисный блок");
    z.totalPrice = calcPrice(z, "moscow", 0);
    return [z];
  });
  const [activeId, setActiveId] = useState(zones[0].id);

  const activeZone = zones.find(z => z.id === activeId) ?? zones[0];

  const updateZone = (patch: Partial<Omit<ZoneConfig, "id" | "totalPrice">>) => {
    setZones(prev => prev.map(z => {
      if (z.id !== activeId) return z;
      const updated = { ...z, ...patch };
      return { ...updated, totalPrice: calcPrice(updated, regionId, markupPct) };
    }));
  };

  const recalcAll = (rg: string, mk: number) => {
    setZones(prev => prev.map(z => ({ ...z, totalPrice: calcPrice(z, rg, mk) })));
  };

  const addZone = () => {
    const z = makeZone(`Зона ${zones.length + 1}`);
    z.totalPrice = calcPrice(z, regionId, markupPct);
    setZones(prev => [...prev, z]);
    setActiveId(z.id);
  };

  const removeZone = (id: string) => {
    if (zones.length === 1) return;
    const remaining = zones.filter(z => z.id !== id);
    setZones(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  };

  const totalAll = zones.reduce((s, z) => s + z.totalPrice, 0);

  const handleRegionChange = (rg: string) => {
    setRegionId(rg);
    localStorage.setItem(REGION_KEY, rg);
    recalcAll(rg, markupPct);
  };

  const handleMarkup = (v: string) => {
    const n = Math.max(0, Math.min(300, parseFloat(v) || 0));
    setMarkupPct(n);
    localStorage.setItem(MARKUP_KEY, String(n));
    recalcAll(regionId, n);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Icon name="Building2" size={16} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 leading-tight">ОФИС</div>
              <div className="text-xs text-gray-400">Калькулятор коммерческих помещений</div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <div className="text-xs text-gray-400">Итого по объекту</div>
              <div className="text-lg font-bold text-blue-600">{fmtPrice(totalAll)}</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowMarkup(!showMarkup)}>
              <Icon name="Percent" size={14} className="mr-1" />
              {markupPct > 0 ? `+${markupPct}%` : "Наценка"}
            </Button>
          </div>
        </div>
        {showMarkup && (
          <div className="bg-amber-50 border-t px-4 py-2 flex items-center gap-3">
            <span className="text-sm text-amber-700">Наценка (%):</span>
            <Input
              type="number" value={markupPct} min={0} max={300}
              onChange={e => handleMarkup(e.target.value)}
              className="w-24 h-7 text-sm"
            />
            <span className="text-xs text-amber-600">Применяется ко всем зонам</span>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── ЛЕВАЯ КОЛОНКА: список зон + параметры ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Регион */}
            <Card className="p-4">
              <Label className="text-xs text-gray-500 mb-2 block">Регион</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {REGIONS.map(r => (
                  <button key={r.id} type="button" onClick={() => handleRegionChange(r.id)}
                    className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      regionId === r.id ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-400"
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Вкладки зон */}
            <div className="flex items-center gap-2 flex-wrap">
              {zones.map(z => (
                <button key={z.id} type="button" onClick={() => setActiveId(z.id)}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                    activeId === z.id ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 text-gray-700 hover:border-blue-400"
                  }`}>
                  {renamingId === z.id ? (
                    <input
                      autoFocus defaultValue={z.name}
                      className="bg-transparent outline-none w-28 text-sm"
                      onBlur={e => { setZones(p => p.map(x => x.id === z.id ? { ...x, name: e.target.value || x.name } : x)); setRenamingId(null); }}
                      onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span onDoubleClick={() => setRenamingId(z.id)}>{z.name}</span>
                  )}
                  {activeId === z.id && fmtPrice(z.totalPrice) !== "0 ₽" && (
                    <span className="text-xs opacity-80 ml-1">{fmtPrice(z.totalPrice)}</span>
                  )}
                  {zones.length > 1 && (
                    <span onClick={e => { e.stopPropagation(); removeZone(z.id); }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-1 text-xs">✕</span>
                  )}
                </button>
              ))}
              <button type="button" onClick={addZone}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-blue-300 text-blue-500 text-sm hover:bg-blue-50 transition-all">
                <Icon name="Plus" size={13} /> Добавить зону
              </button>
            </div>

            {/* Редактор активной зоны */}
            <Card className="p-5 space-y-6">

              {/* Тип помещения */}
              <Section title="Тип помещения" icon="Building2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ROOM_TYPES.map(rt => (
                    <button key={rt.id} type="button"
                      onClick={() => updateZone({ roomType: rt.id })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        activeZone.roomType === rt.id ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 hover:border-blue-400"
                      }`}>
                      <Icon name={rt.icon as Parameters<typeof Icon>[0]["name"]} size={15} />
                      {rt.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Площадь, м²</Label>
                    <Input type="number" value={activeZone.area} min={10} max={50000}
                      onChange={e => updateZone({ area: Number(e.target.value) || 10 })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Высота потолков, м</Label>
                    <Input type="number" value={activeZone.height} min={2.5} max={20} step={0.1}
                      onChange={e => updateZone({ height: Number(e.target.value) || 3 })} />
                  </div>
                </div>
              </Section>

              {/* Уровень отделки */}
              <Section title="Уровень отделки" icon="Paintbrush">
                <OptionGrid options={FINISH_LEVELS} value={activeZone.finishLevel} onChange={v => updateZone({ finishLevel: v })} />
              </Section>

              {/* Полы */}
              <Section title="Напольное покрытие" icon="Layers">
                <OptionGrid options={FLOORING_OPTIONS} value={activeZone.flooring} onChange={v => updateZone({ flooring: v })} />
              </Section>

              {/* Потолок */}
              <Section title="Потолок" icon="PanelTop">
                <OptionGrid options={CEILING_OPTIONS} value={activeZone.ceiling} onChange={v => updateZone({ ceiling: v })} />
              </Section>

              {/* Перегородки */}
              <Section title="Перегородки" icon="Columns2">
                <OptionGrid options={PARTITION_OPTIONS} value={activeZone.partitions} onChange={v => updateZone({ partitions: v })} />
                {activeZone.partitions !== "none" && (
                  <NumRow label="Длина перегородок, п.м." value={activeZone.partitionLinearM}
                    onChange={v => updateZone({ partitionLinearM: v })} min={1} max={5000} />
                )}
              </Section>

              {/* Отопление */}
              <Section title="Отопление" icon="Thermometer">
                <OptionGrid options={HEATING_OPTIONS} value={activeZone.heating} onChange={v => updateZone({ heating: v })} />
              </Section>

              {/* Вентиляция и кондиционирование */}
              <Section title="Вентиляция и кондиционирование" icon="Wind">
                <OptionGrid options={VENT_OPTIONS} value={activeZone.ventilation} onChange={v => updateZone({ ventilation: v })} />
                <NumRow label="Сплит-системы (доп., шт.)" value={activeZone.airConditioners}
                  onChange={v => updateZone({ airConditioners: v })} max={200} />
              </Section>

              {/* Электрика */}
              <Section title="Электрика и сети" icon="Zap">
                <NumRow label="Электроточки (розетки, выключатели)" value={activeZone.electricPoints}
                  onChange={v => updateZone({ electricPoints: v })} min={0} max={1000} />
                <Toggle label="Освещение (монтаж + светильники)" value={activeZone.lighting}
                  onChange={v => updateZone({ lighting: v })} description={`~${fmtPrice(activeZone.area * 1800)}`} />
                <Toggle label="ИБП (источник бесперебойного питания)" value={activeZone.ups}
                  onChange={v => updateZone({ ups: v })} description="~85 000 ₽ комплект" />
                <Label className="text-xs text-gray-500 block mt-2">Структурированная кабельная сеть (СКС)</Label>
                <OptionGrid options={NETWORK_OPTIONS} value={activeZone.networkType} onChange={v => updateZone({ networkType: v })} />
              </Section>

              {/* Охранная сигнализация */}
              <Section title="Охранная сигнализация" icon="ShieldAlert">
                <OptionGrid options={ALARM_OPTIONS} value={activeZone.alarmType} onChange={v => updateZone({ alarmType: v })} />
                {activeZone.alarmType !== "none" && (
                  <NumRow label="Датчики движения/вибрации, шт." value={activeZone.alarmSensors}
                    onChange={v => updateZone({ alarmSensors: v })} min={1} max={500} />
                )}
              </Section>

              {/* Видеонаблюдение */}
              <Section title="Видеонаблюдение (CCTV)" icon="Camera">
                <OptionGrid options={CCTV_OPTIONS} value={activeZone.cctvType} onChange={v => updateZone({ cctvType: v })} />
                {activeZone.cctvType !== "none" && (
                  <NumRow label="Камеры, шт." value={activeZone.cctvCameras}
                    onChange={v => updateZone({ cctvCameras: v })} min={1} max={500} />
                )}
              </Section>

              {/* СКУД */}
              <Section title="Контроль доступа (СКУД)" icon="KeyRound">
                <OptionGrid options={ACCESS_OPTIONS} value={activeZone.accessType} onChange={v => updateZone({ accessType: v })} />
                {activeZone.accessType !== "none" && (
                  <NumRow label="Дверей с контролем доступа" value={activeZone.accessDoors}
                    onChange={v => updateZone({ accessDoors: v })} min={1} max={200} />
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
                    value={activeZone.fireSignaling} onChange={v => updateZone({ fireSignaling: v })}
                    description="Пульт, прибор, разводка кабелей" />
                  {activeZone.fireSignaling && (
                    <NumRow label="Пожарные датчики (дымовые/тепловые), шт." value={activeZone.fireSensors}
                      onChange={v => updateZone({ fireSensors: v })} min={1} max={2000} />
                  )}
                </Section>

                {/* Пожаротушение */}
                <Section title="Система пожаротушения" icon="Droplets">
                  <OptionGrid options={FIRE_PROTECTION_OPTIONS} value={activeZone.fireProtection}
                    onChange={v => updateZone({ fireProtection: v })} />
                  {(activeZone.fireProtection === "sprinkler" || activeZone.fireProtection === "gas" || activeZone.fireProtection === "powder") && (
                    <NumRow label="Насадки/головки/модули, шт." value={activeZone.fireSprinklerHeads}
                      onChange={v => updateZone({ fireSprinklerHeads: v })} min={1} max={5000} />
                  )}
                </Section>

                {/* Огнезащита металла */}
                <Section title="Огнезащита металлических конструкций" icon="Shield">
                  <p className="text-xs text-gray-500 -mt-1">Покрытие несущих конструкций, балок, ферм огнезащитным составом (ГОСТ Р 53295)</p>
                  <OptionGrid options={METAL_FIREPROOF_OPTIONS.slice(0, 4)} value={activeZone.metalFireProof}
                    onChange={v => updateZone({ metalFireProof: v })} />
                  <OptionGrid options={METAL_FIREPROOF_OPTIONS.slice(4)} value={activeZone.metalFireProof}
                    onChange={v => updateZone({ metalFireProof: v })} cols={3} />
                  {activeZone.metalFireProof !== "none" && (
                    <NumRow label="Площадь металлоконструкций, м²" value={activeZone.metalFireProofM2}
                      onChange={v => updateZone({ metalFireProofM2: v })} min={1} max={50000} />
                  )}
                </Section>

                {/* Огнезащита дерева */}
                <Section title="Огнезащита деревянных конструкций" icon="TreePine">
                  <p className="text-xs text-gray-500 -mt-1">Обработка стропил, перекрытий, элементов кровли огнебиозащитным составом</p>
                  <OptionGrid options={WOOD_FIREPROOF_OPTIONS} value={activeZone.woodFireProof}
                    onChange={v => updateZone({ woodFireProof: v })} cols={3} />
                  {activeZone.woodFireProof !== "none" && (
                    <NumRow label="Площадь деревянных конструкций, м²" value={activeZone.woodFireProofM2}
                      onChange={v => updateZone({ woodFireProofM2: v })} min={1} max={50000} />
                  )}
                </Section>

                {/* Двери и гидранты */}
                <Section title="Противопожарные двери и краны" icon="DoorOpen">
                  <NumRow label="Противопожарные двери (EI60/EI90), шт." value={activeZone.fireDoors}
                    onChange={v => updateZone({ fireDoors: v })} min={0} max={200} />
                  <NumRow label="Огнетушители (порошковые/углекислотные)" value={activeZone.fireExtinguishers}
                    onChange={v => updateZone({ fireExtinguishers: v })} min={0} max={500} />
                  <Toggle label="Проверка и перезарядка пожарных кранов и гидрантов"
                    value={activeZone.fireHydrantCheck} onChange={v => updateZone({ fireHydrantCheck: v })}
                    description="Испытание, составление актов" />
                  {activeZone.fireHydrantCheck && (
                    <NumRow label="Пожарные краны / гидранты, шт." value={activeZone.fireHydrantCount}
                      onChange={v => updateZone({ fireHydrantCount: v })} min={1} max={200} />
                  )}
                </Section>
              </div>

            </Card>
          </div>

          {/* ── ПРАВАЯ КОЛОНКА: сводка + форма ── */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">

            {/* Итог по зонам */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="BarChart3" size={15} className="text-gray-400" />
                <span className="font-semibold text-gray-800 text-sm">Сводка по объекту</span>
              </div>
              <div className="space-y-2">
                {zones.map(z => (
                  <div key={z.id} onClick={() => setActiveId(z.id)}
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
                {[
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
                ].filter(r => r.val > 0).map(r => (
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
            <LeadForm totalPrice={totalAll} zones={zones} />

            <p className="text-xs text-center text-gray-400">
              Расчёт ориентировочный. Точную стоимость определит выезд специалиста.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}