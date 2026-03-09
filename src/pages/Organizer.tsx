import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMeta } from "@/hooks/useMeta";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { API, getHeaders, getLocalUser, Stage, Plan, fmt, fmtDays, diffLabel } from "@/components/organizer/OrganizerTypes";
import OrganizerStageCard from "@/components/organizer/OrganizerStageCard";
import OrganizerCreateDialog from "@/components/organizer/OrganizerCreateDialog";
import OrganizerStageDialog, { SummaryCard } from "@/components/organizer/OrganizerStageDialog";

export default function Organizer() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useMeta({
    title: "Органайзер ремонта — планирование этапов и контроль работ",
    description: "Планируйте ремонт поэтапно: контролируйте сроки, бюджет и подрядчиков. Удобный органайзер для управления ремонтными работами онлайн.",
    keywords: "органайзер ремонта, планирование ремонта, контроль ремонта, этапы ремонта, управление подрядчиками",
    canonical: "/organizer",
  });

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);
  const [editStage, setEditStage] = useState<Stage | null>(null);
  const [saving, setSaving] = useState(false);

  const [newPlan, setNewPlan] = useState({ title: "Мой ремонт", address: "", apartment_area: "", start_date: "", notes: "" });

  useEffect(() => {
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
          <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
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
              {stages.map((s, idx) => (
                <OrganizerStageCard key={s.id} stage={s} index={idx} onClick={openStage} />
              ))}
            </div>
          </>
        )}
      </div>

      <OrganizerCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        newPlan={newPlan}
        setNewPlan={setNewPlan}
        onSubmit={createPlan}
        saving={saving}
      />

      <OrganizerStageDialog
        open={stageOpen}
        onOpenChange={setStageOpen}
        editStage={editStage}
        setEditStage={setEditStage}
        onSave={saveStage}
        saving={saving}
      />
    </div>
  );
}