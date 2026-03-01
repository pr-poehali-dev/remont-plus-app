import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { type ShowroomItemDB } from "./showroomHelpers";

interface Props {
  item: ShowroomItemDB;
  deleting: boolean;
  onEdit: (item: ShowroomItemDB) => void;
  onDelete: (id: number) => void;
}

export default function ShowroomAdminCard({ item, deleting, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {item.image && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          {item.video_url && (
            <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <Icon name="Play" size={10} />
              Видео
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon name="Pencil" size={14} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              disabled={deleting}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
            >
              <Icon name="Trash2" size={14} />
            </button>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Badge variant="secondary" className="text-[10px]">{item.room}</Badge>
          <Badge variant="outline" className="text-[10px]">{item.style}</Badge>
          {item.area && <Badge variant="outline" className="text-[10px]">{item.area}</Badge>}
        </div>
      </div>
    </div>
  );
}
