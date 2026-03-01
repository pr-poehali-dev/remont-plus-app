import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { EgrulData } from "./types";

interface EgrulBadgeProps {
  data?: EgrulData;
}

export function EgrulBadge({ data }: EgrulBadgeProps) {
  if (!data) return null;
  if (data.error) return <span className="text-xs text-red-400">{data.error}</span>;
  const color = data.status === "Действующая" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700";
  return <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${color}`}>{data.status}</span>;
}

interface Props {
  withInnCount: number;
  enriching: boolean;
  onEnrich: () => void;
}

export default function EgrulEnrichCard({ withInnCount, enriching, onEnrich }: Props) {
  return (
    <Card className="p-5 border-indigo-200 bg-indigo-50/40">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h2 className="font-semibold flex items-center gap-2 text-indigo-900">
            <Icon name="Building2" size={16} />
            Обогатить данные через ЕГРЮЛ
          </h2>
          <p className="text-sm text-indigo-700 mt-1">
            По найденным ИНН получим: официальное название, статус компании, руководителя, ОГРН, КПП, дату регистрации и юридический адрес.
          </p>
          {withInnCount > 0 && (
            <p className="text-xs text-indigo-500 mt-1">
              Найдено ИНН для обогащения: <strong>{withInnCount}</strong> компаний
            </p>
          )}
        </div>
        <Button
          onClick={onEnrich}
          disabled={enriching || withInnCount === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
          size="sm"
        >
          {enriching ? (
            <><Icon name="Loader2" size={14} className="mr-1.5 animate-spin" />Загружаю...</>
          ) : (
            <><Icon name="Sparkles" size={14} className="mr-1.5" />Запросить ЕГРЮЛ ({withInnCount})</>
          )}
        </Button>
      </div>
    </Card>
  );
}
