import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWABanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { state: pushState, subscribe } = usePushNotifications();

  useEffect(() => {
    if (localStorage.getItem("pwa-dismissed")) return;

    const isIOSDevice =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window.navigator as Navigator & { standalone?: boolean }).standalone;

    const isInStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (isInStandalone) {
      if (!localStorage.getItem("push-subscribed") && pushState !== "unsupported" && pushState !== "denied") {
        setTimeout(() => setVisible(true), 4000);
      }
      return;
    }

    if (isIOSDevice) {
      setIsIOS(true);
      setTimeout(() => setVisible(true), 3000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [pushState]);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
      localStorage.setItem("pwa-dismissed", "1");
    }
    setPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("pwa-dismissed", "1");
  };

  const handleSubscribe = async () => {
    await subscribe();
    setTimeout(() => setVisible(false), 1000);
  };

  if (!visible || dismissed) return null;

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80"
      style={{ animation: "slideUp 0.4s ease-out" }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex gap-3 items-start">
        <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
          <Icon name={isStandalone ? "Bell" : "Smartphone"} size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {isStandalone ? (
            <>
              <div className="font-bold text-gray-900 text-sm">Включить уведомления</div>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                Получайте важные обновления и напоминания прямо на телефон
              </p>
              <button
                onClick={handleSubscribe}
                disabled={pushState === "subscribing" || pushState === "subscribed"}
                className="mt-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                {pushState === "subscribing" ? "Подключение..." : pushState === "subscribed" ? "Подключено ✓" : "Включить"}
              </button>
            </>
          ) : isIOS ? (
            <>
              <div className="font-bold text-gray-900 text-sm">Установить приложение</div>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                Нажмите <span className="font-medium">«Поделиться»</span> → <span className="font-medium">«На экран Домой»</span>
              </p>
            </>
          ) : (
            <>
              <div className="font-bold text-gray-900 text-sm">Установить приложение</div>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                Добавьте АВАНГАРД на главный экран — работает без интернета
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleInstall}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Установить
                </button>
                {pushState !== "unsupported" && pushState !== "denied" && pushState !== "subscribed" && (
                  <button
                    onClick={handleSubscribe}
                    disabled={pushState === "subscribing"}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Icon name="Bell" size={12} />
                    {pushState === "subscribing" ? "..." : "Уведомления"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 -mt-0.5"
        >
          <Icon name="X" size={16} />
        </button>
      </div>
    </div>
  );
}
