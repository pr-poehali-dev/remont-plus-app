import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { YasenAdminPanel } from '@/components/admin/YasenAdminPanel';
import { AdminStats } from '@/components/admin/AdminStats';

export const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_auth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Простая проверка пароля (в реальном приложении это должно быть через backend)
    const ADMIN_PASSWORD = 'admin2025'; // Временно захардкожено, потом через секреты

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_password', password);
      setIsAuthenticated(true);
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в панель администратора'
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный пароль',
        variant: 'destructive'
      });
    }

    setIsLoading(false);
    setPassword('');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_password');
    setIsAuthenticated(false);
    toast({
      title: 'Выход',
      description: 'Вы вышли из панели администратора'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon name="Shield" size={32} className="text-primary" />
            </div>
            <CardTitle className="text-2xl">Панель администратора</CardTitle>
            <CardDescription>Введите пароль для доступа</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль..."
                  required
                  autoFocus
                  className="h-12"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12" 
                disabled={isLoading || !password}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="Lock" size={20} className="mr-2" />
                    Войти
                  </>
                )}
              </Button>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} className="flex-shrink-0 mt-0.5 text-primary" />
                  <span className="text-muted-foreground">
                    Доступ ограничен. Только для администраторов системы.
                  </span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pb-24">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon name="Shield" size={24} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Панель администратора</CardTitle>
                  <CardDescription>Управление системой ПРОЕКТ ПРО</CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <Icon name="LogOut" size={18} className="mr-2" />
                Выйти
              </Button>
            </div>
          </CardHeader>
        </Card>

        <AdminStats />

        <Card className="shadow-lg border-0 mt-6">
          <CardHeader>
            <CardTitle>Панель ЯСЕН</CardTitle>
            <CardDescription>Управление голосовым помощником</CardDescription>
          </CardHeader>
        </Card>
        <YasenAdminPanel />
      </div>
    </div>
  );
};

export default AdminPanel;