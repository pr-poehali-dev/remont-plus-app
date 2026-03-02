import {
  ZoneConfig, fmtPrice, REGIONS,
  FINISH_LEVELS, FLOORING_OPTIONS, CEILING_OPTIONS, PARTITION_OPTIONS,
  HEATING_OPTIONS, VENT_OPTIONS, ALARM_OPTIONS, CCTV_OPTIONS,
  ACCESS_OPTIONS, FIRE_PROTECTION_OPTIONS, METAL_FIREPROOF_OPTIONS,
  WOOD_FIREPROOF_OPTIONS, NETWORK_OPTIONS, MATERIALS_SUPPLY,
  DOC_PROJECT_OPTIONS, DOC_ESTIMATE_OPTIONS, DOC_PERMIT_OPTIONS,
  ROOM_TYPES,
} from "./officeCalcTypes";
import { OfficeExportState } from "./officeExportTypes";

// ── Типы ───────────────────────────────────────────────────────────────────

interface LineItem {
  section: string;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
  total: number;
}

// ── CSS для печатных форм ──────────────────────────────────────────────────

export const CSS = `
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

// ── Детализация по статьям для одной зоны ─────────────────────────────────

export function getZoneLines(z: ZoneConfig, regionId: string, markupPct: number): LineItem[] {
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

  // Материалы — детализированный расчёт расходников по разделам
  if (z.blockMaterials && matSupply.coeff > 0) {
    const laborSubtotal = lines.reduce((s, l) => s + l.total, 0);
    const matBudget = Math.round(laborSubtotal * matSupply.coeff * z.materialsCoeffCustom);
    if (matBudget > 0) {
      const sec = "Материалы и расходники";
      const addM = (name: string, unit: string, qty: number, unitPrice: number) => {
        const total = Math.round(qty * unitPrice);
        if (qty > 0 && total > 0) lines.push({ section: sec, name, unit, qty, unitPrice, total });
      };

      // ── Отделочные работы (грунт, шпатлёвка, краска) ──────────────────
      if (z.blockFinish && finish.pricePerM2 > 0) {
        addM("Грунтовка универсальная", "л", Math.ceil(z.area * 0.2), 180);
        addM("Шпатлёвка финишная", "кг", Math.ceil(z.area * 1.2), 55);
        addM("Краска интерьерная (2 слоя)", "л", Math.ceil(z.area * 0.35), 320);
        addM("Малярная лента 50 мм", "рул.", Math.ceil(z.area / 15), 90);
        addM("Валик малярный 200 мм", "шт.", Math.max(1, Math.ceil(z.area / 80)), 350);
        addM("Кювета малярная", "шт.", Math.max(1, Math.ceil(z.area / 80)), 120);
        addM("Кисть-флейц 100 мм", "шт.", Math.max(1, Math.ceil(z.area / 100)), 280);
        addM("Шпатель стальной 400 мм", "шт.", Math.max(1, Math.ceil(z.area / 120)), 380);
      }

      // ── Полы ───────────────────────────────────────────────────────────
      if (z.blockFlooring && flooring.pricePerM2 > 0) {
        if (z.flooring === "porcelain") {
          addM("Клей плиточный (25 кг/меш.)", "меш.", Math.ceil(z.area / 4), 620);
          addM("Затирка для швов (2 кг/уп.)", "уп.", Math.ceil(z.area / 8), 380);
          addM("Крестики для плитки 2 мм", "уп.", Math.ceil(z.area / 3), 95);
          addM("Грунтовка для основания", "л", Math.ceil(z.area * 0.15), 180);
        } else if (z.flooring === "linoleum" || z.flooring === "carpet") {
          addM("Клей-мастика для покрытия", "л", Math.ceil(z.area * 0.3), 420);
          addM("Малярная лента 50 мм", "рул.", Math.ceil(z.area / 20), 90);
          addM("Нож монтажный + лезвия", "компл.", 1, 350);
        } else if (z.flooring === "epoxy") {
          addM("Грунтовка эпоксидная (компл.)", "компл.", Math.ceil(z.area / 20), 1800);
          addM("Растворитель технический", "л", Math.ceil(z.area / 15), 220);
          addM("Валик игольчатый 400 мм", "шт.", Math.max(1, Math.ceil(z.area / 50)), 850);
        } else if (z.flooring === "raised_floor") {
          addM("Саморезы 4×25 мм (200 шт/уп)", "уп.", Math.ceil(z.area / 5), 280);
          addM("Дюбель-гвоздь 6×40 мм (100 шт/уп)", "уп.", Math.ceil(z.area / 8), 190);
        }
        addM("Подложка под покрытие 3 мм", "м²", Math.ceil(z.area * 1.05), 55);
        addM("Плинтус напольный 60 мм", "пм", Math.ceil(Math.sqrt(z.area) * 4), 180);
      }

      // ── Потолок ────────────────────────────────────────────────────────
      if (z.blockCeiling && ceiling.pricePerM2 > 0) {
        if (z.ceiling === "armstrong") {
          addM("Профиль подвесной (тройник/крест)", "пм", Math.ceil(z.area * 0.8), 95);
          addM("Подвес прямой потолочный", "шт.", Math.ceil(z.area / 0.6), 22);
          addM("Саморезы 3.5×9 мм (500 шт/уп)", "уп.", Math.ceil(z.area / 20), 210);
        } else if (z.ceiling === "gypsum") {
          addM("Профиль CD 60/27 (3м)", "шт.", Math.ceil(z.area / 1.5), 145);
          addM("Профиль UD 27/28 (3м)", "шт.", Math.ceil(Math.sqrt(z.area) * 1.5), 120);
          addM("Саморезы 3.5×25 мм (500 шт/уп)", "уп.", Math.ceil(z.area / 12), 210);
          addM("Лента бандажная армирующая", "м", Math.ceil(z.area * 1.5), 18);
          addM("Шпатлёвка стартовая (20 кг/меш.)", "меш.", Math.ceil(z.area / 10), 580);
          addM("Шпатлёвка финишная (20 кг/меш.)", "меш.", Math.ceil(z.area / 15), 620);
          addM("Грунтовка глубокого проникновения", "л", Math.ceil(z.area * 0.2), 180);
          addM("Краска потолочная (2 слоя)", "л", Math.ceil(z.area * 0.3), 340);
          addM("Валик малярный 150 мм", "шт.", Math.max(1, Math.ceil(z.area / 80)), 280);
        } else if (z.ceiling === "stretch") {
          addM("Багет пристенный (ПВХ)", "пм", Math.ceil(Math.sqrt(z.area) * 4), 210);
        } else if (z.ceiling === "grillato") {
          addM("Подвес для грильято", "шт.", Math.ceil(z.area / 0.5), 85);
          addM("Саморезы 3.5×9 мм (500 шт/уп)", "уп.", Math.ceil(z.area / 25), 210);
        }
      }

      // ── Перегородки ────────────────────────────────────────────────────
      if (z.blockPartitions && partition.pricePerLM > 0 && z.partitionLinearM > 0) {
        const lm = z.partitionLinearM;
        const h = z.height;
        if (z.partitions === "gypsum") {
          addM("Профиль CW 75 мм (3м)", "шт.", Math.ceil(lm * h / 1.5), 145);
          addM("Профиль UW 75 мм (3м)", "шт.", Math.ceil(lm * 2 / 3), 120);
          addM("ГКЛ 12,5 мм (лист 1,2×2,5м)", "шт.", Math.ceil(lm * h / 3 * 2), 680);
          addM("Минвата 50 мм (6 м²/уп)", "уп.", Math.ceil(lm * h / 6), 1200);
          addM("Саморезы 3.5×25 мм (500 шт/уп)", "уп.", Math.ceil(lm * h / 8), 210);
          addM("Саморезы 3.5×9 мм (500 шт/уп)", "уп.", Math.ceil(lm / 5), 210);
          addM("Дюбель-гвоздь 6×40 мм (100 шт/уп)", "уп.", Math.ceil(lm / 4), 190);
          addM("Лента демпферная (10м/рул.)", "рул.", Math.ceil(lm / 5), 280);
          addM("Серпянка армирующая (50м/рул.)", "рул.", Math.ceil(lm * h * 0.3 / 50), 380);
          addM("Шпатлёвка финишная (20 кг/меш.)", "меш.", Math.ceil(lm * h / 15), 620);
          addM("Грунтовка глубокого проникновения", "л", Math.ceil(lm * h * 0.25), 180);
        } else if (z.partitions === "glass" || z.partitions === "glass_full") {
          addM("Герметик силиконовый прозрачный (310 мл)", "шт.", Math.ceil(lm / 5), 320);
          addM("Уплотнительная резина (10м/рул.)", "рул.", Math.ceil(lm / 8), 480);
          addM("Анкер-болт 8×80 мм (10 шт/уп)", "уп.", Math.ceil(lm / 0.6), 190);
        }
      }

      // ── Отопление ──────────────────────────────────────────────────────
      if (z.blockHeating && heating.pricePerM2 > 0) {
        addM("Лента герметизирующая алюм. 50 мм", "рул.", Math.max(1, Math.ceil(z.area / 60)), 180);
        addM("Хомут монтажный пластиковый (100 шт/уп)", "уп.", Math.ceil(z.area / 20), 95);
        if (z.heating === "underfloor") {
          addM("Монтажная лента для тёплого пола (50м)", "рул.", Math.ceil(z.area / 50), 320);
          addM("Демпферная лента (25м/рул.)", "рул.", Math.ceil(Math.sqrt(z.area) * 4 / 25), 280);
        }
      }

      // ── Вентиляция ─────────────────────────────────────────────────────
      if (z.blockVentilation && (vent.pricePerM2 > 0 || z.airConditioners > 0)) {
        addM("Герметик для воздуховодов (310 мл)", "шт.", Math.max(1, Math.ceil(z.area / 40)), 340);
        addM("Алюминиевая самоклеящаяся лента 50 мм", "рул.", Math.ceil(z.area / 30), 180);
        addM("Хомут монтажный пластиковый (100 шт/уп)", "уп.", Math.ceil(z.area / 15), 95);
        if (z.airConditioners > 0) {
          addM("Монтажная пена (850 мл)", "балл.", z.airConditioners, 280);
          addM("Кабельный канал 40×16 мм (2м)", "шт.", z.airConditioners * 2, 120);
        }
      }

      // ── Электрика ──────────────────────────────────────────────────────
      if (z.blockElectric) {
        if (z.electricPoints > 0) {
          addM("Кабель ВВГнг 3×2.5 мм² (50м/бух.)", "бух.", Math.ceil(z.electricPoints / 8), 2800);
          addM("Кабель ВВГнг 3×1.5 мм² (50м/бух.)", "бух.", Math.ceil(z.electricPoints / 12), 1900);
          addM("Гофротруба ПВД 20 мм (50м/бух.)", "бух.", Math.ceil(z.electricPoints / 6), 480);
          addM("Распаечная коробка ОП 65×65", "шт.", Math.ceil(z.electricPoints / 3), 55);
          addM("Клеммник WAGO 5×2.5 (100 шт/уп)", "уп.", Math.ceil(z.electricPoints / 8), 680);
          addM("Изолента ПВХ (10м/рул.)", "рул.", Math.ceil(z.electricPoints / 10), 65);
          addM("Дюбель-гвоздь 6×40 мм (100 шт/уп)", "уп.", Math.ceil(z.electricPoints / 5), 190);
        }
        if (z.lighting) {
          addM("Кабель ВВГнг 3×1.5 мм² (50м/бух.)", "бух.", Math.ceil(z.area / 25), 1900);
          addM("Гофротруба ПВД 16 мм (50м/бух.)", "бух.", Math.ceil(z.area / 30), 360);
        }
      }

      // ── Пожарная безопасность ──────────────────────────────────────────
      if (z.blockFire && (z.fireSignaling || z.fireSensors > 0)) {
        addM("Кабель КСПВ 2×0.5 (200м/бух.)", "бух.", Math.ceil(z.fireSensors / 10), 980);
        addM("Дюбель-гвоздь 6×40 мм (100 шт/уп)", "уп.", Math.ceil(z.fireSensors / 8), 190);
        addM("Хомут монтажный белый (100 шт/уп)", "уп.", Math.ceil(z.fireSensors / 12), 95);
      }

      // ── Итог материалов: если детализация превышает бюджет — пропускаем
      // Считаем фактическую сумму детализации
      const detailLines = lines.filter(l => l.section === sec);
      const detailTotal = detailLines.reduce((s, l) => s + l.total, 0);

      // Если детализация < бюджета — добавляем остаток как "прочие расходники"
      const remainder = matBudget - detailTotal;
      if (remainder > 500) {
        lines.push({
          section: sec,
          name: "Прочие расходные материалы (герметики, метизы, крепёж)",
          unit: "компл.",
          qty: 1,
          unitPrice: remainder,
          total: remainder,
        });
      }
      // Если детализация > бюджета — добавляем корректирующую строку (скидка)
      if (detailTotal > matBudget && detailTotal - matBudget > 500) {
        lines.push({
          section: sec,
          name: "Корректировка (оптовая закупка / скидка подрядчика)",
          unit: "компл.",
          qty: 1,
          unitPrice: -(detailTotal - matBudget),
          total: -(detailTotal - matBudget),
        });
      }
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

// ── HTML-блоки ─────────────────────────────────────────────────────────────

export function metaBlock(s: OfficeExportState, regionLabel: string, dateStr: string): string {
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

export function staffBlock(s: OfficeExportState): string {
  const { foremanName, foremanPhone, supplyName, supplyPhone } = s;
  if (!foremanName && !supplyName) return "";
  return `
    <table class="staff" style="margin-bottom:12px">
      ${foremanName ? `<tr><td>Прораб:</td><td>${foremanName}${foremanPhone ? " — " + foremanPhone : ""}</td></tr>` : ""}
      ${supplyName ? `<tr><td>Снабженец:</td><td>${supplyName}${supplyPhone ? " — " + supplyPhone : ""}</td></tr>` : ""}
    </table>`;
}

export function signsBlock(s: OfficeExportState): string {
  return `
    <div class="signs">
      <div class="sign">Заказчик${s.customer ? ": " + s.customer : ""}<br><br>_____________ / ______________</div>
      <div class="sign">Подрядчик${s.contractor ? ": " + s.contractor : ""}<br><br>_____________ / ______________</div>
    </div>
    <p class="footer">Расчёт ориентировочный. Окончательная стоимость определяется после выезда специалиста и подписания договора.</p>`;
}

export function detailTable(zones: ZoneConfig[], regionId: string, markupPct: number, totalAll: number, withMarkup: boolean): string {
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

export function summaryTable(zones: ZoneConfig[], totalAll: number, withMarkup: boolean): string {
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

// ── Построители HTML-документов ────────────────────────────────────────────

export function buildSmeta(s: OfficeExportState, zones: ZoneConfig[], totalAll: number, regionId: string, markupPct: number, regionLabel: string, dateStr: string): string {
  const title = s.docType === "smeta" ? "СМЕТА" : "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title><style>${CSS}</style></head><body>
    <h1>${title}</h1>
    <p class="sub">на выполнение работ по коммерческому помещению · ${dateStr}</p>
    ${metaBlock(s, regionLabel, dateStr)}
    ${staffBlock(s)}
    ${summaryTable(zones, totalAll, markupPct > 0)}
    <div class="pg-break"></div>
    <h1 style="margin-bottom:8px">${title} — Детализация</h1>
    ${detailTable(zones, regionId, markupPct, totalAll, markupPct > 0)}
    ${signsBlock(s)}
  </body></html>`;
}

export function buildKS2(s: OfficeExportState, zones: ZoneConfig[], totalAll: number, regionId: string, markupPct: number, regionLabel: string, dateStr: string): string {
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

export function buildKS3(s: OfficeExportState, zones: ZoneConfig[], totalAll: number, regionId: string, markupPct: number, regionLabel: string, dateStr: string): string {
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

export function buildMaterials(s: OfficeExportState, zones: ZoneConfig[], regionId: string, markupPct: number, regionLabel: string, dateStr: string): string {
  const { customer, contractor, address, contractNumber, contractDate } = s;

  // Собираем все позиции материалов по всем зонам
  interface MatRow { zone: string; name: string; unit: string; qty: number; unitPrice: number; total: number; }
  const allRows: MatRow[] = [];

  for (const z of zones) {
    if (!z.blockMaterials) continue;
    const lines = getZoneLines(z, regionId, markupPct);
    const matLines = lines.filter(l => l.section === "Материалы и расходники");
    for (const l of matLines) {
      allRows.push({ zone: z.name, name: l.name, unit: l.unit, qty: l.qty, unitPrice: l.unitPrice, total: l.total });
    }
  }

  // Группируем одинаковые позиции по всем зонам
  const grouped: Map<string, { name: string; unit: string; unitPrice: number; byZone: { zone: string; qty: number; total: number }[]; totalQty: number; totalSum: number }> = new Map();
  for (const r of allRows) {
    const key = `${r.name}||${r.unit}||${r.unitPrice}`;
    if (!grouped.has(key)) {
      grouped.set(key, { name: r.name, unit: r.unit, unitPrice: r.unitPrice, byZone: [], totalQty: 0, totalSum: 0 });
    }
    const g = grouped.get(key)!;
    g.byZone.push({ zone: r.zone, qty: r.qty, total: r.total });
    g.totalQty += r.qty;
    g.totalSum += r.total;
  }

  const grandTotal = Array.from(grouped.values()).reduce((s, g) => s + g.totalSum, 0);
  const multiZone = zones.filter(z => z.blockMaterials).length > 1;

  let n = 1;
  const rows = Array.from(grouped.values()).map((g, i) => {
    const zoneNote = multiZone && g.byZone.length > 1
      ? `<br><span style="color:#888;font-size:9px">${g.byZone.map(bz => `${bz.zone}: ${bz.qty} ${g.unit}`).join(" · ")}</span>`
      : "";
    return `<tr style="background:${i % 2 === 0 ? "#fff" : "#f5f7fa"}">
      <td style="color:#555;text-align:center">${n++}</td>
      <td>${g.name}${zoneNote}</td>
      <td class="r">${g.totalQty}</td>
      <td>${g.unit}</td>
      <td class="r">${g.unitPrice.toLocaleString("ru-RU")}</td>
      <td class="r"><b>${g.totalSum.toLocaleString("ru-RU")}</b></td>
    </tr>`;
  }).join("");

  const noMaterials = allRows.length === 0
    ? `<p style="color:#888;text-align:center;padding:20px">Нет зон с включённым разделом «Материалы». Активируйте раздел материалов в настройках зоны.</p>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Ведомость материалов</title><style>${CSS}
    .num-col{width:30px;text-align:center;color:#555}
  </style></head><body>
    <h1>ВЕДОМОСТЬ МАТЕРИАЛОВ И РАСХОДНИКОВ</h1>
    <p class="sub">на выполнение работ по коммерческому помещению · ${dateStr}</p>

    <div class="ks-box">
      <table>
        ${customer ? `<tr><td>Заказчик:</td><td><b>${customer}</b></td></tr>` : ""}
        ${contractor ? `<tr><td>Подрядчик / снабженец:</td><td><b>${contractor}</b></td></tr>` : ""}
        ${address ? `<tr><td>Адрес объекта:</td><td>${address}</td></tr>` : ""}
        ${contractNumber ? `<tr><td>Договор №:</td><td>${contractNumber}${contractDate ? " от " + contractDate : ""}</td></tr>` : ""}
        <tr><td>Регион:</td><td>${regionLabel}</td></tr>
        <tr><td>Дата:</td><td>${dateStr}</td></tr>
        <tr><td>Зоны:</td><td>${zones.filter(z => z.blockMaterials).map(z => `${z.name} (${z.area} м²)`).join(", ") || "—"}</td></tr>
      </table>
    </div>

    ${noMaterials}

    ${allRows.length > 0 ? `
    <table style="margin-bottom:14px">
      <thead><tr>
        <th style="width:30px;text-align:center">№</th>
        <th>Наименование материала / расходника</th>
        <th class="r">Кол-во</th>
        <th>Ед.</th>
        <th class="r">Цена за ед., ₽</th>
        <th class="r">Сумма, ₽</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr class="total-row">
        <td colspan="5">ИТОГО К ЗАКУПКЕ</td>
        <td class="r">${fmtPrice(grandTotal)}</td>
      </tr></tfoot>
    </table>

    <p style="font-size:9px;color:#888;margin-top:4px">
      * Количество рассчитано по нормам расхода. При закупке рекомендуется добавить 5–10% запаса.
      Цены ориентировочные — уточняйте у поставщиков.
    </p>
    ` : ""}

    <div class="signs" style="margin-top:24px">
      <div class="sign">Составил${contractor ? ": " + contractor : ""}<br><br>_____________ / ______________</div>
      <div class="sign">Принял${customer ? ": " + customer : ""}<br><br>_____________ / ______________</div>
    </div>
  </body></html>`;
}

export function buildAct(s: OfficeExportState, zones: ZoneConfig[], totalAll: number, regionId: string, markupPct: number, regionLabel: string, dateStr: string): string {
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