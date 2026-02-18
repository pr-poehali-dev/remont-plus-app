import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { getEstimateItems, type EstimateSavedItem } from "@/lib/lemanapro-data";
import { exportEstimatePdf } from "@/lib/export-pdf";
import EstimateTab from "@/components/calculator/EstimateTab";
import LemanaProTab from "@/components/calculator/LemanaProTab";
import ContractorsTab from "@/components/calculator/ContractorsTab";
import CalculatorSidebar from "@/components/calculator/CalculatorSidebar";

const SERVICE_PRICES_URL = "https://functions.poehali.dev/4dae7ba0-b573-436a-b4c6-d3b0abf69fce";

export interface EstimateItem {
  id: string;
  category: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PriceCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  items: PriceItem[];
}

export interface PriceItem {
  id: number;
  name: string;
  description: string | null;
  unit: string;
  price: number;
}

export interface Region {
  id: number;
  name: string;
  code: string;
}

export default function Calculator() {
  const navigate = useNavigate();
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [lemanaItems, setLemanaItems] = useState<EstimateSavedItem[]>([]);
  const [priceCatalog, setPriceCatalog] = useState<PriceCategory[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState(() => {
    return localStorage.getItem("avangard_calc_region") || "moscow";
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLemanaItems(getEstimateItems());
    const saved = localStorage.getItem("avangard_calc_items");
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("avangard_calc_items", JSON.stringify(items));
  }, [items]);

  const loadPrices = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`${SERVICE_PRICES_URL}?region=${selectedRegion}`);
    const data = await response.json();
    setPriceCatalog(data.prices);
    setRegions(data.regions);
    setLoading(false);
    localStorage.setItem("avangard_calc_region", selectedRegion);
  }, [selectedRegion]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  const addItem = (item: EstimateItem) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<EstimateItem>) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, ...updates };
      updated.total = updated.quantity * updated.price;
      return updated;
    }));
  };

  const addFromPriceList = (priceItem: PriceItem, quantity: number) => {
    const newItem: EstimateItem = {
      id: `work-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: "Работы",
      name: priceItem.name,
      unit: priceItem.unit,
      quantity,
      price: priceItem.price,
      total: priceItem.price * quantity,
    };
    setItems(prev => [...prev, newItem]);
  };

  const totalMaterials = items.filter(i => i.category === "Материалы").reduce((sum, i) => sum + i.total, 0);
  const totalWorks = items.filter(i => i.category === "Работы").reduce((sum, i) => sum + i.total, 0);

  const MATERIAL_COEFF = 1.3;
  const minWorksFromMaterials = Math.round(totalMaterials * MATERIAL_COEFF);
  const materialSurcharge = totalMaterials > 0 && totalWorks < minWorksFromMaterials
    ? minWorksFromMaterials - totalWorks
    : 0;
  const adjustedWorks = totalWorks + materialSurcharge;
  const grandTotal = totalMaterials + adjustedWorks;

  const contractors = [
    { name: "СтройЭксперт", rating: 4.8, reviews: 127, price: Math.round(grandTotal * 1.0), experience: "12 лет" },
    { name: "РемонтПро", rating: 4.6, reviews: 89, price: Math.round(grandTotal * 1.15), experience: "8 лет" },
    { name: "МастерДом", rating: 4.9, reviews: 234, price: Math.round(grandTotal * 0.95), experience: "15 лет" },
  ];

  const currentRegion = regions.find(r => r.code === selectedRegion);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Калькулятор стоимости</h1>
                <p className="text-sm text-gray-600">
                  {currentRegion ? currentRegion.name : "Загрузка..."}
                  {" · "}{items.length} позиций
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => navigate("/prices")}>
                <Icon name="ClipboardList" className="mr-2 h-4 w-4" />
                Прайс-лист
              </Button>
              <Button onClick={() => exportEstimatePdf(items, lemanaItems)}>
                <Icon name="Download" className="mr-2 h-4 w-4" />
                Скачать PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <Tabs defaultValue="estimate">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="estimate">
                    Смета
                    {items.length > 0 && (
                      <Badge className="ml-1.5 bg-purple-500 hover:bg-purple-500 text-white text-[10px] px-1.5 py-0 h-4">
                        {items.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="lemanapro" className="relative">
                    ЛеманаПро
                    {lemanaItems.length > 0 && (
                      <Badge className="ml-1.5 bg-green-500 hover:bg-green-500 text-white text-[10px] px-1.5 py-0 h-4">
                        {lemanaItems.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="contractors">Мастера</TabsTrigger>
                </TabsList>

                <TabsContent value="estimate" className="mt-6">
                  <EstimateTab
                    items={items}
                    totalMaterials={totalMaterials}
                    totalWorks={totalWorks}
                    adjustedWorks={adjustedWorks}
                    materialSurcharge={materialSurcharge}
                    grandTotal={grandTotal}
                    priceCatalog={priceCatalog}
                    loading={loading}
                    onAddFromPriceList={addFromPriceList}
                    onRemoveItem={removeItem}
                    onUpdateItem={updateItem}
                    onAddItem={addItem}
                    regionName={currentRegion?.name}
                  />
                </TabsContent>

                <TabsContent value="lemanapro" className="mt-6">
                  <LemanaProTab
                    lemanaItems={lemanaItems}
                    setLemanaItems={setLemanaItems}
                  />
                </TabsContent>

                <TabsContent value="contractors" className="mt-6 space-y-4">
                  <ContractorsTab contractors={contractors} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <CalculatorSidebar
            lemanaItemsCount={lemanaItems.length}
            onExportPdf={() => exportEstimatePdf(items, lemanaItems, materialSurcharge)}
            regions={regions}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            grandTotal={grandTotal}
            materialSurcharge={materialSurcharge}
          />
        </div>
      </div>
    </div>
  );
}