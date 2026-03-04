import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

export type BathDocType = "smeta" | "kp" | "contract" | "ks2" | "ks3" | "act";

export interface ExportState {
  showExportPanel: boolean;
  customer: string;
  contractor: string;
  address: string;
  phone: string;
  email: string;
  inn: string;
  docType: BathDocType;
  validDays: string;
  startDate: string;
  endDate: string;
  contractNum: string;
  contractDate: string;
  advancePct: string;
  warrantyMonths: string;
}

interface Props {
  exportState: ExportState;
  onExportChange: (patch: Partial<ExportState>) => void;
  onPrint: () => void;
}

const DOC_TYPES: { type: BathDocType; label: string; icon: string }[] = [
  { type: "smeta",    label: "Смета",    icon: "ClipboardList" },
  { type: "kp",      label: "КП",       icon: "Handshake" },
  { type: "contract",label: "Договор",  icon: "FileSignature" },
  { type: "ks2",     label: "КС-2",     icon: "ClipboardCheck" },
  { type: "ks3",     label: "КС-3",     icon: "BarChart2" },
  { type: "act",     label: "Акт",      icon: "CheckSquare" },
];

const CONTRACT_DOCS: BathDocType[] = ["contract", "ks2", "ks3", "act"];

export default function BathHouseExportPanel({ exportState, onExportChange, onPrint }: Props) {
  const { showExportPanel, customer, contractor, address, phone, email, inn, docType, validDays,
    startDate, endDate, contractNum, contractDate, advancePct, warrantyMonths } = exportState;
  const isContract = CONTRACT_DOCS.includes(docType);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
          <Icon name="Printer" size={14} className="text-amber-600" />
          Документы
        </h3>
        <button
          onClick={() => onExportChange({ showExportPanel: !showExportPanel })}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {showExportPanel ? "Скрыть" : "Реквизиты"}
        </button>
      </div>

      {/* Выбор типа документа */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {DOC_TYPES.map(d => (
          <button
            key={d.type}
            onClick={() => onExportChange({ docType: d.type })}
            className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-[11px] font-medium border-2 transition-all ${
              docType === d.type
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-gray-200 text-gray-500 hover:border-amber-300"
            }`}
          >
            <Icon name={d.icon as Parameters<typeof Icon>[0]["name"]} size={13} />
            {d.label}
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
            <Label className="text-xs text-gray-500 mb-1 block">Подрядчик</Label>
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
              <Label className="text-xs text-gray-500 mb-1 block">Email</Label>
              <Input value={email} onChange={e => onExportChange({ email: e.target.value })} placeholder="email" className="h-8 text-sm" />
            </div>
          </div>
          {(docType === "kp" || isContract) && (
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">ИНН подрядчика</Label>
              <Input value={inn} onChange={e => onExportChange({ inn: e.target.value })} placeholder="7701234567" className="h-8 text-sm" />
            </div>
          )}
          {docType === "kp" && (
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Срок действия КП (дней)</Label>
              <Input value={validDays} onChange={e => onExportChange({ validDays: e.target.value })} type="number" className="h-8 text-sm" />
            </div>
          )}
          {isContract && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">№ договора</Label>
                  <Input value={contractNum} onChange={e => onExportChange({ contractNum: e.target.value })} placeholder="001/2025" className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Дата договора</Label>
                  <Input value={contractDate} onChange={e => onExportChange({ contractDate: e.target.value })} type="date" className="h-8 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Начало работ</Label>
                  <Input value={startDate} onChange={e => onExportChange({ startDate: e.target.value })} type="date" className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Конец работ</Label>
                  <Input value={endDate} onChange={e => onExportChange({ endDate: e.target.value })} type="date" className="h-8 text-sm" />
                </div>
              </div>
              {docType === "contract" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Аванс (%)</Label>
                    <Input value={advancePct} onChange={e => onExportChange({ advancePct: e.target.value })} type="number" placeholder="30" className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Гарантия (мес.)</Label>
                    <Input value={warrantyMonths} onChange={e => onExportChange({ warrantyMonths: e.target.value })} type="number" placeholder="12" className="h-8 text-sm" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" onClick={onPrint}>
        <Icon name="Printer" size={15} className="mr-2" />
        Открыть / Печать PDF
      </Button>
    </div>
  );
}
