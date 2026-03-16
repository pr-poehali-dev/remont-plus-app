import { useMemo } from "react";

export type DocType = "smeta" | "kp" | "ks2" | "ks3" | "act" | "contract";

const TARIFF_DOCS: Record<string, DocType[]> = {
  b2c_basic: ["smeta"],
  b2c_professional: ["smeta", "kp", "ks2", "ks3", "act", "contract"],
  b2c_premium: ["smeta", "kp", "ks2", "ks3", "act", "contract"],
  b2b_start: ["smeta", "kp", "ks2", "ks3", "act", "contract"],
  b2b_business: ["smeta", "kp", "ks2", "ks3", "act", "contract"],
  b2b_pro: ["smeta", "kp", "ks2", "ks3", "act", "contract"],
};

const TARIFFS_URL = "https://avangard-ai.ru/tariffs";

function getStoredUser(): { id?: number; role?: string; email?: string; name?: string } | null {
  try {
    return JSON.parse(localStorage.getItem("avangard_user") || "null");
  } catch {
    return null;
  }
}

function getTariffData(): { plan_id: string; paid: boolean; ts: number } | null {
  try {
    const raw = localStorage.getItem("avangard_tariff");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function hasLegacyPaid(): boolean {
  try {
    const raw = localStorage.getItem("avangard_estimate_paid");
    if (!raw) return false;
    const { paid } = JSON.parse(raw);
    return paid === true;
  } catch {
    return false;
  }
}

export function useTariffAccess() {
  return useMemo(() => {
    const user = getStoredUser();
    const isAdmin = user?.role === "admin";

    if (isAdmin) {
      return {
        hasTariff: true,
        planId: "admin" as string | null,
        canAccessDoc: () => true,
        redirectToTariffs: () => { window.location.href = TARIFFS_URL; },
      };
    }

    const tariff = getTariffData();
    const legacy = hasLegacyPaid();

    const planId: string | null = tariff?.plan_id ?? (legacy ? "b2c_basic" : null);
    const hasTariff = planId !== null;

    const canAccessDoc = (docType: DocType): boolean => {
      if (!planId) return false;
      const allowed = TARIFF_DOCS[planId];
      if (!allowed) return false;
      return allowed.includes(docType);
    };

    const redirectToTariffs = () => {
      window.location.href = TARIFFS_URL;
    };

    return { hasTariff, planId, canAccessDoc, redirectToTariffs };
  }, []);
}

export default useTariffAccess;