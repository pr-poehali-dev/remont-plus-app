import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

const API = "https://functions.poehali.dev/2718d43b-b9db-426c-add0-8a4f4b840a10";

function getHeaders() {
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(userId ? { "X-User-Id": userId } : {}),
    ...(token ? { "X-Auth-Token": token } : {}),
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending:     { label: "Не начат",   color: "bg-gray-100 text-gray-600 border-gray-200",       icon: "Circle" },
  in_progress: { label: "В работе",   color: "bg-blue-100 text-blue-700 border-blue-200",        icon: "PlayCircle" },
  done:        { label: "Выполнен",   color: "bg-green-100 text-green-700 border-green-200",     icon: "CheckCircle2" },
  blocked:     { label: "Задержка",   color: "bg-red-100 text-red-700 border-red-200",           icon: "AlertCircle" },
};

interface Stage {
  id: number;
  sort_order: number;
  title: string;
  description: string;
  checkpoints: string[];
  plan_days: number | null;
  plan_amount: number | null;
  fact_days: number | null;
  fact_amount: number | null;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  status: string;
  comment: string | null;
}

interface Plan {
  id: number;
  title: string;
  address: string;
  apartment_area: number | null;
  start_date: string | null;
  notes: string;
}

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";
}

function fmtDays(n: number | null | undefined) {
  if (n == null) return "—";
  return `${n} дн.`;
}

function diffColor(plan: number | null, fact: number | null, invert = false) {
  if (plan == null || fact == null) return "text-gray-400";
  const saved = plan - fact;
  if (saved === 0) return "text-gray-500";
  if (invert) return saved > 0 ? "text-red-600" : "text-green-600";
  return saved > 0 ? "text-green-600" : "text-red-600";
}

function diffLabel(plan: number | null, fact: number | null, unit = "₽", invert = false) {
  if (plan == null || fact == null) return null;
  const diff = plan - fact;
  if (diff === 0) return null;
  const sign = diff > 0 ? "−" : "+";
  const abs = Math.abs(diff);
  const val = unit === "₽" ? abs.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽" : `${abs} дн.`;
  const label = invert
    ? (diff > 0 ? `Задержка ${val}` : `Опережение ${val}`)
    : (diff > 0 ? `Экономия ${val}` : `Перерасход ${val}`);
  return { label, sign, positive: invert ? diff < 0 : diff > 0 };
}

export default function Organizer() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);
  const [editStage, setEditStage] = useState<Stage | null>(null);
  const [saving, setSaving] = useState(false);

  const [newPlan, setNewPlan] = useState({ title: "Мой ремонт", address: "", apartment_area: "", start_date: "", notes: "" });

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) { navigate("/login"); return; }
    loadPlan();
  }, []);

  async function loadPlan() {
    setLoading(true);
    try {
      const res = await fetch(API, { headers: getHeaders() });
      const data = await res.json();
      setPlan(data.plan);
      setStages(data.stages || []);
    } finally {
      setLoading(false);
    }
  }

  async function createPlan() {
    setSaving(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ ...newPlan, apartment_area: newPlan.apartment_area ? parseFloat(newPlan.apartment_area) : null }),
      });
      if (res.ok) {
        setCreateOpen(false);
        await loadPlan();
        toast({ title: "План создан", description: "Шаблон из 12 этапов загружен" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveStage() {
    if (!editStage) return;
    setSaving(true);
    try {
      const res = await fetch(API + "/stages", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(editStage),
      });
      if (res.ok) {
        setStageOpen(false);
        await loadPlan();
        toast({ title: "Этап сохранён" });
      }
    } finally {
      setSaving(false);
    }
  }

  function openStage(s: Stage) {
    setEditStage({ ...s });
    setStageOpen(true);
  }

  // Сводка
  const totalPlanBudget = stages.reduce((s, x) => s + (x.plan_amount || 0), 0);
  const totalFactBudget = stages.reduce((s, x) => s + (x.fact_amount || 0), 0);
  const totalPlanDays = stages.reduce((s, x) => s + (x.plan_days || 0), 0);
  const totalFactDays = stages.reduce((s, x) => s + (x.fact_days || 0), 0);
  const doneCount = stages.filter(s => s.status === "done").length;
  const inProgressCount = stages.filter(s => s.status === "in_progress").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Icon name="ArrowLeft" size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Органайзер ремонта</h1>
            <p className="text-sm text-gray-500">Контроль сроков и бюджета</p>
          </div>
          {plan && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 font-medium">
              {doneCount}/{stages.length} этапов
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Нет плана */}
        {!plan && (
          <Card className="p-10 text-center border-dashed border-2 border-gray-300">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="ClipboardList" size={32} className="text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Создайте план ремонта</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Шаблон из 12 типовых этапов: демонтаж, электрика, стяжка, отделка и сдача объекта
            </p>
            <Button onClick={() => setCreateOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Icon name="Plus" size={16} />
              Создать план
            </Button>
          </Card>
        )}

        {/* Есть план */}
        {plan && (
          <>
            {/* Инфо объекта */}
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="Home" size={20} className="text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{plan.title}</p>
                  {plan.address && <p className="text-sm text-gray-500">{plan.address}</p>}
                  <div className="flex flex-wrap gap-3 mt-1">
                    {plan.apartment_area && <span className="text-xs text-gray-500">{plan.apartment_area} м²</span>}
                    {plan.start_date && <span className="text-xs text-gray-500">Старт: {new Date(plan.start_date).toLocaleDateString("ru-RU")}</span>}
                  </div>
                </div>
              </div>
            </Card>

            {/* Сводка */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard icon="Wallet" label="Бюджет (план)" value={fmt(totalPlanBudget)} color="blue" />
              <SummaryCard
                icon="Receipt"
                label="Факт"
                value={fmt(totalFactBudget || null)}
                color={totalFactBudget > totalPlanBudget ? "red" : "green"}
                sub={totalFactBudget > 0 ? diffLabel(totalPlanBudget, totalFactBudget)?.label : undefined}
                subPositive={totalPlanBudget >= totalFactBudget}
              />
              <SummaryCard icon="CalendarClock" label="Срок (план)" value={fmtDays(totalPlanDays)} color="purple" />
              <SummaryCard
                icon="Clock"
                label="Факт (дни)"
                value={fmtDays(totalFactDays || null)}
                color={totalFactDays > totalPlanDays ? "red" : "green"}
                sub={totalFactDays > 0 ? diffLabel(totalPlanDays, totalFactDays, "дн.", true)?.label : undefined}
                subPositive={totalPlanDays >= totalFactDays}
              />
            </div>

            {/* Прогресс */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Прогресс выполнения</p>
                <p className="text-sm text-gray-500">{doneCount} из {stages.length} этапов завершено</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-orange-400 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${stages.length ? (doneCount / stages.length) * 100 : 0}%` }}
                />
              </div>
              <div className="flex gap-4 mt-3">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> В работе: {inProgressCount}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Выполнено: {doneCount}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Ожидает: {stages.filter(s => s.status === "pending").length}
                </span>
              </div>
            </Card>

            {/* Этапы */}
            <div className="space-y-3">
              <h2 className="font-bold text-gray-900 text-base">Этапы ремонта</h2>
              {stages.map((s, idx) => {
                const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
                const budgetDiff = diffLabel(s.plan_amount, s.fact_amount);
                const daysDiff = diffLabel(s.plan_days, s.fact_days, "дн.", true);
                return (
                  <Card
                    key={s.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow border hover:border-orange-200"
                    onClick={() => openStage(s)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-sm font-bold text-orange-600">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
                            <Icon name={cfg.icon} size={11} />
                            {cfg.label}
                          </span>
                        </div>
                        {s.description && <p className="text-xs text-gray-500 mb-2 line-clamp-1">{s.description}</p>}

                        {/* Контрольные точки */}
                        {s.checkpoints && s.checkpoints.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {s.checkpoints.map((cp, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{cp}</span>
                            ))}
                          </div>
                        )}

                        {/* Цифры план/факт */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                          <PlanFactCell label="Дни (план)" value={fmtDays(s.plan_days)} />
                          <PlanFactCell
                            label="Дни (факт)"
                            value={fmtDays(s.fact_days)}
                            diff={daysDiff?.label}
                            positive={daysDiff?.positive}
                          />
                          <PlanFactCell label="Сумма (план)" value={fmt(s.plan_amount)} />
                          <PlanFactCell
                            label="Сумма (факт)"
                            value={fmt(s.fact_amount)}
                            diff={budgetDiff?.label}
                            positive={budgetDiff?.positive}
                          />
                        </div>

                        {s.comment && (
                          <p className="text-xs text-gray-500 mt-2 italic">💬 {s.comment}</p>
                        )}
                      </div>
                      <Icon name="ChevronRight" size={16} className="text-gray-400 shrink-0 mt-1" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Диалог: создать план */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Новый план ремонта</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Название объекта</label>
              <Input value={newPlan.title} onChange={e => setNewPlan(p => ({ ...p, title: e.target.value }))} placeholder="Моя квартира" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Адрес</label>
              <Input value={newPlan.address} onChange={e => setNewPlan(p => ({ ...p, address: e.target.value }))} placeholder="ул. Пушкина, д. 1, кв. 42" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Площадь (м²)</label>
                <Input type="number" value={newPlan.apartment_area} onChange={e => setNewPlan(p => ({ ...p, apartment_area: e.target.value }))} placeholder="65" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Дата начала</label>
                <Input type="date" value={newPlan.start_date} onChange={e => setNewPlan(p => ({ ...p, start_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Примечания</label>
              <Textarea value={newPlan.notes} onChange={e => setNewPlan(p => ({ ...p, notes: e.target.value }))} placeholder="Ремонт в новостройке, без мебели" rows={2} />
            </div>
            <Button onClick={createPlan} disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2">
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Plus" size={16} />}
              Создать план из шаблона
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог: редактировать этап */}
      {editStage && (
        <Dialog open={stageOpen} onOpenChange={setStageOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Этап: {editStage.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              {/* Статус */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Статус</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setEditStage(s => s ? { ...s, status: key } : s)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${editStage.status === key ? val.color + " border-current" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                    >
                      <Icon name={val.icon} size={14} />
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Контрольные точки */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Контрольные точки</label>
                <div className="space-y-1.5">
                  {(editStage.checkpoints || []).map((cp, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-1.5">
                      <Icon name="CheckSquare" size={14} className="text-green-500 shrink-0" />
                      <span className="flex-1">{cp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr />

              {/* Плановые показатели */}
              <p className="text-sm font-semibold text-gray-700">Плановые показатели</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Дней (план)</label>
                  <Input type="number" value={editStage.plan_days ?? ""} onChange={e => setEditStage(s => s ? { ...s, plan_days: e.target.value ? parseInt(e.target.value) : null } : s)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Сумма (план), ₽</label>
                  <Input type="number" value={editStage.plan_amount ?? ""} onChange={e => setEditStage(s => s ? { ...s, plan_amount: e.target.value ? parseFloat(e.target.value) : null } : s)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Дата начала (план)</label>
                  <Input type="date" value={editStage.planned_start ?? ""} onChange={e => setEditStage(s => s ? { ...s, planned_start: e.target.value || null } : s)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Дата окончания (план)</label>
                  <Input type="date" value={editStage.planned_end ?? ""} onChange={e => setEditStage(s => s ? { ...s, planned_end: e.target.value || null } : s)} />
                </div>
              </div>

              <hr />

              {/* Фактические показатели */}
              <p className="text-sm font-semibold text-gray-700">Фактические показатели</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Дней (факт)</label>
                  <Input type="number" value={editStage.fact_days ?? ""} onChange={e => setEditStage(s => s ? { ...s, fact_days: e.target.value ? parseInt(e.target.value) : null } : s)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Сумма (факт), ₽</label>
                  <Input type="number" value={editStage.fact_amount ?? ""} onChange={e => setEditStage(s => s ? { ...s, fact_amount: e.target.value ? parseFloat(e.target.value) : null } : s)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Дата начала (факт)</label>
                  <Input type="date" value={editStage.actual_start ?? ""} onChange={e => setEditStage(s => s ? { ...s, actual_start: e.target.value || null } : s)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Дата окончания (факт)</label>
                  <Input type="date" value={editStage.actual_end ?? ""} onChange={e => setEditStage(s => s ? { ...s, actual_end: e.target.value || null } : s)} />
                </div>
              </div>

              {/* Итог по этапу */}
              {(editStage.plan_amount != null && editStage.fact_amount != null) && (
                <div className={`rounded-lg px-4 py-3 ${editStage.plan_amount >= editStage.fact_amount ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Итог по этапу</p>
                  <div className="flex gap-6 text-sm">
                    <span className="text-gray-600">Бюджет: {fmt(editStage.plan_amount)} → {fmt(editStage.fact_amount)}</span>
                    <span className={editStage.plan_amount >= editStage.fact_amount ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
                      {editStage.plan_amount >= editStage.fact_amount ? "Экономия" : "Перерасход"} {fmt(Math.abs(editStage.plan_amount - editStage.fact_amount))}
                    </span>
                  </div>
                </div>
              )}

              {/* Комментарий */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Комментарий</label>
                <Textarea value={editStage.comment ?? ""} onChange={e => setEditStage(s => s ? { ...s, comment: e.target.value } : s)} placeholder="Заметки по этапу: что сделано, кто выполнял..." rows={3} />
              </div>

              <Button onClick={saveStage} disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2">
                {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Save" size={16} />}
                Сохранить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, color, sub, subPositive }: { icon: string; label: string; value: string; color: string; sub?: string; subPositive?: boolean }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600", purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <Card className="p-3">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon name={icon} size={16} />
      </div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-base font-bold text-gray-900">{value}</p>
      {sub && <p className={`text-xs font-medium mt-0.5 ${subPositive ? "text-green-600" : "text-red-600"}`}>{sub}</p>}
    </Card>
  );
}

function PlanFactCell({ label, value, diff, positive }: { label: string; value: string; diff?: string; positive?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
      {diff && <p className={`text-xs font-medium ${positive ? "text-green-600" : "text-red-600"}`}>{diff}</p>}
    </div>
  );
}