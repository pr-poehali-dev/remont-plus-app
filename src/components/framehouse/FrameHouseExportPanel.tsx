import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

export interface FrameExportState {
  showExportPanel: boolean;
  customer: string;
  contractor: string;
  address: string;
  phone: string;
  email: string;
  docType: "smeta" | "kp";
  validDays: string;
}

interface Props {
  exportState: FrameExportState;
  onExportChange: (patch: Partial<FrameExportState>) => void;
  onPrint: () => void;
}

export default function FrameHouseExportPanel({ exportState, onExportChange, onPrint }: Props) {
  return (
    <div className="p-4">
      <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
        <Icon name="FileText" size={14} />
        Сформировать документ
      </h3>

      <div className="flex gap-2 mb-3">
        {(["smeta", "kp"] as const).map(t => (
          <button
            key={t}
            onClick={() => onExportChange({ docType: t })}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
              exportState.docType === t
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-600 hover:border-green-300"
            }`}
          >
            {t === "smeta" ? "Смета" : "Коммерческое предложение"}
          </button>
        ))}
      </div>

      {!exportState.showExportPanel ? (
        <Button
          variant="outline"
          className="w-full text-sm border-green-200 text-green-700 hover:bg-green-50"
          onClick={() => onExportChange({ showExportPanel: true })}
        >
          <Icon name="ChevronDown" size={14} className="mr-1" />
          Добавить реквизиты
        </Button>
      ) : (
        <div className="space-y-2">
          <div>
            <Label className="text-xs text-gray-600">Заказчик</Label>
            <Input value={exportState.customer} onChange={e => onExportChange({ customer: e.target.value })} placeholder="ФИО или компания" className="h-8 text-sm mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Подрядчик / ваша компания</Label>
            <Input value={exportState.contractor} onChange={e => onExportChange({ contractor: e.target.value })} placeholder="Название компании" className="h-8 text-sm mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Адрес объекта</Label>
            <Input value={exportState.address} onChange={e => onExportChange({ address: e.target.value })} placeholder="Адрес / участок" className="h-8 text-sm mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-600">Телефон</Label>
              <Input value={exportState.phone} onChange={e => onExportChange({ phone: e.target.value })} placeholder="+7 (999)" className="h-8 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Email</Label>
              <Input value={exportState.email} onChange={e => onExportChange({ email: e.target.value })} placeholder="mail@example.com" className="h-8 text-sm mt-1" />
            </div>
          </div>
          {exportState.docType === "kp" && (
            <div>
              <Label className="text-xs text-gray-600">Срок действия (дней)</Label>
              <Input value={exportState.validDays} onChange={e => onExportChange({ validDays: e.target.value })} className="h-8 text-sm mt-1 w-20" />
            </div>
          )}
        </div>
      )}

      <Button onClick={onPrint} className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white text-sm">
        <Icon name="Printer" size={14} className="mr-2" />
        Печать / PDF
      </Button>
    </div>
  );
}
