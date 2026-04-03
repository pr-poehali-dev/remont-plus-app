export const FREE_PERIOD_END = new Date("2026-04-15T23:59:59");

export function isFreePeriod(): boolean {
  return new Date() <= FREE_PERIOD_END;
}

export const isPromoActive = isFreePeriod;
