import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Icon from "@/components/ui/icon";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useState } from "react";

const AUTH_URL = "https://functions.poehali.dev/2642096f-c763-42ef-8dc1-67e3acce37b3";

const userTypes = [
  { value: "customer", icon: "Home", title: "Заказчик", description: "Хочу сделать ремонт" },
  { value: "contractor", icon: "Hammer", title: "Мастер", description: "Выполняю ремонтные работы" },
  { value: "supplier", icon: "Store", title: "Поставщик", description: "Поставляю материалы" },
];

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [userType, setUserType] = useState("customer");
  const [formData, setFormData] = useState({ email: "", password: "", name: "", phone: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          user_type: userType,
          email_consent: emailConsent,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка регистрации");
        return;
      }

      localStorage.setItem("avangard_user", JSON.stringify(data.user));
      localStorage.setItem("avangard_token", data.token);

      if (userType === "contractor") {
        navigate("/master-profile");
      } else {
        navigate(redirectTo || "/");
      }
    } catch {
      setError("Сервер недоступен. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
            На главную
          </Button>
          <h1 className="text-3xl font-bold mb-2">Регистрация</h1>
          <p className="text-gray-600">Создайте аккаунт и начните работу</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Выберите тип аккаунта</CardTitle>
            <CardDescription>Как вы будете использовать платформу</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                  <Icon name="AlertCircle" className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <RadioGroup value={userType} onValueChange={setUserType}>
                <div className="grid md:grid-cols-3 gap-4">
                  {userTypes.map((type) => (
                    <Label
                      key={type.value}
                      htmlFor={type.value}
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        userType === type.value ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/30"
                      }`}
                    >
                      <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        userType === type.value ? "bg-primary text-primary-foreground" : "bg-gray-100 text-gray-600"
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
                  <Label htmlFor="name">Имя *</Label>
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
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
                <Label htmlFor="password">Пароль * <span className="text-xs text-gray-400">(минимум 6 символов)</span></Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Придумайте пароль"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 accent-orange-500"
                    required
                  />
                  <span className="text-sm text-gray-600">
                    Я принимаю{" "}
                    <Link to="/terms" className="text-orange-500 hover:underline" target="_blank">
                      Пользовательское соглашение
                    </Link>{" "}
                    и{" "}
                    <Link to="/privacy" className="text-orange-500 hover:underline" target="_blank">
                      Политику конфиденциальности
                    </Link>
                    , даю согласие на обработку персональных данных в соответствии с ФЗ-152
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailConsent}
                    onChange={(e) => setEmailConsent(e.target.checked)}
                    className="mt-0.5 accent-orange-500"
                  />
                  <span className="text-sm text-gray-600">
                    Согласен(а) получать полезные материалы, акции и новости сервиса на указанный email
                  </span>
                </label>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || !agreed}>
                {isLoading ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />Регистрация...</>
                ) : (
                  <><Icon name="UserPlus" className="mr-2 h-5 w-5" />Создать аккаунт</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Уже есть аккаунт? </span>
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate(redirectTo ? `/login?redirect=${redirectTo}` : "/login")}>
                Войти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}