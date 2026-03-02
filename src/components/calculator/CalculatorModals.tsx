import { useNavigate } from "react-router-dom";
import { type EstimateSavedItem } from "@/lib/lemanapro-data";
import { type EstimateItem, type PriceCategory, incrementFreePrints } from "@/hooks/useCalculatorState";

import ExportDialog from "@/components/calculator/ExportDialog";
import TemplatesDialog from "@/components/calculator/TemplatesDialog";
import PaywallModal from "@/components/calculator/PaywallModal";
import CalcTour from "@/components/calculator/CalcTour";
import SalesWidget from "@/components/calculator/SalesWidget";

interface CalculatorModalsProps {
  items: EstimateItem[];
  setItems: (items: EstimateItem[]) => void;
  lemanaItems: EstimateSavedItem[];
  priceCatalog: PriceCategory[];
  showTemplates: boolean;
  setShowTemplates: (v: boolean) => void;
  showExportDialog: boolean;
  setShowExportDialog: (v: boolean) => void;
  showPaywall: boolean;
  setShowPaywall: (v: boolean) => void;
  hasPaidPlan: boolean;
  reloadSub: () => void;
  totalWithDelivery: number;
  currentRegionName: string | undefined;
  totalMaterials: number;
  totalWorks: number;
  materialSurcharge: number;
  adjustedWorks: number;
  grandTotal: number;
  deliveryCost: number;
  deliveryFloor: number;
  deliveryHasElevator: boolean;
}

export default function CalculatorModals({
  items,
  setItems,
  lemanaItems,
  priceCatalog,
  showTemplates,
  setShowTemplates,
  showExportDialog,
  setShowExportDialog,
  showPaywall,
  setShowPaywall,
  hasPaidPlan,
  reloadSub,
  totalWithDelivery,
  currentRegionName,
  totalMaterials,
  totalWorks,
  materialSurcharge,
  adjustedWorks,
  grandTotal,
  deliveryCost,
  deliveryFloor,
  deliveryHasElevator,
}: CalculatorModalsProps) {
  const navigate = useNavigate();

  return (
    <>
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

      <SalesWidget
        calcContext={{
          calcName: "Калькулятор ремонта",
          totalPrice: totalWithDelivery,
          region: currentRegionName,
          items: items.slice(0, 8).map(i => ({ name: i.name, total: i.total })),
          summary: items.length > 0
            ? `${items.filter(i => i.category === "Работы").length} видов работ, ${items.filter(i => i.category === "Материалы").length} видов материалов`
            : undefined,
        }}
      />
    </>
  );
}
