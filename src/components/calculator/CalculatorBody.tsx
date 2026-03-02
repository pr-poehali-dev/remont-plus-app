import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { type EstimateSavedItem } from "@/lib/lemanapro-data";
import { type EstimateItem, type PriceCategory, type PriceItem, type Region } from "@/hooks/useCalculatorState";

import EstimateTab from "@/components/calculator/EstimateTab";
import LemanaProTab from "@/components/calculator/LemanaProTab";
import DocsTab from "@/components/calculator/DocsTab";
import CalculatorSidebar from "@/components/calculator/CalculatorSidebar";

interface CalculatorBodyProps {
  items: EstimateItem[];
  lemanaItems: EstimateSavedItem[];
  setLemanaItems: (items: EstimateSavedItem[]) => void;
  priceCatalog: PriceCategory[];
  loading: boolean;
  regions: Region[];
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  currentRegionName: string | undefined;
  totalMaterials: number;
  totalWorks: number;
  adjustedWorks: number;
  materialSurcharge: number;
  grandTotal: number;
  totalWithDelivery: number;
  deliveryCost: number;
  deliveryEnabled: boolean;
  deliveryFloor: number;
  deliveryHasElevator: boolean;
  onDeliveryEnabledChange: (v: boolean) => void;
  onDeliveryFloorChange: (v: number) => void;
  onDeliveryElevatorChange: (v: boolean) => void;
  onAddFromPriceList: (item: PriceItem, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<EstimateItem>) => void;
  onAddItem: (item: EstimateItem) => void;
  onExportPdf: () => void;
}

export default function CalculatorBody({
  items,
  lemanaItems,
  setLemanaItems,
  priceCatalog,
  loading,
  regions,
  selectedRegion,
  onRegionChange,
  currentRegionName,
  totalMaterials,
  totalWorks,
  adjustedWorks,
  materialSurcharge,
  grandTotal,
  totalWithDelivery,
  deliveryCost,
  deliveryEnabled,
  deliveryFloor,
  deliveryHasElevator,
  onDeliveryEnabledChange,
  onDeliveryFloorChange,
  onDeliveryElevatorChange,
  onAddFromPriceList,
  onRemoveItem,
  onUpdateItem,
  onAddItem,
  onExportPdf,
}: CalculatorBodyProps) {
  return (
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
                  onAddFromPriceList={onAddFromPriceList}
                  onRemoveItem={onRemoveItem}
                  onUpdateItem={onUpdateItem}
                  onAddItem={onAddItem}
                  regionName={currentRegionName}
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
          onExportPdf={onExportPdf}
          regions={regions}
          selectedRegion={selectedRegion}
          onRegionChange={onRegionChange}
          grandTotal={totalWithDelivery}
          materialSurcharge={materialSurcharge}
          deliveryEnabled={deliveryEnabled}
          deliveryFloor={deliveryFloor}
          deliveryHasElevator={deliveryHasElevator}
          deliveryCost={deliveryCost}
          onDeliveryEnabledChange={onDeliveryEnabledChange}
          onDeliveryFloorChange={onDeliveryFloorChange}
          onDeliveryElevatorChange={onDeliveryElevatorChange}
        />
      </div>
    </div>
  );
}
