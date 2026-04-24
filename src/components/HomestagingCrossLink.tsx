import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface Props {
  variant?: "card" | "inline";
  className?: string;
}

export default function HomestagingCrossLink({ variant = "card", className = "" }: Props) {
  const navigate = useNavigate();

  if (variant === "inline") {
    return (
      <a
        href="/homestaging"
        onClick={(e) => { e.preventDefault(); navigate("/homestaging"); }}
        className={`inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium text-sm underline-offset-2 hover:underline ${className}`}
      >
        <Icon name="Sparkles" size={16} />
        Подготовьте квартиру к продаже с ИИ-хоумстейджингом
      </a>
    );
  }

  return (
    <a
      href="/homestaging"
      onClick={(e) => { e.preventDefault(); navigate("/homestaging"); }}
      className={`block group rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 border border-rose-100 hover:border-rose-300 hover:shadow-lg transition-all ${className}`}
    >
      <div className="p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          <Icon name="Home" size={28} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Хоумстейджинг с ИИ</h3>
            <span className="text-[10px] sm:text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">БЕСПЛАТНО</span>
          </div>
          <p className="text-gray-600 text-sm">
            Планируете продать или сдать квартиру? Загрузите фото — ИИ подскажет,
            что улучшить для увеличения стоимости.
          </p>
        </div>
        <Icon name="ArrowRight" size={22} className="text-rose-500 flex-shrink-0 group-hover:translate-x-1 transition-transform hidden sm:block" />
      </div>
    </a>
  );
}
