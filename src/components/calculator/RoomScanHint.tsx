import Icon from "@/components/ui/icon";

interface RoomScanHintProps {
  variant?: "card" | "inline" | "compact";
  className?: string;
}

export default function RoomScanHint({
  variant = "card",
  className = "",
}: RoomScanHintProps) {
  if (variant === "compact") {
    return (
      <a
        href="https://roomscan-ai.ru/"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 hover:underline ${className}`}
      >
        <Icon name="ScanLine" size={14} />
        Нет точных замеров? Отсканируйте комнату на RoomScan AI
        <Icon name="ExternalLink" size={11} />
      </a>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`flex items-center gap-2 text-xs text-slate-600 ${className}`}
      >
        <Icon name="Info" size={14} className="text-sky-500 shrink-0" />
        <span>
          Не знаете точные размеры?{" "}
          <a
            href="https://roomscan-ai.ru/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-600 hover:text-sky-700 hover:underline inline-flex items-center gap-0.5"
          >
            Отсканируйте помещение в RoomScan AI
            <Icon name="ExternalLink" size={10} />
          </a>{" "}
          — ИИ построит план и замерит площадь за минуту.
        </span>
      </div>
    );
  }

  return (
    <a
      href="https://roomscan-ai.ru/"
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 p-3 hover:border-sky-300 hover:shadow-md transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
          <Icon name="ScanLine" size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-bold text-slate-900">
              Нужны точные замеры?
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-sky-100 text-[9px] font-bold text-sky-700 uppercase tracking-wide">
              Партнёр
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-snug">
            Отсканируйте комнату телефоном — RoomScan AI построит план и замерит
            размеры за минуту.
          </p>
          <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 group-hover:text-sky-700">
            roomscan-ai.ru
            <Icon
              name="ArrowUpRight"
              size={12}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </a>
  );
}
