import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "MessageSquare",
      title: "ИИ-консультант",
      description: "Получите профессиональную консультацию по ремонту в режиме реального времени"
    },
    {
      icon: "Palette",
      title: "Дизайн-проект",
      description: "Создайте уникальный дизайн интерьера с помощью умного конструктора"
    },
    {
      icon: "Calculator",
      title: "Смета работ",
      description: "Точный расчет стоимости материалов и работ за минуты"
    },
    {
      icon: "Users",
      title: "Проверенные исполнители",
      description: "База надежных подрядчиков с рейтингами и отзывами"
    }
  ];

  const projects = [
    {
      image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/4efef414-51c8-4b1b-84da-7c9dc8b09fbd.jpg",
      title: "Современная кухня",
      style: "Минимализм"
    },
    {
      image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3a24d615-0a8e-4158-8a11-f1219a4ff77f.jpg",
      title: "Уютная гостиная",
      style: "Скандинавский стиль"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Home" className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">Ремонт без дизайнера</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Button variant="ghost" onClick={() => navigate('/catalog')}>Исполнители</Button>
            <Button variant="ghost" onClick={() => navigate('/projects')}>Проекты</Button>
            <Button variant="ghost" onClick={() => navigate('/blog')}>Советы</Button>
            <Button onClick={() => navigate('/login')}>Войти</Button>
          </div>
        </nav>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ремонт квартиры без дизайнера
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            ИИ-агент заменит дизайнера: создаст проект, рассчитает смету и подберет исполнителей. 
            Сэкономьте до 150 000 ₽ на услугах специалистов.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg h-14 px-8"
              onClick={() => navigate('/ai-chat')}
            >
              <Icon name="Sparkles" className="mr-2 h-5 w-5" />
              Начать консультацию бесплатно
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg h-14 px-8"
              onClick={() => navigate('/designer')}
            >
              <Icon name="Palette" className="mr-2 h-5 w-5" />
              Создать дизайн-проект
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Icon name={feature.icon} className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Примеры реализованных проектов</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {projects.map((project, index) => (
            <Card key={index} className="overflow-hidden group cursor-pointer">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                <p className="text-sm text-gray-600">{project.style}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={() => navigate('/projects')}>
            Смотреть все проекты
            <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Готовы начать ремонт?</h2>
          <p className="text-xl mb-8 opacity-90">
            Получите бесплатную консультацию и дизайн-проект за 10 минут
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg h-14 px-8"
            onClick={() => navigate('/register')}
          >
            <Icon name="Rocket" className="mr-2 h-5 w-5" />
            Создать аккаунт бесплатно
          </Button>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Home" className="h-6 w-6" />
                <span className="text-lg font-bold">Ремонт без дизайнера</span>
              </div>
              <p className="text-sm text-gray-400">
                Платформа для умного ремонта с ИИ-консультантом
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Сервисы</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">ИИ-консультант</li>
                <li className="hover:text-white cursor-pointer">Дизайн-проекты</li>
                <li className="hover:text-white cursor-pointer">Калькулятор</li>
                <li className="hover:text-white cursor-pointer">Исполнители</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">О нас</li>
                <li className="hover:text-white cursor-pointer">Контакты</li>
                <li className="hover:text-white cursor-pointer">Вакансии</li>
                <li className="hover:text-white cursor-pointer">Партнёрам</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">FAQ</li>
                <li className="hover:text-white cursor-pointer">Политика</li>
                <li className="hover:text-white cursor-pointer">Условия</li>
                <li className="hover:text-white cursor-pointer">Помощь</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 Ремонт без дизайнера. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
