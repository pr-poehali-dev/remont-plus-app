import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import {
  CONSTRUCTION_TYPES, PROFILE_SYSTEMS,
} from "@/components/calculator/windows/WindowTypes";
import type { WindowConfig } from "@/components/calculator/windows/WindowTypes";
import { fmt } from "@/components/calculator/windows/windowUtils";
import EstimateActions from "@/components/calculator/EstimateActions";

interface Props {
  configs: WindowConfig[];
  cfg: Omit<WindowConfig, "id" | "totalPrice">;
  price: number;
  markupPct: number;
  totalSum: number;
  onRemove: (id: string) => void;
  onShowExport: () => void;
}

export default function WindowsConfigsList({
  configs,
  cfg,
  price,
  markupPct,
  totalSum,
  onRemove,
  onShowExport,
}: Props) {
  if (configs.length === 0) return null;

  return (
    <Card className="p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Список позиций
        <Badge className="ml-2 bg-blue-100 text-blue-700 border-blue-200">{configs.length}</Badge>
      </p>
      <div className="space-y-2">
        {configs.map((c) => {
          const ct = CONSTRUCTION_TYPES.find(x => x.value === c.constructionType);
          const pf = PROFILE_SYSTEMS.find(x => x.id === c.profileSystemId);
          return (
            <div key={c.id} className="flex items-start justify-between gap-2 text-xs border-b pb-2 last:border-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{ct?.label}</p>
                <p className="text-gray-500">{c.width}×{c.height}{c.hasTransom && c.constructionType !== "transom" ? ` +фр.${c.transomHeight}` : ""} · {pf?.brand} · {c.quantity} шт.</p>
                <p className="text-blue-600 font-semibold">{fmt(c.totalPrice)} ₽</p>
              </div>
              <button
                onClick={() => onRemove(c.id)}
                className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
              >
                <Icon name="Trash2" size={13} />
              </button>
            </div>
          );
        })}
        <div className="flex justify-between font-bold text-sm pt-2 border-t">
          <span>Итого</span>
          <span className="text-blue-700">{fmt(totalSum)} ₽</span>
        </div>
      </div>
      <Button
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
        onClick={onShowExport}
      >
        <Icon name="FileText" size={15} className="mr-2" />
        Создать документ
      </Button>
      <div className="mt-3 pt-3 border-t">
        <EstimateActions
          onPrint={() => {
            const now = new Date();
            const exportConfigs = configs.length > 0
              ? configs
              : [{ ...cfg, id: `win-${Date.now()}`, totalPrice: price }];
            const exportTotal = exportConfigs.reduce((s, c) => s + c.totalPrice, 0);
            const printState = {
              configs: exportConfigs,
              markupPct,
              totalSum: exportTotal,
              docNum: String(now.getTime()).slice(-6),
              date: now.toLocaleDateString("ru-RU"),
              docType: "smeta" as const,
            };
            sessionStorage.setItem("windows_print_state", JSON.stringify(printState));
            window.open("/windows/print", "_blank");
          }}
          calcName="Окна и остекление"
          totalSum={totalSum}
          items={configs.map(c => {
            const ct = CONSTRUCTION_TYPES.find(x => x.value === c.constructionType);
            return { name: `${ct?.label ?? "Окно"} ${c.width}x${c.height} x${c.quantity}`, price: c.totalPrice };
          })}
          params={{
            "Позиций": `${configs.length}`,
            ...(markupPct > 0 ? { "Наценка": `${markupPct}%` } : {}),
          }}
        />
      </div>
    </Card>
  );
}
