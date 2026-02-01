import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const navigate = useNavigate();

  const projects = [
    {
      id: 1,
      title: "Современная кухня 15 м²",
      style: "Минимализм",
      budget: 450000,
      image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/4efef414-51c8-4b1b-84da-7c9dc8b09fbd.jpg",
      likes: 234,
      contractor: "СтройМастер"
    },
    {
      id: 2,
      title: "Уютная гостиная 25 м²",
      style: "Скандинавский",
      budget: 380000,
      image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3a24d615-0a8e-4158-8a11-f1219a4ff77f.jpg",
      likes: 189,
      contractor: "РемонтПро"
    },
    {
      id: 3,
      title: "Спальня в стиле Loft 18 м²",
      style: "Лофт",
      budget: 320000,
      image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/4efef414-51c8-4b1b-84da-7c9dc8b09fbd.jpg",
      likes: 156,
      contractor: "МастерДом"
    },
    {
      id: 4,
      title: "Ванная комната Premium 8 м²",
      style: "Современный",
      budget: 520000,
      image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3a24d615-0a8e-4158-8a11-f1219a4ff77f.jpg",
      likes: 298,
      contractor: "СтройМастер"
    },
    {
      id: 5,
      title: "Детская комната 14 м²",
      style: "Эклектика",
      budget: 280000,
      image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/4efef414-51c8-4b1b-84da-7c9dc8b09fbd.jpg",
      likes: 142,
      contractor: "РемонтПро"
    },
    {
      id: 6,
      title: "Кухня-гостиная 35 м²",
      style: "Современный",
      budget: 780000,
      image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3a24d615-0a8e-4158-8a11-f1219a4ff77f.jpg",
      likes: 421,
      contractor: "МастерДом"
    }
  ];

  const styles = ["Все стили", "Современный", "Минимализм", "Скандинавский", "Лофт", "Классический"];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Портфолио проектов</h1>
                <p className="text-sm text-gray-600">Реализованные ремонты от наших исполнителей</p>
              </div>
            </div>
            <Button onClick={() => navigate('/designer')}>
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Создать свой проект
            </Button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Вдохновитесь реальными проектами</h2>
          <p className="text-lg opacity-90">
            Более 500 завершённых ремонтов с фото и детальными сметами
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            {styles.map((style) => (
              <TabsTrigger key={style} value={style.toLowerCase().replace(' ', '-')}>
                {style}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="все-стили" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">Найдено {projects.length} проектов</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Icon name="SlidersHorizontal" className="mr-2 h-4 w-4" />
                  Фильтры
                </Button>
                <Button variant="outline" size="sm">
                  <Icon name="ArrowUpDown" className="mr-2 h-4 w-4" />
                  Сортировка
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-full bg-white/90 hover:bg-white"
                      >
                        <Icon name="Heart" className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                        {project.style}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Бюджет</p>
                        <p className="font-semibold text-purple-600">
                          {project.budget.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Исполнитель</p>
                        <p className="text-sm font-medium">{project.contractor}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Icon name="Heart" className="h-4 w-4" />
                        <span>{project.likes}</span>
                      </div>
                      <Button variant="link" className="p-0 h-auto">
                        Подробнее →
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Button variant="outline" size="lg">
                Показать еще проекты
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Проверенные исполнители</h3>
            <p className="text-sm text-gray-600">
              Все проекты реализованы сертифицированными подрядчиками
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="FileText" className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Детальные сметы</h3>
            <p className="text-sm text-gray-600">
              К каждому проекту прилагается полная смета работ и материалов
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="TrendingDown" className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Экономия на дизайне</h3>
            <p className="text-sm text-gray-600">
              Используйте наш ИИ-конструктор и экономьте до 150 000 ₽
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
