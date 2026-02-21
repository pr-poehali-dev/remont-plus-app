import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { type Subscription } from "@/hooks/useSubscription";
import ActivatePlanModal from "@/components/ActivatePlanModal";

interface Props {
  subscription: Subscription | null;
  loading: boolean;
  userId?: number | null;
  onActivated?: () => void;
}

function LimitBar({ used, max, label }: { used: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  const left = max - used;
  const danger = pct >= 90;
  const warn = pct >= 60;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className={`font-semibold ${danger ? "text-red-500" : warn ? "text-amber-500" : "text-gray-700"}`}>
          {left <= 0 ? "Лимит исчерпан" : `осталось ${left} из ${max}`}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${danger ? "bg-red-500" : warn ? "bg-amber-400" : "bg-green-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function SubscriptionStatus({ subscription, loading, userId, onActivated }: Props) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleActivated = () => {
    onActivated?.();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
        <div className="h-2 bg-gray-100 rounded mb-2" />
        <div className="h-2 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Icon name="Zap" size={18} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm mb-0.5">Нет активной подписки</p>
              <p className="text-xs text-gray-500 mb-3">Выберите тариф для создания дизайн-проектов</p>
              <div className="flex gap-2">
                <Button size="sm" className="h-8 text-xs" onClick={() => setModalOpen(true)}>
                  <Icon name="Zap" size={13} className="mr-1.5" />
                  Активировать тариф
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs text-gray-500" onClick={() => navigate("/tariffs")}>
                  Подробнее о тарифах
                </Button>
              </div>
            </div>
          </div>
        </div>
        <ActivatePlanModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          userId={userId ?? null}
          onActivated={handleActivated}
        />
      </>
    );
  }

  const planColors: Record<string, string> = {
    start: "from-green-50 to-emerald-50 border-green-100",
    pro: "from-blue-50 to-indigo-50 border-blue-100",
    max: "from-purple-50 to-fuchsia-50 border-purple-100",
    studio: "from-teal-50 to-cyan-50 border-teal-100",
    business: "from-blue-50 to-indigo-50 border-blue-100",
    enterprise: "from-amber-50 to-orange-50 border-amber-100",
  };
  const dotColors: Record<string, string> = {
    start: "bg-green-400", pro: "bg-blue-500", max: "bg-purple-500",
    studio: "bg-teal-500", business: "bg-blue-500", enterprise: "bg-amber-500",
  };
  const colorClass = planColors[subscription.plan_code] || "from-gray-50 to-gray-50 border-gray-100";
  const dotClass = dotColors[subscription.plan_code] || "bg-gray-400";

  return (
    <>
      <div className={`bg-gradient-to-br ${colorClass} rounded-2xl border p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
            <span className="font-bold text-sm">{subscription.plan_name}</span>
            {subscription.is_monthly && (
              <span className="text-xs text-gray-400">/ мес</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Сменить тариф
            </button>
          </div>
        </div>

        {subscription.is_unlimited ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Icon name="Infinity" size={16} />
            <span className="font-medium">Без ограничений</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            <LimitBar used={subscription.projects_used} max={subscription.max_projects} label="Проекты" />
            <LimitBar used={subscription.visualizations_used} max={subscription.max_visualizations} label="Визуализации ИИ" />
            {subscription.max_revisions > 0 && (
              <LimitBar used={subscription.revisions_used} max={subscription.max_revisions} label="Правки" />
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          {subscription.expires_at ? (
            <p className="text-xs text-gray-400">
              Действует до {new Date(subscription.expires_at).toLocaleDateString("ru-RU")}
            </p>
          ) : (
            <span />
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-3"
            onClick={() => setModalOpen(true)}
          >
            <Icon name="Zap" size={12} className="mr-1" />
            Активировать тариф
          </Button>
        </div>
      </div>

      <ActivatePlanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId ?? null}
        currentPlanCode={subscription.plan_code}
        onActivated={handleActivated}
      />
    </>
  );
}
