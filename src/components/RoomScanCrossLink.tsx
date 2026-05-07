import Icon from "@/components/ui/icon";
import reachGoal from "@/lib/metrika";

interface Props {
  variant?: "card" | "compact" | "inline";
  className?: string;
}

const URL = "https://roomscan-ai.ru/";

export default function RoomScanCrossLink({ variant = "card", className = "" }: Props) {
  const handleClick = () => reachGoal("roomscan_link");

  if (variant === "inline") {
    return (
      <a
        href={URL}
        target="_blank"
        rel="noopener"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium text-sm underline-offset-2 hover:underline ${className}`}
      >
        <Icon name="ScanLine" size={16} />
        Сделайте план комнаты с RoomScan AI
        <Icon name="ExternalLink" size={12} />
      </a>
    );
  }

  if (variant === "compact") {
    return (
      <a
        href={URL}
        target="_blank"
        rel="noopener"
        onClick={handleClick}
        className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100 hover:border-sky-300 hover:shadow-md transition-all group ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          <Icon name="ScanLine" size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-900 text-sm">RoomScan AI</span>
            <Icon name="ExternalLink" size={11} className="text-gray-400" />
          </div>
          <p className="text-xs text-gray-600 truncate">Сканирование комнаты по фото</p>
        </div>
        <Icon name="ArrowRight" size={18} className="text-sky-500 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
      </a>
    );
  }

  return (
    <a
      href={URL}
      target="_blank"
      rel="noopener"
      onClick={handleClick}
      className={`block group rounded-2xl overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 border border-sky-100 hover:border-sky-300 hover:shadow-lg transition-all ${className}`}
    >
      <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          <Icon name="ScanLine" size={32} className="text-white" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">RoomScan AI — сканирование комнаты</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
              <Icon name="Sparkles" size={11} />
              Экосистема АВАНГАРД
            </span>
          </div>
          <p className="text-gray-600 text-sm sm:text-base max-w-xl">
            Снимите комнату на телефон — ИИ автоматически измерит размеры, построит план помещения и подготовит данные для дизайн-проекта.
          </p>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-medium text-sm group-hover:shadow-lg transition-all">
            Открыть RoomScan AI
            <Icon name="ExternalLink" size={14} />
          </span>
        </div>
      </div>
    </a>
  );
}
