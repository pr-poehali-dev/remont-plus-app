import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import SEOMeta from "@/components/SEOMeta";

export default function PaymentFailed() {
  const [params] = useSearchParams();
  const reason = params.get("reason") || "";
  const orderId = params.get("order") || params.get("orderId") || "";

  useEffect(() => {
    try {
      (window as unknown as { ym?: (id: number, action: string, goal: string) => void }).ym?.(106944583, "reachGoal", "payment_failed");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-12">
      <SEOMeta
        title="Оплата не прошла"
        description="Платёж не удалось завершить. Попробуйте ещё раз или свяжитесь с поддержкой."
      />
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-10 pb-8 px-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center mb-6">
            <Icon name="XCircle" className="w-12 h-12 text-rose-600 dark:text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Оплата не прошла</h1>
          <p className="text-muted-foreground mb-6">
            Не удалось завершить платёж. Деньги не списались — попробуйте ещё раз
            или используйте другой способ оплаты.
          </p>

          {(orderId || reason) && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm text-left space-y-1">
              {orderId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Номер заказа</span>
                  <span className="font-mono font-medium">{orderId}</span>
                </div>
              )}
              {reason && (
                <div>
                  <div className="text-muted-foreground mb-1">Причина</div>
                  <div className="font-medium">{reason}</div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Link to="/tariffs">
              <Button className="w-full" size="lg">
                <Icon name="RotateCcw" className="w-4 h-4 mr-2" />
                Попробовать снова
              </Button>
            </Link>
            <Link to="/account">
              <Button variant="outline" className="w-full">
                В личный кабинет
              </Button>
            </Link>
            <a href="https://t.me/+QgiLIa1gFRY4Y2Iy" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="w-full">
                <Icon name="MessageCircle" className="w-4 h-4 mr-2" />
                Связаться с поддержкой
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
