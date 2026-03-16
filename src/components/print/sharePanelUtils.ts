export const TARIFF_API = "https://functions.poehali.dev/aae7e353-917d-4759-9f27-a78f28be0084";
export const NOTIFY_EMAIL_URL = "https://functions.poehali.dev/a8b87e78-89d1-48d8-ba76-8da2e0df32a3";
export const TARIFFS_URL = "https://avangard-ai.ru/tariffs";

export interface SharePanelProps {
  docTitle: string;
  totalSum: number;
  customerEmail?: string;
  customerPhone?: string;
  docType?: "smeta" | "kp";
  estimateItems?: { name: string; price: number }[];
  estimateParams?: Record<string, string>;
  customer?: string;
  contractor?: string;
  address?: string;
  phone?: string;
  docDate?: string;
  calcName?: string;
}

export function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export function checkTariffAccess(): boolean {
  try {
    const user = JSON.parse(localStorage.getItem("avangard_user") || "null");
    if (user?.role === "admin") return true;
    const tariff = localStorage.getItem("avangard_tariff");
    if (tariff) return true;
    const legacy = localStorage.getItem("avangard_estimate_paid");
    if (legacy) {
      const { paid } = JSON.parse(legacy);
      if (paid) return true;
    }
    return false;
  } catch { return false; }
}

export function syncTariffFromBackend() {
  try {
    const user = JSON.parse(localStorage.getItem("avangard_user") || "null");
    if (!user || user.role === "admin") return;
    if (!user.id && !user.email) return;
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
        const d = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;
        const t = d?.tariff;
        if (t && t.plan_id) {
          localStorage.setItem(
            "avangard_tariff",
            JSON.stringify({
              plan_id: t.plan_id,
              paid: true,
              ts: t.activated_at ? new Date(t.activated_at).getTime() : Date.now(),
              days_total: t.days_total || 30,
            }),
          );
        }
      })
      .catch(() => {});
  } catch { /* ignore */ }
}

export const btnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 14px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#fff",
  fontSize: 12,
  fontFamily: "inherit",
  cursor: "pointer",
  fontWeight: 500,
  color: "#374151",
  transition: "all 0.15s",
  textDecoration: "none",
  whiteSpace: "nowrap" as const,
};

export default {};
