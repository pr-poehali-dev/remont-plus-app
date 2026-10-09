import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { CALC_REGIONS } from "@/components/calculator/shared/regions";
import { SEASONS, autoSeasonLabel } from "@/components/calculator/shared/seasonality";
import type { SeasonId } from "@/components/calculator/shared/seasonality";
import OverheadsPanel from "@/components/calculator/shared/OverheadsPanel";
import type { OverheadState } from "@/components/calculator/shared/overheads";

interface Props {
  mode: "estimate" | "analyze";
  regionId: string;
  onRegionChange: (id: string) => void;
  seasonId: SeasonId;
  onSeasonChange: (id: SeasonId) => void;
  workCoeff: number;
  sCoeff: number;
  markupPct: number;
  onMarkupChange: (v: number) => void;
  profitPct: number;
  onProfitChange: (v: number) => void;
  overheads: OverheadState;
  onOverheadsChange: (next: OverheadState) => void;
  onRun: () => void;
  loading: boolean;
  parsing: boolean;
}

export default function TenderParamsCard({
  mode,
  regionId,
  onRegionChange,
  seasonId,
  onSeasonChange,
  workCoeff,
  sCoeff,
  markupPct,
  onMarkupChange,
  profitPct,
  onProfitChange,
  overheads,
  onOverheadsChange,
  onRun,
  loading,
  parsing,
}: Props) {
  return mode === "estimate" ? (
    <Card className="p-5 space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase">3. Параметры расчёта</p>

      <div>
        <label className="text-xs text-gray-500">Регион</label>
        <select
          value={regionId}
          onChange={(e) => onRegionChange(e.target.value)}
          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          {CALC_REGIONS.map((r) => (
            <option key={r.id} value={r.id}>{r.label} (×{r.coeff})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-500">Сезон (влияет на работы)</label>
        <select
          value={seasonId}
          onChange={(e) => onSeasonChange(e.target.value as SeasonId)}
          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="auto">Авто по месяцу — {autoSeasonLabel()}</option>
          {SEASONS.map((s) => (
            <option key={s.id} value={s.id}>{s.label} (×{s.coeff})</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Работы × {workCoeff.toFixed(2)} (регион × сезон {sCoeff.toFixed(2)})
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Наценка, %</label>
          <input
            type="number"
            min={0}
            max={200}
            value={markupPct}
            onChange={(e) => onMarkupChange(Math.max(0, Math.min(200, parseFloat(e.target.value) || 0)))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Сметная прибыль, %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={profitPct}
            onChange={(e) => onProfitChange(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <OverheadsPanel value={overheads} onChange={onOverheadsChange} className="pt-1" />

      <Button onClick={onRun} disabled={loading || parsing} className="w-full bg-teal-600 hover:bg-teal-700">
        {loading ? (
          <><Icon name="LoaderCircle" size={16} className="animate-spin mr-2" /> Считаем смету…</>
        ) : (
          <><Icon name="Calculator" size={16} className="mr-2" /> Рассчитать смету</>
        )}
      </Button>
    </Card>
  ) : (
    <Card className="p-5">
      <Button onClick={onRun} disabled={loading || parsing} className="w-full bg-indigo-600 hover:bg-indigo-700">
        {loading ? (
          <><Icon name="LoaderCircle" size={16} className="animate-spin mr-2" /> Анализируем смету…</>
        ) : (
          <><Icon name="ChartLine" size={16} className="mr-2" /> Проанализировать смету</>
        )}
      </Button>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Покажем вашу прибыль по позициям, риски и забытые работы
      </p>
    </Card>
  );
}
