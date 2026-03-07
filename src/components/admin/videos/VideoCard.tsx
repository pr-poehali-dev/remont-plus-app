import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Video } from "./videoTypes";

interface Props {
  video: Video;
  onEdit: (v: Video) => void;
  onToggleActive: (v: Video) => void;
  onRemove: (id: number) => void;
  onQuickThumb: (id: number) => void;
}

function sourceLabel(v: Video): string {
  if (v.embed_url) return "Ссылка";
  if (v.video_url) return "Файл";
  return "—";
}

export default function VideoCard({ video: v, onEdit, onToggleActive, onRemove, onQuickThumb }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="relative aspect-video bg-gray-100">
        {v.thumbnail_url ? (
          <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="Play" size={32} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {v.is_own ? (
            <span className="px-2 py-0.5 rounded text-xs bg-orange-500 text-white">Наш</span>
          ) : (
            <span className="px-2 py-0.5 rounded text-xs bg-blue-500 text-white">Партнёр</span>
          )}
          <span className="px-2 py-0.5 rounded text-xs bg-black/40 text-white backdrop-blur-sm">
            {sourceLabel(v)}
          </span>
          {!v.is_active && (
            <span className="px-2 py-0.5 rounded text-xs bg-gray-400 text-white">Скрыт</span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-1">{v.title}</h4>
        {v.partner_name && (
          <p className="text-xs text-gray-400 mb-3">{v.partner_name}</p>
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(v)}
            className="flex-1 text-xs h-8"
          >
            <Icon name="Pencil" size={12} className="mr-1" />
            Изменить
          </Button>
          <Button
            size="sm"
            variant="outline"
            title="Сменить обложку"
            onClick={() => onQuickThumb(v.id)}
            className="text-xs h-8"
          >
            <Icon name="Image" size={12} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleActive(v)}
            className="text-xs h-8"
          >
            <Icon name={v.is_active ? "EyeOff" : "Eye"} size={12} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemove(v.id)}
            className="text-xs h-8 text-red-500 border-red-200 hover:bg-red-50"
          >
            <Icon name="Trash2" size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}
