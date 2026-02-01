import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Catalog() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"contractors" | "suppliers">("contractors");

  const contractors = [
    {
      id: 1,
      name: "СтройМастер",
      avatar: "СМ",
      rating: 4.9,
      reviews: 234,
      experience: "15 лет",
      projects: 450,
      specialization: ["Квартиры", "Дома"],
      location: "Москва",
      verified: true,
      price: "от 3 500 ₽/м²"
    },
    {
      id: 2,
      name: "РемонтПро",
      avatar: "РП",
      rating: 4.7,
      reviews: 156,
      experience: "10 лет",
      projects: 320,
      specialization: ["Офисы", "Коммерция"],
      location: "Москва",
      verified: true,
      price: "от 4 200 ₽/м²"
    },
    {
      id: 3,
      name: "МастерДом",
      avatar: "МД",
      rating: 4.8,
      reviews: 189,
      experience: "12 лет",
      projects: 380,
      specialization: ["Квартиры", "Ванные"],
      location: "Москва и МО",
      verified: false,
      price: "от 3 200 ₽/м²"
    }
  ];

  const suppliers = [
    {
      id: 1,
      name: "СтройМатериалы Плюс",
      avatar: "СП",
      rating: 4.6,
      reviews: 89,
      categories: ["Отделка", "Напольные покрытия"],
      delivery: "Бесплатная от 50 000 ₽",
      location: "Москва",
      verified: true
    },
    {
      id: 2,
      name: "Керамика Профи",
      avatar: "КП",
      rating: 4.9,
      reviews: 145,
      categories: ["Плитка", "Керамогранит"],
      delivery: "Платная от 1 500 ₽",
      location: "Москва",
      verified: true
    }
  ];

  const data = userType === "contractors" ? contractors : suppliers;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Каталог</h1>
                <p className="text-sm text-gray-600">Проверенные исполнители и поставщики</p>
              </div>
            </div>
            <Button onClick={() => navigate('/register')}>
              <Icon name="UserPlus" className="mr-2 h-4 w-4" />
              Стать исполнителем
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Фильтры</h3>
              
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Тип</Label>
                  <Select value={userType} onValueChange={(value) => setUserType(value as typeof userType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contractors">Исполнители</SelectItem>
                      <SelectItem value="suppliers">Поставщики</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-3 block">Регион</Label>
                  <Select defaultValue="msk">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="msk">Москва</SelectItem>
                      <SelectItem value="spb">Санкт-Петербург</SelectItem>
                      <SelectItem value="other">Другие регионы</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-3 block">Рейтинг</Label>
                  <div className="space-y-2">
                    {[5, 4, 3].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <Checkbox id={`rating-${rating}`} />
                        <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 cursor-pointer">
                          {rating} <Icon name="Star" className="h-3 w-3 fill-yellow-400 text-yellow-400" /> и выше
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">
                    <Icon name="CheckCircle" className="inline h-4 w-4 mr-1 text-green-600" />
                    Только проверенные
                  </Label>
                  <div className="flex items-center gap-2">
                    <Checkbox id="verified" />
                    <Label htmlFor="verified" className="cursor-pointer">
                      С подтверждением
                    </Label>
                  </div>
                </div>

                <Button className="w-full">Применить фильтры</Button>
                <Button variant="outline" className="w-full">Сбросить</Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {userType === "contractors" ? "Исполнители" : "Поставщики"}
                </h2>
                <p className="text-gray-600">Найдено {data.length} результатов</p>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Поиск..." className="w-64" />
                <Select defaultValue="rating">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">По рейтингу</SelectItem>
                    <SelectItem value="reviews">По отзывам</SelectItem>
                    <SelectItem value="price">По цене</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {userType === "contractors" ? (
                contractors.map((contractor) => (
                  <Card key={contractor.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        {contractor.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold">{contractor.name}</h3>
                              {contractor.verified && (
                                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Icon name="Star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{contractor.rating}</span>
                                <span>({contractor.reviews} отзывов)</span>
                              </div>
                              <span>•</span>
                              <span>Опыт {contractor.experience}</span>
                              <span>•</span>
                              <span>{contractor.projects} проектов</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">Стоимость работ</p>
                            <p className="text-xl font-bold text-purple-600">{contractor.price}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          {contractor.specialization.map((spec, index) => (
                            <Badge key={index} variant="secondary">{spec}</Badge>
                          ))}
                          <span className="text-sm text-gray-600">• {contractor.location}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1">
                            <Icon name="MessageSquare" className="mr-2 h-4 w-4" />
                            Отправить запрос
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Icon name="Eye" className="mr-2 h-4 w-4" />
                            Портфолио
                          </Button>
                          <Button variant="outline" size="icon">
                            <Icon name="Heart" className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                suppliers.map((supplier) => (
                  <Card key={supplier.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        {supplier.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold">{supplier.name}</h3>
                              {supplier.verified && (
                                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Icon name="Star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{supplier.rating}</span>
                                <span>({supplier.reviews} отзывов)</span>
                              </div>
                              <span>•</span>
                              <span>{supplier.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          {supplier.categories.map((cat, index) => (
                            <Badge key={index} variant="secondary">{cat}</Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <Icon name="Truck" className="h-4 w-4" />
                          <span>{supplier.delivery}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1">
                            <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />
                            Каталог товаров
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Icon name="MessageSquare" className="mr-2 h-4 w-4" />
                            Связаться
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            <div className="mt-8 flex justify-center">
              <Button variant="outline" size="lg">
                Показать еще
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
