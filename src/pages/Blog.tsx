import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

export default function Blog() {
  const navigate = useNavigate();

  const articles = [
    {
      id: 1,
      title: "10 ошибок при ремонте квартиры, которые стоят дорого",
      excerpt: "Узнайте, какие распространённые ошибки допускают при ремонте и как их избежать",
      category: "Советы",
      readTime: "8 мин",
      image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/4efef414-51c8-4b1b-84da-7c9dc8b09fbd.jpg",
      date: "1 февраля 2026"
    },
    {
      id: 2,
      title: "Как выбрать правильный стиль интерьера",
      excerpt: "Гид по современным стилям интерьера: от минимализма до эклектики",
      category: "Дизайн",
      readTime: "12 мин",
      image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3a24d615-0a8e-4158-8a11-f1219a4ff77f.jpg",
      date: "30 января 2026"
    },
    {
      id: 3,
      title: "Расчёт бюджета на ремонт: полное руководство",
      excerpt: "Пошаговая инструкция по планированию бюджета и избежанию скрытых расходов",
      category: "Финансы",
      readTime: "10 мин",
      image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/4efef414-51c8-4b1b-84da-7c9dc8b09fbd.jpg",
      date: "28 января 2026"
    },
    {
      id: 4,
      title: "Материалы для ремонта: что выбрать в 2026 году",
      excerpt: "Обзор современных материалов для отделки и их характеристик",
      category: "Материалы",
      readTime: "15 мин",
      image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3a24d615-0a8e-4158-8a11-f1219a4ff77f.jpg",
      date: "25 января 2026"
    }
  ];

  const categories = ["Все статьи", "Советы", "Дизайн", "Финансы", "Материалы", "Технологии"];

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
                <h1 className="text-xl font-bold">База знаний</h1>
                <p className="text-sm text-gray-600">Советы и руководства по ремонту</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Всё о ремонте в одном месте</h2>
          <p className="text-xl mb-8 opacity-90">
            Статьи, советы и руководства от профессионалов
          </p>
          <div className="max-w-2xl mx-auto flex gap-2">
            <Input 
              placeholder="Поиск статей..." 
              className="bg-white text-gray-900"
            />
            <Button variant="secondary" size="lg">
              <Icon name="Search" className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "Все статьи" ? "default" : "outline"}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary">{article.category}</Badge>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Icon name="Clock" className="h-3 w-3" />
                    {article.readTime}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{article.date}</span>
                  <Button variant="link" className="p-0">
                    Читать далее →
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Icon name="Lightbulb" className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Нужна консультация?</h3>
            <p className="text-sm text-gray-700 mb-4">
              Задайте вопрос ИИ-консультанту и получите ответ в режиме реального времени
            </p>
            <Button className="w-full" onClick={() => navigate('/ai-chat')}>
              Начать чат
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Icon name="Palette" className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Создать проект</h3>
            <p className="text-sm text-gray-700 mb-4">
              Используйте конструктор для создания уникального дизайн-проекта
            </p>
            <Button className="w-full" onClick={() => navigate('/designer')}>
              Конструктор
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <Icon name="Calculator" className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Рассчитать смету</h3>
            <p className="text-sm text-gray-700 mb-4">
              Получите детальный расчёт стоимости материалов и работ
            </p>
            <Button className="w-full" onClick={() => navigate('/calculator')}>
              Калькулятор
            </Button>
          </Card>
        </div>

        <Card className="p-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <Icon name="Mail" className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Подпишитесь на рассылку</h2>
          <p className="mb-6 opacity-90">
            Получайте новые статьи и советы по ремонту прямо на почту
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <Input 
              placeholder="Ваш email" 
              className="bg-white text-gray-900"
            />
            <Button variant="secondary" size="lg">
              Подписаться
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
