import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

export const HomeSection = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="gradient-purple-pink rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">ЯСЕН</h1>
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
};
