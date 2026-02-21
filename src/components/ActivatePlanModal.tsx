import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

const SUBS_URL = "https://functions.poehali.dev/52ea78ee-5f41-4904-b547-d60063d9da0a";

const PLANS = [
  {
    code: "start",
    name: "START",
    price: "990 ₽/мес",
    color: "border-green-200 bg-green-50",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-400",
    features: ["3 проекта", "10 визуализаций ИИ", "5 правок"],
  },
  {
    code: "pro",
    name: "PRO",
    price: "2 490 ₽/мес",
    color: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    features: ["10 проектов", "30 визуализаций ИИ", "20 правок"],
    popular: true,
  },
  {
    code: "max",
    name: "MAX",
    price: "4 990 ₽/мес",
    color: "border-purple-200 bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
    features: ["30 проектов", "100 визуализаций ИИ", "Безлимит правок", "Материалы и сметы"],
  },
  {
    code: "studio",
    name: "STUDIO",
    price: "9 900 ₽/мес",
    color: "border-teal-200 bg-teal-50",
    badge: "bg-teal-100 text-teal-700",
    dot: "bg-teal-500",
    features: ["Безлимит проектов", "Безлимит ИИ", "Менеджер", "CRM для клиентов"],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  userId: number | null;
  currentPlanCode?: string;
  onActivated: () => void;
}

export default function ActivatePlanModal({ open, onClose, userId, currentPlanCode, onActivated }: Props) {
  const [activating, setActivating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activate = async (planCode: string) => {
    if (!userId) return;
    setActivating(planCode);
    setError(null);
    try {
      const res = await fetch(`${SUBS_URL}?user_id=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate", plan_code: planCode }),
      });
      const data = await res.json();
      if (data.success) {
        onActivated();
        onClose();
      } else {
        setError(data.error || "Не удалось активировать тариф");
      }
    } catch {
      setError("Ошибка подключения. Попробуйте ещё раз.");
    } finally {
      setActivating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Активировать тариф</DialogTitle>
          <p className="text-sm text-gray-500">Выберите план и нажмите «Активировать» — тариф включится немедленно</p>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            <Icon name="AlertCircle" size={15} />
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 mt-1">
          {PLANS.map((plan) => {
            const isCurrent = plan.code === currentPlanCode;
            const isLoading = activating === plan.code;

            return (
              <div
                key={plan.code}
                className={`relative rounded-2xl border-2 p-4 ${isCurrent ? "border-gray-300 bg-gray-50 opacity-60" : plan.color}`}
              >
                {plan.popular && !isCurrent && (
                  <span className="absolute -top-2.5 left-4 text-xs font-semibold bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                    Популярный
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-2.5 left-4 text-xs font-semibold bg-gray-500 text-white px-2.5 py-0.5 rounded-full">
                    Активен
                  </span>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${plan.dot}`} />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan.badge}`}>{plan.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{plan.price}</span>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Icon name="Check" size={13} className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  size="sm"
                  className="w-full h-8 text-xs"
                  disabled={isCurrent || isLoading || !!activating}
                  variant={isCurrent ? "outline" : "default"}
                  onClick={() => activate(plan.code)}
                >
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" size={13} className="mr-1.5 animate-spin" />
                      Активируем...
                    </>
                  ) : isCurrent ? (
                    "Текущий тариф"
                  ) : (
                    <>
                      <Icon name="Zap" size={13} className="mr-1.5" />
                      Активировать
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 text-center mt-1">
          Смена тарифа отменит текущую подписку и немедленно активирует новую
        </p>
      </DialogContent>
    </Dialog>
  );
}
