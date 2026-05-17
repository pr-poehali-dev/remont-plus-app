import { useEffect } from "react";

const REFERRALS_URL = "https://functions.poehali.dev/4d5b1e32-287c-41a5-992c-365d1b58dd97";
const STORAGE_KEY = "avangard_ref_code";
const TTL_DAYS = 30;

/**
 * Невидимый компонент: ловит ?ref=XXX из URL, сохраняет в localStorage на 30 дней.
 * Если пользователь уже залогинен — сразу привязывает реферера на бэке.
 */
export default function ReferralCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");

      if (ref) {
        const clean = ref.trim().toUpperCase().slice(0, 16);
        if (clean) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ code: clean, ts: Date.now() })
          );

          // Если уже залогинен — сразу привязываем
          const userRaw = localStorage.getItem("avangard_user");
          if (userRaw) {
            const user = JSON.parse(userRaw);
            if (user?.id) {
              fetch(REFERRALS_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "attach_referrer",
                  user_id: user.id,
                  code: clean,
                }),
              }).catch(() => {});
            }
          }
        }
      } else {
        // Проверим срок хранения и почистим
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (Date.now() - (data?.ts || 0) > TTL_DAYS * 24 * 60 * 60 * 1000) {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
