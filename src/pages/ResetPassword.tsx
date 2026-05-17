import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import SEOMeta from "@/components/SEOMeta";

const AUTH_URL = "https://functions.poehali.dev/2642096f-c763-42ef-8dc1-67e3acce37b3";

type State = "checking" | "ready" | "expired" | "success";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [state, setState] = useState<State>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setState("expired");
      return;
    }
    fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify_reset_token", token }),
    })
      .then((r) => r.json())
      .then((data) => {
        setState(data?.valid ? "ready" : "expired");
      })
      .catch(() => setState("expired"));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password", token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.error || "Не удалось сменить пароль");
        return;
      }
      setState("success");
      setTimeout(() => navigate("/login"), 2500);
    } catch {
      setError("Сервер недоступен. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <SEOMeta
        title="Сброс пароля"
        description="Установите новый пароль для входа в личный кабинет."
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Новый пароль</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Придумайте новый пароль для входа
          </p>
        </div>

        <Card>
          {state === "checking" && (
            <CardContent className="py-12 text-center">
              <div className="animate-spin mx-auto rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mb-3" />
              <p className="text-sm text-muted-foreground">Проверяем ссылку…</p>
            </CardContent>
          )}

          {state === "expired" && (
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center mb-4">
                <Icon name="AlertTriangle" className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Ссылка недействительна</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Срок действия ссылки истёк или она уже была использована. Запросите новую ссылку для восстановления.
              </p>
              <div className="flex flex-col gap-2">
                <Link to="/forgot-password">
                  <Button className="w-full">Запросить новую ссылку</Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">К входу</Button>
                </Link>
              </div>
            </CardContent>
          )}

          {state === "success" && (
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
                <Icon name="CheckCircle2" className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Пароль изменён</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Сейчас перенаправим вас на страницу входа…
              </p>
              <Link to="/login">
                <Button className="w-full">Войти сейчас</Button>
              </Link>
            </CardContent>
          )}

          {state === "ready" && (
            <>
              <CardHeader>
                <CardTitle>Установить пароль</CardTitle>
                <CardDescription>Минимум 6 символов</CardDescription>
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
                    <Label htmlFor="password">Новый пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Минимум 6 символов"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm">Повторите пароль</Label>
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="Ещё раз тот же пароль"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Сохраняем…
                      </>
                    ) : (
                      <>
                        <Icon name="KeyRound" className="mr-2 h-4 w-4" />
                        Сменить пароль
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
