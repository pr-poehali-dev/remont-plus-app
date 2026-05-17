import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const STORAGE_KEY = "cookie_consent_v1";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      // Показываем не сразу, чтобы не мешать первому впечатлению
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, ts: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Согласие на использование файлов cookie"
      className="fixed inset-x-0 bottom-0 z-[55] p-3 sm:p-4 animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
          <Icon name="Cookie" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 text-sm text-slate-700 dark:text-slate-300">
          Мы используем cookie для аналитики и улучшения сервиса. Продолжая работу,
          вы соглашаетесь с{" "}
          <Link to="/privacy" className="text-orange-600 hover:underline font-medium">
            политикой конфиденциальности
          </Link>
          .
        </div>
        <Button onClick={accept} className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shrink-0 w-full sm:w-auto">
          Принять
        </Button>
      </div>
    </div>
  );
}
