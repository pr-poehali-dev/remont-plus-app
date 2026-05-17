import type { CutPiece } from "./cutting";

export interface FrameHouseSpec {
  /** Длина дома (по фасаду), мм */
  length: number;
  /** Ширина дома, мм */
  width: number;
  /** Высота стены 1 этажа, мм */
  wallHeight: number;
  /** Шаг стоек, мм (обычно 600) */
  studPitch: number;
  /** Этажи: 1 или 2 */
  floors: 1 | 2;
  /** Внутренние перегородки, общая длина, мм */
  partitionsLength: number;
  /** Количество окон */
  windowsCount: number;
  /** Размер окна (ширина × высота), мм */
  windowWidth: number;
  windowHeight: number;
  /** Количество дверей */
  doorsCount: number;
  doorWidth: number;
  doorHeight: number;
  /** Свес кровли с каждой стороны, мм */
  roofOverhang: number;
  /** Уклон кровли, градусы */
  roofPitchDeg: number;
}

export interface MaterialGroup {
  /** Сечение, например 50×150 */
  section: string;
  pieces: CutPiece[];
  /** Стандартная длина хлыста */
  stockLength: number;
  /** Описание */
  title: string;
}

export const DEFAULT_FRAME_SPEC: FrameHouseSpec = {
  length: 8000,
  width: 6000,
  wallHeight: 2700,
  studPitch: 600,
  floors: 1,
  partitionsLength: 6000,
  windowsCount: 5,
  windowWidth: 1200,
  windowHeight: 1400,
  doorsCount: 2,
  doorWidth: 900,
  doorHeight: 2100,
  roofOverhang: 500,
  roofPitchDeg: 25,
};

/**
 * Генерация деталей каркаса по спецификации дома.
 * Стандартные размеры для каркасника:
 *   - Обвязка нижняя и верхняя: брус 150×150
 *   - Стойки стен: доска 50×150
 *   - Перекрытие/лаги: доска 50×200
 *   - Стропила: доска 50×200
 *   - Обрешётка: доска 25×100
 */
export function generateFrameMaterials(spec: FrameHouseSpec): MaterialGroup[] {
  const groups: MaterialGroup[] = [];

  const perimeter = 2 * (spec.length + spec.width);

  // ── 1. ОБВЯЗКА (нижняя + верхняя), брус 150×150
  const beltPieces: CutPiece[] = [];
  // Нижняя обвязка по периметру, балки длиной = стена
  beltPieces.push({ length: spec.length, label: "Низ. обвязка фасад" });
  beltPieces.push({ length: spec.length, label: "Низ. обвязка тыл" });
  beltPieces.push({ length: spec.width, label: "Низ. обвязка лев" });
  beltPieces.push({ length: spec.width, label: "Низ. обвязка прав" });
  // Верхняя обвязка
  beltPieces.push({ length: spec.length, label: "Верх. обвязка фасад" });
  beltPieces.push({ length: spec.length, label: "Верх. обвязка тыл" });
  beltPieces.push({ length: spec.width, label: "Верх. обвязка лев" });
  beltPieces.push({ length: spec.width, label: "Верх. обвязка прав" });
  if (spec.floors === 2) {
    beltPieces.push({ length: spec.length, label: "Меж. обвязка фасад" });
    beltPieces.push({ length: spec.length, label: "Меж. обвязка тыл" });
    beltPieces.push({ length: spec.width, label: "Меж. обвязка лев" });
    beltPieces.push({ length: spec.width, label: "Меж. обвязка прав" });
  }
  groups.push({
    section: "150×150",
    title: "Обвязка (брус 150×150)",
    stockLength: 6000,
    pieces: beltPieces,
  });

  // ── 2. СТОЙКИ СТЕН, доска 50×150
  // Кол-во стоек = периметр / шаг + углы
  const studsPerFloor = Math.ceil(perimeter / spec.studPitch) + 4; // +угловые
  const studsCount = studsPerFloor * spec.floors;
  const studPieces: CutPiece[] = [];
  for (let i = 0; i < studsCount; i++) {
    studPieces.push({ length: spec.wallHeight, label: `Стойка ${i + 1}` });
  }
  // Стойки перегородок (грубо: на каждые 600 мм)
  const partStuds = Math.ceil(spec.partitionsLength / spec.studPitch) * spec.floors;
  for (let i = 0; i < partStuds; i++) {
    studPieces.push({ length: spec.wallHeight, label: `Стойка перегор. ${i + 1}` });
  }
  // Доп. стойки оконных/дверных проёмов (по 2 на проём + ригель)
  const openings = (spec.windowsCount + spec.doorsCount) * spec.floors;
  for (let i = 0; i < openings * 2; i++) {
    studPieces.push({ length: spec.wallHeight, label: `Стойка проёма ${i + 1}` });
  }
  groups.push({
    section: "50×150",
    title: "Стойки стен и перегородок (доска 50×150)",
    stockLength: 6000,
    pieces: studPieces,
  });

  // ── 3. ПЕРЕМЫЧКИ ОКОН / ДВЕРЕЙ — доска 50×150
  const headerPieces: CutPiece[] = [];
  for (let i = 0; i < spec.windowsCount * spec.floors; i++) {
    headerPieces.push({ length: spec.windowWidth + 200, label: `Перемычка окна ${i + 1}` });
    headerPieces.push({ length: spec.windowWidth, label: `Подоконник ${i + 1}` });
  }
  for (let i = 0; i < spec.doorsCount * spec.floors; i++) {
    headerPieces.push({ length: spec.doorWidth + 200, label: `Перемычка двери ${i + 1}` });
  }
  if (headerPieces.length > 0) {
    groups.push({
      section: "50×150",
      title: "Перемычки и подоконники (доска 50×150)",
      stockLength: 6000,
      pieces: headerPieces,
    });
  }

  // ── 4. ЛАГИ ПЕРЕКРЫТИЯ — доска 50×200
  // Лаги пола 1-го этажа + лаги перекрытия 2-го (если есть)
  const joistPitch = 600;
  const joistsPerFloor = Math.ceil(spec.length / joistPitch) + 1;
  const joistPieces: CutPiece[] = [];
  for (let i = 0; i < joistsPerFloor; i++) {
    joistPieces.push({ length: spec.width, label: `Лага пола ${i + 1}` });
  }
  if (spec.floors === 2) {
    for (let i = 0; i < joistsPerFloor; i++) {
      joistPieces.push({ length: spec.width, label: `Лага перекр. 2эт ${i + 1}` });
    }
  }
  groups.push({
    section: "50×200",
    title: "Лаги пола и перекрытия (доска 50×200)",
    stockLength: 6000,
    pieces: joistPieces,
  });

  // ── 5. СТРОПИЛА — доска 50×200
  // Длина стропила = (ширина/2 + свес) / cos(угол)
  const halfSpan = spec.width / 2 + spec.roofOverhang;
  const rafterLen = Math.ceil(halfSpan / Math.cos((spec.roofPitchDeg * Math.PI) / 180));
  const rafterPitch = 700;
  const rafterPairs = Math.ceil(spec.length / rafterPitch) + 1;
  const rafterPieces: CutPiece[] = [];
  for (let i = 0; i < rafterPairs; i++) {
    rafterPieces.push({ length: rafterLen, label: `Стропило лев ${i + 1}` });
    rafterPieces.push({ length: rafterLen, label: `Стропило прав ${i + 1}` });
  }
  // Коньковый прогон
  rafterPieces.push({ length: spec.length, label: "Коньковый прогон" });
  groups.push({
    section: "50×200",
    title: "Стропильная система (доска 50×200)",
    stockLength: 6000,
    pieces: rafterPieces,
  });

  // ── 6. ОБРЕШЁТКА — доска 25×100
  const sheathingRows = Math.ceil(rafterLen / 350); // шаг 350 мм
  const sheathingPieces: CutPiece[] = [];
  for (let i = 0; i < sheathingRows; i++) {
    // По 2 ряда обрешётки (на обе стороны крыши)
    sheathingPieces.push({ length: spec.length + spec.roofOverhang * 2, label: `Обрешётка ряд ${i + 1} лев` });
    sheathingPieces.push({ length: spec.length + spec.roofOverhang * 2, label: `Обрешётка ряд ${i + 1} прав` });
  }
  groups.push({
    section: "25×100",
    title: "Обрешётка кровли (доска 25×100)",
    stockLength: 6000,
    pieces: sheathingPieces,
  });

  return groups;
}

/**
 * Объём пиломатериала в м³ для секции (например, "50×150").
 */
export function sectionVolumeM3(section: string, totalLengthMm: number): number {
  const m = section.match(/(\d+)\D+(\d+)/);
  if (!m) return 0;
  const w = parseInt(m[1], 10) / 1000;
  const h = parseInt(m[2], 10) / 1000;
  const l = totalLengthMm / 1000;
  return w * h * l;
}

/**
 * Ориентировочные цены за м³ (Самара, средняя по рынку).
 */
export const PRICE_PER_M3: Record<string, number> = {
  "150×150": 18000,
  "50×200": 16500,
  "50×150": 16000,
  "25×100": 14000,
};
