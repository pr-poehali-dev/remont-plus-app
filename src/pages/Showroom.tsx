import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { showroomItems, roomFilters, styleFilters } from "@/components/showroom/showroomData";
import ShowroomItemCard from "@/components/showroom/ShowroomItemCard";

export default function Showroom() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState("Все");
  const [selectedStyle, setSelectedStyle] = useState("Все");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = showroomItems.filter((item) => {
    if (selectedRoom !== "Все" && item.room !== selectedRoom) return false;
    if (selectedStyle !== "Все" && item.style !== selectedStyle) return false;
    return true;
  });

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
                <h1 className="text-xl font-bold">ШОУРУМ</h1>
                <p className="text-sm text-gray-600">Готовые дизайнерские решения для вашего ремонта</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/suppliers")}>
                <Icon name="Store" className="mr-2 h-4 w-4" />
                Каталог
              </Button>
              <Button onClick={() => navigate("/ai-chat")}>
                <Icon name="Sparkles" className="mr-2 h-4 w-4" />
                Создать свой проект
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Breadcrumbs
        items={[
          { label: "Главная", path: "/" },
          { label: "Шоурум", path: "/showroom" },
        ]}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-3">Вдохновитесь готовыми решениями</h2>
            <p className="text-white/85 text-lg">
              Подборка визуализаций интерьеров от наших дизайнеров. Выберите стиль, который вам нравится,
              и мы поможем воплотить его в вашем доме.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 mr-4">
            <Icon name="DoorOpen" className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Помещение:</span>
          </div>
          {roomFilters.map((room) => (
            <Button
              key={room}
              variant={selectedRoom === room ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRoom(room)}
            >
              {room}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2 mr-4">
            <Icon name="Palette" className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Стиль:</span>
          </div>
          {styleFilters.map((style) => (
            <Button
              key={style}
              variant={selectedStyle === style ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStyle(style)}
            >
              {style}
            </Button>
          ))}
        </div>

        <p className="text-gray-500 mb-6">Найдено решений: {filtered.length}</p>

        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="Image" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Нет решений по фильтрам</h3>
            <p className="text-gray-600 mb-4">Попробуйте изменить фильтры</p>
            <Button onClick={() => { setSelectedRoom("Все"); setSelectedStyle("Все"); }}>
              Сбросить фильтры
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <ShowroomItemCard
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                onNavigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}