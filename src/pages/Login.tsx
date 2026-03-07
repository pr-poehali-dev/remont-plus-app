import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { YandexLoginButton } from "@/components/extensions/yandex-auth/YandexLoginButton";
import { useYandexAuth } from "@/components/extensions/yandex-auth/useYandexAuth";

const AUTH_URL = "https://functions.poehali.dev/2642096f-c763-42ef-8dc1-67e3acce37b3";
const YANDEX_AUTH_URL = "https://functions.poehali.dev/e79ea16f-9897-425c-8f3a-6944097e6748";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const yandexAuth = useYandexAuth({
    apiUrls: {
      authUrl: `${YANDEX_AUTH_URL}?action=auth-url`,
      callback: `${YANDEX_AUTH_URL}?action=callback`,
      refresh: `${YANDEX_AUTH_URL}?action=refresh`,
      logout: `${YANDEX_AUTH_URL}?action=logout`,
    },
    onAuthChange: (user) => {
      if (user) {
        localStorage.setItem("avangard_user", JSON.stringify(user));
        navigate(redirectTo || "/");
      }
    },
  });

  const handleYandexLogin = () => {
    if (redirectTo) sessionStorage.setItem("yandex_auth_redirect", redirectTo);
    yandexAuth.login();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        return;
      }

      localStorage.setItem("avangard_user", JSON.stringify(data.user));
      localStorage.setItem("avangard_token", data.token);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "yukassa_staff") {
        navigate("/yukassa");
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
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
            На главную
          </Button>
          <h1 className="text-3xl font-bold mb-2">Вход</h1>
          <p className="text-gray-600">Войдите в свой аккаунт</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Авторизация</CardTitle>
            <CardDescription>Введите email и пароль</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                  <Icon name="AlertCircle" className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />Вход...</>
                ) : (
                  <><Icon name="LogIn" className="mr-2 h-4 w-4" />Войти</>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">или</span>
              </div>
            </div>

            <YandexLoginButton
              onClick={handleYandexLogin}
              isLoading={yandexAuth.isLoading}
              className="w-full"
            />

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Нет аккаунта? </span>
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate(redirectTo ? `/register?redirect=${redirectTo}` : "/register")}>
                Зарегистрироваться
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}