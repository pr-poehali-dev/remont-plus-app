import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

const CONTRACTS_URL = "https://functions.poehali.dev/0fa5f44f-a6a1-4e4d-ad3b-9596884f37ea";
const HEADERS = { "Content-Type": "application/json", "X-Admin-Token": "admin2025" };

export interface Contract {
  id: number;
  title: string;
  contract_number: string;
  contract_type: string;
  counterparty_name: string;
  counterparty_inn: string;
  counterparty_type: string;
  status: string;
  subject: string;
  amount: number | null;
  currency: string;
  signed_at: string | null;
  valid_from: string | null;
  valid_until: string | null;
  auto_renewal: boolean;
  responsible_person: string;
  file_url: string;
  notes: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

const CONTRACT_TYPES = [
  { value: "partner", label: "Партнёрский" },
  { value: "supplier", label: "Поставщик" },
  { value: "service", label: "Услуги" },
  { value: "rental", label: "Аренда" },
  { value: "employment", label: "Трудовой" },
  { value: "nda", label: "NDA / Конфиденциальность" },
  { value: "other", label: "Прочее" },
];

const STATUSES = [
  { value: "draft", label: "Черновик", color: "bg-gray-100 text-gray-600" },
  { value: "review", label: "На согласовании", color: "bg-yellow-100 text-yellow-700" },
  { value: "active", label: "Действующий", color: "bg-green-100 text-green-700" },
  { value: "signed", label: "Подписан", color: "bg-blue-100 text-blue-700" },
  { value: "expired", label: "Истёк", color: "bg-red-100 text-red-600" },
  { value: "terminated", label: "Расторгнут", color: "bg-gray-100 text-gray-500" },
];

const EMPTY: Omit<Contract, "id" | "created_at" | "updated_at"> = {
  title: "",
  contract_number: "",
  contract_type: "partner",
  counterparty_name: "",
  counterparty_inn: "",
  counterparty_type: "company",
  status: "draft",
  subject: "",
  amount: null,
  currency: "RUB",
  signed_at: null,
  valid_from: null,
  valid_until: null,
  auto_renewal: false,
  responsible_person: "",
  file_url: "",
  notes: "",
  tags: [],
};

function statusBadge(status: string) {
  const s = STATUSES.find(x => x.value === status);
  return s ? s : { label: status, color: "bg-gray-100 text-gray-500" };
}

function typelabel(type: string) {
  return CONTRACT_TYPES.find(x => x.value === type)?.label ?? type;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ru-RU");
}

function formatAmount(amount: number | null, currency: string) {
  if (amount === null) return "—";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: currency || "RUB", maximumFractionDigits: 0 }).format(amount);
}

export default function AdminLegalTab() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [stats, setStats] = useState<Record<string, number>>({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form, setForm] = useState<Omit<Contract, "id" | "created_at" | "updated_at">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailContract, setDetailContract] = useState<Contract | null>(null);

  useEffect(() => { load(); }, [filterStatus, filterType]);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterType) params.set("contract_type", filterType);
    if (search.trim()) params.set("search", search.trim());
    const res = await fetch(`${CONTRACTS_URL}?${params}`, { headers: HEADERS });
    const data = await res.json();
    setContracts(data.contracts || []);
    setStats(data.stats || {});
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setTagsInput("");
    setDialogOpen(true);
  }

  function openEdit(c: Contract) {
    setEditing(c);
    setForm({
      title: c.title, contract_number: c.contract_number, contract_type: c.contract_type,
      counterparty_name: c.counterparty_name, counterparty_inn: c.counterparty_inn,
      counterparty_type: c.counterparty_type, status: c.status, subject: c.subject,
      amount: c.amount, currency: c.currency || "RUB",
      signed_at: c.signed_at ? c.signed_at.split("T")[0] : null,
      valid_from: c.valid_from ? c.valid_from.split("T")[0] : null,
      valid_until: c.valid_until ? c.valid_until.split("T")[0] : null,
      auto_renewal: c.auto_renewal, responsible_person: c.responsible_person,
      file_url: c.file_url, notes: c.notes, tags: c.tags || [],
    });
    setTagsInput((c.tags || []).join(", "));
    setDialogOpen(true);
  }

  function openDetail(c: Contract) {
    setDetailContract(c);
    setDetailOpen(true);
  }

  async function save() {
    setSaving(true);
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    const payload = { ...form, tags };
    if (editing) {
      await fetch(`${CONTRACTS_URL}?id=${editing.id}`, { method: "PUT", headers: HEADERS, body: JSON.stringify(payload) });
    } else {
      await fetch(CONTRACTS_URL, { method: "POST", headers: HEADERS, body: JSON.stringify(payload) });
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Удалить договор?")) return;
    await fetch(`${CONTRACTS_URL}?id=${id}`, { method: "DELETE", headers: HEADERS });
    load();
  }

  const filtered = contracts.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.counterparty_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contract_number || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalActive = stats["active"] || 0;
  const totalSigned = stats["signed"] || 0;
  const totalReview = stats["review"] || 0;
  const totalExpired = stats["expired"] || 0;

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Icon name="Scale" size={20} className="text-indigo-600" />
            Юридический отдел
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Договорная работа с партнёрами и поставщиками</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Icon name="Plus" size={16} />
          Новый договор
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Действующих", value: totalActive, icon: "CheckCircle", color: "text-green-600", bg: "bg-green-50" },
          { label: "Подписано", value: totalSigned, icon: "FileCheck", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "На согласовании", value: totalReview, icon: "Clock", color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Истекли", value: totalExpired, icon: "AlertCircle", color: "text-red-500", bg: "bg-red-50" },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <Icon name={s.icon} size={20} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Поиск по названию, контрагенту, номеру..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-9 text-sm border border-gray-200 rounded-md px-2 bg-white"
        >
          <option value="">Все статусы</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="h-9 text-sm border border-gray-200 rounded-md px-2 bg-white"
        >
          <option value="">Все типы</option>
          {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <Button variant="outline" size="sm" onClick={load} className="h-9">
          <Icon name="RefreshCw" size={14} />
        </Button>
      </div>

      {/* Таблица договоров */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
          Загрузка...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Icon name="FileX" size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Договоров не найдено</p>
          <p className="text-sm mt-1">Создайте первый договор</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const sb = statusBadge(c.status);
            const isExpiringSoon = c.valid_until && (() => {
              const d = new Date(c.valid_until!);
              const diff = (d.getTime() - Date.now()) / 86400000;
              return diff > 0 && diff < 30;
            })();
            return (
              <Card
                key={c.id}
                className="p-4 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => openDetail(c)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Icon name="FileText" size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 truncate">{c.title}</p>
                          {c.contract_number && (
                            <span className="text-xs text-gray-400">№{c.contract_number}</span>
                          )}
                          {isExpiringSoon && (
                            <Badge className="bg-orange-100 text-orange-600 border-0 text-[10px] px-1.5">
                              Истекает скоро
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Icon name="Building2" size={12} className="text-gray-400" />
                            {c.counterparty_name}
                          </span>
                          {c.counterparty_inn && (
                            <span className="text-xs text-gray-400">ИНН {c.counterparty_inn}</span>
                          )}
                          <span className="text-xs text-gray-400">{typelabel(c.contract_type)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sb.color}`}>
                          {sb.label}
                        </span>
                        {c.amount !== null && (
                          <span className="text-sm font-bold text-gray-800">
                            {formatAmount(c.amount, c.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                      {c.signed_at && <span>Подписан: {formatDate(c.signed_at)}</span>}
                      {c.valid_from && <span>С {formatDate(c.valid_from)}</span>}
                      {c.valid_until && <span>По {formatDate(c.valid_until)}</span>}
                      {c.responsible_person && (
                        <span className="flex items-center gap-1">
                          <Icon name="User" size={11} />
                          {c.responsible_person}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                      <Icon name="Pencil" size={14} className="text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(c.id)}>
                      <Icon name="Trash2" size={14} className="text-red-400" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Детальный просмотр */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="FileText" size={18} className="text-indigo-600" />
              {detailContract?.title}
            </DialogTitle>
          </DialogHeader>
          {detailContract && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(detailContract.status).color}`}>
                  {statusBadge(detailContract.status).label}
                </span>
                {detailContract.contract_number && (
                  <span className="text-gray-500">№{detailContract.contract_number}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Контрагент</p>
                  <p className="font-medium">{detailContract.counterparty_name}</p>
                  {detailContract.counterparty_inn && <p className="text-xs text-gray-400">ИНН: {detailContract.counterparty_inn}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Тип договора</p>
                  <p className="font-medium">{typelabel(detailContract.contract_type)}</p>
                </div>
                {detailContract.amount !== null && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Сумма</p>
                    <p className="font-bold text-indigo-700">{formatAmount(detailContract.amount, detailContract.currency)}</p>
                  </div>
                )}
                {detailContract.responsible_person && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Ответственный</p>
                    <p className="font-medium">{detailContract.responsible_person}</p>
                  </div>
                )}
              </div>
              {detailContract.subject && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Предмет договора</p>
                  <p className="text-gray-700">{detailContract.subject}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Подписан", val: formatDate(detailContract.signed_at) },
                  { label: "Начало", val: formatDate(detailContract.valid_from) },
                  { label: "Окончание", val: formatDate(detailContract.valid_until) },
                ].map(d => (
                  <div key={d.label} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[10px] text-gray-400">{d.label}</p>
                    <p className="text-sm font-medium">{d.val}</p>
                  </div>
                ))}
              </div>
              {detailContract.auto_renewal && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 text-xs">
                  <Icon name="RefreshCw" size={13} />
                  Автопролонгация включена
                </div>
              )}
              {detailContract.notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Примечания</p>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-2">{detailContract.notes}</p>
                </div>
              )}
              {detailContract.file_url && (
                <a href={detailContract.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:underline text-sm">
                  <Icon name="Paperclip" size={14} />
                  Открыть файл договора
                </a>
              )}
              {(detailContract.tags || []).length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {(detailContract.tags || []).map(t => (
                    <span key={t} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">{t}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={() => { setDetailOpen(false); openEdit(detailContract); }}>
                  <Icon name="Pencil" size={14} className="mr-1.5" />
                  Редактировать
                </Button>
                <Button variant="outline" onClick={() => setDetailOpen(false)}>Закрыть</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Форма создания/редактирования */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Редактировать договор" : "Новый договор"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label className="text-xs">Название договора *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Договор оказания услуг с ООО Ромашка"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Номер договора</Label>
                <Input
                  value={form.contract_number}
                  onChange={e => setForm(f => ({ ...f, contract_number: e.target.value }))}
                  placeholder="2025-01/П"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Тип договора</Label>
                <select
                  value={form.contract_type}
                  onChange={e => setForm(f => ({ ...f, contract_type: e.target.value }))}
                  className="mt-1 w-full h-9 text-sm border border-gray-200 rounded-md px-2 bg-white"
                >
                  {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Контрагент *</Label>
                <Input
                  value={form.counterparty_name}
                  onChange={e => setForm(f => ({ ...f, counterparty_name: e.target.value }))}
                  placeholder="ООО Ромашка"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">ИНН контрагента</Label>
                <Input
                  value={form.counterparty_inn}
                  onChange={e => setForm(f => ({ ...f, counterparty_inn: e.target.value }))}
                  placeholder="7700000000"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Тип контрагента</Label>
                <select
                  value={form.counterparty_type}
                  onChange={e => setForm(f => ({ ...f, counterparty_type: e.target.value }))}
                  className="mt-1 w-full h-9 text-sm border border-gray-200 rounded-md px-2 bg-white"
                >
                  <option value="company">Юридическое лицо</option>
                  <option value="individual">ИП</option>
                  <option value="person">Физическое лицо</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Статус</Label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="mt-1 w-full h-9 text-sm border border-gray-200 rounded-md px-2 bg-white"
                >
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Сумма договора</Label>
                <Input
                  type="number" min={0}
                  value={form.amount ?? ""}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="0"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Валюта</Label>
                <select
                  value={form.currency}
                  onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                  className="mt-1 w-full h-9 text-sm border border-gray-200 rounded-md px-2 bg-white"
                >
                  <option value="RUB">RUB — Рубли</option>
                  <option value="USD">USD — Доллары</option>
                  <option value="EUR">EUR — Евро</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Дата подписания</Label>
                <Input
                  type="date"
                  value={form.signed_at || ""}
                  onChange={e => setForm(f => ({ ...f, signed_at: e.target.value || null }))}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Начало действия</Label>
                <Input
                  type="date"
                  value={form.valid_from || ""}
                  onChange={e => setForm(f => ({ ...f, valid_from: e.target.value || null }))}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Окончание действия</Label>
                <Input
                  type="date"
                  value={form.valid_until || ""}
                  onChange={e => setForm(f => ({ ...f, valid_until: e.target.value || null }))}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Ответственный</Label>
                <Input
                  value={form.responsible_person}
                  onChange={e => setForm(f => ({ ...f, responsible_person: e.target.value }))}
                  placeholder="Иванов Иван"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Ссылка на файл</Label>
                <Input
                  value={form.file_url}
                  onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))}
                  placeholder="https://..."
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Предмет договора</Label>
                <Textarea
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Оказание услуг по..."
                  rows={2}
                  className="mt-1 text-sm resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Примечания</Label>
                <Textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Дополнительные условия, важные детали..."
                  rows={2}
                  className="mt-1 text-sm resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Теги (через запятую)</Label>
                <Input
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="поставщик, ремонт, 2025"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto_renewal"
                  checked={form.auto_renewal}
                  onChange={e => setForm(f => ({ ...f, auto_renewal: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="auto_renewal" className="text-sm cursor-pointer">Автопролонгация</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={save}
                disabled={saving || !form.title || !form.counterparty_name}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {saving ? <Icon name="Loader2" size={14} className="animate-spin mr-1.5" /> : <Icon name="Save" size={14} className="mr-1.5" />}
                {editing ? "Сохранить" : "Создать договор"}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}