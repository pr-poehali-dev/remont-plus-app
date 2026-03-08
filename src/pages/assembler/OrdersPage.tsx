import { useState } from "react";
import { Order } from "@/types";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Props {
  orders: Order[];
  onUpdateStatus: (id: string, status: Order["status"]) => void;
  onDelete: (id: string) => void;
}

const STATUS_LABEL: Record<Order["status"], string> = {
  new: "Новая",
  in_progress: "В работе",
  completed: "Выполнена",
};

const STATUS_COLOR: Record<Order["status"], string> = {
  new: "bg-orange-100 text-orange-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

export default function OrdersPage({ orders, onUpdateStatus, onDelete }: Props) {
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = orders.filter((o) => filter === "all" || o.status === filter);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
      setExpanded(null);
    } else {
      setConfirmDelete(id);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Заявки</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {orders.filter((o) => o.status === "new").length} новых заявок
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "new", "in_progress", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "all" ? "Все" : STATUS_LABEL[f]}
            <span className="ml-1.5 opacity-60">
              {f === "all" ? orders.length : orders.filter((o) => o.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="ClipboardList" size={32} className="mx-auto mb-3 opacity-30" />
          <p>Заявок нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => (
            <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-200">
              <button
                onClick={() => { setExpanded(expanded === order.id ? null : order.id); setConfirmDelete(null); }}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground shrink-0">{order.id}</span>
                  <span className="font-medium text-sm truncate">{order.customerName}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", STATUS_COLOR[order.status])}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs text-muted-foreground hidden sm:block">{formatDate(order.createdAt)}</span>
                  <Icon name={expanded === order.id ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
                </div>
              </button>

              {expanded === order.id && (
                <div className="px-5 pb-5 border-t border-border animate-fade-in">
                  <div className="mt-4 mb-4 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="text-sm">{item.productName}</span>
                        <span className="font-medium text-sm">{item.quantity} л</span>
                      </div>
                    ))}
                  </div>
                  {order.comment && (
                    <div className="bg-secondary rounded-md px-3 py-2 text-sm text-muted-foreground mb-4">
                      {order.comment}
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap items-center">
                    {order.status === "new" && (
                      <button
                        onClick={() => onUpdateStatus(order.id, "in_progress")}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        Взять в работу
                      </button>
                    )}
                    {order.status === "in_progress" && (
                      <button
                        onClick={() => onUpdateStatus(order.id, "completed")}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-700 transition-colors"
                      >
                        Завершить
                      </button>
                    )}
                    {order.status === "completed" && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <Icon name="CheckCircle" size={14} />
                        Заявка выполнена
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(order.id)}
                      className={cn(
                        "ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        confirmDelete === order.id
                          ? "bg-red-600 text-white"
                          : "text-muted-foreground hover:text-red-600 hover:bg-red-50"
                      )}
                    >
                      <Icon name="Trash2" size={13} />
                      {confirmDelete === order.id ? "Подтвердить удаление" : "Удалить"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
