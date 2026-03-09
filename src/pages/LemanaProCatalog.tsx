import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMeta } from "@/hooks/useMeta";
import {
  type EstimateSavedItem,
  BASE_URL,
  getEstimateItems,
  saveEstimateItems,
} from "@/lib/lemanapro-data";
import LemanaProEstimate from "@/components/lemanapro/LemanaProEstimate";
import LemanaProCatalogGrid from "@/components/lemanapro/LemanaProCatalogGrid";

export { type EstimateSavedItem, getEstimateItems, saveEstimateItems } from "@/lib/lemanapro-data";

export default function LemanaProCatalog() {
  const navigate = useNavigate();
  const [estimateItems, setEstimateItems] = useState<EstimateSavedItem[]>([]);
  const [showEstimate, setShowEstimate] = useState(false);

  useMeta({
    title: "Каталог стройматериалов Леман Про — цены и смета онлайн",
    description: "Подбирайте стройматериалы из каталога Леман Про, добавляйте в смету и рассчитывайте стоимость ремонта. Актуальные цены на отделочные материалы.",
    keywords: "Леман Про, каталог стройматериалов, цены на материалы, смета ремонта, Леруа Мерлен",
    canonical: "/lemanapro",
  });

  useEffect(() => {
    setEstimateItems(getEstimateItems());
  }, []);

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
          <LemanaProEstimate
            estimateItems={estimateItems}
            setEstimateItems={setEstimateItems}
            setShowEstimate={setShowEstimate}
          />
        ) : (
          <LemanaProCatalogGrid
            estimateItems={estimateItems}
            setEstimateItems={setEstimateItems}
          />
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