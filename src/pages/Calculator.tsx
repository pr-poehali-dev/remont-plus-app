import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useMeta } from "@/hooks/useMeta";
import { getEstimateItems, type EstimateSavedItem } from "@/lib/lemanapro-data";
import { useSubscription } from "@/hooks/useSubscription";

import EstimateTab from "@/components/calculator/EstimateTab";
import LemanaProTab from "@/components/calculator/LemanaProTab";
import DocsTab from "@/components/calculator/DocsTab";
import CalculatorSidebar from "@/components/calculator/CalculatorSidebar";
import ExportDialog from "@/components/calculator/ExportDialog";
import TemplatesDialog from "@/components/calculator/TemplatesDialog";
import PaywallModal from "@/components/calculator/PaywallModal";
import CalcTour from "@/components/calculator/CalcTour";

const FREE_PRINTS_KEY = "calc_free_prints_used";
const FREE_PRINTS_LIMIT = 3;

function getFreePrintsUsed(): number {
  return parseInt(localStorage.getItem(FREE_PRINTS_KEY) || "0", 10);
}
function incrementFreePrints() {
  localStorage.setItem(FREE_PRINTS_KEY, String(getFreePrintsUsed() + 1));
}

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

  useMeta({
    title: "Калькулятор стоимости ремонта",
    description: "Рассчитайте стоимость ремонта квартиры онлайн. Калькулятор учитывает актуальные цены на работы и материалы по вашему региону — получите смету за 2 минуты.",
    keywords: "калькулятор стоимости ремонта, смета на ремонт онлайн, рассчитать ремонт квартиры, стоимость отделки, смета онлайн",
    canonical: "/calculator",
  });

  const [items, setItems] = useState<EstimateItem[]>([]);
  const [lemanaItems, setLemanaItems] = useState<EstimateSavedItem[]>([]);
  const [priceCatalog, setPriceCatalog] = useState<PriceCategory[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState(() => {
    return localStorage.getItem("avangard_calc_region") || "moscow";
  });
  const [loading, setLoading] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("avangard_user") || "null");
  const userId: number | null = storedUser?.id ?? null;
  const { subscription, reload: reloadSub } = useSubscription(userId);
  const hasPaidPlan = !!subscription && subscription.status === "active";
  const freePrintsUsed = getFreePrintsUsed();
  const hasFreePrints = freePrintsUsed < FREE_PRINTS_LIMIT;
  const canExport = hasPaidPlan || hasFreePrints;

  const [deliveryFloor, setDeliveryFloor] = useState<number>(1);
  const [deliveryHasElevator, setDeliveryHasElevator] = useState<boolean>(true);
  const [deliveryEnabled, setDeliveryEnabled] = useState<boolean>(false);

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

  // Расчёт доставки и подъёма материалов
  // Базовая доставка + подъём: за каждый этаж выше 1-го
  const DELIVERY_BASE = 3500; // базовая стоимость доставки
  const LIFT_PER_FLOOR_ELEVATOR = 300;   // с лифтом: за этаж выше 1-го
  const LIFT_PER_FLOOR_NO_ELEVATOR = 700; // без лифта: за этаж выше 1-го
  const floorsAboveFirst = Math.max(0, deliveryFloor - 1);
  const liftCost = floorsAboveFirst * (deliveryHasElevator ? LIFT_PER_FLOOR_ELEVATOR : LIFT_PER_FLOOR_NO_ELEVATOR);
  const deliveryCost = deliveryEnabled ? DELIVERY_BASE + liftCost : 0;
  const totalWithDelivery = grandTotal + deliveryCost;

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
              <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)} disabled={loading}>
                <Icon name={loading ? "Loader2" : "LayoutTemplate"} className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Шаблоны
              </Button>
              <div className="relative">
                <Button onClick={() => canExport ? setShowExportDialog(true) : setShowPaywall(true)}>
                  <Icon name={canExport ? "Download" : "Lock"} className="mr-2 h-4 w-4" />
                  Скачать PDF
                </Button>
                {!hasPaidPlan && hasFreePrints && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {FREE_PRINTS_LIMIT - freePrintsUsed}
                  </span>
                )}
              </div>
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
                  <TabsTrigger value="docs">
                    <Icon name="FileText" size={13} className="mr-1" />
                    Документы
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="estimate" className="mt-6">
                  <EstimateTab
                    items={items}
                    totalMaterials={totalMaterials}
                    totalWorks={totalWorks}
                    adjustedWorks={adjustedWorks}
                    materialSurcharge={materialSurcharge}
                    grandTotal={grandTotal}
                    deliveryCost={deliveryCost}
                    priceCatalog={priceCatalog}
                    loading={loading}
                    onAddFromPriceList={addFromPriceList}
                    onRemoveItem={removeItem}
                    onUpdateItem={updateItem}
                    onAddItem={addItem}
                    regionName={currentRegion?.name}
                    selectedRegion={selectedRegion}
                  />
                </TabsContent>

                <TabsContent value="lemanapro" className="mt-6">
                  <LemanaProTab
                    lemanaItems={lemanaItems}
                    setLemanaItems={setLemanaItems}
                  />
                </TabsContent>

                <TabsContent value="docs" className="mt-6">
                  <DocsTab
                    items={items}
                    lemanaItems={lemanaItems}
                    grandTotal={grandTotal}
                    materialSurcharge={materialSurcharge}
                    totalMaterials={totalMaterials}
                    totalWorks={totalWorks}
                    adjustedWorks={adjustedWorks}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <CalculatorSidebar
            lemanaItemsCount={lemanaItems.length}
            onExportPdf={() => setShowExportDialog(true)}
            regions={regions}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            grandTotal={totalWithDelivery}
            materialSurcharge={materialSurcharge}
            deliveryEnabled={deliveryEnabled}
            deliveryFloor={deliveryFloor}
            deliveryHasElevator={deliveryHasElevator}
            deliveryCost={deliveryCost}
            onDeliveryEnabledChange={setDeliveryEnabled}
            onDeliveryFloorChange={setDeliveryFloor}
            onDeliveryElevatorChange={setDeliveryHasElevator}
          />
        </div>
      </div>

      <TemplatesDialog
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        currentItems={items}
        priceCatalog={priceCatalog}
        onApply={(newItems, mode) =>
          setItems(mode === "append" ? [...items, ...newItems] : newItems)
        }
      />

      {showExportDialog && (
        <ExportDialog
          onCancel={() => setShowExportDialog(false)}
          onConfirm={({ customer, contractor, address, phone, email, validDays, docType, inn, kpp, ogrn, legalAddress, bank, bik, checkingAccount }) => {
            setShowExportDialog(false);
            if (!hasPaidPlan) incrementFreePrints();
            const docNum = Date.now().toString().slice(-6);
            const date = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
            navigate("/estimate/print", {
              state: {
                items,
                lemanaItems,
                materialSurcharge,
                customer,
                contractor,
                address,
                phone,
                email,
                validDays,
                docType,
                inn,
                kpp,
                ogrn,
                legalAddress,
                bank,
                bik,
                checkingAccount,
                totalMaterials,
                totalWorks,
                adjustedWorks,
                grandTotal,
                deliveryCost,
                deliveryFloor,
                deliveryHasElevator,
                docNum,
                date,
              },
            });
          }}
        />
      )}

      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onSuccess={() => {
            setShowPaywall(false);
            reloadSub();
            setShowExportDialog(true);
          }}
        />
      )}

      <CalcTour />
    </div>
  );
}