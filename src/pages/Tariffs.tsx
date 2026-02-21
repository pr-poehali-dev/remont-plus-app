import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import PricingPlans from "@/components/prices/PricingPlans";

export default function Tariffs() {
  const navigate = useNavigate();

  useMeta({
    title: "Цены на услуги — дизайн-проект и смета",
    description: "Стоимость услуг: дизайн-проект, смета ремонта, подбор материалов. Тарифы для частных клиентов и строительных компаний.",
    keywords: "цены дизайн-проект, стоимость сметы ремонта, тарифы дизайн интерьера, B2B автоматизация проектов",
    canonical: "/tariffs",
  });

  return (
    <div className="min-h-screen bg-gray-50">
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
          <span className="cursor-pointer hover:text-gray-600" onClick={() => navigate("/")}>
            Главная
          </span>
          <Icon name="ChevronRight" size={14} />
          <span className="text-gray-700">Цены</span>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Цены на услуги</h1>
            <p className="text-gray-500">
              Выберите подходящий тариф — для частного клиента или для вашей компании
            </p>
          </div>
          <Button
            onClick={() => navigate("/ai-chat")}
            className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 h-11 px-5"
          >
            <Icon name="Sparkles" size={16} className="mr-2" />
            Попробовать бесплатно
          </Button>
        </div>

        <PricingPlans />

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400 mb-3">Нужен прайс на строительные работы?</p>
          <Button variant="outline" onClick={() => navigate("/prices")}>
            <Icon name="ClipboardList" size={16} className="mr-2" />
            Смотреть прайс-лист работ
          </Button>
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-gray-400 mt-8">
        АВАНГАРД &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
