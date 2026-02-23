import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/89a93896-7725-4f8e-b42b-561db9546fd8";
const ADMIN_TOKEN = "admin2025";

export interface PartnerLead {
  id: number;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  partner_type: string;
  region: string;
  comment: string;
  status: string;
  created_at: string;
}

interface Props {
  leads: PartnerLead[];
  onReload: () => void;
}

const PARTNER_TYPE_LABELS: Record<string, string> = {
  contractor: "Бригада / мастер",
  supplier: "Поставщик материалов",
  windows: "Оконная компания",
  design: "Дизайн-студия",
  other: "Другое",
};

const STATUSES = [
  { value: "new", label: "Новая", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "in_progress", label: "В работе", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "approved", label: "Подтверждена", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "rejected", label: "Отклонена", color: "bg-red-100 text-red-700 border-red-200" },
];

function statusMeta(status: string) {
  return STATUSES.find(s => s.value === status) ?? { label: status, color: "bg-gray-100 text-gray-600 border-gray-200" };
}

const FILTER_ALL = "all";

export default function AdminPartnerLeadsTab({ leads, onReload }: Props) {
  const [filter, setFilter] = useState<string>(FILTER_ALL);
  const [changingId, setChangingId] = useState<number | null>(null);

  const filtered = filter === FILTER_ALL ? leads : leads.filter(l => l.status === filter);

  const changeStatus = async (id: number, status: string) => {
    setChangingId(id);
    await fetch(API_URL, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Admin-Token": ADMIN_TOKEN },
      body: JSON.stringify({ id, status }),
    });
    setChangingId(null);
    onReload();
  };

  const countByStatus = (s: string) => leads.filter(l => l.status === s).length;

  return (
    <div>
      {/* Заголовок и счётчики */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold">Заявки партнёров</h2>
          <p className="text-sm text-gray-500">{leads.length} заявок всего</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReload}>
          <Icon name="RefreshCw" size={14} className="mr-1.5" />
          Обновить
        </Button>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter(FILTER_ALL)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            filter === FILTER_ALL
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          }`}
        >
          Все ({leads.length})
        </button>
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === s.value
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {s.label} ({countByStatus(s.value)})
          </button>
        ))}
      </div>

      {/* Список заявок */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Icon name="Inbox" size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Заявок пока нет</p>
          <p className="text-sm mt-1">Они появятся, когда партнёры оставят заявки на сайте</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(lead => {
            const sm = statusMeta(lead.status);
            return (
              <Card key={lead.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Основная информация */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${sm.color}`}>
                        {sm.label}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {PARTNER_TYPE_LABELS[lead.partner_type] ?? lead.partner_type}
                      </Badge>
                      {lead.region && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Icon name="MapPin" size={11} />
                          {lead.region}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">{lead.created_at}</span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base">{lead.company_name}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{lead.contact_name}</p>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Icon name="Phone" size={14} />
                        {lead.phone}
                      </a>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700"
                        >
                          <Icon name="Mail" size={14} />
                          {lead.email}
                        </a>
                      )}
                    </div>

                    {lead.comment && (
                      <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        {lead.comment}
                      </p>
                    )}
                  </div>

                  {/* Смена статуса */}
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    {STATUSES.filter(s => s.value !== lead.status).map(s => (
                      <button
                        key={s.value}
                        disabled={changingId === lead.id}
                        onClick={() => changeStatus(lead.id, s.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 ${s.color} hover:opacity-80`}
                      >
                        {changingId === lead.id ? "..." : `→ ${s.label}`}
                      </button>
                    ))}
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
