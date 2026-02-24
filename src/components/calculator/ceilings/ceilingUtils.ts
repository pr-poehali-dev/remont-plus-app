import {
  CEILING_TYPES, CEILING_LEVELS, CEILING_BRANDS, CEILING_COLORS,
  LIGHTING_OPTIONS, PROFILE_OPTIONS, CEILING_REGIONS,
  BASE_PRICE_PER_M2, INSTALLATION_PRICE_PER_M2,
} from "./CeilingTypes";
import type { CeilingConfig } from "./CeilingTypes";

export function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export const DEFAULT_CONFIG: Omit<CeilingConfig, "id" | "totalPrice"> = {
  roomName: "",
  ceilingType: "matte",
  level: "single",
  brandId: "lackfolie",
  colorId: "white",
  area: 20,
  perimeter: 18,
  lightingId: "spot",
  lightingCount: 6,
  profileId: "garpun",
  installationIncluded: true,
  regionId: "moscow",
  note: "",
};

export function calcPrice(cfg: Omit<CeilingConfig, "id" | "totalPrice">): number {
  const type = CEILING_TYPES.find(t => t.value === cfg.ceilingType);
  const level = CEILING_LEVELS.find(l => l.value === cfg.level);
  const brand = CEILING_BRANDS.find(b => b.id === cfg.brandId);
  const color = CEILING_COLORS.find(c => c.id === cfg.colorId);
  const lighting = LIGHTING_OPTIONS.find(l => l.id === cfg.lightingId);
  const profile = PROFILE_OPTIONS.find(p => p.id === cfg.profileId);
  const region = CEILING_REGIONS.find(r => r.id === cfg.regionId);

  if (!type || !level || !brand) return 0;

  let price = BASE_PRICE_PER_M2
    * type.priceCoeff
    * level.priceCoeff
    * (brand.priceCoeff)
    * (profile?.priceCoeff ?? 1.0)
    * cfg.area;

  price += (color?.priceAdd ?? 0) * cfg.area;

  if (lighting && lighting.id !== "none") {
    price += lighting.pricePerUnit * cfg.lightingCount;
  }

  if (cfg.installationIncluded) {
    price += INSTALLATION_PRICE_PER_M2 * cfg.area;
  }

  price *= (region?.coeff ?? 1.0);

  return Math.round(price);
}