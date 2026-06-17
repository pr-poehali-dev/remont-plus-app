import {
  REGIONS, ROOM_TYPES, RENOVATION_LEVELS, SCREED_TYPES,
  PLASTER_TYPES, CEILING_FINISH_TYPES, FLOORING_TYPES, DOOR_TYPES,
  HEATED_FLOOR_TYPES, BACKSPLASH_TYPES, COUNTERTOP_TYPES,
  CONDITIONER_TYPES, SOUNDPROOF_TYPES,
  BATHTUB_TYPES, SHOWER_TYPES, TOILET_TYPES, SINK_TYPES, PLUMBING_PIPES_TYPES,
} from "./NewbuildTypes";
import type { NewbuildConfig } from "./NewbuildTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

/**
 * ЕДИНЫЙ ДВИЖОК РАСЧЁТА РЕМОНТА В НОВОСТРОЙКЕ (расценки 2026 г.)
 *
 * Принцип: смета строится ТОЛЬКО из детальных позиций (норма расхода × цена).
 * Итог = строгая сумма всех позиций. Никаких «процентных» приближений
 * (было: materialsCost = screedCost*0.60 + ...).
 *
 * Каждая позиция помечена блоком (block) — экранный калькулятор показывает
 * привычную разбивку по этапам (blockTotals), печать — полный список.
 *
 * Региональный коэффициент rc и уровень отделки lc применяются к РАБОТАМ
 * (как и раньше). Материалы — по прайсу поставщика; на материалы влияет lc
 * там, где уровень меняет класс материала (краска, напольное, тёплый пол).
 */

export type NewbuildBlock =
  | "screed"
  | "plaster"
  | "ceiling"
  | "paint"
  | "flooring"
  | "electrics"
  | "doors"
  | "windowSlopes"
  | "heatedFloor"
  | "backsplash"
  | "countertop"
  | "conditioner"
  | "soundproof"
  | "plumbing";

export interface NewbuildLine extends MaterialItem {
  block: NewbuildBlock;
}

export interface NewbuildEstimate {
  lines: NewbuildLine[];
  works: NewbuildLine[];
  materials: NewbuildLine[];
  worksTotal: number;
  materialsTotal: number;
  subtotal: number;     // works + materials (без наценки)
  markupAmount: number;
  total: number;        // subtotal + markup
  regionCoeff: number;
  levelCoeff: number;
  blockTotals: Record<NewbuildBlock, number>;
}

// ─── РАСЦЕНКИ РАБОТ 2026, ₽ (база, до lc и rc) ───────────────────────────────
const WORK_RATES = {
  screedDry: 620,            // монтаж сухой стяжки, ₽/м²
  screedWet: 720,            // устройство мокрой стяжки по маякам, ₽/м²
  screedSelf: 480,           // заливка наливного пола, ₽/м²
  plaster: 650,              // штукатурка стен по маякам, ₽/м²
  ceilingPaint: 520,         // шпаклёвка+покраска потолка, ₽/м²
  ceilingStretch: 480,       // монтаж натяжного потолка, ₽/м²
  ceilingGkl: 1150,          // монтаж ГКЛ-потолка, ₽/м²
  paint: 280,                // покраска поверхности (1 слой), ₽/м²
  flooringLay: 550,          // укладка напольного покрытия, ₽/м²
  electricPoint: 950,        // монтаж точки (розетка/выключатель), ₽/шт
  electricWiring: 320,       // штробление+разводка, ₽/м² площади
  doorInstall: 4500,         // установка двери с коробкой, ₽/шт
  windowSlope: 2800,         // монтаж откоса проёма, ₽/проём
  heatedFloorLay: 850,       // монтаж тёплого пола, ₽/м²
  backsplashLay: 1600,       // укладка фартука, ₽/м²
  countertopInstall: 1500,   // установка столешницы, ₽/м.п.
  conditionerInstall: 9500,  // монтаж сплит-системы, ₽/шт
  soundproof: 950,           // монтаж шумоизоляции, ₽/м²
  plumbingPoint: 2600,       // разводка сантехточки, ₽/точка
  bathtubInstall: 5500,      // установка ванны, ₽/шт
  showerInstall: 7000,       // монтаж душа/кабины, ₽/шт
  toiletInstall: 3500,       // установка унитаза, ₽/шт
  sinkInstall: 2800,         // установка раковины, ₽/шт
};

// ─── ЦЕНЫ МАТЕРИАЛОВ 2026, ₽ ─────────────────────────────────────────────────
const MAT_PRICES = {
  screedDryGvl: 380,         // лист ГВЛ Knauf суперпол, ₽/м²
  keramzit: 3600,            // керамзит, ₽/м³
  cementMix: 12,             // ЦПС М200, ₽/кг
  fibre: 480,                // фибра, ₽/кг
  selfLevel: 32,             // наливная смесь, ₽/кг
  primer: 150,               // грунтовка, ₽/л
  beacons: 45,               // маяки, ₽/шт
  plasterMix: 18,            // штукатурная смесь, ₽/кг (~12 кг/м²)
  plasterPrimer: 120,        // грунтовка стен, ₽/л
  plasterBeacons: 58,        // маячный профиль, ₽/шт
  stretchCanvas: 480,        // натяжное полотно ПВХ, ₽/м²
  stretchProfile: 125,       // профиль натяжного, ₽/м.п.
  gkl: 360,                  // гипсокартон, ₽/м²
  gklProfile: 125,           // профиль CD/UD+подвесы, ₽/м² (компл.)
  ceilPutty: 29,             // шпаклёвка потолочная, ₽/кг (~0,9 кг/м²)
  paint: 420,                // краска интерьерная, ₽/л (~0,18 л/м²/слой)
  paintPrimer: 110,          // грунт под краску, ₽/л
  underlay: 75,              // подложка, ₽/м²
  skirting: 240,             // плинтус, ₽/м.п.
  cable: 72,                 // кабель ВВГнг 3×2,5, ₽/м.п.
  socket: 420,               // розетка, ₽/шт
  switch: 360,               // выключатель, ₽/шт
  corrugation: 80,           // гофра+подрозетники, ₽/м² (компл.)
  slopePvc: 1400,            // комплект ПВХ-откоса на проём
  slopeFoam: 490,            // пена+герметик на проём
  heatCable: 1650,           // нагревательный мат/кабель, ₽/м²
  heatPipe: 85,              // труба PEX-a, ₽/м.п.
  heatCollector: 8500,       // коллектор, ₽/шт
  thermostat: 3200,          // терморегулятор, ₽/шт
  heatInsul: 180,            // теплоизоляция, ₽/м²
  tileGlue: 350,             // плиточный клей+затирка на 1 м²
  countertopEdge: 420,       // кромка/планки на 1 м.п.
  acTrack: 4500,             // медная трасса+дренаж, ₽/компл
  mineralWool: 320,          // минвата акустическая, ₽/м²
  acousticGkl: 480,          // ГКЛ акустический, ₽/м²
  vibroKit: 180,             // виброподвесы/профиль, ₽/м²
  plumbFittings: 850,        // фитинги/арматура на точку
  bathMixer: 4200,           // смеситель ванны+сифон
  showerMixer: 3800,         // смеситель душа
  toiletKit: 650,            // гофра/крепёж унитаза
  sinkMixer: 3200,           // смеситель раковины+сифон
};

export function calcNewbuild(
  cfg: Omit<NewbuildConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): NewbuildEstimate {
  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[3];
  const roomType = ROOM_TYPES.find((r) => r.id === cfg.roomType);
  const level = RENOVATION_LEVELS.find((l) => l.id === cfg.renovationLevel);

  const rc = region.coeff;
  const lc = level?.priceCoeff ?? 1.0;
  const tc = roomType?.priceCoeff ?? 1.0;
  const area = cfg.area || 0;
  const ceilH = cfg.ceilingHeightM || 2.8;
  const wallCoeff = roomType?.wallCoeff ?? 2.4;
  const wallArea = Math.round(area * wallCoeff * ceilH / 2.8 * 10) / 10;

  const lines: NewbuildLine[] = [];
  const round = (n: number) => Math.round(n);

  // work: цена за единицу с региональным коэффициентом, уровнем и сложностью комнаты
  const work = (block: NewbuildBlock, name: string, unit: string, qty: number, ratePerUnit: number, spec?: string, applyRoom = true) => {
    if (qty <= 0 || ratePerUnit <= 0) return;
    const price = round(ratePerUnit * lc * (applyRoom ? tc : 1) * rc);
    const q = Math.round(qty * 10) / 10;
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isWork: true });
  };

  // material: цена материала (по прайсу). levelMul — где уровень меняет класс материала
  const material = (block: NewbuildBlock, name: string, unit: string, qty: number, pricePerUnit: number, spec?: string, isConsumable?: boolean) => {
    if (qty <= 0 || pricePerUnit <= 0) return;
    const q = Math.round(qty * 100) / 100;
    const price = round(pricePerUnit);
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isConsumable, isWork: false });
  };

  // ── СТЯЖКА ─────────────────────────────────────────────────
  if (cfg.screedIncluded) {
    const screedType = SCREED_TYPES.find((s) => s.id === cfg.screedType);
    if (cfg.screedType === "dry") {
      work("screed", "Монтаж сухой стяжки пола", "м²", area, WORK_RATES.screedDry, screedType?.description);
      material("screed", "Листы ГВЛ (сухая стяжка)", "м²", area * 1.08, MAT_PRICES.screedDryGvl, "Knauf Суперпол");
      material("screed", "Керамзит фракция 5–10 мм", "м³", area * 0.03, MAT_PRICES.keramzit, "засыпка 3 см", true);
    } else if (cfg.screedType === "wet") {
      work("screed", "Устройство цементной стяжки по маякам", "м²", area, WORK_RATES.screedWet, screedType?.description);
      material("screed", "Цементно-песчаная смесь М200", "кг", Math.ceil(area * 22), MAT_PRICES.cementMix, "мешки 50 кг");
      material("screed", "Фибра полипропиленовая", "кг", Math.ceil(area * 0.06), MAT_PRICES.fibre, undefined, true);
    } else {
      work("screed", "Заливка самовыравнивающегося пола", "м²", area, WORK_RATES.screedSelf, screedType?.description);
      material("screed", "Самовыравнивающаяся смесь", "кг", Math.ceil(area * 15), MAT_PRICES.selfLevel, "Vetonit 5–40 мм");
    }
    material("screed", "Грунтовка для пола", "л", Math.ceil(area * 0.2), MAT_PRICES.primer, undefined, true);
    material("screed", "Маяки для стяжки", "шт.", Math.ceil(area / 3), MAT_PRICES.beacons, undefined, true);
  }

  // ── ШТУКАТУРКА ─────────────────────────────────────────────
  if (cfg.plasterIncluded) {
    const plasterType = PLASTER_TYPES.find((p) => p.id === cfg.plasterType);
    work("plaster", `Штукатурка стен по маякам: ${plasterType?.label ?? ""}`.trim(), "м²", wallArea, WORK_RATES.plaster, plasterType?.description);
    material("plaster", `Штукатурная смесь: ${plasterType?.label ?? ""}`.trim(), "кг", Math.ceil(wallArea * 12), MAT_PRICES.plasterMix);
    material("plaster", "Грунтовка стен Ceresit CT17", "л", Math.ceil(wallArea * 0.15), MAT_PRICES.plasterPrimer, undefined, true);
    material("plaster", "Профили маячные", "шт.", Math.ceil(wallArea / 5), MAT_PRICES.plasterBeacons, undefined, true);
  }

  // ── ПОТОЛОК ────────────────────────────────────────────────
  if (cfg.ceilingLevelIncluded) {
    const ceilingType = CEILING_FINISH_TYPES.find((c) => c.id === cfg.ceilingType);
    const perimeter = Math.round(Math.sqrt(area) * 4);
    if (cfg.ceilingType === "stretch") {
      work("ceiling", "Монтаж натяжного потолка", "м²", area, WORK_RATES.ceilingStretch, ceilingType?.description);
      material("ceiling", "Натяжное полотно ПВХ", "м²", area * 1.05, MAT_PRICES.stretchCanvas, "любой цвет");
      material("ceiling", "Профиль для натяжного потолка", "м.п.", perimeter, MAT_PRICES.stretchProfile, undefined, true);
    } else if (cfg.ceilingType === "gypsum-board") {
      work("ceiling", "Монтаж гипсокартонного потолка", "м²", area, WORK_RATES.ceilingGkl, ceilingType?.description);
      material("ceiling", "Гипсокартон потолочный Knauf", "м²", area * 1.05, MAT_PRICES.gkl, "9.5 мм");
      material("ceiling", "Профиль CD/UD и подвесы", "м²", area, MAT_PRICES.gklProfile, undefined, true);
    } else {
      work("ceiling", "Шпаклёвка и покраска потолка", "м²", area, WORK_RATES.ceilingPaint, ceilingType?.description);
      material("ceiling", "Шпаклёвка потолочная Bergauf", "кг", Math.ceil(area * 0.9), MAT_PRICES.ceilPutty);
      material("ceiling", "Грунтовка потолка", "л", Math.ceil(area * 0.15), MAT_PRICES.plasterPrimer, undefined, true);
    }
  }

  // ── МАЛЯРНЫЕ РАБОТЫ ────────────────────────────────────────
  let paintArea = 0;
  if (cfg.paintingWalls) paintArea += wallArea;
  if (cfg.paintingCeiling) paintArea += area;
  if (paintArea > 0) {
    const layers = cfg.paintLayersCount || 2;
    const surfaces = [cfg.paintingWalls ? "стены" : null, cfg.paintingCeiling ? "потолок" : null].filter(Boolean).join(", ");
    work("paint", `Покраска (${surfaces})`, "м²", paintArea * layers, WORK_RATES.paint, `${layers} слоя`, false);
    const litres = Math.ceil(paintArea * 0.18 * layers);
    material("paint", "Краска интерьерная Dulux / Tikkurila", "л", litres, round(MAT_PRICES.paint * lc), `${layers} слоя`);
    material("paint", "Грунтовка под краску", "л", Math.ceil(paintArea * 0.12), MAT_PRICES.paintPrimer, undefined, true);
    material("paint", "Малярный скотч, валики, кисти", "компл.", 1, round(paintArea * 20), undefined, true);
  }

  // ── НАПОЛЬНОЕ ПОКРЫТИЕ ─────────────────────────────────────
  {
    const flooringType = FLOORING_TYPES.find((f) => f.id === cfg.flooringType);
    if (flooringType && area > 0) {
      const perimeter = Math.round(Math.sqrt(area) * 4);
      work("flooring", `Укладка покрытия: ${flooringType.label}`, "м²", area, WORK_RATES.flooringLay, flooringType.description);
      material("flooring", `Напольное покрытие: ${flooringType.label}`, "м²", area * 1.08, round(flooringType.priceM2 * lc), "+8% отход");
      material("flooring", "Подложка 3 мм", "м²", area * 1.05, MAT_PRICES.underlay, undefined, true);
      material("flooring", "Плинтус напольный", "м.п.", perimeter, MAT_PRICES.skirting);
    }
  }

  // ── ЭЛЕКТРИКА ──────────────────────────────────────────────
  if (cfg.electricsIncluded) {
    const points = cfg.outletsCount + cfg.switchesCount;
    work("electrics", "Штробление и разводка кабеля", "м²", area, WORK_RATES.electricWiring, "по площади помещения");
    work("electrics", "Монтаж электроточек (розетки/выключатели)", "шт.", points, WORK_RATES.electricPoint);
    material("electrics", "Кабель ВВГнг-LS 3×2,5 мм²", "м.п.", Math.round(area * 4), MAT_PRICES.cable);
    material("electrics", "Розетки", "шт.", cfg.outletsCount, MAT_PRICES.socket);
    material("electrics", "Выключатели", "шт.", cfg.switchesCount, MAT_PRICES.switch);
    material("electrics", "Гофра, подрозетники", "м²", area, MAT_PRICES.corrugation, undefined, true);
  }

  // ── ДВЕРИ ──────────────────────────────────────────────────
  if (cfg.doorsCount > 0) {
    const doorType = DOOR_TYPES.find((d) => d.id === cfg.doorType);
    work("doors", "Установка межкомнатной двери", "шт.", cfg.doorsCount, WORK_RATES.doorInstall, doorType?.label);
    material("doors", `Дверь: ${doorType?.label ?? ""}`.trim(), "шт.", cfg.doorsCount, doorType?.pricePerDoor ?? 20000, "с коробкой");
    material("doors", "Наличники, петли, ручки", "компл.", cfg.doorsCount, round((doorType?.pricePerDoor ?? 20000) * 0.05), undefined, true);
  }

  // ── ОТКОСЫ ОКОН ────────────────────────────────────────────
  if (cfg.windowSlopesCount > 0) {
    work("windowSlopes", "Монтаж оконных откосов", "проём", cfg.windowSlopesCount, WORK_RATES.windowSlope);
    material("windowSlopes", "Откосы оконные ПВХ", "проём", cfg.windowSlopesCount, MAT_PRICES.slopePvc, "комплект");
    material("windowSlopes", "Монтажная пена, герметик", "проём", cfg.windowSlopesCount, MAT_PRICES.slopeFoam, undefined, true);
  }

  // ── ТЁПЛЫЙ ПОЛ ─────────────────────────────────────────────
  if (cfg.heatedFloorIncluded) {
    const hfType = HEATED_FLOOR_TYPES.find((h) => h.id === cfg.heatedFloorType);
    const hfA = cfg.heatedFloorArea > 0 ? cfg.heatedFloorArea : area * 0.7;
    work("heatedFloor", `Монтаж тёплого пола: ${hfType?.label ?? ""}`.trim(), "м²", hfA, WORK_RATES.heatedFloorLay, hfType?.description);
    if (cfg.heatedFloorType === "water") {
      material("heatedFloor", "Труба PEX-a для тёплого пола", "м.п.", Math.round(hfA * 6.5), MAT_PRICES.heatPipe, "16×2 мм");
      material("heatedFloor", "Коллектор тёплого пола", "компл.", 1, MAT_PRICES.heatCollector);
    } else {
      material("heatedFloor", `Нагревательный ${cfg.heatedFloorType === "electric-mat" ? "мат" : "кабель"}`, "м²", hfA, MAT_PRICES.heatCable, hfType?.description);
    }
    material("heatedFloor", "Терморегулятор с датчиком", "шт.", 1, MAT_PRICES.thermostat);
    material("heatedFloor", "Теплоизоляция (пенополистирол 20 мм)", "м²", hfA * 1.05, MAT_PRICES.heatInsul, undefined, true);
  }

  // ── КУХОННЫЙ ФАРТУК ────────────────────────────────────────
  if (cfg.backsplashIncluded) {
    const bsType = BACKSPLASH_TYPES.find((b) => b.id === cfg.backsplashType);
    const bsArea = cfg.backsplashArea || 3;
    work("backsplash", `Укладка фартука: ${bsType?.label ?? ""}`.trim(), "м²", bsArea, WORK_RATES.backsplashLay, bsType?.description);
    material("backsplash", `Фартук: ${bsType?.label ?? "плитка"}`, "м²", bsArea * 1.1, bsType?.priceM2 ?? 3850);
    if (cfg.backsplashType !== "glass") {
      material("backsplash", "Плиточный клей, затирка", "м²", bsArea, MAT_PRICES.tileGlue, undefined, true);
    }
  }

  // ── СТОЛЕШНИЦА ─────────────────────────────────────────────
  if (cfg.countertopIncluded) {
    const ctType = COUNTERTOP_TYPES.find((c) => c.id === cfg.countertopType);
    const ctLen = cfg.countertopLength || 3;
    work("countertop", "Установка и подгонка столешницы", "м.п.", ctLen, WORK_RATES.countertopInstall, ctType?.label);
    material("countertop", `Столешница: ${ctType?.label ?? "ДСП"}`, "м.п.", ctLen, ctType?.pricePerMeter ?? 4400, "глубина 600 мм");
    material("countertop", "Кромка, торцевые планки, герметик", "м.п.", ctLen, MAT_PRICES.countertopEdge, undefined, true);
  }

  // ── КОНДИЦИОНИРОВАНИЕ ──────────────────────────────────────
  if (cfg.conditionerIncluded) {
    const acType = CONDITIONER_TYPES.find((c) => c.id === cfg.conditionerType);
    const acQty = cfg.conditionerCount || 1;
    work("conditioner", "Монтаж сплит-системы", "шт.", acQty, WORK_RATES.conditionerInstall, acType?.label, false);
    material("conditioner", `${acType?.label ?? "Сплит-система"}`, "шт.", acQty, acType?.pricePerUnit ?? 38500, acType?.description);
    material("conditioner", "Медная трасса + дренаж", "компл.", acQty, MAT_PRICES.acTrack, "до 5 м.п.", true);
  }

  // ── ШУМОИЗОЛЯЦИЯ ───────────────────────────────────────────
  if (cfg.soundproofIncluded) {
    const spType = SOUNDPROOF_TYPES.find((s) => s.id === cfg.soundproofType);
    work("soundproof", `Монтаж шумоизоляции: ${spType?.label ?? ""}`.trim(), "м²", area, WORK_RATES.soundproof, spType?.description);
    if (cfg.soundproofType === "premium") {
      material("soundproof", "Минвата акустическая 50 мм", "м²", Math.round(area * 2.5), MAT_PRICES.mineralWool);
      material("soundproof", "ГКЛ акустический (стены+потолок)", "м²", Math.round(area * 3), MAT_PRICES.acousticGkl);
    } else if (cfg.soundproofType === "enhanced") {
      material("soundproof", "Минвата акустическая 50 мм", "м²", Math.round(area * 1.8), MAT_PRICES.mineralWool);
      material("soundproof", "ГКЛ акустический 12.5 мм (2 слоя)", "м²", Math.round(area * 3), MAT_PRICES.acousticGkl);
    } else {
      material("soundproof", "Минвата акустическая 50 мм", "м²", Math.round(area * 1.2), MAT_PRICES.mineralWool);
      material("soundproof", "ГКЛ 12.5 мм", "м²", Math.round(area * 1.2), MAT_PRICES.gkl);
    }
    material("soundproof", "Виброподвесы, профиль, уплотнители", "м²", area, MAT_PRICES.vibroKit, undefined, true);
  }

  // ── САНТЕХНИКА ─────────────────────────────────────────────
  if (cfg.plumbingIncluded) {
    const pipesType = PLUMBING_PIPES_TYPES.find((p) => p.id === cfg.plumbingPipesType);
    const pts = cfg.plumbingPointsCount || 4;
    work("plumbing", "Разводка сантехнических точек", "точка", pts, WORK_RATES.plumbingPoint, pipesType?.label);
    material("plumbing", `Трубы: ${pipesType?.label ?? "ППР"}`, "точка", pts, round((pipesType?.pricePerPoint ?? 4400) * 0.5), "разводка");
    material("plumbing", "Фитинги, запорная арматура, краны", "точка", pts, MAT_PRICES.plumbFittings, undefined, true);

    if (cfg.bathtubIncluded) {
      const bt = BATHTUB_TYPES.find((b) => b.id === cfg.bathtubType);
      work("plumbing", "Установка ванны", "шт.", 1, WORK_RATES.bathtubInstall, bt?.label);
      material("plumbing", `Ванна: ${bt?.label ?? "акриловая"}`, "шт.", 1, bt?.pricePerUnit ?? 18700, bt?.description);
      material("plumbing", "Смеситель для ванны + сифон", "компл.", 1, MAT_PRICES.bathMixer, undefined, true);
    }
    if (cfg.showerIncluded) {
      const sh = SHOWER_TYPES.find((s) => s.id === cfg.showerType);
      work("plumbing", "Монтаж душа / кабины", "шт.", 1, WORK_RATES.showerInstall, sh?.label);
      material("plumbing", `Душ: ${sh?.label ?? "кабина"}`, "шт.", 1, sh?.pricePerUnit ?? 22000, sh?.description);
      material("plumbing", "Смеситель душа + лейка + шланг", "компл.", 1, MAT_PRICES.showerMixer, undefined, true);
    }
    if (cfg.toiletIncluded) {
      const tl = TOILET_TYPES.find((t) => t.id === cfg.toiletType);
      const tqty = cfg.toiletCount || 1;
      work("plumbing", "Установка унитаза", "шт.", tqty, WORK_RATES.toiletInstall, tl?.label);
      material("plumbing", `Унитаз: ${tl?.label ?? "напольный"}`, "шт.", tqty, tl?.pricePerUnit ?? 16500, tl?.description);
      material("plumbing", "Гофра, крепёж, герметик", "шт.", tqty, MAT_PRICES.toiletKit, undefined, true);
    }
    if (cfg.sinkIncluded) {
      const sk = SINK_TYPES.find((s) => s.id === cfg.sinkType);
      const sqty = cfg.sinkCount || 1;
      work("plumbing", "Установка раковины", "шт.", sqty, WORK_RATES.sinkInstall, sk?.label);
      material("plumbing", `Раковина: ${sk?.label ?? "с тумбой"}`, "шт.", sqty, sk?.pricePerUnit ?? 15400, sk?.description);
      material("plumbing", "Смеситель + сифон для раковины", "компл.", sqty, MAT_PRICES.sinkMixer, undefined, true);
    }
  }

  // ── ИТОГИ (строгая сумма позиций) ──────────────────────────
  const works = lines.filter((l) => l.isWork);
  const materials = lines.filter((l) => !l.isWork);
  const worksTotal = works.reduce((s, l) => s + l.total, 0);
  const materialsTotal = materials.reduce((s, l) => s + l.total, 0);
  const subtotal = worksTotal + materialsTotal;
  const markupAmount = markupPct > 0 ? Math.round(subtotal * markupPct / 100) : 0;
  const total = subtotal + markupAmount;

  const blocks: NewbuildBlock[] = [
    "screed", "plaster", "ceiling", "paint", "flooring", "electrics", "doors",
    "windowSlopes", "heatedFloor", "backsplash", "countertop", "conditioner",
    "soundproof", "plumbing",
  ];
  const blockTotals = blocks.reduce((acc, b) => {
    acc[b] = lines.filter((l) => l.block === b).reduce((s, l) => s + l.total, 0);
    return acc;
  }, {} as Record<NewbuildBlock, number>);

  return {
    lines, works, materials,
    worksTotal, materialsTotal, subtotal, markupAmount, total,
    regionCoeff: rc, levelCoeff: lc, blockTotals,
  };
}