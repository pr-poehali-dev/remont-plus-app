import { Order } from "@/types";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Props {
  orders: Order[];
  customerName?: string;
}

const STATUS_LABEL: Record<Order["status"], string> = {
  new: "Ожидает сборки",
  in_progress: "В работе",
  completed: "Выполнена",
};

const STATUS_COLOR: Record<Order["status"], string> = {
  new: "bg-orange-100 text-orange-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

const STATUS_ICON: Record<Order["status"], string> = {
  new: "Clock",
  in_progress: "Zap",
  completed: "CheckCircle",
};

export default function CustomerOrdersPage({ orders }: Props) {
  const active = orders.filter((o) => o.status !== "completed");
  const done = orders.filter((o) => o.status === "completed");

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ru-RU", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });

  const OrderCard = ({ order }: { order: Order }) => (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs font-mono text-muted-foreground mb-1">{order.id}</div>
          <div className={cn(
            "inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium",
            STATUS_COLOR[order.status]
          )}>
            <Icon name={STATUS_ICON[order.status]} size={11} />
            {STATUS_LABEL[order.status]}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
      </div>
      <div className="space-y-1.5 mt-3">
        {order.items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span className="text-muted-foreground truncate mr-4">{item.productName}</span>
            <span className="shrink-0">{item.volume} л × {item.quantity} шт</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Мои заявки</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{active.length} активных заявок</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="FileText" size={32} className="mx-auto mb-3 opacity-30" />
          <p className="mb-4">У вас пока нет заявок</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Активные</h2>
              <div className="space-y-3">
                {active.map((o) => <OrderCard key={o.id} order={o} />)}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Завершённые</h2>
              <div className="space-y-3 opacity-70">
                {done.map((o) => <OrderCard key={o.id} order={o} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
