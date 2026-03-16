import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";

const PLAN_NAMES: Record<string, string> = {
  b2c_basic: "Базовый",
  b2c_professional: "Профессиональный",
  b2c_premium: "Премиум",
  b2b_start: "Старт",
  b2b_business: "Бизнес",
  b2b_pro: "Профи",
};

const TARIFF_DURATION_DAYS = 30;

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

interface TariffData {
  plan_id: string;
  paid: boolean;
  ts: number;
}

const quickActions = [
  { label: "Калькулятор смет", icon: "Calculator", path: "/calculator", external: false },
  { label: "Дизайнер", icon: "Palette", path: "/designer", external: false },
  { label: "Мои документы", icon: "FileText", path: "/prices", external: false },
  { label: "Тарифы", icon: "BadgePercent", path: "https://avangard-ai.ru/tariffs", external: true },
];

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tariff, setTariff] = useState<TariffData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("avangard_user");
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }

    try {
      const raw = localStorage.getItem("avangard_tariff");
      if (raw) setTariff(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const planName = tariff?.plan_id ? PLAN_NAMES[tariff.plan_id] || tariff.plan_id : null;

  const getDaysRemaining = (): number => {
    if (!tariff?.ts) return 0;
    const expiresAt = tariff.ts + TARIFF_DURATION_DAYS * 24 * 60 * 60 * 1000;
    const remaining = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    return Math.max(0, remaining);
  };

  const getDaysPassed = (): number => {
    if (!tariff?.ts) return 0;
    const passed = Math.floor((Date.now() - tariff.ts) / (24 * 60 * 60 * 1000));
    return Math.min(TARIFF_DURATION_DAYS, Math.max(0, passed));
  };

  const daysRemaining = getDaysRemaining();
  const daysPassed = getDaysPassed();
  const progressValue = (daysPassed / TARIFF_DURATION_DAYS) * 100;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-1.5"
            >
              <Icon name="ArrowLeft" size={16} />
              Главная
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Icon name="User" size={14} className="text-white" />
            </div>
            {user?.name && <span className="font-medium text-foreground">{user.name}</span>}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Личный кабинет</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="CreditCard" size={20} />
              Текущий тариф
            </CardTitle>
          </CardHeader>
          <CardContent>
            {planName ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-semibold">{planName}</p>
                    <p className="text-sm text-muted-foreground">
                      Осталось {daysRemaining} {daysRemaining === 1 ? "день" : daysRemaining >= 2 && daysRemaining <= 4 ? "дня" : "дней"}
                    </p>
                  </div>
                  <Button
                    onClick={() => { window.location.href = "https://avangard-ai.ru/tariffs"; }}
                    className="gap-1.5"
                  >
                    <Icon name="RefreshCw" size={14} />
                    Продлить тариф
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Прошло {daysPassed} из {TARIFF_DURATION_DAYS} дней</span>
                    <span>{Math.round(progressValue)}%</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Icon name="AlertCircle" size={24} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Тариф не подключён</p>
                <Button
                  onClick={() => { window.location.href = "https://avangard-ai.ru/tariffs"; }}
                  className="gap-1.5"
                >
                  <Icon name="Zap" size={14} />
                  Выбрать тариф
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-3">Быстрые действия</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Card
                key={action.label}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  if (action.external) {
                    window.location.href = action.path;
                  } else {
                    navigate(action.path);
                  }
                }}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Icon name={action.icon} size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="Receipt" size={20} />
              История платежей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-6">
              История платежей будет доступна в ближайшее время
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}