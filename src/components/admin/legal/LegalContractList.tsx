import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { CONTRACT_TYPES, STATUSES, statusBadge, typelabel, formatDate, formatAmount } from "./LegalTypes";
import type { Contract } from "./LegalTypes";

interface Props {
  contracts: Contract[];
  loading: boolean;
  search: string;
  filterStatus: string;
  filterType: string;
  stats: Record<string, number>;
  onSearchChange: (v: string) => void;
  onFilterStatusChange: (v: string) => void;
  onFilterTypeChange: (v: string) => void;
  onReload: () => void;
  onOpenCreate: () => void;
  onOpenDetail: (c: Contract) => void;
  onOpenEdit: (c: Contract) => void;
  onRemove: (id: number) => void;
}

export default function LegalContractList({
  contracts, loading, search, filterStatus, filterType, stats,
  onSearchChange, onFilterStatusChange, onFilterTypeChange,
  onReload, onOpenCreate, onOpenDetail, onOpenEdit, onRemove,
}: Props) {
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
        <Button onClick={onOpenCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
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
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onReload()}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => onFilterStatusChange(e.target.value)}
          className="h-9 text-sm border border-gray-200 rounded-md px-2 bg-white"
        >
          <option value="">Все статусы</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          value={filterType}
          onChange={e => onFilterTypeChange(e.target.value)}
          className="h-9 text-sm border border-gray-200 rounded-md px-2 bg-white"
        >
          <option value="">Все типы</option>
          {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <Button variant="outline" size="sm" onClick={onReload} className="h-9">
          <Icon name="RefreshCw" size={14} />
        </Button>
      </div>

      {/* Список */}
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
                onClick={() => onOpenDetail(c)}
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenEdit(c)}>
                      <Icon name="Pencil" size={14} className="text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(c.id)}>
                      <Icon name="Trash2" size={14} className="text-red-400" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
