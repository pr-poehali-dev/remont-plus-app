import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/2642096f-c763-42ef-8dc1-67e3acce37b3";

interface Props {
  calcName: string;
  calcPath: string;
  children: React.ReactNode;
}

export default function CalcAuthGate({ calcName, calcPath, children }: Props) {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("avangard_user");
    if (saved) setIsAuth(true);
  }, []);

  if (isAuth) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = mode === "login"
        ? { action: "login", email: email.trim(), password }
        : { action: "register", email: email.trim(), password, name: name.trim(), phone: phone.trim() };

      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка");
        return;
      }
      localStorage.setItem("avangard_user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("avangard_token", data.token);
      setIsAuth(true);
    } catch (_e) {
      setError("Сервер недоступен. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4">
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            На главную
          </Button>
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Calculator" size={28} className="text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Калькулятор: {calcName}</h1>
          <p className="text-gray-500 text-sm">Войдите или зарегистрируйтесь, чтобы начать расчёт и сохранить результаты</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "login" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
            >
              Войти
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "register" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="tel"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Телефон"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </>
            )}
            <input
              type="text"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1.5">
                <Icon name="AlertCircle" size={14} />
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
            >
              {loading ? (
                <><Icon name="Loader2" size={15} className="mr-2 animate-spin" />Загрузка...</>
              ) : mode === "login" ? "Войти и открыть калькулятор" : "Зарегистрироваться и начать"}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-4">
            Нажимая кнопку, вы соглашаетесь на обработку персональных данных
          </p>
        </div>
      </div>
    </div>
  );
}
