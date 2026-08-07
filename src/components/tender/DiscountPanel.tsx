import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import type { DiscountState } from "./tenderTotals";

interface Props {
  value: DiscountState;
  onChange: (next: DiscountState) => void;
  /** итог до скидки — для показа суммы скидки */
  totalBeforeDiscount?: number;
  discountAmount?: number;
}

const QUICK = [0, 3, 5, 7, 10, 15];

export default function DiscountPanel({ value, onChange, discountAmount = 0 }: Props) {
  return (
    <Card className="p-4">
      <p className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
        <Icon name="BadgePercent" size={16} className="text-red-500" /> Скидка заказчику
      </p>

      <div className="grid grid-cols-2 gap-1 mb-3 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onChange({ ...value, mode: "percent" })}
          className={`rounded-md py-1.5 text-xs font-medium transition ${
            value.mode === "percent" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Процент %
        </button>
        <button
          onClick={() => onChange({ ...value, mode: "amount" })}
          className={`rounded-md py-1.5 text-xs font-medium transition ${
            value.mode === "amount" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Сумма ₽
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          value={value.value || ""}
          placeholder="0"
          onChange={(e) => onChange({ ...value, value: Math.max(0, Number(e.target.value) || 0) })}
          className="h-9 text-sm tabular-nums"
        />
        <span className="text-sm text-gray-500 w-4">{value.mode === "percent" ? "%" : "₽"}</span>
      </div>

      {value.mode === "percent" && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => onChange({ mode: "percent", value: q })}
              className={`px-2 py-1 rounded-md text-xs border transition ${
                value.value === q
                  ? "bg-red-50 border-red-300 text-red-600 font-medium"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {q === 0 ? "без скидки" : `${q}%`}
            </button>
          ))}
        </div>
      )}

      {discountAmount > 0 && (
        <p className="text-xs text-red-600 mt-2.5 font-medium">
          Скидка: − {Math.round(discountAmount).toLocaleString("ru-RU")} ₽
        </p>
      )}
      <p className="text-xs text-gray-400 mt-2">Скидка вычитается из итога и попадёт в Excel, КП и договор.</p>
    </Card>
  );
}
