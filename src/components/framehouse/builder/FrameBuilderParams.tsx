import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import type { FrameHouseSpec } from "@/lib/frameHouseGenerator";
import { NumberField } from "./builderShared";

const STOCK_OPTIONS = [3000, 4000, 6000];

interface Props {
  spec: FrameHouseSpec;
  setSpec: (spec: FrameHouseSpec) => void;
  stockLength: number;
  setStockLength: (v: number) => void;
  kerf: number;
  setKerf: (v: number) => void;
}

export default function FrameBuilderParams({ spec, setSpec, stockLength, setStockLength, kerf, setKerf }: Props) {
  return (
    <div className="lg:col-span-4 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Ruler" className="w-4 h-4 text-orange-500" />
            Габариты
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Длина дома"
              value={spec.length}
              onChange={(v) => setSpec({ ...spec, length: v })}
              step={500}
              min={2000}
            />
            <NumberField
              label="Ширина дома"
              value={spec.width}
              onChange={(v) => setSpec({ ...spec, width: v })}
              step={500}
              min={2000}
            />
            <NumberField
              label="Высота стены"
              value={spec.wallHeight}
              onChange={(v) => setSpec({ ...spec, wallHeight: v })}
              step={100}
              min={2200}
            />
            <NumberField
              label="Шаг стоек"
              value={spec.studPitch}
              onChange={(v) => setSpec({ ...spec, studPitch: v })}
              step={50}
              min={400}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-600 dark:text-slate-400">Этажность</Label>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={spec.floors === f ? "default" : "outline"}
                  onClick={() => setSpec({ ...spec, floors: f as 1 | 2 })}
                >
                  {f} этаж{f === 2 ? "а" : ""}
                </Button>
              ))}
            </div>
          </div>
          <NumberField
            label="Длина перегородок (всего)"
            value={spec.partitionsLength}
            onChange={(v) => setSpec({ ...spec, partitionsLength: v })}
            step={500}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="DoorOpen" className="w-4 h-4 text-orange-500" />
            Проёмы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label="Окон, шт"
              value={spec.windowsCount}
              onChange={(v) => setSpec({ ...spec, windowsCount: v })}
              step={1}
              suffix="шт"
            />
            <NumberField
              label="Ширина окна"
              value={spec.windowWidth}
              onChange={(v) => setSpec({ ...spec, windowWidth: v })}
              step={100}
            />
            <NumberField
              label="Высота окна"
              value={spec.windowHeight}
              onChange={(v) => setSpec({ ...spec, windowHeight: v })}
              step={100}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label="Дверей, шт"
              value={spec.doorsCount}
              onChange={(v) => setSpec({ ...spec, doorsCount: v })}
              step={1}
              suffix="шт"
            />
            <NumberField
              label="Ширина двери"
              value={spec.doorWidth}
              onChange={(v) => setSpec({ ...spec, doorWidth: v })}
              step={50}
            />
            <NumberField
              label="Высота двери"
              value={spec.doorHeight}
              onChange={(v) => setSpec({ ...spec, doorHeight: v })}
              step={50}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Mountain" className="w-4 h-4 text-orange-500" />
            Кровля
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Свес кровли"
              value={spec.roofOverhang}
              onChange={(v) => setSpec({ ...spec, roofOverhang: v })}
              step={50}
            />
            <NumberField
              label="Уклон"
              value={spec.roofPitchDeg}
              onChange={(v) => setSpec({ ...spec, roofPitchDeg: v })}
              step={1}
              suffix="°"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Scissors" className="w-4 h-4 text-orange-500" />
            Параметры раскроя
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-slate-600 dark:text-slate-400">Длина хлыста</Label>
            <div className="grid grid-cols-3 gap-2">
              {STOCK_OPTIONS.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={stockLength === s ? "default" : "outline"}
                  onClick={() => setStockLength(s)}
                >
                  {s / 1000} м
                </Button>
              ))}
            </div>
          </div>
          <NumberField
            label="Пропил (kerf)"
            value={kerf}
            onChange={setKerf}
            step={1}
          />
        </CardContent>
      </Card>
    </div>
  );
}
