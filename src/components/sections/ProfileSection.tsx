import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export const ProfileSection = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="gradient-purple-pink p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl font-bold">
              ИИ
            </div>
            <div>
              <h2 className="text-2xl font-bold">Иван Иванов</h2>
              <p className="text-white/90 text-sm">+7 (999) 123-45-67</p>
            </div>
          </div>
        </div>
      </Card>

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

      <div className="space-y-2">
        <Button variant="outline" className="w-full h-12 justify-start gap-3">
          <Icon name="History" size={20} />
          История операций
        </Button>
        <Button variant="outline" className="w-full h-12 justify-start gap-3">
          <Icon name="Settings" size={20} />
          Настройки профиля
        </Button>
        <Button variant="outline" className="w-full h-12 justify-start gap-3 text-red-600 hover:text-red-700">
          <Icon name="LogOut" size={20} />
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
};
