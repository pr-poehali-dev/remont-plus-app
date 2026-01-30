import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const AUTH_API_URL = 'https://functions.poehali.dev/2642096f-c763-42ef-8dc1-67e3acce37b3';

interface RegistrationFormProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const RegistrationForm = ({ onClose, onSuccess }: RegistrationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [userType, setUserType] = useState<'customer' | 'contractor'>('customer');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: '',
    experience: ''
  });
  const [smsCode, setSmsCode] = useState('');
  const [devCode, setDevCode] = useState('');
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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_code',
          phone: formData.phone.replace(/\D/g, ''),
          user_type: userType
        })
      });

      const data = await response.json();

      if (data.success) {
        setDevCode(data.dev_code || '');
        setStep('code');
        toast({
          title: 'Код отправлен!',
          description: `SMS с кодом отправлен на ${formData.phone}${data.dev_code ? ` (DEV: ${data.dev_code})` : ''}`
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить код',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить код',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          phone: formData.phone.replace(/\D/g, ''),
          code: smsCode,
          name: formData.name,
          email: formData.email,
          user_type: userType,
          specialization: formData.specialization || null,
          experience: formData.experience ? parseInt(formData.experience) : null
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Добро пожаловать!',
          description: `${userType === 'customer' ? 'Регистрация' : 'Заявка'} успешно завершена`
        });
        onSuccess(data.user);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Неверный код',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подтвердить код',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {step === 'form' ? 'Регистрация' : 'Подтверждение телефона'}
              </CardTitle>
              <CardDescription>
                {step === 'form' 
                  ? 'ПРОЕКТ ПРО - профессиональное проектирование'
                  : `Введите код из SMS на номер ${formData.phone}`}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'form' ? (
            <Tabs value={userType} onValueChange={(v) => setUserType(v as 'customer' | 'contractor')} className="w-full">
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
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Имя и фамилия</Label>
                    <Input
                      id="customer-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Иван Петров"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Телефон</Label>
                    <Input
                      id="customer-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})}
                      placeholder="+7 999 123-45-67"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                        Отправка...
                      </>
                    ) : (
                      <>
                        Получить код
                        <Icon name="ArrowRight" size={20} className="ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="contractor">
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractor-name">Имя и фамилия</Label>
                    <Input
                      id="contractor-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Сергей Иванов"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractor-phone">Телефон</Label>
                    <Input
                      id="contractor-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})}
                      placeholder="+7 999 123-45-67"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractor-email">Email</Label>
                    <Input
                      id="contractor-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="sergey@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Специализация</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      placeholder="Дизайнер интерьера, архитектор..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Опыт работы (лет)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
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
                        Получить код
                        <Icon name="Send" size={20} className="ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sms-code">Код из SMS</Label>
                <Input
                  id="sms-code"
                  type="text"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="____"
                  maxLength={4}
                  className="h-16 text-center text-3xl tracking-widest font-bold"
                  required
                  autoFocus
                />
                {devCode && (
                  <p className="text-xs text-muted-foreground text-center">
                    DEV режим: {devCode}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading || smsCode.length !== 4}>
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    Подтвердить
                    <Icon name="Check" size={20} className="ml-2" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('form');
                  setSmsCode('');
                }}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Изменить данные
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
