import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type EstimateSavedItem } from "@/lib/lemanapro-data";
import { type EstimateItem, type PriceCategory } from "@/hooks/useCalculatorState";

import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import TemplatesDialog from "@/components/calculator/TemplatesDialog";
import LeadGateModal, { isLeadGatePassed } from "@/components/calculator/LeadGateModal";

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
  const [showLeadGate, setShowLeadGate] = useState(false);
  const pendingExport = useRef<ExportConfirmData | null>(null);

  const navigateToPrint = (data: ExportConfirmData) => {
    const docNum = Date.now().toString().slice(-6);
    const date = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
    navigate("/estimate/print", {
      state: {
        items,
        lemanaItems,
        materialSurcharge,
        customer: data.customer,
        contractor: data.contractor,
        address: data.address,
        phone: data.phone,
        email: data.email,
        validDays: data.validDays,
        docType: data.docType,
        inn: data.inn,
        kpp: data.kpp,
        ogrn: data.ogrn,
        legalAddress: data.legalAddress,
        bank: data.bank,
        bik: data.bik,
        checkingAccount: data.checkingAccount,
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
  };

  const handleExportConfirm = (data: ExportConfirmData) => {
    setShowExportDialog(false);
    if (isLeadGatePassed()) {
      navigateToPrint(data);
    } else {
      pendingExport.current = data;
      setShowLeadGate(true);
    }
  };

  const handleLeadSuccess = () => {
    setShowLeadGate(false);
    if (pendingExport.current) {
      navigateToPrint(pendingExport.current);
      pendingExport.current = null;
    }
  };

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
          onConfirm={handleExportConfirm}
        />
      )}

      <LeadGateModal
        open={showLeadGate}
        calcType="Калькулятор ремонта"
        totalSum={grandTotal ? `${grandTotal.toLocaleString("ru-RU")} ₽` : undefined}
        itemsCount={items.length}
        region={currentRegionName}
        onSuccess={handleLeadSuccess}
        onClose={() => setShowLeadGate(false)}
      />

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