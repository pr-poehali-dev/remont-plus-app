import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = "pwa_prompt_dismissed_at";
const DISMISS_DAYS = 14;

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Показываем через 8 сек после загрузки — не отвлекает сразу
      setTimeout(() => setVisible(true), 8000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      try {
        (window as unknown as { ym?: (id: number, action: string, goal: string) => void }).ym?.(
          106944583,
          "reachGoal",
          "pwa_installed"
        );
      } catch {
        /* ignore */
      }
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:max-w-sm z-[60] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-3">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Icon name="Smartphone" className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
            Установить приложение
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
            Калькуляторы и кабинет всегда под рукой — без браузера
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleInstall} className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
              <Icon name="Download" className="w-3.5 h-3.5 mr-1.5" />
              Установить
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Позже
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
          aria-label="Закрыть"
        >
          <Icon name="X" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
