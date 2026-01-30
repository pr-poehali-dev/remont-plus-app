import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface AuthProps {
  onLogin: (phone: string) => void;
}

const Auth = ({ onLogin }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');

  const handleSendCode = () => {
    if (phone.length >= 10) {
      setStep('code');
    }
  };

  const handleVerifyCode = () => {
    if (code.length === 4) {
      onLogin(phone);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 1) return numbers;
    if (numbers.length <= 4) return `+7 (${numbers.slice(1)}`;
    if (numbers.length <= 7) return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4)}`;
    if (numbers.length <= 9) return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7)}`;
    return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="gradient-purple-pink w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Icon name="Sparkles" size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">ЯСЕН</h1>
          <p className="text-muted-foreground">Ваш умный помощник в ремонте</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isLogin ? 'Вход в приложение' : 'Регистрация'}
            </CardTitle>
            <CardDescription>
              {step === 'phone' 
                ? 'Введите номер телефона для идентификации' 
                : 'Введите код из SMS'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 'phone' ? (
              <>
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Ваше имя</Label>
                    <Input
                      id="name"
                      placeholder="Иван Иванов"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="phone">Номер телефона</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="h-12 text-lg"
                  />
                </div>
                <Button
                  onClick={handleSendCode}
                  disabled={phone.length < 10}
                  className="w-full h-12 gradient-purple-pink text-white border-0 text-lg font-semibold shadow-lg"
                >
                  Получить код
                  <Icon name="ArrowRight" size={20} className="ml-2" />
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="code">Код из SMS</Label>
                  <div className="text-sm text-muted-foreground mb-2">
                    Отправлен на номер {phone}
                  </div>
                  <Input
                    id="code"
                    type="text"
                    placeholder="____"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="h-12 text-center text-2xl tracking-widest"
                  />
                </div>
                <Button
                  onClick={handleVerifyCode}
                  disabled={code.length !== 4}
                  className="w-full h-12 gradient-purple-pink text-white border-0 text-lg font-semibold shadow-lg"
                >
                  Войти
                  <Icon name="Check" size={20} className="ml-2" />
                </Button>
                <Button
                  onClick={() => setStep('phone')}
                  variant="ghost"
                  className="w-full"
                >
                  Изменить номер
                </Button>
              </>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setIsLogin(!isLogin)}
              variant="outline"
              className="w-full h-12"
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 gradient-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Icon name="Shield" size={24} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Регистрация бесплатная</h3>
                <p className="text-sm text-muted-foreground">
                  Создайте аккаунт и получите доступ к базовым функциям приложения
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
