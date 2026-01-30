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
  specialization?: string;
  experience?: number;
}

interface ContractorDashboardProps {
  user: User;
  onLogout: () => void;
}

export const ContractorDashboard = ({ user, onLogout }: ContractorDashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pb-24">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Briefcase" size={24} className="text-primary" />
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

        <div className="gradient-orange-blue rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Briefcase" size={32} />
            <h2 className="text-2xl font-bold">Личный кабинет исполнителя</h2>
          </div>
          <p className="text-white/90">Просматривайте заказы и управляйте проектами</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ClipboardList" size={24} className="text-primary" />
              Доступные заказы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-50" />
              <p>Новых заказов пока нет</p>
              <Button className="mt-4" variant="outline">
                <Icon name="Search" size={18} className="mr-2" />
                Найти заказы
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 mx-auto mb-3 flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-blue-500" />
              </div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Активных</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 mx-auto mb-3 flex items-center justify-center">
                <Icon name="CheckCircle2" size={24} className="text-green-500" />
              </div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Завершённых</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 mx-auto mb-3 flex items-center justify-center">
                <Icon name="Star" size={24} className="text-orange-500" />
              </div>
              <div className="text-2xl font-bold">5.0</div>
              <div className="text-sm text-muted-foreground">Рейтинг</div>
            </CardContent>
          </Card>
        </div>

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
            {user.specialization && (
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Специализация</span>
                <span className="font-medium">{user.specialization}</span>
              </div>
            )}
            {user.experience && (
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Опыт работы</span>
                <span className="font-medium">{user.experience} лет</span>
              </div>
            )}
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Статус</span>
              <Badge className="bg-green-500">
                <Icon name="CheckCircle2" size={14} className="mr-1" />
                Подтверждён
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 gradient-card">
          <CardHeader>
            <CardTitle>Преимущества работы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractorDashboard;
