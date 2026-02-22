import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

type DocType = "smeta" | "kp";

interface ExportDialogProps {
  onConfirm: (data: {
    customer: string;
    contractor: string;
    address: string;
    phone: string;
    email: string;
    validDays: string;
    docType: DocType;
  }) => void;
  onCancel: () => void;
}

export default function ExportDialog({ onConfirm, onCancel }: ExportDialogProps) {
  const [docType, setDocType] = useState<DocType>("smeta");
  const [customer, setCustomer] = useState("");
  const [contractor, setContractor] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [validDays, setValidDays] = useState("30");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
            <Icon name="FileText" size={20} className="text-orange-500" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Сформировать документ</h2>
            <p className="text-sm text-gray-400">Данные будут вписаны в документ</p>
          </div>
        </div>

        {/* Выбор типа документа */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setDocType("smeta")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              docType === "smeta"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon name="ClipboardList" size={15} />
            Смета
          </button>
          <button
            onClick={() => setDocType("kp")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              docType === "kp"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon name="Handshake" size={15} />
            Коммерческое предложение
          </button>
        </div>

        <div className="space-y-4">
          {docType === "kp" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="customer">Кому адресовано <span className="text-gray-400 text-xs">(ФИО или организация)</span></Label>
                <Input
                  id="customer"
                  placeholder="Иванов Иван Иванович"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contractor">От кого <span className="text-gray-400 text-xs">(подрядчик / компания)</span></Label>
                <Input
                  id="contractor"
                  placeholder="ИП Петров П.П."
                  value={contractor}
                  onChange={(e) => setContractor(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Телефон для связи</Label>
                <Input
                  id="phone"
                  placeholder="+7 (900) 000-00-00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="info@example.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Адрес объекта</Label>
                <Input
                  id="address"
                  placeholder="г. Самара, ул. Ленина, д. 1, кв. 10"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="validDays">Срок действия КП (дней)</Label>
                <Input
                  id="validDays"
                  placeholder="30"
                  value={validDays}
                  onChange={(e) => setValidDays(e.target.value)}
                  type="number"
                  min={1}
                  max={365}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="customer">Заказчик <span className="text-gray-400 text-xs">(ФИО или название организации)</span></Label>
                <Input
                  id="customer"
                  placeholder="Иванов Иван Иванович"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contractor">Подрядчик <span className="text-gray-400 text-xs">(ФИО или название организации)</span></Label>
                <Input
                  id="contractor"
                  placeholder="ИП Петров П.П."
                  value={contractor}
                  onChange={(e) => setContractor(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Адрес объекта</Label>
                <Input
                  id="address"
                  placeholder="г. Самара, ул. Ленина, д. 1, кв. 10"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Поля необязательны — можно заполнить вручную после печати документа.
        </p>

        <div className="flex gap-3 mt-5">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Отмена
          </Button>
          <Button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => onConfirm({ customer, contractor, address, phone, email, validDays, docType })}
          >
            <Icon name="Printer" size={15} className="mr-2" />
            Открыть документ
          </Button>
        </div>
      </div>
    </div>
  );
}
