import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { type Region, type Category, type PriceCategory } from "./PricesTypes";

interface PriceListTableProps {
  regions: Region[];
  categories: Category[];
  prices: PriceCategory[];
  selectedRegion: string;
  selectedCategory: string;
  search: string;
  loading: boolean;
  expandedCategories: Set<string>;
  currentRegion: Region | undefined;
  totalItems: number;
  onRegionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onToggleCategory: (slug: string) => void;
  formatPrice: (price: number) => string;
}

export default function PriceListTable({
  regions,
  categories,
  prices,
  selectedRegion,
  selectedCategory,
  search,
  loading,
  expandedCategories,
  currentRegion,
  totalItems,
  onRegionChange,
  onCategoryChange,
  onSearchChange,
  onToggleCategory,
  formatPrice,
}: PriceListTableProps) {
  const navigate = useNavigate();

  return (
    <div className="border-t border-gray-200 mb-8 pt-8">
      <h2 className="text-xl font-bold mb-1">Прайс-лист на работы</h2>
      <p className="text-gray-500 text-sm mb-6">Актуальные цены с учётом региона</p>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Select value={selectedRegion} onValueChange={onRegionChange}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Icon name="MapPin" size={16} className="text-gray-400" />
              <SelectValue placeholder="Выберите регион" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.code} value={region.code}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Icon name="LayoutList" size={16} className="text-gray-400" />
              <SelectValue placeholder="Категория работ" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                <div className="flex items-center gap-2">
                  <Icon name={cat.icon} size={14} />
                  <span>{cat.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Icon
            name="Search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Поиск работ..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {currentRegion && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Icon name="MapPin" size={13} />
            {currentRegion.name}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
            <Icon name="ClipboardList" size={13} />
            {totalItems} позиций
          </Badge>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : prices.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="SearchX" className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Ничего не найдено</p>
          <p className="text-gray-400 text-sm mt-1">
            Попробуйте изменить параметры поиска
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {prices.map((category) => (
            <Card key={category.slug} className="overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onToggleCategory(category.slug)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name={category.icon} className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">{category.name}</h2>
                    <span className="text-sm text-gray-400">
                      {category.items.length} позиций
                    </span>
                  </div>
                </div>
                <Icon
                  name={expandedCategories.has(category.slug) ? "ChevronUp" : "ChevronDown"}
                  className="h-5 w-5 text-gray-400"
                />
              </div>

              {expandedCategories.has(category.slug) && (
                <div className="border-t">
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="w-[50%]">Наименование работ</TableHead>
                          <TableHead className="w-[15%] text-center">Ед. изм.</TableHead>
                          <TableHead className="w-[35%] text-right">Цена, ₽</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.items.map((item, idx) => (
                          <TableRow
                            key={item.id}
                            className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}
                          >
                            <TableCell>
                              <div>
                                <span className="font-medium">{item.name}</span>
                                {item.description && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-gray-500">
                              {item.unit}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-lg">
                              {formatPrice(item.price)} ₽
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="md:hidden divide-y">
                    {category.items.map((item) => (
                      <div key={item.id} className="p-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            {item.unit}
                          </span>
                          <div className="text-right">
                            <span className="font-semibold text-lg">
                              {formatPrice(item.price)} ₽
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-8 p-6 bg-blue-50/50 border-blue-100">
        <div className="flex gap-3">
          <Icon name="Info" className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              Цены указаны за работу без учёта стоимости материалов.
              Окончательная стоимость определяется после осмотра объекта.
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-6 text-center">
        <Button size="lg" onClick={() => navigate("/calculator")} className="gap-2">
          <Icon name="Calculator" size={18} />
          Рассчитать смету
        </Button>
      </div>
    </div>
  );
}
