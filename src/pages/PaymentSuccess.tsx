import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import SEOMeta from "@/components/SEOMeta";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("order") || params.get("orderId") || "";
  const amount = params.get("amount") || "";

  useEffect(() => {
    try {
      (window as unknown as { ym?: (id: number, action: string, goal: string) => void }).ym?.(106944583, "reachGoal", "payment_success");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-12">
      <SEOMeta
        title="Оплата прошла успешно"
        description="Спасибо! Ваш платёж принят, можно вернуться в личный кабинет."
      />
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-10 pb-8 px-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-6">
            <Icon name="CheckCircle2" className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Оплата прошла успешно</h1>
          <p className="text-muted-foreground mb-6">
            Спасибо! Платёж принят. Доступ к услуге уже активирован.
          </p>

          {(orderId || amount) && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm text-left space-y-1">
              {orderId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Номер заказа</span>
                  <span className="font-mono font-medium">{orderId}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Сумма</span>
                  <span className="font-medium">{amount} ₽</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Link to="/account">
              <Button className="w-full" size="lg">
                <Icon name="User" className="w-4 h-4 mr-2" />
                В личный кабинет
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="w-full">
                На главную
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}