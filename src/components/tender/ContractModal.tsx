import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { EMPTY_CONTRACT, type ContractParty } from "./tenderContract";

const STORE_KEY = "tender_contract_party";

function loadParty(): ContractParty {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { ...EMPTY_CONTRACT, ...JSON.parse(raw), dateStr: new Date().toLocaleDateString("ru-RU") };
  } catch { /* ignore */ }
  return EMPTY_CONTRACT;
}

interface Props {
  totalWithDiscount: number;
  onClose: () => void;
  onPrint: (party: ContractParty) => void;
}

export default function ContractModal({ totalWithDiscount, onClose, onPrint }: Props) {
  const [p, setP] = useState<ContractParty>(loadParty);
  const set = (patch: Partial<ContractParty>) => setP((prev) => ({ ...prev, ...patch }));

  const handlePrint = () => {
    // реквизиты подрядчика сохраняем — чтобы не вводить каждый раз
    localStorage.setItem(STORE_KEY, JSON.stringify({
      contractorName: p.contractorName,
      contractorDetails: p.contractorDetails,
      termDays: p.termDays,
      prepayPct: p.prepayPct,
    }));
    onPrint(p);
  };

  const prepay = Math.round(totalWithDiscount * (p.prepayPct || 0) / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Icon name="FileSignature" size={18} className="text-teal-600" /> Договор подряда по смете
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="X" size={20} /></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Номер договора</label>
              <Input value={p.contractNumber} onChange={(e) => set({ contractNumber: e.target.value })} placeholder="12/2026" className="h-9 mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Дата</label>
              <Input value={p.dateStr} onChange={(e) => set({ dateStr: e.target.value })} className="h-9 mt-1" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Объект / адрес работ</label>
            <Input value={p.objectAddress} onChange={(e) => set({ objectAddress: e.target.value })} placeholder="МО, г. Пушкино, СНТ «Заря», уч. 14" className="h-9 mt-1" />
          </div>

          <div className="border-t pt-3">
            <p className="text-xs font-bold text-teal-700 uppercase mb-2">Подрядчик (вы)</p>
            <Input value={p.contractorName} onChange={(e) => set({ contractorName: e.target.value })} placeholder="ИП Иванов Иван Иванович" className="h-9" />
            <Textarea
              value={p.contractorDetails}
              onChange={(e) => set({ contractorDetails: e.target.value })}
              placeholder="ИНН 000000000000, ОГРНИП ..., р/с ..., банк ..., тел. ..."
              className="mt-2 text-sm min-h-[70px]"
            />
          </div>

          <div className="border-t pt-3">
            <p className="text-xs font-bold text-orange-700 uppercase mb-2">Заказчик</p>
            <Input value={p.customerName} onChange={(e) => set({ customerName: e.target.value })} placeholder="Петров Пётр Петрович" className="h-9" />
            <Textarea
              value={p.customerDetails}
              onChange={(e) => set({ customerDetails: e.target.value })}
              placeholder="Паспорт ..., адрес регистрации ..., тел. ..."
              className="mt-2 text-sm min-h-[70px]"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 border-t pt-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Срок работ, дней</label>
              <Input type="number" min={1} value={p.termDays} onChange={(e) => set({ termDays: Number(e.target.value) || 0 })} className="h-9 mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Аванс, %</label>
              <Input type="number" min={0} max={100} value={p.prepayPct} onChange={(e) => set({ prepayPct: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} className="h-9 mt-1" />
            </div>
          </div>

          <div className="rounded-lg bg-teal-50 border border-teal-200 p-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Сумма договора</span><span className="font-bold text-teal-700 tabular-nums">{Math.round(totalWithDiscount).toLocaleString("ru-RU")} ₽</span></div>
            <div className="flex justify-between mt-1"><span className="text-gray-600">Аванс {p.prepayPct}%</span><span className="tabular-nums">{prepay.toLocaleString("ru-RU")} ₽</span></div>
            <div className="flex justify-between mt-1"><span className="text-gray-600">Остаток по факту</span><span className="tabular-nums">{(Math.round(totalWithDiscount) - prepay).toLocaleString("ru-RU")} ₽</span></div>
          </div>
        </div>

        <div className="px-5 py-4 border-t flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Отмена</Button>
          <Button onClick={handlePrint} className="flex-1 bg-teal-600 hover:bg-teal-700">
            <Icon name="Printer" size={16} className="mr-2" /> Договор + смета
          </Button>
        </div>
      </div>
    </div>
  );
}
