import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export const HomeSection = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="gradient-purple-pink rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">ПРОЕКТ ПРО</h1>
            <p className="text-white/90 text-sm">Профессиональное проектирование интерьеров</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <Icon name="Home" size={32} className="text-white" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button className="bg-white text-primary hover:bg-white/90 font-semibold h-14 text-base">
            <Icon name="User" size={20} className="mr-2" />
            ЗАКАЗЧИК
          </Button>
          <Button className="bg-white/20 backdrop-blur text-white hover:bg-white/30 font-semibold h-14 text-base border-2 border-white/40">
            <Icon name="Briefcase" size={20} className="mr-2" />
            ИСПОЛНИТЕЛЬ
          </Button>
        </div>
      </div>

      <Card className="shadow-lg border-0 gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="User" size={24} className="text-primary" />
            Для заказчика
          </CardTitle>
          <CardDescription>Регистрация бесплатная</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="MapPin" size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Внесение данных объекта</h4>
                <p className="text-xs text-muted-foreground">Адрес, размеры помещений, использование лазерной рулетки</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/5 to-transparent hover:from-purple-500/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Palette" size={20} className="text-purple-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Консультации по стилю и дизайну</h4>
                <p className="text-xs text-muted-foreground">Подбор стиля интерьера под ваши предпочтения</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-500/5 to-transparent hover:from-blue-500/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Pen" size={20} className="text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Разработка дизайн-проекта</h4>
                <p className="text-xs text-muted-foreground">Полный проект помещения с визуализацией</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-500/5 to-transparent hover:from-green-500/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Eye" size={20} className="text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Создание визуализаций интерьеров</h4>
                <p className="text-xs text-muted-foreground">Реалистичные 3D-изображения вашего будущего интерьера</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-500/5 to-transparent hover:from-orange-500/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Zap" size={20} className="text-orange-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">План электрики, сантехники и освещения</h4>
                <p className="text-xs text-muted-foreground">Детальные схемы инженерных коммуникаций</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-pink-500/5 to-transparent hover:from-pink-500/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name="ShoppingBag" size={20} className="text-pink-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Выбор материалов и мебели</h4>
                <p className="text-xs text-muted-foreground">Подбор отделочных материалов и предметов интерьера</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-cyan-500/5 to-transparent hover:from-cyan-500/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Calculator" size={20} className="text-cyan-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Формирование подробной сметы</h4>
                <p className="text-xs text-muted-foreground">Точный расчёт стоимости ремонтных работ</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-500/5 to-transparent hover:from-indigo-500/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Eye" size={20} className="text-indigo-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Авторский надзор за ремонтом</h4>
                <p className="text-xs text-muted-foreground">Контроль качества выполнения работ</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-500/5 to-transparent hover:from-amber-500/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Truck" size={20} className="text-amber-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Покупка и доставка</h4>
                <p className="text-xs text-muted-foreground">Стройматериалы и предметы интерьера</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-rose-500/5 to-transparent hover:from-rose-500/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Sparkles" size={20} className="text-rose-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Декорирование и финальная отделка</h4>
                <p className="text-xs text-muted-foreground">Завершающие штрихи для идеального интерьера</p>
              </div>
            </div>
          </div>

          <Button className="w-full mt-6 h-12 text-base font-semibold">
            Начать работу
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Briefcase" size={24} className="text-primary" />
            Для исполнителя
          </CardTitle>
          <CardDescription>Получайте заказы от проверенных клиентов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
              <Badge className="gradient-purple-pink text-white border-0">
                <Icon name="Star" size={14} className="mr-1" />
                PRO
              </Badge>
              <span className="text-sm font-medium">Доступ к базе заказов</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
              <Badge className="gradient-orange-blue text-white border-0">
                <Icon name="ShieldCheck" size={14} className="mr-1" />
                Гарантия
              </Badge>
              <span className="text-sm font-medium">Безопасные сделки</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
              <Badge className="bg-green-500 text-white border-0">
                <Icon name="TrendingUp" size={14} className="mr-1" />
                Рост
              </Badge>
              <span className="text-sm font-medium">Увеличение дохода</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-6 h-12 text-base font-semibold border-2">
            Зарегистрироваться как исполнитель
            <Icon name="UserPlus" size={20} className="ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
