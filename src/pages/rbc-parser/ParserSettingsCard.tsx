import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { RBC_CATEGORIES } from "./types";

interface Props {
  category: string;
  setCategory: (v: string) => void;
  pageTo: number;
  setPageTo: (v: number) => void;
  loading: boolean;
  phase: "idle" | "list" | "detail" | "done";
  progress: { current: number; total: number };
  error: string;
  onCollect: () => void;
}

export default function ParserSettingsCard({
  category, setCategory, pageTo, setPageTo,
  loading, phase, progress, error, onCollect,
}: Props) {
  return (
    <Card className="p-5">
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        <Icon name="Settings" size={16} />
        Параметры сбора — РБК Компании
      </h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Label className="text-sm mb-1.5 block">Категория (slug из URL)</Label>
          <Input value={category} onChange={e => setCategory(e.target.value)} className="font-mono text-sm" />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Количество страниц</Label>
          <Input
            type="number" min={1} max={20} value={pageTo}
            onChange={e => setPageTo(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
          />
          <p className="text-xs text-gray-400 mt-1">~10–20 компаний на странице</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-gray-400 self-center">Быстрый выбор:</span>
        {RBC_CATEGORIES.map(cat => (
          <button
            key={cat.slug} type="button" onClick={() => setCategory(cat.slug)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
              category === cat.slug
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-200 text-gray-600 hover:border-blue-400"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <Icon name="AlertCircle" size={15} />
          {error}
        </div>
      )}

      <Button onClick={onCollect} disabled={loading || !category} className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
        {loading ? (
          <>
            <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
            {phase === "list" && "Собираю список..."}
            {phase === "detail" && `Загружаю детали... ${progress.current}/${progress.total}`}
          </>
        ) : (
          <><Icon name="Play" size={16} className="mr-2" />Начать сбор с РБК</>
        )}
      </Button>
    </Card>
  );
}
