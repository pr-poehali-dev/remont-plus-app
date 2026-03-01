import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

export interface ExportState {
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
  exportState: ExportState;
  onExportChange: (patch: Partial<ExportState>) => void;
  onPrint: () => void;
}

export default function BathHouseExportPanel({ exportState, onExportChange, onPrint }: Props) {
  const { showExportPanel, customer, contractor, address, phone, email, docType, validDays } = exportState;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
          <Icon name="Printer" size={14} className="text-amber-600" />
          Печать сметы
        </h3>
        <button
          onClick={() => onExportChange({ showExportPanel: !showExportPanel })}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {showExportPanel ? "Скрыть" : "Настроить"}
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        {(["smeta", "kp"] as const).map(t => (
          <button
            key={t}
            onClick={() => onExportChange({ docType: t })}
            className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
              docType === t ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 text-gray-600"
            }`}
          >
            {t === "smeta" ? "📋 Смета" : "📄 Коммерческое предложение"}
          </button>
        ))}
      </div>

      {showExportPanel && (
        <div className="space-y-2 mb-3">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Заказчик</Label>
            <Input value={customer} onChange={e => onExportChange({ customer: e.target.value })} placeholder="ФИО или компания" className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Подрядчик / ваше название</Label>
            <Input value={contractor} onChange={e => onExportChange({ contractor: e.target.value })} placeholder="Название компании / ИП" className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Адрес объекта</Label>
            <Input value={address} onChange={e => onExportChange({ address: e.target.value })} placeholder="Адрес строительства" className="h-8 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Телефон</Label>
              <Input value={phone} onChange={e => onExportChange({ phone: e.target.value })} placeholder="+7..." className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">E-mail</Label>
              <Input value={email} onChange={e => onExportChange({ email: e.target.value })} placeholder="email" className="h-8 text-sm" />
            </div>
          </div>
          {docType === "kp" && (
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Срок действия КП (дней)</Label>
              <Input value={validDays} onChange={e => onExportChange({ validDays: e.target.value })} type="number" min={1} max={365} className="h-8 text-sm" />
            </div>
          )}
        </div>
      )}

      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" onClick={onPrint}>
        <Icon name="Printer" size={15} className="mr-2" />
        Печать / Сохранить PDF
      </Button>
    </div>
  );
}
