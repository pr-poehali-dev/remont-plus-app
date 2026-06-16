import {
  PROFILE_SYSTEMS, GLASS_UNITS, GLASS_COATINGS, LAMINATION_TYPES,
  HARDWARE_OPTIONS, WINDOW_SILLS, SLOPES,
  BASE_PRICE_PER_M2, INSTALLATION_PRICE_PER_M2, TRANSOM_PRICE_ADDON,
} from "./WindowTypes";
import type { WindowConfig, ProfileMaterial, OpeningType } from "./WindowTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import { calcWindow } from "./windowEngine";

export const MAT_LABEL: Record<ProfileMaterial, string> = {
  pvc: "ПВХ",
  aluminum: "Алюминий холодный",
  aluminum_warm: "Алюминий тёплый",
};

export function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export interface PriceOverrides {
  basePricePerM2: Record<ProfileMaterial, number>;
  installationPricePerM2: number;
  transomAddon: number;
  profileCoeffs: Record<string, number>;
  glassCoeffs: Record<string, number>;
  coatingPrices: Record<string, number>;
  laminationPrices: Record<string, number>;
  hardwarePrices: Record<string, number>;
  sillPrices: Record<string, number>;
  slopePrices: Record<string, number>;
}

const PRICE_OVERRIDES_KEY = "windows_price_overrides";

export function getDefaultOverrides(): PriceOverrides {
  return {
    basePricePerM2: { ...BASE_PRICE_PER_M2 },
    installationPricePerM2: INSTALLATION_PRICE_PER_M2,
    transomAddon: TRANSOM_PRICE_ADDON,
    profileCoeffs: Object.fromEntries(PROFILE_SYSTEMS.map(p => [p.id, p.priceCoeff])),
    glassCoeffs: Object.fromEntries(GLASS_UNITS.map(g => [g.id, g.priceCoeff])),
    coatingPrices: Object.fromEntries(GLASS_COATINGS.map(c => [c.id, c.priceAdd])),
    laminationPrices: Object.fromEntries(LAMINATION_TYPES.map(l => [l.id, l.priceAdd])),
    hardwarePrices: Object.fromEntries(HARDWARE_OPTIONS.map(h => [h.id, h.pricePerSash])),
    sillPrices: Object.fromEntries(WINDOW_SILLS.map(s => [s.id, s.pricePerMeter])),
    slopePrices: Object.fromEntries(SLOPES.map(s => [s.id, s.pricePerMeter])),
  };
}

export function loadPriceOverrides(): PriceOverrides {
  try {
    const raw = localStorage.getItem(PRICE_OVERRIDES_KEY);
    if (!raw) return getDefaultOverrides();
    const saved = JSON.parse(raw) as Partial<PriceOverrides>;
    const defaults = getDefaultOverrides();
    return {
      basePricePerM2: { ...defaults.basePricePerM2, ...saved.basePricePerM2 },
      installationPricePerM2: saved.installationPricePerM2 ?? defaults.installationPricePerM2,
      transomAddon: saved.transomAddon ?? defaults.transomAddon,
      profileCoeffs: { ...defaults.profileCoeffs, ...saved.profileCoeffs },
      glassCoeffs: { ...defaults.glassCoeffs, ...saved.glassCoeffs },
      coatingPrices: { ...defaults.coatingPrices, ...saved.coatingPrices },
      laminationPrices: { ...defaults.laminationPrices, ...saved.laminationPrices },
      hardwarePrices: { ...defaults.hardwarePrices, ...saved.hardwarePrices },
      sillPrices: { ...defaults.sillPrices, ...saved.sillPrices },
      slopePrices: { ...defaults.slopePrices, ...saved.slopePrices },
    };
  } catch {
    return getDefaultOverrides();
  }
}

export function savePriceOverrides(o: PriceOverrides) {
  localStorage.setItem(PRICE_OVERRIDES_KEY, JSON.stringify(o));
}

export function resetPriceOverrides() {
  localStorage.removeItem(PRICE_OVERRIDES_KEY);
}

export const DEFAULT_CONFIG: Omit<WindowConfig, "id" | "totalPrice"> = {
  constructionType: "window_double",
  width: 1400,
  height: 1400,
  quantity: 1,
  profileSystemId: "rehau_euro60",
  glassUnitId: "2ch_4_10_4_10_4",
  glassCoatingId: "none",
  laminationId: "none",
  laminationBothSides: false,
  hardwareId: "maco_multi",
  openingTypes: ["tilt_swing", "fixed"],
  hasTransom: false,
  transomHeight: 400,
  transomOpeningType: "fixed",
  windowSillId: "pvc_white",
  windowSillWidth: 300,
  slopeId: "pvc_white",
  slopePerimeter: 5,
  installationIncluded: true,
  regionId: "moscow",
  note: "",
};

/**
 * Цена окна БЕЗ наценки (с региональным коэффициентом и количеством).
 * Совместимая обёртка над единым движком calcWindow: возвращает строго то же
 * число, что и прежняя формула (subtotal движка считается по той же
 * последовательности). PriceOverrides учитываются через движок без изменений.
 */
export function calcPrice(cfg: Omit<WindowConfig, "id" | "totalPrice">, overrides?: PriceOverrides): number {
  return calcWindow(cfg, overrides, cfg.regionId).subtotal;
}

/** Детальная ведомость МАТЕРИАЛОВ + работ (для таблиц). */
export function calcWindowMaterials(
  cfg: Omit<WindowConfig, "id" | "totalPrice">,
  overrides?: PriceOverrides,
  regionId?: string,
): MaterialItem[] {
  const e = calcWindow(cfg, overrides, regionId ?? cfg.regionId, 0);
  return e.lines.map(({ block: _block, ...item }) => item);
}

/** Детальные РАБОТЫ. */
export function calcWindowWorks(
  cfg: Omit<WindowConfig, "id" | "totalPrice">,
  overrides?: PriceOverrides,
  regionId?: string,
): MaterialItem[] {
  const e = calcWindow(cfg, overrides, regionId ?? cfg.regionId, 0);
  return e.works.map(({ block: _block, ...item }) => item);
}

export function syncSashes(type: WindowConfig["constructionType"], CONSTRUCTION_TYPES: typeof import("./WindowTypes").CONSTRUCTION_TYPES): OpeningType[] {
  if (type === "transom") return ["fixed"] as OpeningType[];
  if (type === "shtulp_door") return ["swing", "swing"] as OpeningType[];
  if (type === "entrance_group") return ["swing", "fixed"] as OpeningType[];
  const ct = CONSTRUCTION_TYPES.find(c => c.value === type);
  const n = ct?.sashes ?? 1;
  return Array.from({ length: n }, (_, i) =>
    i === n - 1 && n > 1 ? "fixed" : "tilt_swing"
  ) as OpeningType[];
}