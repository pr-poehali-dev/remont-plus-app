import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { formatDate, formatAmount } from "./LegalTypes";
import type { Contract } from "./LegalTypes";

interface Props {
  contracts: Contract[];
  loading: boolean;
  emailSending: boolean;
  emailSent: boolean;
  onSendEmail: () => void;
  onOpenDetail: (c: Contract) => void;
}

function daysColor(days: number) {
  if (days <= 7) return "text-red-600 bg-red-50";
  if (days <= 14) return "text-orange-600 bg-orange-50";
  return "text-yellow-700 bg-yellow-50";
}

export default function LegalReminders({ contracts, loading, emailSending, emailSent, onSendEmail, onOpenDetail }: Props) {
  if (loading) return null;
  if (contracts.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50/50 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <Icon name="Bell" size={16} className="text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-orange-900 text-sm">
              Истекает в ближайшие 30 дней: {contracts.length} {contracts.length === 1 ? "договор" : contracts.length < 5 ? "договора" : "договоров"}
            </p>
            <p className="text-xs text-orange-600">Требуют продления или завершения</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onSendEmail}
          disabled={emailSending || emailSent}
          className="border-orange-300 text-orange-700 hover:bg-orange-100 text-xs h-8 gap-1.5"
        >
          {emailSent ? (
            <><Icon name="CheckCircle" size={13} className="text-green-600" />Отправлено</>
          ) : emailSending ? (
            <><Icon name="Loader2" size={13} className="animate-spin" />Отправка...</>
          ) : (
            <><Icon name="Mail" size={13} />Отправить на почту</>
          )}
        </Button>
      </div>
      <div className="space-y-1.5">
        {contracts.map(c => {
          const days = c.days_left ?? 0;
          const dc = daysColor(days);
          return (
            <div
              key={c.id}
              onClick={() => onOpenDetail(c)}
              className="flex items-center gap-3 bg-white rounded-lg px-3 py-2.5 cursor-pointer hover:shadow-sm transition-shadow"
            >
              <Icon name="FileText" size={15} className="text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                <p className="text-xs text-gray-500 truncate">{c.counterparty_name} · до {formatDate(c.valid_until!)}</p>
              </div>
              {c.amount !== null && (
                <span className="text-xs text-gray-500 shrink-0 hidden sm:block">{formatAmount(c.amount, c.currency)}</span>
              )}
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${dc}`}>
                {days} дн.
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
