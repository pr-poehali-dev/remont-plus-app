import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { trackCalcEvent } from "@/hooks/useCalcTracking";

interface Props {
  calcType: string;
  total?: string;
  onClose?: () => void;
}

type Status = "idle" | "sending" | "success" | "error";

export default function CalcOrderForm({ calcType, total, onClose }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("https://functions.poehali.dev/e155a53f-72bf-4c18-8aec-b9bd60565215", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, comment, calc_type: calcType, total }),
      });
      await res.json();
      if (res.ok) {
        trackCalcEvent(calcType, 'lead');
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Icon name="CheckCircle2" size={24} className="text-green-600" />
        </div>
        <p className="font-semibold text-gray-900 mb-1">Заявка отправлена!</p>
        <p className="text-sm text-gray-500">Мы свяжемся с вами в ближайшее время</p>
        {onClose && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onClose}>
            Закрыть
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
          <Icon name="Send" size={17} className="text-orange-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Оставить заявку на выполнение работ</p>
          {total && (
            <p className="text-xs text-gray-500">Стоимость по расчёту: <span className="font-medium text-orange-600">{total}</span></p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          required
          type="tel"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Телефон *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          placeholder="Комментарий (необязательно)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {status === "error" && (
          <p className="text-sm text-red-500 flex items-center gap-1.5">
            <Icon name="AlertCircle" size={14} />
            Ошибка отправки. Попробуйте ещё раз.
          </p>
        )}

        <Button
          type="submit"
          disabled={status === "sending" || !phone.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {status === "sending" ? (
            <>
              <Icon name="Loader2" size={15} className="mr-2 animate-spin" />
              Отправляю...
            </>
          ) : (
            <>
              <Icon name="Send" size={15} className="mr-2" />
              Отправить заявку
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-400">
          Нажимая кнопку, вы соглашаетесь на обработку персональных данных
        </p>
      </form>
    </div>
  );
}