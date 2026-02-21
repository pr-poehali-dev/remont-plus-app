import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MastersFiltersProps {
  search: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function MastersFilters({ search, sort, onSearchChange, onSortChange }: MastersFiltersProps) {
  return (
    <div className="flex gap-3 mb-6 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Поиск по имени, специализации, городу..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating">По рейтингу</SelectItem>
          <SelectItem value="experience">По опыту</SelectItem>
          <SelectItem value="reviews">По отзывам</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
