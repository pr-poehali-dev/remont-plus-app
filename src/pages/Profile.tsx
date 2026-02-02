import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Profile() {
  const navigate = useNavigate();
  const [user] = useState({
    name: "Иван Петров",
    email: "ivan@example.com",
    phone: "+7 (987) 123-45-67",
    isAdmin: false
  });

  const [projects] = useState([
    {
      id: 1,
      name: "Ремонт квартиры 45м²",
      status: "В работе",
      budget: 850000,
      createdAt: "2026-01-15"
    },
    {
      id: 2,
      name: "Дизайн-проект кухни",
      status: "Завершен",
      budget: 320000,
      createdAt: "2025-12-20"
    }
  ]);

  const [favorites] = useState([
    {
      id: 1,
      name: "Ламинат \"Дуб натуральный\"",
      price: 1250,
      supplier: "СтройМатериалы Плюс"
    },
    {
      id: 2,
      name: "Диван-кровать \"Скандинавия\"",
      price: 45000,
      supplier: "Мир Интерьера"
    }
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Личный кабинет</h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.isAdmin && (
                <Button variant="outline" onClick={() => navigate('/admin')}>
                  <Icon name="Settings" className="mr-2 h-4 w-4" />
                  Админ-панель
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/suppliers')}>
                <Icon name="Package" className="mr-2 h-4 w-4" />
                Материалы
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <Icon name="User" className="h-4 w-4 mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="projects">
              <Icon name="FolderOpen" className="h-4 w-4 mr-2" />
              Проекты
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Icon name="Heart" className="h-4 w-4 mr-2" />
              Избранное
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Settings" className="h-4 w-4 mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-8">
              <div className="flex items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="User" className="h-16 w-16 text-primary" />
                  </div>
                  <Button className="w-full mt-4" variant="outline" size="sm">
                    Изменить фото
                  </Button>
                </div>
                
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                    <p className="text-gray-600">Пользователь платформы</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input value={user.email} readOnly />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Телефон</label>
                      <Input value={user.phone} readOnly />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-4">Статистика</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {projects.length}
                        </div>
                        <div className="text-sm text-gray-600">Проектов</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {favorites.length}
                        </div>
                        <div className="text-sm text-gray-600">Избранных</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          12
                        </div>
                        <div className="text-sm text-gray-600">Консультаций</div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <div className="space-y-4">
              {projects.map((project) => (
                <Card key={project.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          project.status === 'В работе' 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" className="h-4 w-4" />
                          {new Date(project.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Banknote" className="h-4 w-4" />
                          {formatPrice(project.budget)} ₽
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => navigate('/designer')}>
                      <Icon name="Eye" className="h-4 w-4 mr-2" />
                      Открыть
                    </Button>
                  </div>
                </Card>
              ))}
              
              <Card className="p-8 text-center border-2 border-dashed">
                <Icon name="Plus" className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <h3 className="font-semibold mb-2">Создать новый проект</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Начните работу с ИИ-консультантом
                </p>
                <Button onClick={() => navigate('/ai-chat')}>
                  <Icon name="Sparkles" className="h-4 w-4 mr-2" />
                  Создать проект
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="grid md:grid-cols-2 gap-4">
              {favorites.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.supplier}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Icon name="Heart" className="h-5 w-5 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(item.price)} ₽
                    </div>
                    <Button size="sm" onClick={() => navigate('/suppliers')}>
                      Перейти к товару
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Настройки профиля</h2>
              
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="text-sm font-medium mb-2 block">Имя</label>
                  <Input defaultValue={user.name} />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input defaultValue={user.email} type="email" />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Телефон</label>
                  <Input defaultValue={user.phone} type="tel" />
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Уведомления</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                      <span className="text-sm">Email-уведомления о статусе проектов</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                      <span className="text-sm">SMS-уведомления</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm">Рекламные рассылки</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <Button>Сохранить изменения</Button>
                  <Button variant="outline">Отмена</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
