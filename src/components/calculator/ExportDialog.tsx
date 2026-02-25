import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

type DocType = "smeta" | "kp";

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

export default function ExportDialog({ onConfirm, onCancel }: ExportDialogProps) {
  const saved = loadSaved();
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

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ contractor, phone, email, inn, kpp, ogrn, legalAddress, bank, bik, checkingAccount }));
    if (typeof window !== "undefined" && (window as unknown as { ym?: (id: number, action: string, goal: string) => void }).ym) {
      (window as unknown as { ym: (id: number, action: string, goal: string) => void }).ym(107009331, "reachGoal", "turnkey_document_confirm");
    }
    onConfirm({ customer, contractor, address, phone, email, validDays, docType, inn, kpp, ogrn, legalAddress, bank, bik, checkingAccount });
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

        {/* Тип документа */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setDocType("smeta")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              docType === "smeta" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon name="ClipboardList" size={15} />
            Смета
          </button>
          <button
            onClick={() => setDocType("kp")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              docType === "kp" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon name="Handshake" size={15} />
            Коммерческое предложение
          </button>
        </div>

        <div className="space-y-4">
          {docType === "kp" ? (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Адресат</p>
              <Field id="customer" label="Кому адресовано" hint="(ФИО или организация)" placeholder="Иванов Иван Иванович" value={customer} onChange={setCustomer} autoFocus />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Исполнитель</p>
              <Field id="contractor" label="Название компании / ФИО" hint="(подрядчик)" placeholder="ООО «Ремонт Плюс»" value={contractor} onChange={setContractor} />
              <Field id="phone" label="Телефон" placeholder="+7 (900) 000-00-00" value={phone} onChange={setPhone} />
              <Field id="email" label="Email" placeholder="info@example.ru" value={email} onChange={setEmail} />
              <Field id="address" label="Адрес объекта" placeholder="г. Самара, ул. Ленина, д. 1, кв. 10" value={address} onChange={setAddress} />
              <Field id="validDays" label="Срок действия КП (дней)" placeholder="30" value={validDays} onChange={setValidDays} type="number" />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Реквизиты компании <span className="text-gray-400 normal-case font-normal">(необязательно)</span></p>
              <Field id="inn" label="ИНН" placeholder="7701234567" value={inn} onChange={setInn} />
              <Field id="kpp" label="КПП" placeholder="770101001" value={kpp} onChange={setKpp} />
              <Field id="ogrn" label="ОГРН / ОГРНИП" placeholder="1027700132460" value={ogrn} onChange={setOgrn} />
              <Field id="legalAddress" label="Юридический адрес" placeholder="г. Москва, ул. Примерная, д. 1" value={legalAddress} onChange={setLegalAddress} />
              <Field id="bank" label="Банк" placeholder="ПАО Сбербанк" value={bank} onChange={setBank} />
              <Field id="bik" label="БИК" placeholder="044525225" value={bik} onChange={setBik} />
              <Field id="checkingAccount" label="Расчётный счёт" placeholder="40702810938000000001" value={checkingAccount} onChange={setCheckingAccount} />
            </>
          ) : (
            <>
              <Field id="customer" label="Заказчик" hint="(ФИО или название организации)" placeholder="Иванов Иван Иванович" value={customer} onChange={setCustomer} autoFocus />
              <Field id="contractor" label="Подрядчик" hint="(ФИО или название организации)" placeholder="ИП Петров П.П." value={contractor} onChange={setContractor} />
              <Field id="address" label="Адрес объекта" placeholder="г. Самара, ул. Ленина, д. 1, кв. 10" value={address} onChange={setAddress} />
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