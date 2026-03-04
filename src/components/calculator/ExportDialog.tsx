import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

export type DocType = "smeta" | "kp" | "ks2" | "ks3" | "act" | "contract";

export interface ExportConfirmData {
  customer: string;
  contractor: string;
  address: string;
  phone: string;
  email: string;
  validDays: string;
  docType: DocType;
  inn: string;
  kpp: string;
  ogrn: string;
  legalAddress: string;
  bank: string;
  bik: string;
  checkingAccount: string;
  startDate: string;
  endDate: string;
  contractNum: string;
  contractDate: string;
  advancePct: string;
  warrantyMonths: string;
}

interface ExportDialogProps {
  onConfirm: (data: ExportConfirmData) => void;
  onCancel: () => void;
}

function Field({
  id, label, hint, placeholder, value, onChange, type = "text", autoFocus,
}: {
  id: string; label: string; hint?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; type?: string; autoFocus?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}{hint && <span className="text-gray-400 text-xs ml-1">{hint}</span>}
      </Label>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        autoFocus={autoFocus}
      />
    </div>
  );
}

const STORAGE_KEY = "kp_requisites";
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

const DOC_TYPES: { type: DocType; label: string; icon: string }[] = [
  { type: "smeta",    label: "Смета",          icon: "ClipboardList" },
  { type: "kp",      label: "КП",             icon: "Handshake" },
  { type: "contract",label: "Договор",         icon: "FileSignature" },
  { type: "ks2",     label: "КС-2",           icon: "ClipboardCheck" },
  { type: "ks3",     label: "КС-3",           icon: "BarChart2" },
  { type: "act",     label: "Акт",            icon: "CheckSquare" },
];

const CONTRACT_DOCS: DocType[] = ["contract", "ks2", "ks3", "act"];

export default function ExportDialog({ onConfirm, onCancel }: ExportDialogProps) {
  const saved = loadSaved();
  const today = new Date().toISOString().slice(0, 10);

  const [docType, setDocType] = useState<DocType>("smeta");
  const [customer, setCustomer] = useState("");
  const [contractor, setContractor] = useState(saved.contractor ?? "");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(saved.phone ?? "");
  const [email, setEmail] = useState(saved.email ?? "");
  const [validDays, setValidDays] = useState("30");
  const [inn, setInn] = useState(saved.inn ?? "");
  const [kpp, setKpp] = useState(saved.kpp ?? "");
  const [ogrn, setOgrn] = useState(saved.ogrn ?? "");
  const [legalAddress, setLegalAddress] = useState(saved.legalAddress ?? "");
  const [bank, setBank] = useState(saved.bank ?? "");
  const [bik, setBik] = useState(saved.bik ?? "");
  const [checkingAccount, setCheckingAccount] = useState(saved.checkingAccount ?? "");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [contractNum, setContractNum] = useState(saved.contractNum ?? "");
  const [contractDate, setContractDate] = useState(today);
  const [advancePct, setAdvancePct] = useState("30");
  const [warrantyMonths, setWarrantyMonths] = useState("12");

  const isContract = CONTRACT_DOCS.includes(docType);

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ contractor, phone, email, inn, kpp, ogrn, legalAddress, bank, bik, checkingAccount, contractNum }));
    if (typeof window !== "undefined" && (window as unknown as { ym?: (id: number, action: string, goal: string) => void }).ym) {
      (window as unknown as { ym: (id: number, action: string, goal: string) => void }).ym(107009331, "reachGoal", "turnkey_document_confirm");
    }
    onConfirm({ customer, contractor, address, phone, email, validDays, docType, inn, kpp, ogrn, legalAddress, bank, bik, checkingAccount, startDate, endDate, contractNum, contractDate, advancePct, warrantyMonths });
  };

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

        {/* Тип документа — 6 кнопок 3×2 */}
        <div className="grid grid-cols-3 gap-1.5 mb-5 p-1 bg-gray-100 rounded-xl">
          {DOC_TYPES.map(d => (
            <button
              key={d.type}
              onClick={() => setDocType(d.type)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-lg text-xs font-medium transition-all ${
                docType === d.type
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon name={d.icon as Parameters<typeof Icon>[0]["name"]} size={14} />
              {d.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {/* Стороны — всегда */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Стороны</p>
          <Field id="customer" label="Заказчик" hint="(ФИО или организация)" placeholder="Иванов Иван Иванович" value={customer} onChange={setCustomer} autoFocus />
          <Field id="contractor" label="Подрядчик / Исполнитель" placeholder="ООО «Ремонт Плюс» / ИП Петров П.П." value={contractor} onChange={setContractor} />
          <Field id="address" label="Адрес объекта" placeholder="г. Самара, ул. Ленина, д. 1" value={address} onChange={setAddress} />

          {/* КП — срок действия */}
          {docType === "kp" && (
            <Field id="validDays" label="Срок действия КП (дней)" placeholder="30" value={validDays} onChange={setValidDays} type="number" />
          )}

          {/* Контакты подрядчика — для КП и договора */}
          {(docType === "kp" || isContract) && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Контакты подрядчика</p>
              <div className="grid grid-cols-2 gap-2">
                <Field id="phone" label="Телефон" placeholder="+7 (900) 000-00-00" value={phone} onChange={setPhone} />
                <Field id="email" label="Email" placeholder="info@example.ru" value={email} onChange={setEmail} />
              </div>
              <Field id="inn" label="ИНН" placeholder="7701234567" value={inn} onChange={setInn} />
            </>
          )}

          {/* Договорные поля — для contract, ks2, ks3, act */}
          {isContract && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Реквизиты договора</p>
              <div className="grid grid-cols-2 gap-2">
                <Field id="contractNum" label="№ договора" placeholder="001/2025" value={contractNum} onChange={setContractNum} />
                <Field id="contractDate" label="Дата договора" value={contractDate} onChange={setContractDate} type="date" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field id="startDate" label="Начало работ" value={startDate} onChange={setStartDate} type="date" />
                <Field id="endDate" label="Окончание работ" value={endDate} onChange={setEndDate} type="date" />
              </div>
              {docType === "contract" && (
                <div className="grid grid-cols-2 gap-2">
                  <Field id="advancePct" label="Аванс (%)" placeholder="30" value={advancePct} onChange={setAdvancePct} type="number" />
                  <Field id="warrantyMonths" label="Гарантия (мес.)" placeholder="12" value={warrantyMonths} onChange={setWarrantyMonths} type="number" />
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Поля необязательны — можно заполнить вручную после печати.
        </p>

        <div className="flex gap-3 mt-5">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Отмена
          </Button>
          <Button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleConfirm}
          >
            <Icon name="Printer" size={15} className="mr-2" />
            Открыть документ
          </Button>
        </div>
      </div>
    </div>
  );
}
