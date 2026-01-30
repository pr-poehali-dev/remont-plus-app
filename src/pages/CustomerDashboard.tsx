import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  user_type: string;
}

interface CustomerDashboardProps {
  user: User;
  onLogout: () => void;
}

export const CustomerDashboard = ({ user, onLogout }: CustomerDashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pb-24">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="User" size={24} className="text-primary" />
                </div>
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>{user.phone}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <Icon name="LogOut" size={20} />
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="gradient-purple-pink rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Home" size={32} />
            <h2 className="text-2xl font-bold">Личный кабинет заказчика</h2>
          </div>
          <p className="text-white/90">Управляйте проектами и отслеживайте прогресс</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Briefcase" size={24} className="text-primary" />
              Мои проекты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="FolderOpen" size={48} className="mx-auto mb-3 opacity-50" />
              <p>У вас пока нет проектов</p>
              <Button className="mt-4">
                <Icon name="Plus" size={18} className="mr-2" />
                Создать первый проект
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 gradient-card">
          <CardHeader>
            <CardTitle>Доступные услуги</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-start gap-3 text-left">
                <Icon name="MapPin" size={24} className="text-orange-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Внесение данных объекта</div>
                  <div className="text-sm text-muted-foreground">Адрес, размеры, лазерная рулетка</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-start gap-3 text-left">
                <Icon name="Palette" size={24} className="text-purple-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Консультации по дизайну</div>
                  <div className="text-sm text-muted-foreground">Подбор стиля интерьера</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-start gap-3 text-left">
                <Icon name="Pen" size={24} className="text-blue-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Разработка дизайн-проекта</div>
                  <div className="text-sm text-muted-foreground">Полный проект с визуализацией</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-start gap-3 text-left">
                <Icon name="Calculator" size={24} className="text-green-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Формирование сметы</div>
                  <div className="text-sm text-muted-foreground">Точный расчёт стоимости работ</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="User" size={24} className="text-primary" />
              Профиль
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Имя</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Телефон</span>
              <span className="font-medium">{user.phone}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Статус</span>
              <Badge className="bg-green-500">
                <Icon name="CheckCircle2" size={14} className="mr-1" />
                Подтверждён
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;
