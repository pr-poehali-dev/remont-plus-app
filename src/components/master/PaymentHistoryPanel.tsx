import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/2642096f-c763-42ef-8dc1-67e3acce37b3";
const NOTIFY_URL = "https://functions.poehali.dev/a8b87e78-89d1-48d8-ba76-8da2e0df32a3";

interface Transaction {
  id: number;
  contract_amount: number;
  commission_pct: number;
  commission_amount: number;
  payout_amount: number;
  customer_name: string;
  work_description: string;
  status: string;
  paid_at: string | null;
  payout_at: string | null;
  created_at: string | null;
}

interface Props {
  contractorId: number;
  masterName?: string;
  masterEmail?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:        { label: "Ожидает оплаты",    color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  paid:           { label: "Оплачено",           color: "bg-blue-100 text-blue-700 border-blue-200" },
  payout_pending: { label: "Ожидает выплаты",   color: "bg-orange-100 text-orange-700 border-orange-200" },
  completed:      { label: "Выплачено",          color: "bg-green-100 text-green-700 border-green-200" },
  cancelled:      { label: "Отменено",           color: "bg-gray-100 text-gray-500 border-gray-200" },
};

function fmt(n: number) {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 0 }) + " ₽";
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export default function PaymentHistoryPanel({ contractorId, masterName = "", masterEmail = "" }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState<number | null>(null);

  const [form, setForm] = useState({
    contract_amount: "",
    customer_name: "",
    work_description: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_transactions", contractor_id: contractorId }),
      });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [contractorId]);

  const handleAdd = async () => {
    if (!form.contract_amount || isNaN(Number(form.contract_amount))) return;
    setSaving(true);
    try {
      await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_transaction",
          contractor_id: contractorId,
          contract_amount: Number(form.contract_amount),
          customer_name: form.customer_name,
          work_description: form.work_description,
        }),
      });
      setForm({ contract_amount: "", customer_name: "", work_description: "" });
      setShowAddForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (t: Transaction) => {
    setNotifying(t.id);
    try {
      await fetch(NOTIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "notify_payment_received",
          transaction_id: t.id,
          master_email: masterEmail,
          master_name: masterName,
          customer_name: t.customer_name,
          contract_amount: t.contract_amount,
          commission_amount: t.commission_amount,
          payout_amount: t.payout_amount,
          work_description: t.work_description,
        }),
      });
      await load();
    } finally {
      setNotifying(null);
    }
  };

  const totalEarned = transactions
    .filter((t) => t.status === "completed")
    .reduce((s, t) => s + t.payout_amount, 0);

  const totalPending = transactions
    .filter((t) => ["pending", "paid", "payout_pending"].includes(t.status))
    .reduce((s, t) => s + t.payout_amount, 0);

  const totalCommission = transactions
    .filter((t) => t.status === "completed")
    .reduce((s, t) => s + t.commission_amount, 0);

  const completedCount = transactions.filter((t) => t.status === "completed").length;
  const bonusOrdersLeft = Math.max(0, 3 - completedCount);
  const isBonus = bonusOrdersLeft > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Icon name="Wallet" size={20} className="text-green-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">История выплат</h2>
            <p className="text-xs text-gray-400">Все расчёты через Авангард</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Icon name="Plus" size={15} className="mr-1.5" />
          Новый договор
        </Button>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        <div className="px-5 py-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Выплачено</p>
          <p className="font-bold text-green-600 text-lg">{fmt(totalEarned)}</p>
        </div>
        <div className="px-5 py-4 text-center">
          <p className="text-xs text-gray-400 mb-1">В ожидании</p>
          <p className="font-bold text-orange-500 text-lg">{fmt(totalPending)}</p>
        </div>
        <div className="px-5 py-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Комиссия (5%)</p>
          <p className="font-bold text-gray-500 text-lg">{fmt(totalCommission)}</p>
        </div>
      </div>

      {/* Бонус лояльности */}
      {isBonus && (
        <div className="mx-4 mt-4 mb-0 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <Icon name="BadgePercent" size={18} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-700">
              Бонус новичка — 0% комиссии!
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Осталось льготных заказов: <strong>{bonusOrdersLeft} из 3</strong>. После них — стандартные 5%.
            </p>
          </div>
        </div>
      )}

      {/* Форма добавления */}
      {showAddForm && (
        <div className="p-5 bg-orange-50 border-b border-orange-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">Зафиксировать новый договор</p>
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Сумма договора, ₽</label>
              <Input
                type="number"
                placeholder="150000"
                value={form.contract_amount}
                onChange={(e) => setForm({ ...form, contract_amount: e.target.value })}
              />
              {form.contract_amount && !isNaN(Number(form.contract_amount)) && Number(form.contract_amount) > 0 && (
                isBonus ? (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    🎉 Бонус: комиссия 0% · Вам: {fmt(Number(form.contract_amount))}
                  </p>
                ) : (
                  <p className="text-xs text-orange-600 mt-1">
                    Комиссия 5%: {fmt(Number(form.contract_amount) * 0.05)} · Вам: {fmt(Number(form.contract_amount) * 0.95)}
                  </p>
                )
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Заказчик</label>
              <Input
                placeholder="Иванов Иван Иванович"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Вид работ</label>
              <Input
                placeholder="Ремонт ванной комнаты"
                value={form.work_description}
                onChange={(e) => setForm({ ...form, work_description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
              {saving ? "Сохраняю..." : "Сохранить"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Отмена</Button>
          </div>
        </div>
      )}

      {/* Список транзакций */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
            <Icon name="Loader2" size={20} className="animate-spin" />
            Загрузка...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10">
            <Icon name="Receipt" size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Транзакций пока нет</p>
            <p className="text-gray-300 text-xs mt-1">Нажмите «Новый договор», чтобы зафиксировать первую выплату</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => {
              const st = STATUS_MAP[t.status] || { label: t.status, color: "bg-gray-100 text-gray-500" };
              return (
                <div key={t.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {t.customer_name || "Заказчик не указан"}
                        </span>
                        <Badge className={`text-xs border ${st.color}`}>{st.label}</Badge>
                      </div>
                      {t.work_description && (
                        <p className="text-xs text-gray-500 truncate">{t.work_description}</p>
                      )}
                      <p className="text-xs text-gray-300 mt-1">
                        Создан: {fmtDate(t.created_at)}
                        {t.payout_at && ` · Выплачен: ${fmtDate(t.payout_at)}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">Сумма договора</p>
                      <p className="font-semibold text-gray-800">{fmt(t.contract_amount)}</p>
                      <p className="text-xs text-red-400">−{fmt(t.commission_amount)} комиссия</p>
                      <p className="text-sm font-bold text-green-600">= {fmt(t.payout_amount)}</p>
                    </div>
                  </div>
                  {t.status === "pending" && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(t)}
                        disabled={notifying === t.id}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs h-8"
                      >
                        <Icon name={notifying === t.id ? "Loader2" : "CheckCircle"} size={13} className={`mr-1.5 ${notifying === t.id ? "animate-spin" : ""}`} />
                        {notifying === t.id ? "Отправляю..." : "Заказчик оплатил"}
                      </Button>
                      {masterEmail && (
                        <span className="text-xs text-gray-400">
                          → уведомление на {masterEmail}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}