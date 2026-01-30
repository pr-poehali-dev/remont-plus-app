import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

export const RegistrationForm = ({ onClose }: { onClose: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: 'customer',
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
    };

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Регистрация успешна!',
        description: 'Добро пожаловать в ПРОЕКТ ПРО',
      });
      onClose();
    }, 1500);
  };

  const handleContractorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: 'contractor',
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      specialization: formData.get('specialization'),
      experience: formData.get('experience'),
    };

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Заявка отправлена!',
        description: 'Мы свяжемся с вами в течение 24 часов',
      });
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Регистрация</CardTitle>
              <CardDescription>ПРОЕКТ ПРО - профессиональное проектирование</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <Icon name="User" size={16} />
                Заказчик
              </TabsTrigger>
              <TabsTrigger value="contractor" className="flex items-center gap-2">
                <Icon name="Briefcase" size={16} />
                Исполнитель
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer">
              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Имя и фамилия</Label>
                  <Input
                    id="customer-name"
                    name="name"
                    placeholder="Иван Петров"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-phone">Телефон</Label>
                  <Input
                    id="customer-phone"
                    name="phone"
                    type="tel"
                    placeholder="+7 999 123-45-67"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    name="email"
                    type="email"
                    placeholder="ivan@example.com"
                    required
                  />
                </div>

                <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="CheckCircle2" size={16} className="text-green-500" />
                    <span>Регистрация бесплатная</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="CheckCircle2" size={16} className="text-green-500" />
                    <span>Доступ ко всем услугам</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="CheckCircle2" size={16} className="text-green-500" />
                    <span>Персональный менеджер</span>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Регистрация...
                    </>
                  ) : (
                    <>
                      Зарегистрироваться
                      <Icon name="ArrowRight" size={20} className="ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="contractor">
              <form onSubmit={handleContractorSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contractor-name">Имя и фамилия</Label>
                  <Input
                    id="contractor-name"
                    name="name"
                    placeholder="Сергей Иванов"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractor-phone">Телефон</Label>
                  <Input
                    id="contractor-phone"
                    name="phone"
                    type="tel"
                    placeholder="+7 999 123-45-67"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractor-email">Email</Label>
                  <Input
                    id="contractor-email"
                    name="email"
                    type="email"
                    placeholder="sergey@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Специализация</Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    placeholder="Дизайнер интерьера, архитектор..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Опыт работы (лет)</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    placeholder="5"
                    min="0"
                    required
                  />
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Star" size={16} className="text-orange-500" />
                    <span>Доступ к базе заказов</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="ShieldCheck" size={16} className="text-blue-500" />
                    <span>Безопасные сделки</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="TrendingUp" size={16} className="text-green-500" />
                    <span>Увеличение дохода</span>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      Отправить заявку
                      <Icon name="Send" size={20} className="ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
