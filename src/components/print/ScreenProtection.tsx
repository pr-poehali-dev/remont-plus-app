import { useState, useEffect, type ReactNode } from "react";

function checkTariffAccess(): boolean {
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
  } catch {
    return false;
  }
}

interface ScreenProtectionProps {
  children: ReactNode;
  active?: boolean;
}

export default function ScreenProtection({ children, active = true }: ScreenProtectionProps) {
  const [hasAccess, setHasAccess] = useState(() => checkTariffAccess());
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    setHasAccess(checkTariffAccess());
  }, []);

  useEffect(() => {
    if (!active || hasAccess) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        window.location.href = "https://avangard-ai.ru/tariffs";
      }
      if (e.key === "PrintScreen") {
        e.preventDefault();
        setShowOverlay(true);
        setTimeout(() => setShowOverlay(false), 2000);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["s", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        setShowOverlay(true);
        setTimeout(() => setShowOverlay(false), 2000);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [active, hasAccess]);

  if (!active || hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative" style={{ userSelect: "none", WebkitUserSelect: "none" }}>
      {children}
      <div
        className="absolute top-2 right-2 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-900/80 text-white backdrop-blur-sm cursor-pointer hover:bg-gray-900/90 transition-colors"
        onClick={() => { window.location.href = "https://avangard-ai.ru/tariffs"; }}
      >
        <span>&#128274;</span>
        <span>Для скачивания оплатите тариф</span>
      </div>
      {showOverlay && (
        <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800 mb-2">&#128274; Скриншот недоступен</p>
            <p className="text-sm text-gray-500">Для доступа к документам оплатите тариф</p>
            <button
              onClick={() => { window.location.href = "https://avangard-ai.ru/tariffs"; }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Перейти к тарифам
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
