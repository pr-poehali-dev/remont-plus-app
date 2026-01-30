import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');

  const navigationItems = [
    { id: 'home', icon: 'Home', label: 'Главная' },
    { id: 'projects', icon: 'Briefcase', label: 'Проекты' },
    { id: 'designer', icon: 'Palette', label: 'Дизайнер' },
    { id: 'materials', icon: 'Package', label: 'Материалы' },
    { id: 'workers', icon: 'Users', label: 'Исполнители' },
    { id: 'foreman', icon: 'UserCog', label: 'Прораб' },
    { id: 'control', icon: 'ClipboardCheck', label: 'Контроль' },
    { id: 'profile', icon: 'User', label: 'Кабинет' },
  ];

  const projectStages = [
    { name: 'Демонтаж', progress: 100, status: 'completed' },
    { name: 'Электрика', progress: 75, status: 'in-progress' },
    { name: 'Сантехника', progress: 30, status: 'in-progress' },
    { name: 'Отделка стен', progress: 0, status: 'pending' },
    { name: 'Напольное покрытие', progress: 0, status: 'pending' },
  ];

  const contractors = [
    {
      name: 'Алексей Иванов',
      specialty: 'Электрик',
      rating: 9.8,
      reviews: 127,
      avatar: 'AI',
      price: '2500 ₽/день',
      experience: '12 лет',
    },
    {
      name: 'Мария Петрова',
      specialty: 'Дизайнер интерьеров',
      rating: 9.5,
      reviews: 89,
      avatar: 'МП',
      price: '5000 ₽/проект',
      experience: '8 лет',
    },
    {
      name: 'Дмитрий Сидоров',
      specialty: 'Прораб',
      rating: 9.7,
      reviews: 156,
      avatar: 'ДС',
      price: '10% от сметы',
      experience: '15 лет',
    },
  ];

  const interiorStyles = [
    { name: 'Скандинавский', emoji: '🌿', description: 'Минимализм и уют' },
    { name: 'Лофт', emoji: '🏭', description: 'Индустриальный стиль' },
    { name: 'Современный', emoji: '✨', description: 'Актуальные тренды' },
    { name: 'Классика', emoji: '🏛️', description: 'Вечная элегантность' },
  ];

  const renderHome = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="gradient-purple-pink rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ремонт+</h1>
            <p className="text-white/90 text-sm">Ваш умный помощник в ремонте</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <Icon name="Sparkles" size={32} className="text-white" />
          </div>
        </div>
        <Button className="bg-white text-primary hover:bg-white/90 font-semibold mt-4">
          Начать новый проект
          <Icon name="ArrowRight" size={18} className="ml-2" />
        </Button>
      </div>

      <Card className="shadow-lg border-0 gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" size={24} className="text-primary" />
            Быстрый старт
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-24 flex-col gap-2 hover:scale-105 transition-transform">
            <Icon name="Camera" size={28} className="text-orange-500" />
            <span className="text-xs">Сфотографировать объект</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 hover:scale-105 transition-transform">
            <Icon name="Palette" size={28} className="text-purple-500" />
            <span className="text-xs">Подобрать дизайн</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 hover:scale-105 transition-transform">
            <Icon name="Users" size={28} className="text-blue-500" />
            <span className="text-xs">Найти специалиста</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 hover:scale-105 transition-transform">
            <Icon name="Calculator" size={28} className="text-green-500" />
            <span className="text-xs">Рассчитать смету</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg">Текущий проект</CardTitle>
          <CardDescription>Квартира на ул. Ленина, 45</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Общий прогресс</span>
              <span className="text-primary font-semibold">41%</span>
            </div>
            <Progress value={41} className="h-3" />
            <div className="flex gap-2 mt-4">
              <Badge variant="secondary" className="gradient-orange-blue text-white border-0">
                <Icon name="Clock" size={14} className="mr-1" />
                15 дней
              </Badge>
              <Badge variant="outline">Бюджет: 850 000 ₽</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDesigner = () => (
    <div className="space-y-6 animate-slide-up">
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="gradient-orange-blue p-6 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Icon name="Wand2" size={28} />
            ИИ-Дизайнер интерьеров
          </h2>
          <p className="text-white/90 text-sm">Создайте визуализацию вашей мечты за минуты</p>
        </div>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Загрузите фото помещения</CardTitle>
          <CardDescription>ИИ проанализирует и предложит дизайн-решения</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center hover:border-primary/60 transition-colors cursor-pointer">
            <Icon name="Upload" size={48} className="mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground mb-2">Нажмите или перетащите фото</p>
            <p className="text-xs text-muted-foreground">PNG, JPG до 10MB</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Выберите стиль</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {interiorStyles.map((style) => (
              <Card key={style.name} className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{style.emoji}</div>
                  <h3 className="font-semibold mb-1">{style.name}</h3>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full gradient-purple-pink text-white border-0 h-14 text-lg font-semibold shadow-lg">
        <Icon name="Sparkles" size={20} className="mr-2" />
        Сгенерировать дизайн
      </Button>
    </div>
  );

  const renderWorkers = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="gradient-purple-pink p-6 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Icon name="Users" size={28} />
            Исполнители
          </h2>
          <p className="text-white/90 text-sm">Проверенные специалисты с высоким рейтингом</p>
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant="default" size="sm" className="whitespace-nowrap">Все</Button>
        <Button variant="outline" size="sm" className="whitespace-nowrap">Электрики</Button>
        <Button variant="outline" size="sm" className="whitespace-nowrap">Сантехники</Button>
        <Button variant="outline" size="sm" className="whitespace-nowrap">Отделочники</Button>
        <Button variant="outline" size="sm" className="whitespace-nowrap">Дизайнеры</Button>
      </div>

      <div className="space-y-4">
        {contractors.map((contractor) => (
          <Card key={contractor.name} className="shadow-lg border-0 hover:shadow-2xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                    {contractor.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{contractor.name}</h3>
                      <p className="text-sm text-muted-foreground">{contractor.specialty}</p>
                    </div>
                    <Badge className="gradient-orange-blue text-white border-0">
                      <Icon name="Star" size={14} className="mr-1 fill-white" />
                      {contractor.rating}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm mb-3">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Icon name="MessageCircle" size={14} />
                      {contractor.reviews} отзывов
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Icon name="Award" size={14} />
                      {contractor.experience}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{contractor.price}</span>
                    <Button size="sm" className="gradient-purple-pink text-white border-0">
                      Написать
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderControl = () => (
    <div className="space-y-6 animate-slide-up">
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="gradient-orange-blue p-6 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Icon name="ClipboardCheck" size={28} />
            Контроль работ
          </h2>
          <p className="text-white/90 text-sm">Отслеживайте прогресс в режиме реального времени</p>
        </div>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Этапы ремонта</CardTitle>
          <CardDescription>Квартира на ул. Ленина, 45 • 2-комнатная</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {projectStages.map((stage, index) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      stage.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : stage.status === 'in-progress'
                        ? 'gradient-purple-pink text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {stage.status === 'completed' ? (
                      <Icon name="Check" size={20} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{stage.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {stage.status === 'completed'
                        ? 'Завершено'
                        : stage.status === 'in-progress'
                        ? 'В работе'
                        : 'Ожидает'}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-primary">{stage.progress}%</span>
              </div>
              <Progress value={stage.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 gradient-card">
        <CardHeader>
          <CardTitle className="text-lg">Инструменты контроля</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Icon name="Ruler" size={24} className="text-primary" />
            <span className="text-xs">Рулетка</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Icon name="Move" size={24} className="text-secondary" />
            <span className="text-xs">Уровень</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Icon name="Calculator" size={24} className="text-accent" />
            <span className="text-xs">Калькулятор</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return renderHome();
      case 'designer':
        return renderDesigner();
      case 'workers':
        return renderWorkers();
      case 'control':
        return renderControl();
      default:
        return (
          <Card className="shadow-lg border-0 animate-fade-in">
            <CardContent className="p-12 text-center">
              <Icon name="Construction" size={64} className="mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Раздел в разработке</h3>
              <p className="text-muted-foreground">Этот функционал скоро появится!</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pb-24">
      <div className="max-w-2xl mx-auto p-6">
        {renderContent()}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50">
        <div className="max-w-2xl mx-auto px-2 py-2">
          <div className="grid grid-cols-4 gap-1">
            {navigationItems.slice(0, 4).map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setActiveSection(item.id)}
                className={`flex-col gap-1 h-auto py-2 px-2 transition-all ${
                  activeSection === item.id
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Icon name={item.icon as any} size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </nav>

      <Button
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full gradient-purple-pink text-white shadow-2xl border-0 hover:scale-110 transition-transform z-40"
        onClick={() => setActiveSection('designer')}
      >
        <Icon name="Plus" size={28} />
      </Button>
    </div>
  );
};

export default Index;
