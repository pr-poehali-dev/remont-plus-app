import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Designer() {
  const navigate = useNavigate();
  const [roomType, setRoomType] = useState("living");
  const [style, setStyle] = useState("modern");
  const [area, setArea] = useState([20]);
  const [budget, setBudget] = useState([500000]);

  const styles = [
    { id: "modern", name: "Современный", icon: "Sparkles" },
    { id: "minimalism", name: "Минимализм", icon: "Minus" },
    { id: "scandinavian", name: "Скандинавский", icon: "Home" },
    { id: "loft", name: "Лофт", icon: "Building" },
    { id: "classic", name: "Классический", icon: "Crown" },
    { id: "eclectic", name: "Эклектика", icon: "Palette" }
  ];

  const materials = [
    { name: "Ламинат Premium", price: "1 200 ₽/м²" },
    { name: "Керамогранит", price: "2 500 ₽/м²" },
    { name: "Краска латексная", price: "450 ₽/л" },
    { name: "Обои виниловые", price: "850 ₽/рул" }
  ];

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
                <h1 className="text-xl font-bold">Конструктор дизайн-проектов</h1>
                <p className="text-sm text-gray-600">Создайте уникальный интерьер за 10 минут</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/calculator')}>
                <Icon name="Calculator" className="mr-2 h-4 w-4" />
                Смета
              </Button>
              <Button onClick={() => {}}>
                <Icon name="Download" className="mr-2 h-4 w-4" />
                Экспорт PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <Tabs defaultValue="parameters">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="parameters">Параметры</TabsTrigger>
                  <TabsTrigger value="visualization">Визуализация</TabsTrigger>
                  <TabsTrigger value="materials">Материалы</TabsTrigger>
                </TabsList>

                <TabsContent value="parameters" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Тип помещения</Label>
                      <Select value={roomType} onValueChange={setRoomType}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="living">Гостиная</SelectItem>
                          <SelectItem value="bedroom">Спальня</SelectItem>
                          <SelectItem value="kitchen">Кухня</SelectItem>
                          <SelectItem value="bathroom">Ванная</SelectItem>
                          <SelectItem value="children">Детская</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Площадь помещения: {area[0]} м²</Label>
                      <Slider
                        value={area}
                        onValueChange={setArea}
                        min={5}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Бюджет: {budget[0].toLocaleString('ru-RU')} ₽</Label>
                      <Slider
                        value={budget}
                        onValueChange={setBudget}
                        min={100000}
                        max={5000000}
                        step={50000}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">Выберите стиль</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {styles.map((s) => (
                          <Button
                            key={s.id}
                            variant={style === s.id ? "default" : "outline"}
                            className="h-auto py-4 flex flex-col gap-2"
                            onClick={() => setStyle(s.id)}
                          >
                            <Icon name={s.icon} className="h-6 w-6" />
                            <span className="text-sm">{s.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="height">Высота потолка (м)</Label>
                        <Input id="height" type="number" defaultValue="2.7" step="0.1" className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="windows">Количество окон</Label>
                        <Input id="windows" type="number" defaultValue="1" min="0" className="mt-2" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="visualization" className="mt-6">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Icon name="Sparkles" className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                      <h3 className="text-xl font-semibold mb-2">3D Визуализация</h3>
                      <p className="text-gray-600 mb-4">Нажмите кнопку для генерации</p>
                      <Button size="lg">
                        <Icon name="Wand2" className="mr-2 h-5 w-5" />
                        Сгенерировать визуализацию
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded" />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="materials" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Рекомендуемые материалы</h3>
                      <Button variant="outline" size="sm">
                        <Icon name="Plus" className="mr-2 h-4 w-4" />
                        Добавить материал
                      </Button>
                    </div>
                    {materials.map((material, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded" />
                            <div>
                              <p className="font-medium">{material.name}</p>
                              <p className="text-sm text-gray-600">{material.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Icon name="Info" className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Icon name="Check" className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="FileText" className="h-5 w-5 text-purple-600" />
                Текущий проект
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Помещение:</span>
                  <span className="font-medium">Гостиная</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Площадь:</span>
                  <span className="font-medium">{area[0]} м²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Стиль:</span>
                  <span className="font-medium">Современный</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Бюджет:</span>
                  <span className="font-medium">{budget[0].toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="DollarSign" className="h-5 w-5 text-purple-600" />
                Примерная стоимость
              </h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Материалы:</span>
                  <span>245 000 ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Работы:</span>
                  <span>185 000 ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Дизайн:</span>
                  <span className="line-through text-gray-400">75 000 ₽</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-base">
                  <span>Итого:</span>
                  <span className="text-purple-600">430 000 ₽</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigate('/calculator')}>
                Подробная смета
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <Icon name="Sparkles" className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold mb-2 text-green-900">Экономия</h3>
              <p className="text-2xl font-bold text-green-600 mb-2">75 000 ₽</p>
              <p className="text-sm text-gray-700">
                Вы экономите на услугах дизайнера, используя ИИ-конструктор
              </p>
            </Card>

            <Button variant="outline" className="w-full" onClick={() => navigate('/ai-chat')}>
              <Icon name="MessageSquare" className="mr-2 h-4 w-4" />
              Консультация с ИИ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
