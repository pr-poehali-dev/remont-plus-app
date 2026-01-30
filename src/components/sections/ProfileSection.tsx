import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

export const ProfileSection = () => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isIdentified, setIsIdentified] = useState(false);
  const { toast } = useToast();

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    if (numbers.length <= 1) return `+${numbers}`;
    if (numbers.length <= 4) return `+7 ${numbers.slice(1)}`;
    if (numbers.length <= 7) return `+7 ${numbers.slice(1, 4)} ${numbers.slice(4)}`;
    if (numbers.length <= 9) return `+7 ${numbers.slice(1, 4)} ${numbers.slice(4, 7)}-${numbers.slice(7)}`;
    return `+7 ${numbers.slice(1, 4)} ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleIdentify = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone) {
      setIsIdentified(true);
      localStorage.setItem('profile_identified', 'true');
      localStorage.setItem('profile_name', name);
      localStorage.setItem('profile_phone', phone);
      toast({
        title: 'Идентификация пройдена!',
        description: 'Ваш профиль успешно сохранён'
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {!isIdentified ? (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name="User" size={24} className="text-primary" />
              </div>
              <div>
                <CardTitle>Идентификация пользователя</CardTitle>
                <CardDescription>Заполните данные для доступа к кабинету</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIdentify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя и фамилия</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="+7 999 123-45-67"
                  required
                  className="h-12"
                />
              </div>

              <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="CheckCircle2" size={16} className="text-green-500" />
                  <span>Данные сохраняются локально</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Shield" size={16} className="text-blue-500" />
                  <span>Безопасное хранение информации</span>
                </div>
              </div>

              <Button type="submit" className="w-full h-12">
                <Icon name="CheckCircle2" size={20} className="mr-2" />
                Подтвердить данные
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="gradient-purple-pink p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl font-bold">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{name}</h2>
                <p className="text-white/90 text-sm">{phone}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Wallet" size={24} className="text-primary" />
            Баланс и подписки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <div>
              <p className="text-sm text-muted-foreground">Баланс счёта</p>
              <p className="text-2xl font-bold text-green-600">0 ₽</p>
            </div>
            <Button size="sm" className="gradient-purple-pink text-white border-0">
              Пополнить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Платные функции</CardTitle>
          <CardDescription>Оплачивайте только нужные услуги</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border-2 rounded-xl hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Внесение данных</h4>
                  <p className="text-xs text-muted-foreground">Сохранение информации об объекте</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">500 ₽</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-2 rounded-xl hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Icon name="Palette" size={20} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">ИИ-Дизайнер</h4>
                  <p className="text-xs text-muted-foreground">Визуализация интерьера с ИИ</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">от 500 ₽</p>
                <p className="text-xs text-muted-foreground">за м²</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-2 rounded-xl hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Icon name="FileCheck" size={20} className="text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Техническое задание</h4>
                  <p className="text-xs text-muted-foreground">Формирование ТЗ для исполнителей</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">100 ₽</p>
                <p className="text-xs text-muted-foreground">за м²</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-2 border-green-200 bg-green-50 rounded-xl">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                  <Icon name="Send" size={20} className="text-green-700" />
                </div>
                <div>
                  <h4 className="font-semibold">Оформление заявки</h4>
                  <p className="text-xs text-muted-foreground">Подача заявки на ремонт</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">Бесплатно</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-2 rounded-xl hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                  <Icon name="ClipboardCheck" size={20} className="text-pink-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Чек-лист контроля</h4>
                  <p className="text-xs text-muted-foreground">Контроль выполнения работ</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">1 000 ₽</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-2 rounded-xl hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Icon name="UserCog" size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Услуги прораба</h4>
                  <p className="text-xs text-muted-foreground">Профессиональное управление проектом</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">10%</p>
                <p className="text-xs text-muted-foreground">от сметы</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 gradient-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Icon name="CreditCard" size={24} className="text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Оплата через приложение</h3>
              <p className="text-sm text-muted-foreground">
                Безопасные платежи картой, СБП или электронными кошельками
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Bot" size={24} className="text-primary" />
            Голосовой помощник ЯСЕН
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Общайтесь с ИИ-агентом голосом для создания нарядов-заказов
          </p>
          <Button 
            className="w-full gradient-purple-pink text-white border-0 h-14"
            onClick={() => window.location.href = '/yasen'}
          >
            <Icon name="Mic" size={20} className="mr-2" />
            Начать разговор с ЯСЕН
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full h-12 justify-start gap-3"
          onClick={() => window.location.href = '/admin-panel'}
        >
          <Icon name="Shield" size={20} />
          Панель администратора
        </Button>
        <Button variant="outline" className="w-full h-12 justify-start gap-3">
          <Icon name="History" size={20} />
          История операций
        </Button>
        <Button variant="outline" className="w-full h-12 justify-start gap-3 text-red-600 hover:text-red-700">
          <Icon name="LogOut" size={20} />
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
};