import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import {
  ZoneConfig, fmtPrice, REGIONS,
  FINISH_LEVELS, FLOORING_OPTIONS, CEILING_OPTIONS, PARTITION_OPTIONS,
  HEATING_OPTIONS, VENT_OPTIONS, ALARM_OPTIONS, CCTV_OPTIONS,
  ACCESS_OPTIONS, FIRE_PROTECTION_OPTIONS, METAL_FIREPROOF_OPTIONS,
  WOOD_FIREPROOF_OPTIONS, NETWORK_OPTIONS, MATERIALS_SUPPLY,
  DOC_PROJECT_OPTIONS, DOC_ESTIMATE_OPTIONS, DOC_PERMIT_OPTIONS,
  ROOM_TYPES,
} from "./officeCalcTypes";

export type DocFormat = "smeta" | "kp" | "ks2" | "ks3" | "act";

export interface OfficeExportState {
  docType: DocFormat;
  showForm: boolean;
  customer: string;
  contractor: string;
  address: string;
  phone: string;
  email: string;
  validDays: string;
  foremanName: string;
  foremanPhone: string;
  supplyName: string;
  supplyPhone: string;
  contractNumber: string;
  contractDate: string;
  actNumber: string;
  actDateFrom: string;
  actDateTo: string;
}

export function makeExportState(): OfficeExportState {
  return {
    docType: "smeta",
    showForm: false,
    customer: "",
    contractor: "",
    address: "",
    phone: "",
    email: "",
    validDays: "30",
    foremanName: "",
    foremanPhone: "",
    supplyName: "",
    supplyPhone: "",
    contractNumber: "",
    contractDate: "",
    actNumber: "1",
    actDateFrom: "",
    actDateTo: "",
  };
}

interface Props {
  exportState: OfficeExportState;
  onChange: (patch: Partial<OfficeExportState>) => void;
  zones: ZoneConfig[];
  totalAll: number;
  regionId: string;
  markupPct: number;
}

// ── Детализация по статьям для одной зоны ──────────────────────────────────

interface LineItem {
  section: string;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
  total: number;
}

function getZoneLines(z: ZoneConfig, regionId: string, markupPct: number): LineItem[] {
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
  const matSupply = MATERIALS_SUPPLY.find(m => m.id === z.materialsSupply) ?? MATERIALS_SUPPLY[0];

  const rc = region.coeff * (1 + markupPct / 100);
  const lines: LineItem[] = [];

  const add = (section: string, name: string, unit: string, qty: number, unitPrice: number) => {
    if (qty <= 0 || unitPrice <= 0) return;
    lines.push({ section, name, unit, qty, unitPrice: Math.round(unitPrice * rc), total: Math.round(qty * unitPrice * rc) });
  };
  const addFixed = (section: string, name: string, price: number) => {
    if (price <= 0) return;
    lines.push({ section, name, unit: "компл.", qty: 1, unitPrice: Math.round(price * rc), total: Math.round(price * rc) });
  };

  // Отделка
  if (z.blockFinish && finish.pricePerM2 > 0) {
    add("Отделка", `Отделочные работы (${finish.label})`, "м²", z.area, finish.pricePerM2 * room.coeff);
  }
  if (z.blockFlooring && flooring.pricePerM2 > 0) {
    add("Отделка", `Полы: ${flooring.label}`, "м²", z.area, flooring.pricePerM2);
  }
  if (z.blockCeiling && ceiling.pricePerM2 > 0) {
    add("Отделка", `Потолок: ${ceiling.label}`, "м²", z.area, ceiling.pricePerM2);
  }
  if (z.blockPartitions && partition.pricePerLM > 0 && z.partitionLinearM > 0) {
    lines.push({
      section: "Отделка",
      name: `Перегородки: ${partition.label}`,
      unit: "пм",
      qty: z.partitionLinearM,
      unitPrice: Math.round(partition.pricePerLM * rc),
      total: Math.round(partition.pricePerLM * z.partitionLinearM * rc),
    });
  }

  // Отопление
  if (z.blockHeating && heating.pricePerM2 > 0) {
    add("Отопление", `${heating.label}`, "м²", z.area, heating.pricePerM2);
  }

  // Вентиляция и кондиционирование
  if (z.blockVentilation) {
    if (vent.pricePerM2 > 0) add("Вентиляция", `${vent.label}`, "м²", z.area, vent.pricePerM2);
    if (z.airConditioners > 0) {
      lines.push({
        section: "Вентиляция",
        name: "Кондиционер (монтаж + оборудование)",
        unit: "шт.",
        qty: z.airConditioners,
        unitPrice: Math.round(28000 * rc),
        total: Math.round(28000 * z.airConditioners * rc),
      });
    }
  }

  // Электрика
  if (z.blockElectric) {
    if (z.electricPoints > 0) {
      lines.push({
        section: "Электрика",
        name: "Электрические точки (розетки/выключатели)",
        unit: "шт.",
        qty: z.electricPoints,
        unitPrice: Math.round(3500 * rc),
        total: Math.round(3500 * z.electricPoints * rc),
      });
    }
    if (z.lighting) add("Электрика", "Освещение (монтаж + светильники)", "м²", z.area, 1800);
    if (z.ups) addFixed("Электрика", "ИБП (источник бесперебойного питания)", 85000);
  }

  // СКС/Сеть
  if (z.blockNetwork && network.pricePerM2 > 0) {
    add("СКС / Сеть", `${network.label}`, "м²", z.area, network.pricePerM2);
  }

  // Охранная сигнализация
  if (z.blockAlarm && alarm.priceBase > 0) {
    addFixed("Охранная сигнализация", `${alarm.label} (базовая установка)`, alarm.priceBase);
    if (z.alarmSensors > 0) {
      lines.push({
        section: "Охранная сигнализация",
        name: "Датчики охранной сигнализации",
        unit: "шт.",
        qty: z.alarmSensors,
        unitPrice: Math.round(4500 * rc),
        total: Math.round(4500 * z.alarmSensors * rc),
      });
    }
  }

  // Видеонаблюдение
  if (z.blockCCTV && z.cctvType !== "none") {
    addFixed("Видеонаблюдение", `${cctv.label} — регистратор/сервер`, cctv.dvr);
    if (z.cctvCameras > 0) {
      lines.push({
        section: "Видеонаблюдение",
        name: `Камера ${cctv.label}`,
        unit: "шт.",
        qty: z.cctvCameras,
        unitPrice: Math.round(cctv.pricePerCamera * rc),
        total: Math.round(cctv.pricePerCamera * z.cctvCameras * rc),
      });
    }
  }

  // СКУД
  if (z.blockAccess && z.accessType !== "none") {
    addFixed("СКУД", `${access.label} — управляющая панель`, access.panel);
    if (z.accessDoors > 0) {
      lines.push({
        section: "СКУД",
        name: `${access.label} — точка доступа`,
        unit: "дв.",
        qty: z.accessDoors,
        unitPrice: Math.round(access.pricePerDoor * rc),
        total: Math.round(access.pricePerDoor * z.accessDoors * rc),
      });
    }
  }

  // Пожарная безопасность
  if (z.blockFire) {
    if (z.fireSignaling) {
      addFixed("Пожарная безопасность", "Пожарная сигнализация (монтаж, ПКП)", 45000);
      if (z.fireSensors > 0) {
        lines.push({
          section: "Пожарная безопасность",
          name: "Пожарный извещатель",
          unit: "шт.",
          qty: z.fireSensors,
          unitPrice: Math.round(2800 * rc),
          total: Math.round(2800 * z.fireSensors * rc),
        });
      }
    }
    if (z.fireExtinguishers > 0) {
      lines.push({
        section: "Пожарная безопасность",
        name: "Огнетушитель (поставка + размещение)",
        unit: "шт.",
        qty: z.fireExtinguishers,
        unitPrice: Math.round(3500 * rc),
        total: Math.round(3500 * z.fireExtinguishers * rc),
      });
    }
    if (fireProt.base > 0) {
      addFixed("Пожарная безопасность", `${fireProt.label} — монтаж системы`, fireProt.base);
    }
    if (fireProt.pricePerHead > 0 && z.fireSprinklerHeads > 0) {
      lines.push({
        section: "Пожарная безопасность",
        name: "Спринклер / насадка пожаротушения",
        unit: "шт.",
        qty: z.fireSprinklerHeads,
        unitPrice: Math.round(fireProt.pricePerHead * rc),
        total: Math.round(fireProt.pricePerHead * z.fireSprinklerHeads * rc),
      });
    }
    if (metalFP.pricePerM2 > 0 && z.metalFireProofM2 > 0) {
      add("Пожарная безопасность", `Огнезащита металла (${metalFP.label})`, "м²", z.metalFireProofM2, metalFP.pricePerM2);
    }
    if (woodFP.pricePerM2 > 0 && z.woodFireProofM2 > 0) {
      add("Пожарная безопасность", `Огнезащита дерева (${woodFP.label})`, "м²", z.woodFireProofM2, woodFP.pricePerM2);
    }
    if (z.fireDoors > 0) {
      lines.push({
        section: "Пожарная безопасность",
        name: "Противопожарная дверь (монтаж)",
        unit: "шт.",
        qty: z.fireDoors,
        unitPrice: Math.round(38000 * rc),
        total: Math.round(38000 * z.fireDoors * rc),
      });
    }
    if (z.fireHydrantCheck) {
      addFixed("Пожарная безопасность", "Обслуживание пожарных кранов (базовая стоимость)", 8500);
      if (z.fireHydrantCount > 0) {
        lines.push({
          section: "Пожарная безопасность",
          name: "Проверка пожарного крана",
          unit: "шт.",
          qty: z.fireHydrantCount,
          unitPrice: Math.round(3200 * rc),
          total: Math.round(3200 * z.fireHydrantCount * rc),
        });
      }
    }
  }

  // Материалы
  if (z.blockMaterials && matSupply.coeff > 0) {
    const laborSubtotal = lines.reduce((s, l) => s + l.total, 0);
    const matTotal = Math.round(laborSubtotal * matSupply.coeff * z.materialsCoeffCustom);
    if (matTotal > 0) {
      lines.push({
        section: "Материалы",
        name: `${matSupply.label}`,
        unit: "компл.",
        qty: 1,
        unitPrice: matTotal,
        total: matTotal,
      });
    }
  }

  // Документы (без регионального коэффициента)
  if (z.blockDocs) {
    const docProj = DOC_PROJECT_OPTIONS.find(d => d.id === z.docProject) ?? DOC_PROJECT_OPTIONS[0];
    const docEst = DOC_ESTIMATE_OPTIONS.find(d => d.id === z.docEstimate) ?? DOC_ESTIMATE_OPTIONS[0];
    const docPerm = DOC_PERMIT_OPTIONS.find(d => d.id === z.docPermit) ?? DOC_PERMIT_OPTIONS[0];
    if (docProj.price > 0) lines.push({ section: "Документация", name: docProj.label, unit: "компл.", qty: 1, unitPrice: docProj.price, total: docProj.price });
    if (docEst.price > 0) lines.push({ section: "Документация", name: docEst.label, unit: "компл.", qty: 1, unitPrice: docEst.price, total: docEst.price });
    if (docPerm.price > 0) lines.push({ section: "Документация", name: docPerm.label, unit: "компл.", qty: 1, unitPrice: docPerm.price, total: docPerm.price });
    if (z.docAsBuilt) lines.push({ section: "Документация", name: "Исполнительная документация (as-built)", unit: "компл.", qty: 1, unitPrice: 35000, total: 35000 });
    if (z.docSro) lines.push({ section: "Документация", name: "Допуск СРО", unit: "компл.", qty: 1, unitPrice: 45000, total: 45000 });
    if (z.docFireAudit) lines.push({ section: "Документация", name: "Пожарный аудит", unit: "компл.", qty: 1, unitPrice: 28000, total: 28000 });
    if (z.docEnergyCert) lines.push({ section: "Документация", name: "Энергетический паспорт", unit: "компл.", qty: 1, unitPrice: 22000, total: 22000 });
  }

  return lines;
}

// ── HTML-генераторы ────────────────────────────────────────────────────────

const CSS = `
  body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:0;padding:14mm 18mm}
  @page{margin:12mm}
  h1{font-size:15px;font-weight:bold;text-align:center;margin:0 0 3px}
  .sub{text-align:center;color:#555;font-size:10px;margin-bottom:14px}
  table{width:100%;border-collapse:collapse}
  .meta td{padding:3px 0}
  .meta td:first-child{width:150px;color:#555}
  .staff{background:#f8f9fa;margin-bottom:12px}
  .staff td{padding:3px 8px}
  .staff td:first-child{width:150px;color:#555}
  .section-header td{background:#1e3a5f;color:#fff;font-weight:bold;padding:5px 8px;font-size:10px}
  .zone-header td{background:#dce6f1;color:#1e3a5f;font-weight:bold;padding:5px 8px;font-size:10px}
  th{background:#1e3a5f;color:#fff;padding:6px 8px;text-align:left;font-size:10px}
  th.r{text-align:right}
  td{padding:4px 8px;border-bottom:1px solid #e5e7eb;font-size:10px;vertical-align:top}
  td.r{text-align:right}
  .total-row td{background:#1e3a5f;color:#fff;font-weight:bold;padding:6px 8px}
  .total-row td.r{text-align:right;font-size:13px}
  .zone-total td{background:#dce6f1;color:#1e3a5f;font-weight:bold;padding:4px 8px}
  .zone-total td.r{text-align:right}
  .signs{display:flex;gap:40px;margin-top:28px}
  .sign{flex:1;border-top:1px solid #111;padding-top:4px;font-size:10px;color:#555}
  .footer{margin-top:16px;font-size:9px;color:#888;text-align:center}
  .num{color:#555;min-width:24px;display:inline-block}
  .pg-break{page-break-before:always}
  .ks-box{border:1px solid #ccc;padding:6px 10px;margin-bottom:8px;font-size:10px}
  .ks-box table{font-size:10px}
  .ks-box td:first-child{color:#555;width:170px}
`;

function metaBlock(s: OfficeExportState, regionLabel: string, dateStr: string) {
  const { customer, contractor, address, phone, email, docType, validDays, contractNumber, contractDate } = s;
  return `
    <table class="meta" style="margin-bottom:12px">
      ${customer ? `<tr><td>Заказчик:</td><td><b>${customer}</b></td></tr>` : ""}
      ${contractor ? `<tr><td>Подрядчик:</td><td><b>${contractor}</b></td></tr>` : ""}
      ${address ? `<tr><td>Адрес объекта:</td><td>${address}</td></tr>` : ""}
      ${phone ? `<tr><td>Телефон:</td><td>${phone}</td></tr>` : ""}
      ${email ? `<tr><td>E-mail:</td><td>${email}</td></tr>` : ""}
      <tr><td>Регион:</td><td>${regionLabel}</td></tr>
      <tr><td>Дата составления:</td><td>${dateStr}</td></tr>
      ${contractNumber ? `<tr><td>Договор №:</td><td>${contractNumber}${contractDate ? " от " + contractDate : ""}</td></tr>` : ""}
      ${docType === "kp" ? `<tr><td>Срок действия КП:</td><td>${validDays} дней</td></tr>` : ""}
    </table>`;
}

function staffBlock(s: OfficeExportState) {
  const { foremanName, foremanPhone, supplyName, supplyPhone } = s;
  if (!foremanName && !supplyName) return "";
  return `
    <table class="staff" style="margin-bottom:12px">
      ${foremanName ? `<tr><td>Прораб:</td><td>${foremanName}${foremanPhone ? " — " + foremanPhone : ""}</td></tr>` : ""}
      ${supplyName ? `<tr><td>Снабженец:</td><td>${supplyName}${supplyPhone ? " — " + supplyPhone : ""}</td></tr>` : ""}
    </table>`;
}

function signsBlock(s: OfficeExportState) {
  return `
    <div class="signs">
      <div class="sign">Заказчик${s.customer ? ": " + s.customer : ""}<br><br>_____________ / ______________</div>
      <div class="sign">Подрядчик${s.contractor ? ": " + s.contractor : ""}<br><br>_____________ / ______________</div>
    </div>
    <p class="footer">Расчёт ориентировочный. Окончательная стоимость определяется после выезда специалиста и подписания договора.</p>`;
}

function detailTable(zones: ZoneConfig[], regionId: string, markupPct: number, totalAll: number, withMarkup: boolean): string {
  const sections = ["Отделка", "Отопление", "Вентиляция", "Электрика", "СКС / Сеть",
    "Охранная сигнализация", "Видеонаблюдение", "СКУД", "Пожарная безопасность", "Материалы", "Документация"];

  let rows = "";
  let n = 1;

  for (const z of zones) {
    const lines = getZoneLines(z, regionId, markupPct);
    if (lines.length === 0) continue;
    const zTotal = lines.reduce((s, l) => s + l.total, 0);

    rows += `<tr class="zone-header"><td colspan="${withMarkup ? 6 : 5}">▸ ${z.name} (${z.area} м²)</td></tr>`;

    let lastSection = "";
    for (const l of lines) {
      if (l.section !== lastSection) {
        rows += `<tr class="section-header"><td colspan="${withMarkup ? 6 : 5}">${l.section}</td></tr>`;
        lastSection = l.section;
      }
      rows += `<tr>
        <td><span class="num">${n++}.</span> ${l.name}</td>
        <td class="r">${l.qty}</td>
        <td>${l.unit}</td>
        <td class="r">${l.unitPrice.toLocaleString("ru-RU")}</td>
        ${withMarkup ? `<td class="r">${markupPct}%</td>` : ""}
        <td class="r"><b>${l.total.toLocaleString("ru-RU")}</b></td>
      </tr>`;
    }

    rows += `<tr class="zone-total">
      <td colspan="${withMarkup ? 5 : 4}">Итого по зоне «${z.name}»</td>
      <td class="r">${fmtPrice(zTotal)}</td>
    </tr>`;
  }

  return `
    <table style="margin-bottom:14px">
      <thead><tr>
        <th>Наименование работ / услуг</th>
        <th class="r">Кол-во</th>
        <th>Ед.</th>
        <th class="r">Цена, ₽</th>
        ${withMarkup ? `<th class="r">Наценка</th>` : ""}
        <th class="r">Сумма, ₽</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr class="total-row">
        <td colspan="${withMarkup ? 5 : 4}">ИТОГО ПО ВСЕМ ЗОНАМ</td>
        <td class="r">${fmtPrice(totalAll)}</td>
      </tr></tfoot>
    </table>`;
}

function summaryTable(zones: ZoneConfig[], totalAll: number, markupPct: boolean): string {
  const rows = zones.map((z, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f5f7fa"}">
      <td>${z.name}</td>
      <td class="r">${z.area}</td>
      <td class="r"><b>${fmtPrice(z.totalPrice)}</b></td>
    </tr>`).join("");

  return `
    <table style="margin-bottom:14px">
      <thead><tr>
        <th>Зона / Помещение</th>
        <th class="r">Площадь, м²</th>
        <th class="r">Сумма, ₽</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr class="total-row">
        <td colspan="2">ИТОГО</td>
        <td class="r">${fmtPrice(totalAll)}</td>
      </tr></tfoot>
    </table>`;
}

// КС-2: акт о приёмке выполненных работ (развёрнутая)
function buildKS2(s: OfficeExportState, zones: ZoneConfig[], totalAll: number, regionId: string, markupPct: number, regionLabel: string, dateStr: string): string {
  const { customer, contractor, address, contractNumber, contractDate, actNumber, actDateFrom, actDateTo } = s;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>КС-2</title><style>${CSS}</style></head><body>
    <h1>АКТ О ПРИЁМКЕ ВЫПОЛНЕННЫХ РАБОТ</h1>
    <p class="sub">Унифицированная форма № КС-2</p>

    <div class="ks-box">
      <table>
        ${customer ? `<tr><td>Заказчик:</td><td><b>${customer}</b></td></tr>` : ""}
        ${contractor ? `<tr><td>Подрядчик:</td><td><b>${contractor}</b></td></tr>` : ""}
        ${address ? `<tr><td>Адрес объекта:</td><td>${address}</td></tr>` : ""}
        ${contractNumber ? `<tr><td>Договор подряда №:</td><td>${contractNumber}${contractDate ? " от " + contractDate : ""}</td></tr>` : ""}
        <tr><td>Акт № / дата:</td><td>${actNumber} от ${dateStr}</td></tr>
        ${actDateFrom ? `<tr><td>Период выполнения работ:</td><td>с ${actDateFrom} по ${actDateTo || "___________"}</td></tr>` : ""}
        <tr><td>Регион:</td><td>${regionLabel}</td></tr>
      </table>
    </div>

    ${detailTable(zones, regionId, markupPct, totalAll, markupPct > 0)}

    ${signsBlock(s)}
  </body></html>`;
}

// КС-3: справка о стоимости работ и затрат
function buildKS3(s: OfficeExportState, zones: ZoneConfig[], totalAll: number, regionId: string, markupPct: number, regionLabel: string, dateStr: string): string {
  const { customer, contractor, address, contractNumber, contractDate, actNumber, actDateFrom, actDateTo } = s;
  const laborTotal = zones.reduce((sum, z) => {
    const lines = getZoneLines(z, regionId, markupPct);
    return sum + lines.filter(l => l.section !== "Материалы" && l.section !== "Документация").reduce((s2, l) => s2 + l.total, 0);
  }, 0);
  const matTotal = zones.reduce((sum, z) => {
    const lines = getZoneLines(z, regionId, markupPct);
    return sum + lines.filter(l => l.section === "Материалы").reduce((s2, l) => s2 + l.total, 0);
  }, 0);
  const docTotal = zones.reduce((sum, z) => {
    const lines = getZoneLines(z, regionId, markupPct);
    return sum + lines.filter(l => l.section === "Документация").reduce((s2, l) => s2 + l.total, 0);
  }, 0);

  const rows = zones.map((z, i) => {
    const lines = getZoneLines(z, regionId, markupPct);
    const lab = lines.filter(l => l.section !== "Материалы" && l.section !== "Документация").reduce((s2, l) => s2 + l.total, 0);
    const mat = lines.filter(l => l.section === "Материалы").reduce((s2, l) => s2 + l.total, 0);
    const doc = lines.filter(l => l.section === "Документация").reduce((s2, l) => s2 + l.total, 0);
    return `<tr style="background:${i % 2 === 0 ? "#fff" : "#f5f7fa"}">
      <td>${z.name}</td>
      <td class="r">${z.area}</td>
      <td class="r">${fmtPrice(lab)}</td>
      <td class="r">${fmtPrice(mat)}</td>
      <td class="r">${fmtPrice(doc)}</td>
      <td class="r"><b>${fmtPrice(lab + mat + doc)}</b></td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>КС-3</title><style>${CSS}</style></head><body>
    <h1>СПРАВКА О СТОИМОСТИ ВЫПОЛНЕННЫХ РАБОТ И ЗАТРАТ</h1>
    <p class="sub">Унифицированная форма № КС-3</p>

    <div class="ks-box">
      <table>
        ${customer ? `<tr><td>Заказчик:</td><td><b>${customer}</b></td></tr>` : ""}
        ${contractor ? `<tr><td>Подрядчик:</td><td><b>${contractor}</b></td></tr>` : ""}
        ${address ? `<tr><td>Адрес объекта:</td><td>${address}</td></tr>` : ""}
        ${contractNumber ? `<tr><td>Договор подряда №:</td><td>${contractNumber}${contractDate ? " от " + contractDate : ""}</td></tr>` : ""}
        <tr><td>Справка № / дата:</td><td>${actNumber} от ${dateStr}</td></tr>
        ${actDateFrom ? `<tr><td>Отчётный период:</td><td>с ${actDateFrom} по ${actDateTo || "___________"}</td></tr>` : ""}
        <tr><td>Регион:</td><td>${regionLabel}</td></tr>
      </table>
    </div>

    <table style="margin-bottom:14px">
      <thead><tr>
        <th>Зона / Помещение</th>
        <th class="r">Площадь, м²</th>
        <th class="r">Работы, ₽</th>
        <th class="r">Материалы, ₽</th>
        <th class="r">Документация, ₽</th>
        <th class="r">Всего, ₽</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="2">ИТОГО</td>
          <td class="r">${fmtPrice(laborTotal)}</td>
          <td class="r">${fmtPrice(matTotal)}</td>
          <td class="r">${fmtPrice(docTotal)}</td>
          <td class="r">${fmtPrice(totalAll)}</td>
        </tr>
      </tfoot>
    </table>

    <p style="font-size:10px;color:#555;margin-bottom:20px">
      В том числе НДС: <b>не облагается</b> (УСН / без НДС — уточните у подрядчика)
    </p>

    ${signsBlock(s)}
  </body></html>`;
}

// Акт выполненных работ (свободная форма)
function buildAct(s: OfficeExportState, zones: ZoneConfig[], totalAll: number, regionId: string, markupPct: number, regionLabel: string, dateStr: string): string {
  const { customer, contractor, address, contractNumber, contractDate, actNumber, actDateFrom, actDateTo } = s;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Акт выполненных работ</title><style>${CSS}</style></head><body>
    <h1>АКТ ВЫПОЛНЕННЫХ РАБОТ № ${actNumber}</h1>
    <p class="sub">от ${dateStr}</p>

    <div class="ks-box">
      <table>
        ${customer ? `<tr><td>Заказчик:</td><td><b>${customer}</b></td></tr>` : ""}
        ${contractor ? `<tr><td>Исполнитель:</td><td><b>${contractor}</b></td></tr>` : ""}
        ${address ? `<tr><td>Объект:</td><td>${address}</td></tr>` : ""}
        ${contractNumber ? `<tr><td>Основание (договор №):</td><td>${contractNumber}${contractDate ? " от " + contractDate : ""}</td></tr>` : ""}
        ${actDateFrom ? `<tr><td>Период выполнения:</td><td>с ${actDateFrom} по ${actDateTo || "___________"}</td></tr>` : ""}
        <tr><td>Регион:</td><td>${regionLabel}</td></tr>
      </table>
    </div>

    <p style="font-size:10px;margin-bottom:8px">
      Исполнитель выполнил, а Заказчик принял следующие работы:
    </p>

    ${detailTable(zones, regionId, markupPct, totalAll, markupPct > 0)}

    <p style="font-size:10px;margin:8px 0">
      Заказчик принял работы в полном объёме, претензий по качеству и срокам не имеет.
    </p>

    ${signsBlock(s)}
  </body></html>`;
}

// ── Основной компонент ─────────────────────────────────────────────────────

const DOC_TABS: { id: DocFormat; label: string }[] = [
  { id: "smeta", label: "📋 Смета" },
  { id: "kp", label: "📄 КП" },
  { id: "ks2", label: "📑 КС-2" },
  { id: "ks3", label: "📊 КС-3" },
  { id: "act", label: "✅ Акт" },
];

export default function OfficeExportPanel({ exportState, onChange, zones, totalAll, regionId, markupPct }: Props) {
  const [printing, setPrinting] = useState(false);
  const { docType, showForm, customer, contractor, address, phone, email, validDays,
    foremanName, foremanPhone, supplyName, supplyPhone,
    contractNumber, contractDate, actNumber, actDateFrom, actDateTo } = exportState;

  const regionLabel = REGIONS.find(r => r.id === regionId)?.label ?? regionId;

  const handlePrint = () => {
    setPrinting(true);
    const dateStr = new Date().toLocaleDateString("ru-RU");

    let html = "";
    if (docType === "smeta" || docType === "kp") {
      const title = docType === "smeta" ? "СМЕТА" : "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ";
      html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title><style>${CSS}</style></head><body>
        <h1>${title}</h1>
        <p class="sub">на выполнение работ по коммерческому помещению · ${dateStr}</p>
        ${metaBlock(exportState, regionLabel, dateStr)}
        ${staffBlock(exportState)}
        ${summaryTable(zones, totalAll, markupPct > 0)}
        <div class="pg-break"></div>
        <h1 style="margin-bottom:8px">${title} — Детализация</h1>
        ${detailTable(zones, regionId, markupPct, totalAll, markupPct > 0)}
        ${signsBlock(exportState)}
      </body></html>`;
    } else if (docType === "ks2") {
      html = buildKS2(exportState, zones, totalAll, regionId, markupPct, regionLabel, dateStr);
    } else if (docType === "ks3") {
      html = buildKS3(exportState, zones, totalAll, regionId, markupPct, regionLabel, dateStr);
    } else if (docType === "act") {
      html = buildAct(exportState, zones, totalAll, regionId, markupPct, regionLabel, dateStr);
    }

    const win = window.open("", "_blank", "width=960,height=720");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); setPrinting(false); }, 350);
    } else {
      setPrinting(false);
    }
  };

  const isActDoc = docType === "ks2" || docType === "ks3" || docType === "act";

  return (
    <Card className="overflow-hidden">
      {/* Шапка */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b">
        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
          <Icon name="Printer" size={14} className="text-blue-600" />
          Сформировать документ
        </h3>
        <button
          onClick={() => onChange({ showForm: !showForm })}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {showForm ? "Скрыть" : "Реквизиты"}
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Тип документа */}
        <div className="grid grid-cols-5 gap-1">
          {DOC_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => onChange({ docType: t.id })}
              className={`py-2 px-1 rounded-xl text-xs font-medium border-2 transition-all text-center ${
                docType === t.id
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-gray-200 text-gray-600 hover:border-blue-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Форма реквизитов */}
        {showForm && (
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Заказчик</Label>
              <Input value={customer} onChange={e => onChange({ customer: e.target.value })}
                placeholder="ФИО или компания" className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Подрядчик / ваша компания</Label>
              <Input value={contractor} onChange={e => onChange({ contractor: e.target.value })}
                placeholder="Название компании / ИП" className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Адрес объекта</Label>
              <Input value={address} onChange={e => onChange({ address: e.target.value })}
                placeholder="Город, улица, номер" className="h-8 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Телефон</Label>
                <Input value={phone} onChange={e => onChange({ phone: e.target.value })}
                  placeholder="+7..." className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">E-mail</Label>
                <Input value={email} onChange={e => onChange({ email: e.target.value })}
                  placeholder="email" className="h-8 text-sm" />
              </div>
            </div>

            {/* Договор */}
            <div className="border-t pt-2">
              <Label className="text-xs text-gray-500 mb-1.5 block font-medium">Реквизиты договора</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input value={contractNumber} onChange={e => onChange({ contractNumber: e.target.value })}
                  placeholder="Номер договора" className="h-8 text-sm" />
                <Input value={contractDate} onChange={e => onChange({ contractDate: e.target.value })}
                  placeholder="Дата договора" className="h-8 text-sm" />
              </div>
            </div>

            {/* Для актов — период */}
            {isActDoc && (
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block font-medium">
                  Период выполнения работ
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={actNumber} onChange={e => onChange({ actNumber: e.target.value })}
                    placeholder="Номер акта" className="h-8 text-sm" />
                  <Input value={actDateFrom} onChange={e => onChange({ actDateFrom: e.target.value })}
                    placeholder="Дата начала" className="h-8 text-sm" />
                  <Input value={actDateTo} onChange={e => onChange({ actDateTo: e.target.value })}
                    placeholder="Дата конца" className="h-8 text-sm" />
                </div>
              </div>
            )}

            {/* Прораб */}
            <div className="border-t pt-2">
              <Label className="text-xs text-gray-500 mb-1.5 block font-medium">Прораб</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input value={foremanName} onChange={e => onChange({ foremanName: e.target.value })}
                  placeholder="ФИО прораба" className="h-8 text-sm" />
                <Input value={foremanPhone} onChange={e => onChange({ foremanPhone: e.target.value })}
                  placeholder="+7..." className="h-8 text-sm" />
              </div>
            </div>

            {/* Снабженец */}
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block font-medium">Снабженец</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input value={supplyName} onChange={e => onChange({ supplyName: e.target.value })}
                  placeholder="ФИО снабженца" className="h-8 text-sm" />
                <Input value={supplyPhone} onChange={e => onChange({ supplyPhone: e.target.value })}
                  placeholder="+7..." className="h-8 text-sm" />
              </div>
            </div>

            {docType === "kp" && (
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Срок действия КП (дней)</Label>
                <Input value={validDays} onChange={e => onChange({ validDays: e.target.value })}
                  type="number" min={1} max={365} className="h-8 text-sm w-24" />
              </div>
            )}
          </div>
        )}

        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePrint} disabled={printing}>
          {printing
            ? <Icon name="Loader2" size={15} className="animate-spin mr-2" />
            : <Icon name="Printer" size={15} className="mr-2" />
          }
          Печать / Сохранить PDF
        </Button>
      </div>
    </Card>
  );
}
