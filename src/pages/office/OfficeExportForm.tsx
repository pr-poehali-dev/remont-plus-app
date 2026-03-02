import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OfficeExportState } from "./officeExportTypes";

interface Props {
  exportState: OfficeExportState;
  onChange: (patch: Partial<OfficeExportState>) => void;
}

export default function OfficeExportForm({ exportState, onChange }: Props) {
  const {
    customer, contractor, address, phone, email,
    foremanName, foremanPhone, supplyName, supplyPhone,
    contractNumber, contractDate, actNumber, actDateFrom, actDateTo,
    docType, validDays,
  } = exportState;

  const isActDoc = docType === "ks2" || docType === "ks3" || docType === "act";

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-xs text-gray-500 mb-1 block">Заказчик</Label>
        <Input value={customer} onChange={e => onChange({ customer: e.target.value })}
          placeholder="ФИО или компания" className="h-8 text-sm" />
      </div>
      <div>
        <Label className="text-xs text-gray-500 mb-1 block">Подрядчик / ваша компания</Label>
        <Input value={contractor} onChange={e => onChange({ contractor: e.target.value })}
          placeholder="Название компании / ИП" className="h-8 text-sm" />
      </div>
      <div>
        <Label className="text-xs text-gray-500 mb-1 block">Адрес объекта</Label>
        <Input value={address} onChange={e => onChange({ address: e.target.value })}
          placeholder="Город, улица, номер" className="h-8 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">Телефон</Label>
          <Input value={phone} onChange={e => onChange({ phone: e.target.value })}
            placeholder="+7..." className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">E-mail</Label>
          <Input value={email} onChange={e => onChange({ email: e.target.value })}
            placeholder="email" className="h-8 text-sm" />
        </div>
      </div>

      {/* Договор */}
      <div className="border-t pt-2">
        <Label className="text-xs text-gray-500 mb-1.5 block font-medium">Реквизиты договора</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input value={contractNumber} onChange={e => onChange({ contractNumber: e.target.value })}
            placeholder="Номер договора" className="h-8 text-sm" />
          <Input value={contractDate} onChange={e => onChange({ contractDate: e.target.value })}
            placeholder="Дата договора" className="h-8 text-sm" />
        </div>
      </div>

      {/* Для актов — период */}
      {isActDoc && (
        <div>
          <Label className="text-xs text-gray-500 mb-1.5 block font-medium">
            Период выполнения работ
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Input value={actNumber} onChange={e => onChange({ actNumber: e.target.value })}
              placeholder="Номер акта" className="h-8 text-sm" />
            <Input value={actDateFrom} onChange={e => onChange({ actDateFrom: e.target.value })}
              placeholder="Дата начала" className="h-8 text-sm" />
            <Input value={actDateTo} onChange={e => onChange({ actDateTo: e.target.value })}
              placeholder="Дата конца" className="h-8 text-sm" />
          </div>
        </div>
      )}

      {/* Прораб */}
      <div className="border-t pt-2">
        <Label className="text-xs text-gray-500 mb-1.5 block font-medium">Прораб</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input value={foremanName} onChange={e => onChange({ foremanName: e.target.value })}
            placeholder="ФИО прораба" className="h-8 text-sm" />
          <Input value={foremanPhone} onChange={e => onChange({ foremanPhone: e.target.value })}
            placeholder="+7..." className="h-8 text-sm" />
        </div>
      </div>

      {/* Снабженец */}
      <div>
        <Label className="text-xs text-gray-500 mb-1.5 block font-medium">Снабженец</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input value={supplyName} onChange={e => onChange({ supplyName: e.target.value })}
            placeholder="ФИО снабженца" className="h-8 text-sm" />
          <Input value={supplyPhone} onChange={e => onChange({ supplyPhone: e.target.value })}
            placeholder="+7..." className="h-8 text-sm" />
        </div>
      </div>

      {docType === "kp" && (
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">Срок действия КП (дней)</Label>
          <Input value={validDays} onChange={e => onChange({ validDays: e.target.value })}
            type="number" min={1} max={365} className="h-8 text-sm w-24" />
        </div>
      )}
    </div>
  );
}
