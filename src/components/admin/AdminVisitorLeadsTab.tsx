import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const VISITOR_LEADS_URL = "https://functions.poehali.dev/536b1902-f1a6-497f-811d-d2fbad49442a";
const ADMIN_TOKEN = "admin2025";

interface Lead {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  source: string | null;
  page_url: string | null;
  consent: boolean;
  created_at: string;
}

export default function AdminVisitorLeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${VISITOR_LEADS_URL}?limit=200`, {
        headers: { "X-Admin-Token": ADMIN_TOKEN },
      });
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleExportCSV = () => {
    const header = "ID;Имя;Телефон;Email;Источник;Страница;Дата";
    const rows = leads.map(l =>
      [l.id, l.name || "", l.phone || "", l.email || "", l.source || "", l.page_url || "", l.created_at.slice(0, 10)].join(";")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `visitor_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const withEmail = leads.filter(l => l.email).length;
  const withPhone = leads.filter(l => l.phone).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Подписчики и лиды</h2>
          <p className="text-sm text-gray-500 mt-0.5">Контакты посетителей сайта, собранные через форму подписки</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={load} variant="outline" size="sm" className="gap-2">
            <Icon name="RefreshCw" size={14} />
            Обновить
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2" disabled={leads.length === 0}>
            <Icon name="Download" size={14} />
            Скачать CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-extrabold text-gray-900">{total}</p>
          <p className="text-sm text-gray-500 mt-1">Всего подписчиков</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-extrabold text-green-600">{withEmail}</p>
          <p className="text-sm text-gray-500 mt-1">С email</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-extrabold text-blue-500">{withPhone}</p>
          <p className="text-sm text-gray-500 mt-1">С телефоном</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={28} className="animate-spin text-gray-400" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Icon name="Users" size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Пока нет подписчиков</p>
            <p className="text-sm mt-1">Всплывающая форма начнёт собирать контакты посетителей</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Имя</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Телефон</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Источник</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Дата</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l, i) => (
                  <tr key={l.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{l.name || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3">
                      {l.phone ? (
                        <a href={`tel:${l.phone}`} className="text-blue-600 hover:underline">{l.phone}</a>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {l.email ? (
                        <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline">{l.email}</a>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-lg">
                        {l.source || "popup"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {l.created_at ? new Date(l.created_at).toLocaleString("ru-RU") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}