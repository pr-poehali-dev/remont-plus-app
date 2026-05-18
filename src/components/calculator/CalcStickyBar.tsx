import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import CalcOrderForm from "./CalcOrderForm";
import { reachGoal } from "@/lib/metrika";

interface Props {
  totalSum: number;
  totalArea?: number;
  calcType: string;
  shareUrl?: string;
}

function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export default function CalcStickyBar({ totalSum, totalArea, calcType, shareUrl }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  if (totalSum <= 0) return null;

  const handleOpen = () => {
    setShowForm(true);
    reachGoal("sticky_bar_click", { calcType });
  };

  const handleOpenQr = () => {
    setShowQr(true);
    reachGoal("open_on_phone_click", { calcType });
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* no-op */
    }
  };

  const qrImgSrc = shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(
        shareUrl,
      )}`
    : "";

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div className="min-w-0">
              <p className="text-lg font-bold text-gray-900 tabular-nums">{fmt(totalSum)} ₽</p>
              {totalArea && totalArea > 0 && (
                <p className="text-xs text-gray-400">{fmt(Math.round(totalSum / totalArea))} ₽/м²</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {shareUrl && (
                <Button
                  onClick={handleOpenQr}
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-xl border-sky-300 text-sky-700 hover:bg-sky-50"
                  aria-label="Открыть на телефоне"
                >
                  <Icon name="QrCode" size={18} />
                </Button>
              )}
              <Button
                onClick={handleOpen}
                className="bg-orange-600 hover:bg-orange-700 text-white gap-2 px-5 h-11 text-sm font-semibold rounded-xl shadow-lg shadow-orange-200"
              >
                <Icon name="Send" size={15} />
                Получить смету
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showQr && shareUrl && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowQr(false)}
          />
          <div className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-white rounded-2xl shadow-2xl p-5 animate-in slide-in-from-bottom duration-200">
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              aria-label="Закрыть"
            >
              <Icon name="X" size={16} />
            </button>
            <div className="text-center mb-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 text-sky-600 mb-2">
                <Icon name="Smartphone" size={22} />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Открыть на телефоне</h3>
              <p className="text-xs text-gray-500 mt-1">
                Отсканируйте код камерой — расчёт продолжится на смартфоне
              </p>
            </div>
            <div className="flex justify-center">
              <div className="rounded-xl bg-white border-2 border-sky-100 p-3">
                <img src={qrImgSrc} alt="QR" className="w-56 h-56" loading="lazy" />
              </div>
            </div>
            <Button
              onClick={handleCopy}
              variant="outline"
              className="w-full mt-4 gap-2"
            >
              <Icon name={copied ? "Check" : "Copy"} size={16} />
              {copied ? "Скопировано" : "Скопировать ссылку"}
            </Button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 animate-in slide-in-from-bottom duration-200">
            <button
              onClick={() => setShowForm(false)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Icon name="X" size={16} />
            </button>
            <CalcOrderForm
              calcType={calcType}
              total={`от ${fmt(totalSum)} ₽`}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}