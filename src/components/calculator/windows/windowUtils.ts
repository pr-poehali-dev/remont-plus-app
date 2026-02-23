import {
  PROFILE_SYSTEMS, GLASS_UNITS, GLASS_COATINGS, LAMINATION_TYPES,
  HARDWARE_OPTIONS, WINDOW_SILLS, SLOPES, OPENING_TYPES, WINDOW_REGIONS,
  BASE_PRICE_PER_M2, INSTALLATION_PRICE_PER_M2,
} from "./WindowTypes";
import type { WindowConfig, ProfileMaterial, OpeningType } from "./WindowTypes";

export const MAT_LABEL: Record<ProfileMaterial, string> = {
  pvc: "ПВХ",
  aluminum: "Алюминий холодный",
  aluminum_warm: "Алюминий тёплый",
};

export function fmt(n: number) {
  return n.toLocaleString("ru-RU");
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
  windowSillId: "pvc_white",
  windowSillWidth: 300,
  slopeId: "pvc_white",
  slopePerimeter: 5,
  installationIncluded: true,
  regionId: "moscow",
  note: "",
};

export function calcPrice(cfg: Omit<WindowConfig, "id" | "totalPrice">): number {
  const area = (cfg.width / 1000) * (cfg.height / 1000);
  const profile = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
  const glass = GLASS_UNITS.find(g => g.id === cfg.glassUnitId);
  const coating = GLASS_COATINGS.find(c => c.id === cfg.glassCoatingId);
  const lam = LAMINATION_TYPES.find(l => l.id === cfg.laminationId);
  const hw = HARDWARE_OPTIONS.find(h => h.id === cfg.hardwareId);
  const sill = WINDOW_SILLS.find(s => s.id === cfg.windowSillId);
  const slope = SLOPES.find(s => s.id === cfg.slopeId);
  const opening = OPENING_TYPES.find(o => o.value === (cfg.openingTypes[0] ?? "tilt_swing"));

  if (!profile || !glass) return 0;

  const baseMat = BASE_PRICE_PER_M2[profile.material];
  let price = baseMat * profile.priceCoeff * glass.priceCoeff * area;

  const avgOpenCoeff = cfg.openingTypes.length > 0
    ? cfg.openingTypes.reduce((s, ov) => {
        const opt = OPENING_TYPES.find(o => o.value === ov);
        return s + (opt?.priceCoeff ?? 1);
      }, 0) / cfg.openingTypes.length
    : (opening?.priceCoeff ?? 1);
  price *= avgOpenCoeff;

  price += (coating?.priceAdd ?? 0) * area;

  const perim = 2 * ((cfg.width + cfg.height) / 1000);
  const lamSides = cfg.laminationBothSides && lam && lam.id !== "none" ? 2 : 1;
  price += (lam?.priceAdd ?? 0) * perim * lamSides;

  const openSashes = cfg.openingTypes.filter(o => o !== "fixed").length || 1;
  price += (hw?.pricePerSash ?? 0) * openSashes;

  const sillLen = cfg.windowSillWidth > 0 ? cfg.width / 1000 : 0;
  price += (sill?.pricePerMeter ?? 0) * sillLen;

  price += (slope?.pricePerMeter ?? 0) * cfg.slopePerimeter;

  if (cfg.installationIncluded) price += INSTALLATION_PRICE_PER_M2 * area;

  const region = WINDOW_REGIONS.find(r => r.id === cfg.regionId);
  price *= region?.priceCoeff ?? 1.0;

  return Math.round(price * cfg.quantity);
}

export function syncSashes(type: WindowConfig["constructionType"], CONSTRUCTION_TYPES: typeof import("./WindowTypes").CONSTRUCTION_TYPES): OpeningType[] {
  const ct = CONSTRUCTION_TYPES.find(c => c.value === type);
  const n = ct?.sashes ?? 1;
  return Array.from({ length: n }, (_, i) =>
    i === n - 1 && n > 1 ? "fixed" : "tilt_swing"
  ) as OpeningType[];
}