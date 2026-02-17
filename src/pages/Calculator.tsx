import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getEstimateItems, type EstimateSavedItem } from "@/lib/lemanapro-data";
import { exportEstimatePdf } from "@/lib/export-pdf";
import EstimateTab from "@/components/calculator/EstimateTab";
import LemanaProTab from "@/components/calculator/LemanaProTab";
import ContractorsTab from "@/components/calculator/ContractorsTab";
import CalculatorSidebar from "@/components/calculator/CalculatorSidebar";

const defaultItems = [
  { id: "1", category: "Материалы", name: "Ламинат Premium 33 класс", unit: "м²", quantity: 20, price: 1200, total: 24000 },
  { id: "2", category: "Материалы", name: "Краска латексная белая", unit: "л", quantity: 15, price: 450, total: 6750 },
  { id: "3", category: "Работы", name: "Демонтаж старого покрытия", unit: "м²", quantity: 20, price: 350, total: 7000 },
  { id: "4", category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 20, price: 800, total: 16000 },
  { id: "5", category: "Работы", name: "Покраска стен", unit: "м²", quantity: 45, price: 400, total: 18000 },
];

export default function Calculator() {
  const navigate = useNavigate();
  const [items] = useState(defaultItems);
  const [lemanaItems, setLemanaItems] = useState<EstimateSavedItem[]>([]);

  useEffect(() => {
    setLemanaItems(getEstimateItems());
  }, []);

  const totalMaterials = items.filter(i => i.category === "Материалы").reduce((sum, i) => sum + i.total, 0);
  const totalWorks = items.filter(i => i.category === "Работы").reduce((sum, i) => sum + i.total, 0);
  const grandTotal = totalMaterials + totalWorks;

  const contractors = [
    { name: "СтройЭксперт", rating: 4.8, reviews: 127, price: grandTotal * 1.0, experience: "12 лет" },
    { name: "РемонтПро", rating: 4.6, reviews: 89, price: grandTotal * 1.15, experience: "8 лет" },
    { name: "МастерДом", rating: 4.9, reviews: 234, price: grandTotal * 0.95, experience: "15 лет" },
  ];

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
                <p className="text-sm text-gray-600">Точный расчет материалов и работ</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Icon name="FileSpreadsheet" className="mr-2 h-4 w-4" />
                Экспорт Excel
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
                  <TabsTrigger value="estimate">Смета</TabsTrigger>
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
                    grandTotal={grandTotal}
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
            onExportPdf={() => exportEstimatePdf(items, lemanaItems)}
          />
        </div>
      </div>
    </div>
  );
}