import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    setTimeout(() => {
      setIsSubmitted(false);
      setPhone("");
      setName("");
    }, 3000);
  };

  const services = [
    {
      icon: "Home",
      title: "Ремонт квартир под ключ",
      description: "Полный цикл работ от планирования до финишной отделки"
    },
    {
      icon: "Palette",
      title: "Дизайн интерьера",
      description: "Создание уникального дизайн-проекта с визуализацией"
    },
    {
      icon: "Hammer",
      title: "Черновые работы",
      description: "Демонтаж, стяжка, штукатурка, электрика и сантехника"
    },
    {
      icon: "Paintbrush",
      title: "Чистовая отделка",
      description: "Покраска, обои, напольные покрытия, декор"
    }
  ];

  const advantages = [
    {
      number: "01",
      title: "Бесплатная консультация",
      description: "ИИ-помощник поможет определить объем работ и рассчитает предварительную смету"
    },
    {
      number: "02", 
      title: "Проверенные специалисты",
      description: "Работаем только с опытными мастерами с подтвержденной квалификацией"
    },
    {
      number: "03",
      title: "Гарантия качества",
      description: "Официальный договор и гарантия на все виды работ до 3 лет"
    },
    {
      number: "04",
      title: "Точные сроки",
      description: "Соблюдение графика работ по дням с компенсацией за задержки"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Home" className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Ремонт без дизайнера</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="#services" className="hover:text-primary transition-colors">Услуги</a>
              <a href="#advantages" className="hover:text-primary transition-colors">Преимущества</a>
              <a href="#contacts" className="hover:text-primary transition-colors">Контакты</a>
              <div className="flex items-center gap-2 text-right">
                <div>
                  <div className="font-bold text-base">+7 (987) 980-77-77</div>
                  <div className="text-xs text-gray-600">Пн-Вс 9:00-21:00</div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <section className="relative bg-gray-50 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/38107182-f308-4140-ba88-e5ae3a2ed4d7.jpg" 
            alt="Ремонт квартир"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-block bg-primary text-black text-sm font-semibold px-4 py-2 rounded-full mb-6">
              ИИ-АГЕНТ ЗАМЕНИТ ДИЗАЙНЕРА
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              СЕРВИС УСЛУГ ОТ СТРОИТЕЛЬСТВА ДО РЕМОНТА ПОД КЛЮЧ
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              ИИ создаст проект, рассчитает смету и подберет исполнителей. 
              Сэкономьте до 150 000 ₽ на услугах специалистов.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
              <Card className="p-6 bg-white shadow-lg">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Icon name="Phone" className="h-5 w-5 text-primary" />
                  Заказать звонок
                </h3>
                {!isSubmitted ? (
                  <form onSubmit={handleCallbackSubmit} className="space-y-3">
                    <Input 
                      placeholder="Ваше имя"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input 
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <Button 
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Отправка..." : "Перезвоните мне"}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Перезвоним в течение 5 минут
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <Icon name="CheckCircle2" className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-600">Заявка принята!</p>
                    <p className="text-sm text-gray-600 mt-1">Скоро вам перезвонят</p>
                  </div>
                )}
              </Card>
              <div className="flex flex-col gap-3">
                <Button 
                  size="lg" 
                  className="h-14 bg-primary hover:bg-primary/90 text-black font-semibold text-base"
                  onClick={() => navigate('/ai-chat')}
                >
                  <Icon name="MessageSquare" className="mr-2 h-5 w-5" />
                  Чат с ИИ-консультантом
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 border-2 text-base"
                  onClick={() => navigate('/designer')}
                >
                  <Icon name="Calculator" className="mr-2 h-5 w-5" />
                  Рассчитать смету
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Наши услуги</h2>
            <p className="text-xl text-gray-600">Полный спектр работ для вашего ремонта</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-xl transition-all hover:-translate-y-1 border-2">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name={service.icon} className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="advantages" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Почему выбирают нас</h2>
            <p className="text-xl text-gray-600">Работаем на результат и репутацию</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {advantages.map((advantage, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="text-6xl font-bold text-primary/20 leading-none">
                  {advantage.number}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">{advantage.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{advantage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary to-yellow-500">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              Готовы начать ремонт мечты?
            </h2>
            <p className="text-xl mb-10 text-black/80">
              Получите бесплатную консультацию ИИ-агента и дизайн-проект за 10 минут
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                variant="secondary"
                className="text-lg h-14 px-8 bg-white hover:bg-gray-100 text-black font-semibold"
                onClick={() => navigate('/ai-chat')}
              >
                <Icon name="Sparkles" className="mr-2 h-5 w-5" />
                Начать консультацию
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="text-lg h-14 px-8 border-2 border-black text-black hover:bg-black hover:text-white font-semibold"
                onClick={() => navigate('/register')}
              >
                <Icon name="UserPlus" className="mr-2 h-5 w-5" />
                Создать аккаунт
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold mb-6">Как мы работаем</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-black rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Консультация</h3>
                    <p className="text-gray-600">ИИ-агент анализирует ваши пожелания и помещение</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-black rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Проект и смета</h3>
                    <p className="text-gray-600">Создаем дизайн-проект и детальную смету работ</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-black rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Подбор исполнителей</h3>
                    <p className="text-gray-600">Находим проверенных специалистов под ваш бюджет</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-black rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Реализация</h3>
                    <p className="text-gray-600">Контролируем качество и сроки выполнения работ</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8 text-center">
              <Icon name="Award" className="h-20 w-20 mx-auto mb-6 text-primary" />
              <h3 className="text-2xl font-bold mb-4">Более 500 проектов</h3>
              <p className="text-gray-600 mb-6">
                Наши клиенты экономят в среднем 30% бюджета благодаря умному планированию
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/projects')}
              >
                Посмотреть портфолио
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer id="contacts" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Home" className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Ремонт без дизайнера</span>
              </div>
              <p className="text-sm text-gray-400">
                Платформа для умного ремонта с ИИ-консультантом
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Услуги</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer" onClick={() => navigate('/ai-chat')}>ИИ-консультант</li>
                <li className="hover:text-white cursor-pointer" onClick={() => navigate('/designer')}>Дизайн-проекты</li>
                <li className="hover:text-white cursor-pointer" onClick={() => navigate('/calculator')}>Калькулятор сметы</li>
                <li className="hover:text-white cursor-pointer" onClick={() => navigate('/catalog')}>Исполнители</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Icon name="Phone" className="h-4 w-4" />
                  +7 (987) 980-77-77
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Mail" className="h-4 w-4" />
                  info@remont.ru
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="MapPin" className="h-4 w-4" />
                  Самара, ул. Ленина 1
                </li>
                <li className="text-xs">Пн-Вс: 9:00-21:00</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">О компании</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">О нас</li>
                <li className="hover:text-white cursor-pointer">Вакансии</li>
                <li className="hover:text-white cursor-pointer">Партнёрам</li>
                <li className="hover:text-white cursor-pointer">Политика конфиденциальности</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2026 Ремонт без дизайнера. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}