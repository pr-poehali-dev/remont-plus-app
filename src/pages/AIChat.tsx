import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import YandexGPTChat from "@/components/YandexGPTChat";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";

export default function AIChat() {
  useMeta({
    title: "ИИ-консультант по ремонту и дизайну",
    description: "Задайте вопрос ИИ-ассистенту по ремонту, дизайну интерьера, выбору материалов и расчёту стоимости. Бесплатно и без регистрации.",
    keywords: "ИИ консультант ремонт, чат бот дизайн интерьера, вопрос про ремонт онлайн",
    canonical: "/ai-chat",
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Icon name="Sparkles" className="h-5 w-5 text-primary" />
                  ИИ-консультант АВАНГАРД
                </h1>
                <p className="text-sm text-gray-600">Консультант по ремонту на базе YandexGPT</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/suppliers')}>
                <Icon name="Store" className="mr-2 h-4 w-4" />
                Каталог
              </Button>
              <Button variant="outline" onClick={() => navigate('/profile')}>
                <Icon name="User" className="mr-2 h-4 w-4" />
                Профиль
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Breadcrumbs 
        items={[
          { label: "Главная", path: "/" },
          { label: "ИИ-консультант", path: "/ai-chat" }
        ]}
      />

      <div className="flex-1 container mx-auto px-4 py-6">
        <Card className="h-[calc(100vh-220px)] overflow-hidden">
          <YandexGPTChat />
        </Card>
      </div>

      <div className="bg-white border-t py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Icon name="Shield" className="h-4 w-4 text-primary" />
              <span>Безопасно</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Zap" className="h-4 w-4 text-primary" />
              <span>Быстрые ответы</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Brain" className="h-4 w-4 text-primary" />
              <span>YandexGPT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}