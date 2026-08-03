import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { listEstimates, deleteEstimate, type SavedEstimateMeta } from "./tenderStorage";

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU");
const fmtDate = (s: string) => {
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
};

interface Props {
  onClose: () => void;
  onOpen: (id: number, duplicate?: boolean) => void;
}

export default function MyEstimatesModal({ onClose, onOpen }: Props) {
  const [items, setItems] = useState<SavedEstimateMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    listEstimates()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: number) => {
    setBusyId(id);
    try {
      await deleteEstimate(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Icon name="FolderOpen" size={18} className="text-teal-600" /> Мои сметы
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-3">
          {loading ? (
            <div className="py-12 text-center text-gray-400">
              <Icon name="LoaderCircle" size={22} className="animate-spin mx-auto mb-2" />
              <p className="text-sm">Загружаем…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Icon name="FileX" size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Сохранённых смет пока нет</p>
              <p className="text-xs mt-1">Рассчитайте смету и нажмите «Сохранить»</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id} className="border border-gray-200 rounded-xl p-3 hover:border-teal-300 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{it.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 ${it.mode === "analyze" ? "text-indigo-600" : "text-teal-600"}`}>
                          <Icon name={it.mode === "analyze" ? "ChartLine" : "Calculator"} size={12} />
                          {it.mode === "analyze" ? "Анализ" : "Смета"}
                        </span>
                        · {fmtDate(it.updated_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-teal-700 tabular-nums">{fmt(it.total)} ₽</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 h-8 bg-teal-600 hover:bg-teal-700" onClick={() => onOpen(it.id)}>
                      <Icon name="FolderInput" size={14} className="mr-1.5" /> Открыть
                    </Button>
                    <Button size="sm" variant="outline" className="h-8" onClick={() => onOpen(it.id, true)} title="Создать копию">
                      <Icon name="Copy" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-red-500 hover:text-red-600 hover:border-red-300"
                      disabled={busyId === it.id}
                      onClick={() => handleDelete(it.id)}
                      title="Удалить"
                    >
                      {busyId === it.id ? <Icon name="LoaderCircle" size={14} className="animate-spin" /> : <Icon name="Trash2" size={14} />}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
