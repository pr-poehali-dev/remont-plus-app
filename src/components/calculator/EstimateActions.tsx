import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import reachGoal from "@/lib/metrika";

const NOTIFY_EMAIL_URL =
  "https://functions.poehali.dev/a8b87e78-89d1-48d8-ba76-8da2e0df32a3";

interface EstimateActionsProps {
  onPrint: () => void;
  calcName: string;
  totalSum: number;
  items: { name: string; price: number }[];
  params?: Record<string, string>;
  customer?: string;
  contractor?: string;
  address?: string;
}

export default function EstimateActions({
  onPrint,
  calcName,
  totalSum,
  items,
  params,
  customer,
  contractor,
  address,
}: EstimateActionsProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSendEmail = async () => {
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch(NOTIFY_EMAIL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_estimate",
          to_email: email,
          subject: `Смета: ${calcName}`,
          calc_name: calcName,
          total_sum: totalSum,
          items: items,
          params: params || {},
          customer: customer || "",
          contractor: contractor || "",
          address: address || "",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        reachGoal("estimate_email", { calc_name: calcName });
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
          setShowEmailForm(false);
          setEmail("");
        }, 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendEmail();
    }
  };

  return (
    <div className="space-y-3">
      {/* Action buttons row */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPrint()}
          className="gap-1.5"
        >
          <Icon name="Printer" size={15} />
          Распечатать
        </Button>

        <Button
          variant={showEmailForm ? "secondary" : "outline"}
          size="sm"
          onClick={() => {
            setShowEmailForm((v) => !v);
            setStatus("idle");
          }}
          className="gap-1.5"
        >
          <Icon name="Mail" size={15} />
          Отправить на email
        </Button>
      </div>

      {/* Email form dropdown */}
      {showEmailForm && (
        <div className="flex items-center gap-2 flex-wrap rounded-lg border border-input bg-background p-2.5">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="email@example.com"
            className="h-9 flex-1 min-w-[200px] text-sm"
            disabled={status === "loading"}
          />
          <Button
            size="sm"
            onClick={handleSendEmail}
            disabled={!email || status === "loading"}
            className="gap-1.5 h-9"
            variant={
              status === "success"
                ? "default"
                : status === "error"
                  ? "destructive"
                  : "default"
            }
          >
            {status === "loading" && (
              <>
                <Icon name="Loader2" size={14} className="animate-spin" />
                Отправка...
              </>
            )}
            {status === "success" && (
              <>
                <Icon name="Check" size={14} />
                Отправлено
              </>
            )}
            {status === "error" && (
              <>
                <Icon name="X" size={14} />
                Ошибка
              </>
            )}
            {status === "idle" && (
              <>
                <Icon name="Send" size={14} />
                Отправить
              </>
            )}
          </Button>

          {status === "error" && (
            <p className="w-full text-xs text-destructive mt-1">
              Не удалось отправить. Проверьте email и попробуйте снова.
            </p>
          )}
          {status === "success" && (
            <p className="w-full text-xs text-green-600 mt-1">
              Смета отправлена на {email}
            </p>
          )}
        </div>
      )}
    </div>
  );
}