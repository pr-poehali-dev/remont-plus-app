import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const projects = [
    {
      id: 1,
      name: "Ремонт гостиной",
      room: "Гостиная 25 м²",
      status: "В работе",
      progress: 45,
      budget: 450000,
      spent: 202500,
      contractor: "СтройМастер",
      deadline: "15 марта 2026"
    },
    {
      id: 2,
      name: "Ремонт кухни",
      room: "Кухня 12 м²",
      status: "Планирование",
      progress: 10,
      budget: 280000,
      spent: 0,
      contractor: null,
      deadline: "1 апреля 2026"
    }
  ];

  const chatHistory = [
    { id: 1, date: "1 февраля", messages: 24, topic: "Выбор стиля для спальни" },
    { id: 2, date: "31 января", messages: 18, topic: "Расчет сметы для ванной" },
    { id: 3, date: "29 января", messages: 32, topic: "Планировка кухни-гостиной" }
  ];

  const designProjects = [
    { id: 1, name: "Гостиная Modern", style: "Современный", created: "1 фев", image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/4efef414-51c8-4b1b-84da-7c9dc8b09fbd.jpg" },
    { id: 2, name: "Спальня Scandi", style: "Скандинавский", created: "28 янв", image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3a24d615-0a8e-4158-8a11-f1219a4ff77f.jpg" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Icon name="Home" className="h-6 w-6 text-purple-600" />
                <span className="text-xl font-bold">Ремонт без дизайнера</span>
              </div>
              <nav className="hidden md:flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/')}>Главная</Button>
                <Button variant="ghost" onClick={() => navigate('/ai-chat')}>ИИ-консультант</Button>
                <Button variant="ghost" onClick={() => navigate('/designer')}>Конструктор</Button>
                <Button variant="ghost" onClick={() => navigate('/catalog')}>Каталог</Button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Icon name="Bell" className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Settings" className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                И
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Добро пожаловать, Иван!</h1>
          <p className="text-gray-600">Управляйте своими проектами и следите за прогрессом</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Icon name="Briefcase" className="h-8 w-8 text-purple-600" />
              <Badge>Активных</Badge>
            </div>
            <p className="text-3xl font-bold mb-1">2</p>
            <p className="text-sm text-gray-600">Проекта в работе</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Icon name="MessageSquare" className="h-8 w-8 text-blue-600" />
              <Badge variant="secondary">Новые</Badge>
            </div>
            <p className="text-3xl font-bold mb-1">12</p>
            <p className="text-sm text-gray-600">Непрочитанных сообщений</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Icon name="DollarSign" className="h-8 w-8 text-green-600" />
              <Icon name="TrendingDown" className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold mb-1">75 000 ₽</p>
            <p className="text-sm text-gray-600">Экономия на дизайнере</p>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">Мои проекты</TabsTrigger>
            <TabsTrigger value="chats">История чатов</TabsTrigger>
            <TabsTrigger value="designs">Дизайн-проекты</TabsTrigger>
            <TabsTrigger value="documents">Документы</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Активные проекты</h2>
              <Button onClick={() => navigate('/designer')}>
                <Icon name="Plus" className="mr-2 h-4 w-4" />
                Новый проект
              </Button>
            </div>

            {projects.map((project) => (
              <Card key={project.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{project.name}</h3>
                      <Badge variant={project.status === "В работе" ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-1">{project.room}</p>
                    {project.contractor && (
                      <p className="text-sm text-gray-600">
                        Исполнитель: <span className="font-medium">{project.contractor}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Бюджет</p>
                    <p className="text-xl font-bold">{project.budget.toLocaleString('ru-RU')} ₽</p>
                    <p className="text-sm text-gray-600">
                      Потрачено: {project.spent.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Прогресс</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon name="Calendar" className="h-4 w-4" />
                    <span>Срок: {project.deadline}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Icon name="MessageSquare" className="mr-2 h-4 w-4" />
                      Чат
                    </Button>
                    <Button size="sm">
                      <Icon name="Eye" className="mr-2 h-4 w-4" />
                      Подробнее
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="chats">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">История консультаций</h2>
                <Button onClick={() => navigate('/ai-chat')}>
                  <Icon name="MessageSquare" className="mr-2 h-4 w-4" />
                  Новая консультация
                </Button>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {chatHistory.map((chat) => (
                    <Card key={chat.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Icon name="Bot" className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{chat.topic}</h3>
                            <p className="text-sm text-gray-600">{chat.messages} сообщений</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{chat.date}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="designs">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Мои дизайн-проекты</h2>
                <Button onClick={() => navigate('/designer')}>
                  <Icon name="Palette" className="mr-2 h-4 w-4" />
                  Создать новый
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {designProjects.map((design) => (
                  <Card key={design.id} className="overflow-hidden group cursor-pointer">
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={design.image}
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{design.name}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{design.style}</span>
                        <span className="text-gray-500">{design.created}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Документы и сметы</h2>
                <Button variant="outline">
                  <Icon name="Upload" className="mr-2 h-4 w-4" />
                  Загрузить документ
                </Button>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Смета_Гостиная.pdf", size: "1.2 MB", date: "1 февраля" },
                  { name: "Договор_СтройМастер.pdf", size: "850 KB", date: "29 января" },
                  { name: "Акт_выполненных_работ.pdf", size: "640 KB", date: "25 января" }
                ].map((doc, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <Icon name="FileText" className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-600">{doc.size} • {doc.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Icon name="Download" className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon name="Eye" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
