import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface EstimateItem {
  id: string;
  category: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
}

export default function Calculator() {
  const navigate = useNavigate();
  const [items, setItems] = useState<EstimateItem[]>([
    { id: "1", category: "Материалы", name: "Ламинат Premium 33 класс", unit: "м²", quantity: 20, price: 1200, total: 24000 },
    { id: "2", category: "Материалы", name: "Краска латексная белая", unit: "л", quantity: 15, price: 450, total: 6750 },
    { id: "3", category: "Работы", name: "Демонтаж старого покрытия", unit: "м²", quantity: 20, price: 350, total: 7000 },
    { id: "4", category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 20, price: 800, total: 16000 },
    { id: "5", category: "Работы", name: "Покраска стен", unit: "м²", quantity: 45, price: 400, total: 18000 }
  ]);

  const totalMaterials = items.filter(i => i.category === "Материалы").reduce((sum, i) => sum + i.total, 0);
  const totalWorks = items.filter(i => i.category === "Работы").reduce((sum, i) => sum + i.total, 0);
  const grandTotal = totalMaterials + totalWorks;

  const contractors = [
    { name: "СтройЭксперт", rating: 4.8, reviews: 127, price: grandTotal * 1.0, experience: "12 лет" },
    { name: "РемонтПро", rating: 4.6, reviews: 89, price: grandTotal * 1.15, experience: "8 лет" },
    { name: "МастерДом", rating: 4.9, reviews: 234, price: grandTotal * 0.95, experience: "15 лет" }
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
              <Button>
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="estimate">Смета</TabsTrigger>
                  <TabsTrigger value="contractors">Предложения исполнителей</TabsTrigger>
                </TabsList>

                <TabsContent value="estimate" className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Детализация расходов</h3>
                    <Button variant="outline" size="sm">
                      <Icon name="Plus" className="mr-2 h-4 w-4" />
                      Добавить позицию
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Категория</TableHead>
                          <TableHead>Наименование</TableHead>
                          <TableHead>Ед.</TableHead>
                          <TableHead>Кол-во</TableHead>
                          <TableHead>Цена</TableHead>
                          <TableHead>Сумма</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.category}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.price.toLocaleString('ru-RU')} ₽</TableCell>
                            <TableCell className="font-semibold">{item.total.toLocaleString('ru-RU')} ₽</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon">
                                  <Icon name="Pencil" className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Icon name="Trash2" className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Card className="mt-6 p-6 bg-gray-50">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Материалы</p>
                        <p className="text-2xl font-bold">{totalMaterials.toLocaleString('ru-RU')} ₽</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Работы</p>
                        <p className="text-2xl font-bold">{totalWorks.toLocaleString('ru-RU')} ₽</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Общая стоимость</p>
                        <p className="text-3xl font-bold text-purple-600">{grandTotal.toLocaleString('ru-RU')} ₽</p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="contractors" className="mt-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Сравнение предложений</h3>
                    <Button variant="outline" size="sm">
                      <Icon name="Filter" className="mr-2 h-4 w-4" />
                      Фильтры
                    </Button>
                  </div>

                  {contractors.map((contractor, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            {contractor.name[0]}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg mb-1">{contractor.name}</h4>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Icon name="Star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{contractor.rating}</span>
                                <span>({contractor.reviews} отзывов)</span>
                              </div>
                              <span>•</span>
                              <span>Опыт {contractor.experience}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Стоимость</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {contractor.price.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <Icon name="MessageSquare" className="mr-2 h-4 w-4" />
                          Написать
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Icon name="Eye" className="mr-2 h-4 w-4" />
                          Подробнее
                        </Button>
                      </div>
                    </Card>
                  ))}

                  <Button variant="outline" className="w-full">
                    Показать еще исполнителей
                  </Button>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="Settings" className="h-5 w-5 text-purple-600" />
                Параметры расчета
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Площадь помещения</Label>
                  <Input type="number" defaultValue="20" className="mt-2" />
                </div>
                <div>
                  <Label>Регион</Label>
                  <Select defaultValue="msk">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="msk">Москва</SelectItem>
                      <SelectItem value="spb">Санкт-Петербург</SelectItem>
                      <SelectItem value="other">Другой регион</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Срочность</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Обычная</SelectItem>
                      <SelectItem value="fast">Срочно (+20%)</SelectItem>
                      <SelectItem value="very-fast">Очень срочно (+40%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Пересчитать</Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <Icon name="Lightbulb" className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold mb-2">Рекомендации</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <Icon name="Check" className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Заказывайте материалы с запасом 10-15%</span>
                </li>
                <li className="flex gap-2">
                  <Icon name="Check" className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Сравните предложения минимум 3 исполнителей</span>
                </li>
                <li className="flex gap-2">
                  <Icon name="Check" className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Проверяйте наличие материалов у поставщика</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Экспорт сметы</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="FileText" className="mr-2 h-4 w-4" />
                  PDF документ
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="FileSpreadsheet" className="mr-2 h-4 w-4" />
                  Excel таблица
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Mail" className="mr-2 h-4 w-4" />
                  Отправить на email
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
