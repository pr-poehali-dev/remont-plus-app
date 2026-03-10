import { useEffect } from "react";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta from "@/components/SEOMeta";
import { useCalculatorState } from "@/hooks/useCalculatorState";

import CalculatorHeader from "@/components/calculator/CalculatorHeader";
import CalculatorBody from "@/components/calculator/CalculatorBody";
import CalculatorCities from "@/components/calculator/CalculatorCities";
import CalculatorModals from "@/components/calculator/CalculatorModals";

export type { EstimateItem, PriceCategory, PriceItem, Region } from "@/hooks/useCalculatorState";

export default function Calculator() {
  useMeta({
    title: "Калькулятор стоимости ремонта",
    description: "Рассчитайте стоимость ремонта квартиры онлайн. Калькулятор учитывает актуальные цены на работы и материалы по вашему региону — получите смету за 2 минуты.",
    keywords: "калькулятор стоимости ремонта, смета на ремонт онлайн, рассчитать ремонт квартиры, стоимость отделки, смета онлайн",
    canonical: "/calculator",
  });

  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Сколько стоит ремонт квартиры?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Стоимость ремонта зависит от площади, типа отделки и региона. Косметический ремонт однокомнатной квартиры в Москве — от 250 000 ₽, капитальный — от 600 000 ₽. Рассчитайте точную смету в нашем калькуляторе."
          }
        },
        {
          "@type": "Question",
          "name": "Как рассчитать смету на ремонт онлайн?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Выберите ваш регион, добавьте нужные работы из каталога (демонтаж, стяжка, плитка, покраска и др.), укажите площадь — калькулятор автоматически рассчитает итоговую стоимость с учётом актуальных цен."
          }
        },
        {
          "@type": "Question",
          "name": "Можно ли скачать смету в PDF?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Да, готовую смету можно скачать в PDF или распечатать. Для неограниченного количества смет подключите тарифный план."
          }
        },
        {
          "@type": "Question",
          "name": "Учитывает ли калькулятор стоимость материалов?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Да, калькулятор считает отдельно стоимость работ и материалов. Вы можете добавить материалы из каталога Леман ПРО или указать собственные позиции."
          }
        },
        {
          "@type": "Question",
          "name": "Для каких регионов России доступен калькулятор?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Калькулятор охватывает все крупные регионы России: Москва, Санкт-Петербург, Краснодарский край, Екатеринбург, Новосибирск, Казань, Нижний Новгород и другие. Цены автоматически пересчитываются для выбранного региона."
          }
        }
      ]
    };

    const scriptId = "faq-jsonld-calculator";
    let el = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = scriptId;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(faqSchema);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, []);

  const state = useCalculatorState();

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOMeta
        title="Калькуляторы ремонта онлайн — все виды работ"
        description="Все калькуляторы ремонта в одном месте: ванная, потолки, полы, электрика, окна, новостройка, баня, каркасный дом. Точный расчёт онлайн."
        keywords="калькуляторы ремонта, расчёт ремонта онлайн, смета ремонта онлайн"
        path="/calculator"
      />

      <CalculatorHeader
        currentRegionName={state.currentRegion?.name}
        userId={state.userId}
        itemsCount={state.items.length}
        savedToDb={state.savedToDb}
        loading={state.loading}
        hasPaidPlan={state.hasPaidPlan}
        hasFreePrints={state.hasFreePrints}
        freePrintsUsed={state.freePrintsUsed}
        canExport={state.canExport}
        onShowTemplates={() => state.setShowTemplates(true)}
        onExport={() => state.canExport ? state.setShowExportDialog(true) : state.setShowPaywall(true)}
      />

      <CalculatorBody
        items={state.items}
        lemanaItems={state.lemanaItems}
        setLemanaItems={state.setLemanaItems}
        priceCatalog={state.priceCatalog}
        loading={state.loading}
        regions={state.regions}
        selectedRegion={state.selectedRegion}
        onRegionChange={state.setSelectedRegion}
        currentRegionName={state.currentRegion?.name}
        totalMaterials={state.totalMaterials}
        totalWorks={state.totalWorks}
        adjustedWorks={state.adjustedWorks}
        materialSurcharge={state.materialSurcharge}
        grandTotal={state.grandTotal}
        totalWithDelivery={state.totalWithDelivery}
        deliveryCost={state.deliveryCost}
        deliveryEnabled={state.deliveryEnabled}
        deliveryFloor={state.deliveryFloor}
        deliveryHasElevator={state.deliveryHasElevator}
        onDeliveryEnabledChange={state.setDeliveryEnabled}
        onDeliveryFloorChange={state.setDeliveryFloor}
        onDeliveryElevatorChange={state.setDeliveryHasElevator}
        onAddFromPriceList={state.addFromPriceList}
        onRemoveItem={state.removeItem}
        onUpdateItem={state.updateItem}
        onAddItem={state.addItem}
        onExportPdf={() => state.setShowExportDialog(true)}
      />

      <CalculatorCities />

      <CalculatorModals
        items={state.items}
        setItems={state.setItems}
        lemanaItems={state.lemanaItems}
        priceCatalog={state.priceCatalog}
        showTemplates={state.showTemplates}
        setShowTemplates={state.setShowTemplates}
        showExportDialog={state.showExportDialog}
        setShowExportDialog={state.setShowExportDialog}
        showPaywall={state.showPaywall}
        setShowPaywall={state.setShowPaywall}
        hasPaidPlan={state.hasPaidPlan}
        reloadSub={state.reloadSub}
        totalWithDelivery={state.totalWithDelivery}
        currentRegionName={state.currentRegion?.name}
        totalMaterials={state.totalMaterials}
        totalWorks={state.totalWorks}
        materialSurcharge={state.materialSurcharge}
        adjustedWorks={state.adjustedWorks}
        grandTotal={state.grandTotal}
        deliveryCost={state.deliveryCost}
        deliveryFloor={state.deliveryFloor}
        deliveryHasElevator={state.deliveryHasElevator}
      />
    </div>
  );
}