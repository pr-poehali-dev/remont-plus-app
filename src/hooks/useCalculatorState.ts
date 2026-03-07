import { useState, useEffect, useCallback } from "react";
import { getEstimateItems, type EstimateSavedItem } from "@/lib/lemanapro-data";
import { useSubscription } from "@/hooks/useSubscription";

export const FREE_PRINTS_KEY = "calc_free_prints_used";
export const FREE_PRINTS_LIMIT = 3;

export function getFreePrintsUsed(): number {
  return parseInt(localStorage.getItem(FREE_PRINTS_KEY) || "0", 10);
}
export function incrementFreePrints() {
  localStorage.setItem(FREE_PRINTS_KEY, String(getFreePrintsUsed() + 1));
}

export const SERVICE_PRICES_URL = "https://functions.poehali.dev/4dae7ba0-b573-436a-b4c6-d3b0abf69fce";
export const ESTIMATES_URL = "https://functions.poehali.dev/2be69072-d4ba-493f-b89e-575fbbd70e8e";

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

export function useCalculatorState() {
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
  const hasPaidPlan = true;
  const freePrintsUsed = getFreePrintsUsed();
  const hasFreePrints = true;
  const canExport = true;

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

  const [savedToDb, setSavedToDb] = useState(false);
  useEffect(() => {
    if (!userId || items.length === 0) return;
    setSavedToDb(false);
    const timer = setTimeout(async () => {
      const tm = items.filter(i => i.category === "Материалы").reduce((s, i) => s + i.total, 0);
      const tw = items.filter(i => i.category === "Работы").reduce((s, i) => s + i.total, 0);
      const regionName = regions.find(r => r.code === selectedRegion)?.name || selectedRegion;
      await fetch(ESTIMATES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": String(userId) },
        body: JSON.stringify({
          name: `Смета — ${regionName}`,
          items,
          total_materials: tm,
          total_works: tw,
          total: tm + tw,
          region: selectedRegion,
        }),
      });
      setSavedToDb(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [items, userId, selectedRegion, regions]);

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

  const DELIVERY_BASE = 3500;
  const LIFT_PER_FLOOR_ELEVATOR = 300;
  const LIFT_PER_FLOOR_NO_ELEVATOR = 700;
  const floorsAboveFirst = Math.max(0, deliveryFloor - 1);
  const liftCost = floorsAboveFirst * (deliveryHasElevator ? LIFT_PER_FLOOR_ELEVATOR : LIFT_PER_FLOOR_NO_ELEVATOR);
  const deliveryCost = deliveryEnabled ? DELIVERY_BASE + liftCost : 0;
  const totalWithDelivery = grandTotal + deliveryCost;

  const currentRegion = regions.find(r => r.code === selectedRegion);

  return {
    items, setItems,
    lemanaItems, setLemanaItems,
    priceCatalog,
    regions,
    selectedRegion, setSelectedRegion,
    loading,
    showExportDialog, setShowExportDialog,
    showTemplates, setShowTemplates,
    showPaywall, setShowPaywall,
    userId,
    hasPaidPlan,
    freePrintsUsed,
    hasFreePrints,
    canExport,
    reloadSub,
    savedToDb,
    deliveryFloor, setDeliveryFloor,
    deliveryHasElevator, setDeliveryHasElevator,
    deliveryEnabled, setDeliveryEnabled,
    deliveryCost,
    totalMaterials,
    totalWorks,
    materialSurcharge,
    adjustedWorks,
    grandTotal,
    totalWithDelivery,
    currentRegion,
    addItem,
    removeItem,
    updateItem,
    addFromPriceList,
  };
}