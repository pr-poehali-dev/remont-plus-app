import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useTariffAccess } from "@/hooks/useTariffAccess";

const ESTIMATE_PAYMENT_URL = "https://functions.poehali.dev/610d6f7d-fc4b-4907-b4f2-2e678dc3217d";
const PAID_KEY = "avangard_estimate_paid";
const TARIFFS_URL = "https://avangard-ai.ru/tariffs";

function isPaidLocal(): boolean {
  try {
    const raw = localStorage.getItem(PAID_KEY);
    if (!raw) return false;
    const { paid } = JSON.parse(raw);
    return paid === true;
  } catch {
    return false;
  }
}

function markPaid() {
  localStorage.setItem(PAID_KEY, JSON.stringify({ paid: true, ts: Date.now() }));
}

async function checkPaidOnServer(userId?: number, email?: string): Promise<boolean> {
  if (!userId && !email) return false;
  try {
    const res = await fetch(ESTIMATE_PAYMENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "check_user_paid",
        ...(userId ? { user_id: userId } : {}),
        ...(email ? { client_email: email } : {}),
      }),
    });
    const raw = await res.json();
    const data = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;
    return data.paid === true;
  } catch {
    return false;
  }
}

interface Props {
  children: React.ReactNode;
  docTitle?: string;
  totalSum?: number;
}

export default function PrintPaywall({ children, docTitle = "Смета" }: Props) {
  let storedUser: { id?: number; role?: string; email?: string; name?: string } | null = null;
  try { storedUser = JSON.parse(localStorage.getItem("avangard_user") || "null"); } catch { storedUser = null; }

  const { hasTariff } = useTariffAccess();
  const isAdmin = storedUser?.role === "admin";

  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAdmin || hasTariff) {
      setUnlocked(true);
      setChecking(false);
      return;
    }
    if (isPaidLocal()) {
      setUnlocked(true);
      setChecking(false);
      return;
    }
    checkPaidOnServer(storedUser?.id, storedUser?.email).then((paid) => {
      if (paid) {
        markPaid();
        setUnlocked(true);
      }
      setChecking(false);
    });
  }, [isAdmin, hasTariff]);

  if (unlocked) return <>{children}</>;

  if (checking) return (
    <div className="flex items-center justify-center min-h-[40vh] gap-3 text-gray-400">
      <Icon name="Loader2" size={20} className="animate-spin" />
      <span className="text-sm">Проверяем статус оплаты...</span>
    </div>
  );

  return (
    <div className="relative bg-gray-50 min-h-screen">
      <div className="relative overflow-hidden" style={{ maxHeight: "65vh" }}>
        <div className="pointer-events-none select-none" style={{ filter: "blur(5px)", opacity: 0.5 }}>
          {children}
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(249,250,251,0) 20%, rgba(249,250,251,0.9) 65%, rgba(249,250,251,1) 100%)" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 pb-16 -mt-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Icon name="FileText" size={20} />
              </div>
              <div>
                <p className="font-bold text-base leading-tight">Для печати документов необходимо оплатить тариф</p>
                <p className="text-orange-100 text-xs mt-0.5">{docTitle}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                <Icon name="Lock" size={28} className="text-orange-500" />
              </div>
              <p className="font-bold text-lg text-gray-900 mb-1">Доступ ограничен</p>
              <p className="text-sm text-gray-500">
                Выберите подходящий тариф, чтобы получить доступ к печати и скачиванию документов
              </p>
            </div>

            <ul className="text-xs text-gray-600 space-y-1.5 mb-5">
              {[
                "Смета PDF — файл на email",
                "Распечатка и скачивание документов",
                "Формирование КП, КС-2, КС-3, Акт",
                "Доступ к калькулятору и ИИ-эксперту",
              ].map((f) => (
                <li key={f} className="flex items-start gap-1.5">
                  <Icon name="Check" size={12} className="text-green-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11"
              onClick={() => { window.location.href = TARIFFS_URL; }}
            >
              <Icon name="CreditCard" size={16} className="mr-2" />
              Выбрать тариф
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3">Безопасная оплата через Точку</p>
          </div>
        </div>
      </div>
    </div>
  );
}
