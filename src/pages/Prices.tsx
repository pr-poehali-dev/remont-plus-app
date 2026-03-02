import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta from "@/components/SEOMeta";
import { type Region, type Category, type PriceCategory } from "@/components/prices/PricesTypes";
import PriceListTable from "@/components/prices/PriceListTable";
import PageTour from "@/components/ui/PageTour";

const PRICES_TOUR = [
  {
    title: "Прайс-лист по регионам",
    text: "Цены автоматически меняются в зависимости от выбранного города. Выберите свой регион в фильтре.",
    icon: "MapPin",
  },
  {
    title: "Фильтр по категориям",
    text: "Используйте фильтр категорий, чтобы быстро найти нужный вид работ — штукатурка, электрика, сантехника и др.",
    icon: "LayoutList",
  },
  {
    title: "Поиск по названию",
    text: "Введите название работы в строку поиска — например «плитка» или «шпаклёвка» — и найдёте цену за секунды.",
    icon: "Search",
  },
  {
    title: "Перейдите к расчёту сметы",
    text: "Нашли нужные работы? Нажмите «Рассчитать смету» и получите полный документ с итоговой стоимостью.",
    icon: "Calculator",
  },
];

const API_URL =
  "https://functions.poehali.dev/4dae7ba0-b573-436a-b4c6-d3b0abf69fce";

export default function Prices() {
  const navigate = useNavigate();

  useMeta({
    title: "Прайс-лист на ремонтные работы",
    description: "Актуальные цены на все виды ремонта и отделки: штукатурка, укладка плитки, монтаж гипсокартона, электрика, сантехника. Цены по регионам с разбивкой по категориям.",
    keywords: "прайс-лист ремонт квартиры, цены на отделку, стоимость ремонтных работ, расценки мастеров, прайс строительные работы",
    canonical: "/prices",
  });

  const [regions, setRegions] = useState<Region[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [prices, setPrices] = useState<PriceCategory[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("moscow");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const loadPrices = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedRegion) params.set("region", selectedRegion);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (search.trim()) params.set("search", search.trim());

    const response = await fetch(`${API_URL}?${params}`);
    const data = await response.json();

    setRegions(data.regions);
    setCategories(data.categories);
    setPrices(data.prices);
    setLoading(false);

    if (data.prices.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set(data.prices.map((c: PriceCategory) => c.slug)));
    }
  };

  useEffect(() => {
    loadPrices();
  }, [selectedRegion, selectedCategory]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadPrices();
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const toggleCategory = (slug: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const currentRegion = regions.find((r) => r.code === selectedRegion);
  const totalItems = prices.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOMeta
        title="Цены на ремонт квартир и домов 2026 — прайс-лист"
        description="Актуальный прайс-лист на ремонт квартир, домов и офисов. Цены на отделочные работы, электрику, сантехнику и монтаж потолков в 2026 году."
        keywords="цены на ремонт квартиры 2026, прайс лист ремонт, стоимость отделочных работ"
        path="/prices"
      />
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <Icon name="Compass" className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold tracking-tight">АВАНГАРД</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Icon name="Phone" className="h-4 w-4" />
              <span className="font-medium text-gray-700">8 (927) 748-68-68</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <span
            className="cursor-pointer hover:text-gray-600"
            onClick={() => navigate("/")}
          >
            Главная
          </span>
          <Icon name="ChevronRight" size={14} />
          <span className="text-gray-700">Прайс-лист</span>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Прайс-лист на работы
            </h1>
            <p className="text-gray-500">
              Актуальные цены на все виды ремонтных и строительных работ с учётом региона
            </p>
          </div>
          <Button
            onClick={() => navigate("/calculator")}
            className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 h-11 px-5"
          >
            <Icon name="Calculator" size={16} className="mr-2" />
            Рассчитать смету
          </Button>
        </div>

        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 p-6 md:p-8 mb-8">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute -right-2 bottom-0 w-28 h-28 bg-white/10 rounded-full" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="text-white">
              <div className="inline-flex items-center gap-1.5 bg-white/20 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <Icon name="Sparkles" size={12} />
                Бесплатно — навсегда
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold mb-1 leading-snug">
                Смотришь цены — уже можешь считать смету
              </h2>
              <p className="text-white/85 text-sm md:text-base max-w-md">
                Выбери нужные работы из прайса и получи готовую смету с итогом. Без звонков, без менеджеров — сразу документ.
              </p>
            </div>
            <Button
              onClick={() => navigate("/calculator")}
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-xl shrink-0 shadow-lg shadow-orange-700/20 px-7"
            >
              <Icon name="FileText" size={17} className="mr-2" />
              Составить смету
            </Button>
          </div>
        </div>

        <PriceListTable
          regions={regions}
          categories={categories}
          prices={prices}
          selectedRegion={selectedRegion}
          selectedCategory={selectedCategory}
          search={search}
          loading={loading}
          expandedCategories={expandedCategories}
          currentRegion={currentRegion}
          totalItems={totalItems}
          onRegionChange={setSelectedRegion}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearch}
          onToggleCategory={toggleCategory}
          formatPrice={formatPrice}
        />
      </main>

      <footer className="py-8 text-center text-xs text-gray-400 mt-8">
        <div>АВАНГАРД &copy; {new Date().getFullYear()}</div>
        <div className="mt-1">ООО «МАТ-Лабс» &nbsp;|&nbsp; ИНН/КПП 6312223437/631201001 &nbsp;|&nbsp; ОГРН 1266300004288</div>
      </footer>

      <PageTour tourKey="prices_tour_done" steps={PRICES_TOUR} delay={1000} />
    </div>
  );
}