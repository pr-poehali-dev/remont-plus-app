import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

interface ExportDialogProps {
  onConfirm: (data: { customer: string; contractor: string; address: string }) => void;
  onCancel: () => void;
}

export default function ExportDialog({ onConfirm, onCancel }: ExportDialogProps) {
  const [customer, setCustomer] = useState("");
  const [contractor, setContractor] = useState("");
  const [address, setAddress] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
            <Icon name="FileText" size={20} className="text-orange-500" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Скачать смету в PDF</h2>
            <p className="text-sm text-gray-400">Данные будут вписаны в документ</p>
          </div>
        </div>

        <div className="space-y-4">
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
            onClick={() => onConfirm({ customer, contractor, address })}
          >
            <Icon name="Download" size={15} className="mr-2" />
            Скачать PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
