import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface City {
  name: string;
  id: string;
}

interface BulkProgress {
  done: number;
  total: number;
  city: string;
  log: string[];
}

interface Props {
  cities: City[];
  bulkRunning: boolean;
  bulkProgress: BulkProgress;
  onStart: () => void;
  onStop: () => void;
}

export default function CompanyParserBulkPanel({ cities, bulkRunning, bulkProgress, onStart, onStop }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="font-semibold text-gray-900 text-sm">Собрать все города сразу</p>
          <p className="text-xs text-gray-400">Поочерёдно обойдёт все 34 города с населением от 500 000 чел.</p>
        </div>
        <div className="flex gap-2 ml-auto">
          {bulkRunning ? (
            <Button onClick={onStop} variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
              <Icon name="Square" size={14} />
              Остановить
            </Button>
          ) : (
            <Button onClick={onStart} disabled={!cities.length} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Icon name="Zap" size={16} />
              Собрать все {cities.length} городов
            </Button>
          )}
        </div>
      </div>

      {(bulkRunning || bulkProgress.log.length > 0) && (
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${bulkProgress.total > 0 ? Math.round(bulkProgress.done / bulkProgress.total * 100) : 0}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {bulkProgress.done} / {bulkProgress.total}
            </span>
          </div>
          {bulkRunning && bulkProgress.city && (
            <p className="text-xs text-orange-600 flex items-center gap-1 mb-2">
              <Icon name="Loader2" size={12} className="animate-spin" />
              Обрабатываю: {bulkProgress.city}...
            </p>
          )}
          <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1">
            {bulkProgress.log.length === 0 ? (
              <p className="text-xs text-gray-400">Ожидаю результатов...</p>
            ) : (
              [...bulkProgress.log].reverse().map((line, i) => (
                <p key={i} className="text-xs text-gray-600 font-mono">{line}</p>
              ))
            )}
          </div>
          {!bulkRunning && bulkProgress.done === bulkProgress.total && bulkProgress.total > 0 && (
            <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
              <Icon name="CheckCircle2" size={14} />
              Готово! Все города обработаны.
            </p>
          )}
        </div>
      )}
    </div>
  );
}