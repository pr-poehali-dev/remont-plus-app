import { useState, useEffect, useCallback, useMemo } from "react";

export type DocType = "smeta" | "kp" | "ks2" | "ks3" | "act" | "contract";

const TARIFF_API = "https://functions.poehali.dev/aae7e353-917d-4759-9f27-a78f28be0084";

const TARIFF_DOCS: Record<string, DocType[]> = {
  b2c_basic: ["smeta"],
  b2c_professional: ["smeta", "kp", "ks2", "ks3", "act", "contract"],
  b2c_premium: ["smeta", "kp", "ks2", "ks3", "act", "contract"],
  b2b_start: ["smeta", "kp", "ks2", "ks3", "act", "contract"],
  b2b_business: ["smeta", "kp", "ks2", "ks3", "act", "contract"],
  b2b_pro: ["smeta", "kp", "ks2", "ks3", "act", "contract"],
};

const PLAN_NAMES: Record<string, string> = {
  b2c_basic: "Базовый",
  b2c_professional: "Профессиональный",
  b2c_premium: "Премиум",
  b2b_start: "Старт",
  b2b_business: "Бизнес",
  b2b_pro: "Профи",
};

const TARIFFS_URL = "https://avangard-ai.ru/tariffs";
const TARIFF_DURATION_DAYS = 30;

function getStoredUser(): { id?: number; role?: string; email?: string; name?: string } | null {
  try {
    return JSON.parse(localStorage.getItem("avangard_user") || "null");
  } catch {
    return null;
  }
}

function getStoredTariff(): { plan_id: string; paid: boolean; ts: number; days_total?: number } | null {
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

function computeFromTariff(tariff: { plan_id: string; ts: number; days_total?: number } | null, legacy: boolean) {
  const planId: string | null = tariff?.plan_id ?? (legacy ? "b2c_basic" : null);
  const hasTariff = planId !== null;
  const planName = planId ? (PLAN_NAMES[planId] || planId) : null;
  const daysTotal = tariff?.days_total || TARIFF_DURATION_DAYS;
  let daysRemaining = 0;
  if (tariff?.ts) {
    const expiresAt = tariff.ts + daysTotal * 24 * 60 * 60 * 1000;
    daysRemaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
  }
  const allowedDocs = planId ? (TARIFF_DOCS[planId] || []) : [];
  return { hasTariff, planId, planName, daysRemaining, daysTotal, allowedDocs };
}

export function useTariffAccess() {
  const user = useMemo(() => getStoredUser(), []);
  const isAdmin = user?.role === "admin";

  const cachedTariff = useMemo(() => getStoredTariff(), []);
  const legacy = useMemo(() => hasLegacyPaid(), []);
  const initial = useMemo(() => computeFromTariff(cachedTariff, legacy), [cachedTariff, legacy]);

  const [state, setState] = useState({
    hasTariff: isAdmin ? true : initial.hasTariff,
    planId: isAdmin ? ("admin" as string | null) : initial.planId,
    planName: isAdmin ? "Администратор" : initial.planName,
    daysRemaining: isAdmin ? 999 : initial.daysRemaining,
    daysTotal: isAdmin ? 999 : initial.daysTotal,
    allowedDocs: isAdmin ? (["smeta", "kp", "ks2", "ks3", "act", "contract"] as DocType[]) : initial.allowedDocs,
    loading: !isAdmin,
  });

  useEffect(() => {
    if (isAdmin) return;
    if (!user?.id && !user?.email) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    let cancelled = false;

    fetch(TARIFF_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_tariff",
        user_id: user.id,
        email: user.email,
      }),
    })
      .then((res) => res.json())
      .then((raw) => {
        if (cancelled) return;
        const data = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;
        const t = data?.tariff;
        if (t && t.plan_id) {
          const activatedTs = t.activated_at ? new Date(t.activated_at).getTime() : Date.now();
          const tariffData = {
            plan_id: t.plan_id,
            paid: true,
            ts: activatedTs,
            days_total: t.days_total || TARIFF_DURATION_DAYS,
          };
          localStorage.setItem("avangard_tariff", JSON.stringify(tariffData));
          setState({
            hasTariff: true,
            planId: t.plan_id,
            planName: t.plan_name || PLAN_NAMES[t.plan_id] || t.plan_id,
            daysRemaining: t.days_remaining ?? 0,
            daysTotal: t.days_total || TARIFF_DURATION_DAYS,
            allowedDocs: t.allowed_docs || TARIFF_DOCS[t.plan_id] || [],
            loading: false,
          });
        } else {
          if (!legacy) {
            localStorage.removeItem("avangard_tariff");
          }
          setState((prev) => ({ ...prev, loading: false }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, user?.id, user?.email]);

  const canAccessDoc = useCallback(
    (docType: DocType): boolean => {
      if (isAdmin) return true;
      if (!state.planId) return false;
      const allowed = TARIFF_DOCS[state.planId];
      if (!allowed) return false;
      return allowed.includes(docType);
    },
    [isAdmin, state.planId],
  );

  const redirectToTariffs = useCallback(() => {
    window.location.href = TARIFFS_URL;
  }, []);

  return {
    hasTariff: state.hasTariff,
    planId: state.planId,
    planName: state.planName,
    daysRemaining: state.daysRemaining,
    daysTotal: state.daysTotal,
    allowedDocs: state.allowedDocs,
    canAccessDoc,
    redirectToTariffs,
    loading: state.loading,
  };
}

export default useTariffAccess;