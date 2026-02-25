import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Stage, STATUS_CONFIG, fmt, fmtDays, diffLabel } from "./OrganizerTypes";

function PlanFactCell({ label, value, diff, positive }: { label: string; value: string; diff?: string; positive?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
      {diff && <p className={`text-xs font-medium ${positive ? "text-green-600" : "text-red-600"}`}>{diff}</p>}
    </div>
  );
}

interface Props {
  stage: Stage;
  index: number;
  onClick: (stage: Stage) => void;
}

export default function OrganizerStageCard({ stage: s, index: idx, onClick }: Props) {
  const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
  const budgetDiff = diffLabel(s.plan_amount, s.fact_amount);
  const daysDiff = diffLabel(s.plan_days, s.fact_days, "дн.", true);

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow border hover:border-orange-200"
      onClick={() => onClick(s)}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-sm font-bold text-orange-600">
          {idx + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
              <Icon name={cfg.icon} size={11} />
              {cfg.label}
            </span>
          </div>
          {s.description && <p className="text-xs text-gray-500 mb-2 line-clamp-1">{s.description}</p>}

          {s.checkpoints && s.checkpoints.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {s.checkpoints.map((cp, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{cp}</span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            <PlanFactCell label="Дни (план)" value={fmtDays(s.plan_days)} />
            <PlanFactCell
              label="Дни (факт)"
              value={fmtDays(s.fact_days)}
              diff={daysDiff?.label}
              positive={daysDiff?.positive}
            />
            <PlanFactCell label="Сумма (план)" value={fmt(s.plan_amount)} />
            <PlanFactCell
              label="Сумма (факт)"
              value={fmt(s.fact_amount)}
              diff={budgetDiff?.label}
              positive={budgetDiff?.positive}
            />
          </div>

          {s.comment && (
            <p className="text-xs text-gray-500 mt-2 italic">💬 {s.comment}</p>
          )}
        </div>
        <Icon name="ChevronRight" size={16} className="text-gray-400 shrink-0 mt-1" />
      </div>
    </Card>
  );
}
