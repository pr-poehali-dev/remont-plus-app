import Icon from "@/components/ui/icon";
import { type ShowroomItem } from "./showroomData";

interface ShowroomItemCardProps {
  item: ShowroomItem;
  onClick: () => void;
}

export default function ShowroomItemCard({ item, onClick }: ShowroomItemCardProps) {
  const heightClass =
    item.aspectRatio === "tall"
      ? "aspect-[3/4]"
      : item.aspectRatio === "wide"
        ? "aspect-[4/3]"
        : "aspect-square";

  return (
    <div
      className="relative group cursor-pointer overflow-hidden rounded-2xl"
      onClick={onClick}
    >
      <div className={`${heightClass} w-full relative overflow-hidden`}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : item.videoUrl ? (
          <video
            src={item.videoUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {item.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon name="Play" size={20} className="text-white ml-0.5" />
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm">
            {item.room}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm">
            {item.style}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white font-semibold text-base leading-tight mb-1">{item.title}</p>
          <p className="text-white/80 text-xs line-clamp-2 mb-3">{item.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-xs flex items-center gap-1">
              <Icon name="Maximize2" size={12} />
              {item.area}
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-white text-gray-900 font-medium flex items-center gap-1.5 hover:bg-gray-100 transition-colors">
              <Icon name="Sparkles" size={12} />
              Хочу такой
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}