import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = "https://samara.lemanapro.ru";

interface Category {
  name: string;
  slug: string;
  icon: string;
  description: string;
  subcategories: { name: string; slug: string }[];
}

export interface EstimateSavedItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  url: string;
  quantity: number;
  note: string;
  addedAt: string;
}

const STORAGE_KEY = "avangard_lemanapro_estimate";

export function getEstimateItems(): EstimateSavedItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveEstimateItems(items: EstimateSavedItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const categories: Category[] = [
  {
    name: "Стройматериалы",
    slug: "stroymaterialy",
    icon: "Warehouse",
    description: "Сухие смеси, гипсокартон, утеплители, кирпич, блоки",
    subcategories: [
      { name: "Сухие смеси", slug: "suhie-smesi" },
      { name: "Гипсокартон", slug: "gipsokarton-i-komplektuyushchie" },
      { name: "Утеплители", slug: "utepliteli" },
      { name: "Пиломатериалы", slug: "pilomaterialy" },
      { name: "Кирпич и блоки", slug: "kirpich-i-bloki" },
      { name: "Цемент и бетон", slug: "tsement-i-beton" },
    ],
  },
  {
    name: "Плитка",
    slug: "plitka",
    icon: "Grid3x3",
    description: "Керамическая плитка, керамогранит, мозаика, клей",
    subcategories: [
      { name: "Настенная плитка", slug: "nastennaya-plitka" },
      { name: "Напольная плитка", slug: "napolnaya-plitka" },
      { name: "Керамогранит", slug: "keramogranit" },
      { name: "Мозаика", slug: "mozaika" },
      { name: "Клей для плитки", slug: "klej-dlya-plitki" },
      { name: "Затирки", slug: "zatirki" },
    ],
  },
  {
    name: "Сантехника",
    slug: "santehnika",
    icon: "Droplets",
    description: "Смесители, унитазы, раковины, ванны, душевые",
    subcategories: [
      { name: "Смесители", slug: "smesiteli" },
      { name: "Унитазы", slug: "unitazy" },
      { name: "Раковины", slug: "rakoviny" },
      { name: "Ванны", slug: "vanny-i-komplektuyushchie" },
      { name: "Душевые кабины", slug: "dushevye-kabiny" },
      { name: "Полотенцесушители", slug: "polotentsesushiteli" },
    ],
  },
  {
    name: "Напольные покрытия",
    slug: "napolnye-pokrytiya",
    icon: "Layers",
    description: "Ламинат, линолеум, паркет, ковролин, подложка",
    subcategories: [
      { name: "Ламинат", slug: "laminat" },
      { name: "Линолеум", slug: "linoleum" },
      { name: "Паркет", slug: "parket" },
      { name: "Кварц-винил (SPC/LVT)", slug: "kvarts-vinilovaya-plitka" },
      { name: "Ковролин", slug: "kovrolin" },
      { name: "Подложка", slug: "podlozhka" },
    ],
  },
  {
    name: "Краски",
    slug: "kraski",
    icon: "Paintbrush",
    description: "Интерьерные и фасадные краски, лаки, грунтовки",
    subcategories: [
      { name: "Интерьерные краски", slug: "interernye-kraski" },
      { name: "Фасадные краски", slug: "fasadnye-kraski" },
      { name: "Лаки", slug: "laki" },
      { name: "Грунтовки", slug: "gruntovki" },
      { name: "Эмали", slug: "emali" },
      { name: "Колеровка", slug: "kolerovka" },
    ],
  },
  {
    name: "Обои",
    slug: "oboi",
    icon: "Wallpaper",
    description: "Виниловые, флизелиновые, бумажные обои и клей",
    subcategories: [
      { name: "Виниловые обои", slug: "vinilovye-oboi" },
      { name: "Флизелиновые обои", slug: "flizelinovye-oboi" },
      { name: "Обои под покраску", slug: "oboi-pod-pokrasku" },
      { name: "Фотообои", slug: "fotooboi" },
      { name: "Клей для обоев", slug: "klej-dlya-oboev" },
    ],
  },
  {
    name: "Электрика",
    slug: "elektrika",
    icon: "Zap",
    description: "Кабели, розетки, выключатели, автоматы, щитки",
    subcategories: [
      { name: "Кабели и провода", slug: "kabeli-i-provoda" },
      { name: "Розетки и выключатели", slug: "rozetki-i-vyklyuchateli" },
      { name: "Автоматы и УЗО", slug: "avtomaty-i-uzo" },
      { name: "Щитки", slug: "shchitki" },
      { name: "Удлинители", slug: "udliniteli" },
    ],
  },
  {
    name: "Освещение",
    slug: "osveshchenie-zhilyh-pomeshcheniy",
    icon: "Lightbulb",
    description: "Люстры, светильники, бра, лампочки, споты",
    subcategories: [
      { name: "Люстры", slug: "lyustry" },
      { name: "Потолочные светильники", slug: "potolochnye-svetilniki" },
      { name: "Бра и настенные", slug: "bra" },
      { name: "Точечные светильники", slug: "tochechnye-svetilniki" },
      { name: "Лампочки", slug: "lampochki" },
      { name: "LED-ленты", slug: "svetodiodnye-lenty" },
    ],
  },
  {
    name: "Двери",
    slug: "dveri",
    icon: "DoorOpen",
    description: "Межкомнатные, входные двери, фурнитура",
    subcategories: [
      { name: "Межкомнатные двери", slug: "mezhkomnatnye-dveri" },
      { name: "Входные двери", slug: "vhodnye-dveri" },
      { name: "Дверная фурнитура", slug: "dvernaya-furnitura" },
      { name: "Арки и порталы", slug: "arki-i-portaly" },
    ],
  },
  {
    name: "Инструменты",
    slug: "instrumenty",
    icon: "Wrench",
    description: "Ручной и электроинструмент, расходники",
    subcategories: [
      { name: "Электроинструменты", slug: "elektroinstrumenty" },
      { name: "Ручной инструмент", slug: "ruchnoj-instrument" },
      { name: "Измерительный", slug: "izmeritelnyj-instrument" },
      { name: "Расходные материалы", slug: "rashodnye-materialy" },
    ],
  },
  {
    name: "Кухни",
    slug: "kukhni",
    icon: "CookingPot",
    description: "Кухонные гарнитуры, столешницы, мойки",
    subcategories: [
      { name: "Кухонные гарнитуры", slug: "kuhonnye-garnitury" },
      { name: "Столешницы", slug: "stoleshnitsy" },
      { name: "Мойки", slug: "mojki" },
      { name: "Смесители кухонные", slug: "smesiteli-dlya-kuhni" },
    ],
  },
  {
    name: "Мебель",
    slug: "mebel",
    icon: "Sofa",
    description: "Шкафы, стеллажи, столы, стулья, кровати",
    subcategories: [
      { name: "Шкафы", slug: "shkafy" },
      { name: "Стеллажи", slug: "stellazhi" },
      { name: "Столы", slug: "stoly" },
      { name: "Стулья", slug: "stulya" },
      { name: "Кровати и матрасы", slug: "krovati-i-matrasy" },
    ],
  },
];

const groupLabels: Record<string, string[]> = {
  "Отделка и стройка": ["Стройматериалы", "Плитка", "Напольные покрытия", "Краски", "Обои"],
  "Инженерные системы": ["Сантехника", "Электрика", "Освещение"],
  "Обустройство": ["Двери", "Кухни", "Мебель", "Инструменты"],
};

export default function LemanaProCatalog() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [estimateItems, setEstimateItems] = useState<EstimateSavedItem[]>([]);
  const [showEstimate, setShowEstimate] = useState(false);

  useEffect(() => {
    setEstimateItems(getEstimateItems());
  }, []);

  const addToEstimate = (
    subcategoryName: string,
    subcategorySlug: string,
    categoryName: string
  ) => {
    const url = `${BASE_URL}/catalogue/${subcategorySlug}/`;
    const existing = estimateItems.find((i) => i.subcategory === subcategoryName && i.category === categoryName);
    if (existing) {
      toast({ title: "Уже в смете", description: `${subcategoryName} уже добавлен` });
      return;
    }
    const newItem: EstimateSavedItem = {
      id: crypto.randomUUID(),
      name: subcategoryName,
      category: categoryName,
      subcategory: subcategoryName,
      url,
      quantity: 1,
      note: "",
      addedAt: new Date().toISOString(),
    };
    const updated = [...estimateItems, newItem];
    setEstimateItems(updated);
    saveEstimateItems(updated);
    toast({ title: "Добавлено в смету", description: subcategoryName });
  };

  const removeFromEstimate = (id: string) => {
    const updated = estimateItems.filter((i) => i.id !== id);
    setEstimateItems(updated);
    saveEstimateItems(updated);
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    const updated = estimateItems.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
    setEstimateItems(updated);
    saveEstimateItems(updated);
  };

  const updateItemNote = (id: string, note: string) => {
    const updated = estimateItems.map((i) => (i.id === id ? { ...i, note } : i));
    setEstimateItems(updated);
    saveEstimateItems(updated);
  };

  const isInEstimate = (subcategoryName: string, categoryName: string) =>
    estimateItems.some((i) => i.subcategory === subcategoryName && i.category === categoryName);

  const filtered = search.trim()
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase()) ||
          c.subcategories.some((s) => s.name.toLowerCase().includes(search.toLowerCase()))
      )
    : categories;

  const openSubcategory = (slug: string) => {
    window.open(`${BASE_URL}/catalogue/${slug}/`, "_blank", "noopener");
  };

  const openCategory = (slug: string) => {
    window.open(`${BASE_URL}/catalogue/${slug}/`, "_blank", "noopener");
  };

  const groupedCategories = (cats: Category[]) => {
    if (search.trim()) {
      return [{ label: `Найдено: ${cats.length}`, items: cats }];
    }
    const result: { label: string; items: Category[] }[] = [];
    for (const [label, names] of Object.entries(groupLabels)) {
      const items = cats.filter((c) => names.includes(c.name));
      if (items.length) result.push({ label, items });
    }
    return result;
  };

  const estimateByCategory = estimateItems.reduce<Record<string, EstimateSavedItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Каталог ЛеманаПро</h1>
                <p className="text-sm text-gray-500">Самара · Товары для ремонта и обустройства</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showEstimate ? "default" : "outline"}
                onClick={() => setShowEstimate(!showEstimate)}
                className="relative"
              >
                <Icon name="ClipboardList" className="mr-1.5 h-4 w-4" />
                Моя смета
                {estimateItems.length > 0 && (
                  <Badge className="ml-2 bg-green-500 hover:bg-green-500 text-white text-xs px-1.5 py-0">
                    {estimateItems.length}
                  </Badge>
                )}
              </Button>
              <Badge variant="outline" className="hidden sm:flex gap-1 py-1.5 px-3">
                <Icon name="MapPin" className="h-3.5 w-3.5 text-green-600" />
                Самара
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                onClick={() => window.open(BASE_URL, "_blank", "noopener")}
              >
                <Icon name="ExternalLink" className="mr-1.5 h-4 w-4" />
                Сайт
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Breadcrumbs
        items={[
          { label: "Главная", path: "/" },
          { label: "Каталог ЛеманаПро", path: "/lemanapro" },
        ]}
      />

      <div className="container mx-auto px-4 py-6">
        {showEstimate ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Моя смета</h2>
                <p className="text-gray-500 text-sm">
                  {estimateItems.length > 0
                    ? `${estimateItems.length} позиций из каталога ЛеманаПро`
                    : "Пока пусто — добавьте товары из каталога"}
                </p>
              </div>
              <Button variant="outline" onClick={() => setShowEstimate(false)}>
                <Icon name="ArrowLeft" className="mr-1.5 h-4 w-4" />
                К каталогу
              </Button>
            </div>

            {estimateItems.length === 0 ? (
              <Card className="p-12 text-center">
                <Icon name="ClipboardList" className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Смета пуста</p>
                <p className="text-gray-400 text-sm mb-6">
                  Раскройте категорию в каталоге и нажмите «В смету» рядом с нужным товаром
                </p>
                <Button onClick={() => setShowEstimate(false)}>
                  <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />
                  Перейти к каталогу
                </Button>
              </Card>
            ) : (
              <>
                {Object.entries(estimateByCategory).map(([cat, items]) => (
                  <div key={cat} className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-primary rounded-full" />
                      {cat}
                    </h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{item.name}</span>
                                <button
                                  className="text-gray-400 hover:text-blue-500 transition-colors"
                                  onClick={() => window.open(item.url, "_blank", "noopener")}
                                  title="Открыть на сайте ЛеманаПро"
                                >
                                  <Icon name="ExternalLink" className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-gray-500">Кол-во:</span>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                    className="w-20 h-8 text-sm"
                                  />
                                </div>
                                <Input
                                  placeholder="Заметка (арт., цвет...)"
                                  value={item.note}
                                  onChange={(e) => updateItemNote(item.id, e.target.value)}
                                  className="flex-1 h-8 text-sm"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-500 flex-shrink-0"
                              onClick={() => removeFromEstimate(item.id)}
                            >
                              <Icon name="Trash2" className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}

                <Card className="p-5 bg-primary/5 border-primary/20 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Итого: {estimateItems.length} позиций</p>
                      <p className="text-sm text-gray-500">
                        Общее количество единиц: {estimateItems.reduce((s, i) => s + i.quantity, 0)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => navigate("/calculator")}>
                        <Icon name="Calculator" className="mr-1.5 h-4 w-4" />
                        В калькулятор
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setEstimateItems([]);
                          saveEstimateItems([]);
                        }}
                      >
                        <Icon name="Trash2" className="mr-1.5 h-4 w-4" />
                        Очистить
                      </Button>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Icon name="Search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Найти категорию: плитка, сантехника, краски..."
                  className="pl-11 h-12 text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setSearch("")}
                  >
                    <Icon name="X" className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Icon name="SearchX" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Ничего не найдено</p>
                <p className="text-gray-400 text-sm">Попробуйте изменить запрос</p>
              </div>
            )}

            {groupedCategories(filtered).map((group) => (
              <div key={group.label} className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full" />
                  {group.label}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.items.map((cat) => (
                    <Card
                      key={cat.slug}
                      className="overflow-hidden hover:shadow-lg transition-all duration-200 group"
                    >
                      <div
                        className="p-5 cursor-pointer"
                        onClick={() =>
                          expanded === cat.slug ? setExpanded(null) : setExpanded(cat.slug)
                        }
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon name={cat.icon} className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            {cat.subcategories.some((s) => isInEstimate(s.name, cat.name)) && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                <Icon name="Check" className="h-3 w-3 mr-0.5" />
                                в смете
                              </Badge>
                            )}
                            <Icon
                              name={expanded === cat.slug ? "ChevronUp" : "ChevronDown"}
                              className="h-4 w-4 text-gray-400"
                            />
                          </div>
                        </div>
                        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">{cat.description}</p>
                      </div>

                      {expanded === cat.slug && (
                        <div className="border-t bg-gray-50/50 px-5 py-3 space-y-1">
                          {cat.subcategories.map((sub) => {
                            const inEstimate = isInEstimate(sub.name, cat.name);
                            return (
                              <div
                                key={sub.slug}
                                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white transition-colors"
                              >
                                <button
                                  className="text-sm hover:text-primary transition-colors flex items-center gap-1.5 group/link"
                                  onClick={() => openSubcategory(sub.slug)}
                                >
                                  <span>{sub.name}</span>
                                  <Icon
                                    name="ExternalLink"
                                    className="h-3 w-3 text-gray-300 group-hover/link:text-primary"
                                  />
                                </button>
                                <Button
                                  variant={inEstimate ? "secondary" : "ghost"}
                                  size="sm"
                                  className={`h-7 text-xs px-2 ${inEstimate ? "text-green-700" : "text-gray-500 hover:text-primary"}`}
                                  onClick={() => {
                                    if (inEstimate) {
                                      const item = estimateItems.find(
                                        (i) => i.subcategory === sub.name && i.category === cat.name
                                      );
                                      if (item) removeFromEstimate(item.id);
                                    } else {
                                      addToEstimate(sub.name, sub.slug, cat.name);
                                    }
                                  }}
                                >
                                  <Icon
                                    name={inEstimate ? "Check" : "Plus"}
                                    className="h-3 w-3 mr-1"
                                  />
                                  {inEstimate ? "В смете" : "В смету"}
                                </Button>
                              </div>
                            );
                          })}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => openCategory(cat.slug)}
                          >
                            Все товары раздела
                            <Icon name="ArrowRight" className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            <Card className="p-6 mt-4 bg-blue-50/50 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="Info" className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 mb-1">
                    Каталог ведёт на официальный сайт{" "}
                    <span className="font-medium">ЛеманаПро (Самара)</span>. Все цены, наличие и
                    условия доставки — на стороне поставщика.
                  </p>
                  <p className="text-xs text-gray-500">
                    Телефон: 8 (800) 700-00-99 · Бесплатно по России
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {!showEstimate && estimateItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            className="shadow-lg rounded-full h-14 px-6 gap-2"
            onClick={() => setShowEstimate(true)}
          >
            <Icon name="ClipboardList" className="h-5 w-5" />
            Смета ({estimateItems.length})
          </Button>
        </div>
      )}
    </div>
  );
}
