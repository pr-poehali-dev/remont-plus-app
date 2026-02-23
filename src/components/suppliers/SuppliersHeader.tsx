import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

export default function SuppliersHeader() {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Каталог товаров АВАНГАРД</h1>
              <p className="text-sm text-gray-600">Стройматериалы и интерьер для ремонта</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              <Icon name="User" className="mr-2 h-4 w-4" />
              Личный кабинет
            </Button>
            <Button variant="outline" onClick={() => navigate('/designer')}>
              <Icon name="Palette" className="mr-2 h-4 w-4" />
              Мои проекты
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
