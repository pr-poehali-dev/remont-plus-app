import { Order } from "@/types";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Props {
  orders: Order[];
  role: "assembler" | "customer";
}

const STATUS_LABEL: Record<Order["status"], string> = {
  new: "Новая",
  in_progress: "В работе",
  completed: "Выполнена",
};

const STATUS_ICON: Record<Order["status"], string> = {
  new: "Clock",
  in_progress: "Loader",
  completed: "CheckCircle",
};

const STATUS_COLOR: Record<Order["status"], string> = {
  new: "text-orange-500",
  in_progress: "text-blue-500",
  completed: "text-green-500",
};

export default function HistoryPage({ orders, role }: Props) {
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">История операций</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Все заявки в хронологическом порядке</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="History" size={32} className="mx-auto mb-3 opacity-30" />
          <p>История пуста</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {orders.map((order, i) => (
              <div key={order.id} className="relative pl-14 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className={cn(
                  "absolute left-3.5 top-3 w-3 h-3 rounded-full border-2 border-background bg-current",
                  STATUS_COLOR[order.status]
                )} />
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                        <Icon name={STATUS_ICON[order.status]} size={12} className={STATUS_COLOR[order.status]} />
                        <span className={cn("text-xs font-medium", STATUS_COLOR[order.status])}>
                          {STATUS_LABEL[order.status]}
                        </span>
                      </div>
                      <div className="font-medium text-sm">{order.customerName}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
