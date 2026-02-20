import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import type { EstimateItem } from "@/pages/Calculator";
import type { EstimateSavedItem } from "@/lib/lemanapro-data";

interface DocsTabProps {
  items: EstimateItem[];
  lemanaItems: EstimateSavedItem[];
  grandTotal: number;
  materialSurcharge: number;
  totalMaterials: number;
  totalWorks: number;
  adjustedWorks: number;
}

interface DocForm {
  customer: string;
  customerAddress: string;
  customerPassport: string;
  contractor: string;
  contractorInn: string;
  contractorAddress: string;
  objectAddress: string;
  contractNum: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  advancePercent: string;
  paymentConditions: string;
  hiddenWorkDesc: string;
  actNum: string;
  actDate: string;
}

const docNum = () => Date.now().toString().slice(-6);
const today = () => new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const DOCS = [
  { id: "contract", icon: "FileSignature", title: "Договор подряда", desc: "Типовой договор на выполнение ремонтных работ" },
  { id: "hidden", icon: "EyeOff", title: "Акт скрытых работ", desc: "Акт приёмки скрытых работ (монтаж, гидроизоляция и т.д.)" },
  { id: "ks2", icon: "ClipboardCheck", title: "Акт КС-2", desc: "Акт о приёмке выполненных работ" },
  { id: "ks3", icon: "Receipt", title: "Справка КС-3", desc: "Справка о стоимости выполненных работ" },
];

export default function DocsTab({ items, lemanaItems, grandTotal, materialSurcharge, totalMaterials, totalWorks, adjustedWorks }: DocsTabProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<DocForm>({
    customer: "",
    customerAddress: "",
    customerPassport: "",
    contractor: "",
    contractorInn: "",
    contractorAddress: "",
    objectAddress: "",
    contractNum: docNum(),
    contractDate: today(),
    startDate: "",
    endDate: "",
    advancePercent: "30",
    paymentConditions: "Оплата производится в два этапа: аванс в размере 30% от стоимости работ в течение 3 рабочих дней с момента подписания договора, окончательный расчёт — в течение 3 рабочих дней после подписания акта выполненных работ.",
    hiddenWorkDesc: "",
    actNum: docNum(),
    actDate: today(),
  });

  const upd = (k: keyof DocForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openDoc = (docId: string) => {
    navigate("/docs/print", {
      state: { docId, form, items, lemanaItems, grandTotal, materialSurcharge, totalMaterials, totalWorks, adjustedWorks },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 flex gap-2">
        <Icon name="Info" size={16} className="shrink-0 mt-0.5" />
        <span>Заполните реквизиты один раз — они подставятся во все документы. Все поля необязательны.</span>
      </div>

      {/* Реквизиты */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Icon name="Users" size={16} className="text-orange-500" /> Стороны договора
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Заказчик (ФИО / организация)</Label>
            <Input placeholder="Иванов Иван Иванович" value={form.customer} onChange={e => upd("customer", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Адрес заказчика</Label>
            <Input placeholder="г. Москва, ул. Ленина, д. 1" value={form.customerAddress} onChange={e => upd("customerAddress", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Паспорт / реквизиты заказчика</Label>
            <Input placeholder="Серия, номер, выдан..." value={form.customerPassport} onChange={e => upd("customerPassport", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Адрес объекта</Label>
            <Input placeholder="г. Самара, ул. Победы, д. 5, кв. 10" value={form.objectAddress} onChange={e => upd("objectAddress", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Подрядчик (ФИО / ИП / ООО)</Label>
            <Input placeholder="ИП Петров П.П." value={form.contractor} onChange={e => upd("contractor", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>ИНН подрядчика</Label>
            <Input placeholder="123456789012" value={form.contractorInn} onChange={e => upd("contractorInn", e.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Адрес подрядчика</Label>
            <Input placeholder="г. Самара, ул. Строителей, д. 2" value={form.contractorAddress} onChange={e => upd("contractorAddress", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="border-t pt-4 space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Icon name="Calendar" size={16} className="text-orange-500" /> Сроки и оплата
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Номер договора</Label>
            <Input value={form.contractNum} onChange={e => upd("contractNum", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Дата договора</Label>
            <Input type="date" value={form.contractDate.split(".").reverse().join("-")} onChange={e => upd("contractDate", new Date(e.target.value).toLocaleDateString("ru-RU", {day:"2-digit",month:"2-digit",year:"numeric"}))} />
          </div>
          <div className="space-y-1">
            <Label>Аванс, %</Label>
            <Input type="number" min="0" max="100" placeholder="30" value={form.advancePercent} onChange={e => upd("advancePercent", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Начало работ</Label>
            <Input type="date" value={form.startDate} onChange={e => upd("startDate", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Окончание работ</Label>
            <Input type="date" value={form.endDate} onChange={e => upd("endDate", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Условия оплаты</Label>
          <Textarea rows={3} value={form.paymentConditions} onChange={e => upd("paymentConditions", e.target.value)} />
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Icon name="EyeOff" size={16} className="text-orange-500" /> Акт скрытых работ (если есть)
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Номер акта</Label>
            <Input value={form.actNum} onChange={e => upd("actNum", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Дата акта</Label>
            <Input type="date" value={form.actDate.split(".").reverse().join("-")} onChange={e => upd("actDate", new Date(e.target.value).toLocaleDateString("ru-RU", {day:"2-digit",month:"2-digit",year:"numeric"}))} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Описание скрытых работ</Label>
          <Textarea rows={3} placeholder="Гидроизоляция основания пола, прокладка электрокабеля в штробе..." value={form.hiddenWorkDesc} onChange={e => upd("hiddenWorkDesc", e.target.value)} />
        </div>
      </div>

      {/* Кнопки документов */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Icon name="FileText" size={16} className="text-orange-500" /> Сформировать документ
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {DOCS.map(doc => (
            <button
              key={doc.id}
              onClick={() => openDoc(doc.id)}
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center shrink-0 transition-colors">
                <Icon name={doc.icon} size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{doc.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{doc.desc}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-gray-300 group-hover:text-orange-400 ml-auto shrink-0 mt-1 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
