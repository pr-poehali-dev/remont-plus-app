import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"client" | "contractor" | "supplier">("client");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const userTypes = [
    {
      value: "client",
      icon: "User",
      title: "Клиент",
      description: "Я хочу сделать ремонт"
    },
    {
      value: "contractor",
      icon: "Hammer",
      title: "Исполнитель",
      description: "Я выполняю ремонтные работы"
    },
    {
      value: "supplier",
      icon: "Package",
      title: "Поставщик",
      description: "Я поставляю материалы"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
            На главную
          </Button>
          <h1 className="text-3xl font-bold mb-2">Регистрация</h1>
          <p className="text-gray-600">Создайте аккаунт и начните работу с платформой</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Выберите тип аккаунта</CardTitle>
            <CardDescription>
              Выберите, как вы будете использовать платформу
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <RadioGroup value={userType} onValueChange={(value) => setUserType(value as typeof userType)}>
                <div className="grid md:grid-cols-3 gap-4">
                  {userTypes.map((type) => (
                    <Label
                      key={type.value}
                      htmlFor={type.value}
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        userType === type.value
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-purple-200"
                      }`}
                    >
                      <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        userType === type.value ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        <Icon name={type.icon} className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold mb-1">{type.title}</div>
                        <div className="text-xs text-gray-600">{type.description}</div>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    placeholder="Иван Иванов"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Минимум 8 символов"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Icon name="UserPlus" className="mr-2 h-5 w-5" />
                Создать аккаунт
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Уже есть аккаунт? </span>
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => navigate('/login')}
              >
                Войти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
