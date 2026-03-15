import {
  PROFILE_SYSTEMS, GLASS_UNITS, GLASS_COATINGS, LAMINATION_TYPES,
  HARDWARE_OPTIONS, WINDOW_SILLS, SLOPES, OPENING_TYPES, WINDOW_REGIONS,
  BASE_PRICE_PER_M2, INSTALLATION_PRICE_PER_M2, TRANSOM_PRICE_ADDON,
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

export function calcPrice(cfg: Omit<WindowConfig, "id" | "totalPrice">, overrides?: PriceOverrides): number {
  const o = overrides ?? getDefaultOverrides();

  const isStandaloneTransom = cfg.constructionType === "transom";
  const isEntranceGroup = cfg.constructionType === "entrance_group";
  const isShtulpDoor = cfg.constructionType === "shtulp_door";
  const totalH = cfg.hasTransom && !isStandaloneTransom
    ? cfg.height + cfg.transomHeight
    : cfg.height;
  const area = (cfg.width / 1000) * (totalH / 1000);

  const profile = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
  const glass = GLASS_UNITS.find(g => g.id === cfg.glassUnitId);
  const lam = LAMINATION_TYPES.find(l => l.id === cfg.laminationId);
  const hw = HARDWARE_OPTIONS.find(h => h.id === cfg.hardwareId);
  const sill = WINDOW_SILLS.find(s => s.id === cfg.windowSillId);
  const slope = SLOPES.find(s => s.id === cfg.slopeId);
  const opening = OPENING_TYPES.find(ot => ot.value === (cfg.openingTypes[0] ?? "tilt_swing"));

  if (!profile || !glass) return 0;

  const baseMat = o.basePricePerM2[profile.material] ?? BASE_PRICE_PER_M2[profile.material];
  const profCoeff = o.profileCoeffs[profile.id] ?? profile.priceCoeff;
  const glassCoeff = o.glassCoeffs[glass.id] ?? glass.priceCoeff;
  let price = baseMat * profCoeff * glassCoeff * area;

  const avgOpenCoeff = cfg.openingTypes.length > 0
    ? cfg.openingTypes.reduce((s, ov) => {
        const opt = OPENING_TYPES.find(x => x.value === ov);
        return s + (opt?.priceCoeff ?? 1);
      }, 0) / cfg.openingTypes.length
    : (opening?.priceCoeff ?? 1);
  price *= avgOpenCoeff;

  const coatingAdd = o.coatingPrices[cfg.glassCoatingId] ?? GLASS_COATINGS.find(c => c.id === cfg.glassCoatingId)?.priceAdd ?? 0;
  price += coatingAdd * area;

  const perim = 2 * ((cfg.width + totalH) / 1000);
  const lamAdd = o.laminationPrices[cfg.laminationId] ?? lam?.priceAdd ?? 0;
  const lamSides = cfg.laminationBothSides && lam && lam.id !== "none" ? 2 : 1;
  price += lamAdd * perim * lamSides;

  const hwPrice = o.hardwarePrices[cfg.hardwareId] ?? hw?.pricePerSash ?? 0;
  const openSashes = cfg.openingTypes.filter(x => x !== "fixed").length;
  price += hwPrice * openSashes;

  if (cfg.hasTransom && !isStandaloneTransom) {
    price += o.transomAddon;
    if (cfg.transomOpeningType !== "fixed") {
      price += hwPrice;
    }
  }

  if (isShtulpDoor) {
    price *= 2.06;
    price += 2336;
  }

  if (isEntranceGroup) {
    price *= 2.0;
    price += 2336;
  }

  const sillPrice = o.sillPrices[cfg.windowSillId] ?? sill?.pricePerMeter ?? 0;
  const sillLen = cfg.windowSillWidth > 0 ? cfg.width / 1000 : 0;
  price += sillPrice * sillLen;

  const slopePrice = o.slopePrices[cfg.slopeId] ?? slope?.pricePerMeter ?? 0;
  price += slopePrice * cfg.slopePerimeter;

  if (cfg.installationIncluded) price += o.installationPricePerM2 * area;

  const region = WINDOW_REGIONS.find(r => r.id === cfg.regionId);
  price *= region?.priceCoeff ?? 1.0;

  return Math.round(price * cfg.quantity);
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