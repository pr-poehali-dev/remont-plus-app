import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

const areaRanges = [
  { label: 'Любая', value: '' },
  { label: 'до 25 м²', value: '0-25' },
  { label: '25–35 м²', value: '25-35' },
  { label: '35–50 м²', value: '35-50' },
  { label: '50–70 м²', value: '50-70' },
  { label: 'от 70 м²', value: '70-999' },
];

interface Props {
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  areaFilter: string;
  hasAreaSpecs: boolean;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onAreaFilterChange: (area: string) => void;
}

export default function SuppliersFilters({
  categories,
  selectedCategory,
  searchQuery,
  areaFilter,
  hasAreaSpecs,
  onCategoryChange,
  onSearchChange,
  onAreaFilterChange,
}: Props) {
  return (
    <Card className="p-6 sticky top-24">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Icon name="Filter" className="h-5 w-5 text-primary" />
        Фильтры
      </h3>

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Поиск</label>
        <Input
          placeholder="Название товара..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Категории</label>
        <div className="space-y-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => { onCategoryChange(''); onAreaFilterChange(''); }}
          >
            Все категории
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="w-full justify-start text-sm"
              onClick={() => { onCategoryChange(category); onAreaFilterChange(''); }}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {hasAreaSpecs && (
        <div className="mt-6 pt-6 border-t">
          <label className="text-sm font-medium mb-3 block flex items-center gap-2">
            <Icon name="Ruler" className="h-4 w-4 text-primary" />
            Площадь помещения
          </label>
          <div className="space-y-1.5">
            {areaRanges.map((range) => (
              <Button
                key={range.value}
                variant={areaFilter === range.value ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => onAreaFilterChange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <div className="bg-primary/10 rounded-lg p-4">
          <Icon name="Info" className="h-5 w-5 text-primary mb-2" />
          <p className="text-xs text-gray-700">
            Все товары от проверенных поставщиков с гарантией качества
          </p>
        </div>
      </div>
    </Card>
  );
}
