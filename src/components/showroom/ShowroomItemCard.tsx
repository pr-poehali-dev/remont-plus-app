import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { type ShowroomItem } from "./showroomData";

interface ShowroomItemCardProps {
  item: ShowroomItem;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
}

export default function ShowroomItemCard({ item, isExpanded, onToggle, onNavigate }: ShowroomItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm">
            {item.room}
          </Badge>
          <Badge className="bg-white/80 text-gray-800 border-0 backdrop-blur-sm">
            {item.style}
          </Badge>
        </div>
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="backdrop-blur-sm">
            <Icon name="Maximize2" className="h-3 w-3 mr-1" />
            {item.area}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.features.map((f) => (
            <Badge key={f} variant="outline" className="text-xs">
              {f}
            </Badge>
          ))}
        </div>

        {isExpanded && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">Материалы</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {item.materials.map((m) => (
                  <Badge key={m} variant="secondary" className="text-xs">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Дизайнер</span>
              <span className="font-medium">{item.designer}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Площадь</span>
              <span className="font-medium">{item.area}</span>
            </div>
            <Button className="w-full mt-2" onClick={() => onNavigate("/ai-chat")}>
              <Icon name="Sparkles" className="h-4 w-4 mr-2" />
              Хочу такой проект
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full"
          onClick={onToggle}
        >
          {isExpanded ? (
            <>Свернуть <Icon name="ChevronUp" className="h-4 w-4 ml-2" /></>
          ) : (
            <>Подробнее <Icon name="ChevronDown" className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </div>
    </Card>
  );
}
