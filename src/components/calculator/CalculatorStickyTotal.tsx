import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface Props {
  total: number;
  itemsCount: number;
  onExport: () => void;
}

function formatRub(n: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽";
}

export default function CalculatorStickyTotal({ total, itemsCount, onExport }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (itemsCount === 0) return null;

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 md:hidden transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl px-4 py-3 flex items-center gap-3 safe-area-bottom">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-gray-500 leading-tight">
            Итого ({itemsCount} {itemsCount === 1 ? "позиция" : itemsCount < 5 ? "позиции" : "позиций"})
          </div>
          <div className="text-xl font-bold text-gray-900 truncate">{formatRub(total)}</div>
        </div>
        <Button
          onClick={onExport}
          size="lg"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-md hover:from-emerald-600 hover:to-emerald-700"
        >
          <Icon name="FileDown" size={18} className="mr-1.5" />
          Скачать смету
        </Button>
      </div>
    </div>
  );
}
