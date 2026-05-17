import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import SEOMeta from "@/components/SEOMeta";

const AUTH_URL = "https://functions.poehali.dev/2642096f-c763-42ef-8dc1-67e3acce37b3";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;

    setLoading(true);
    try {
      await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "forgot_password",
          email: email.trim(),
        }),
      });
      // Всегда показываем успех — не раскрываем, существует ли email
      setSent(true);
    } catch {
      setError("Сервер недоступен. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <SEOMeta
        title="Восстановление пароля"
        description="Сбросьте пароль и восстановите доступ к личному кабинету."
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Button variant="ghost" onClick={() => navigate("/login")} className="mb-4">
            <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
            К входу
          </Button>
          <h1 className="text-3xl font-bold mb-2">Восстановление пароля</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Укажите email — пришлём ссылку для сброса
          </p>
        </div>

        <Card>
          {sent ? (
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
                <Icon name="Mail" className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Письмо отправлено</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Если email <b>{email}</b> зарегистрирован, на него придёт ссылка для сброса пароля. Проверьте папку «Спам».
              </p>
              <Link to="/login">
                <Button className="w-full">Вернуться ко входу</Button>
              </Link>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Сброс пароля</CardTitle>
                <CardDescription>Введите email, использованный при регистрации</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
                      <Icon name="AlertCircle" className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" className="mr-2 h-4 w-4" />
                        Отправить ссылку
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Вспомнили пароль? </span>
                  <Link to="/login" className="text-orange-600 hover:underline font-medium">
                    Войти
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
