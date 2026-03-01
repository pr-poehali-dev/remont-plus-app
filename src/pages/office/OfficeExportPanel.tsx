import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { ZoneConfig, fmtPrice, REGIONS } from "./officeCalcTypes";

export interface OfficeExportState {
  docType: "smeta" | "kp";
  showForm: boolean;
  customer: string;
  contractor: string;
  address: string;
  phone: string;
  email: string;
  validDays: string;
  foremanName: string;
  foremanPhone: string;
  supplyName: string;
  supplyPhone: string;
}

export function makeExportState(): OfficeExportState {
  return {
    docType: "smeta",
    showForm: false,
    customer: "",
    contractor: "",
    address: "",
    phone: "",
    email: "",
    validDays: "30",
    foremanName: "",
    foremanPhone: "",
    supplyName: "",
    supplyPhone: "",
  };
}

interface Props {
  exportState: OfficeExportState;
  onChange: (patch: Partial<OfficeExportState>) => void;
  zones: ZoneConfig[];
  totalAll: number;
  regionId: string;
  markupPct: number;
}

export default function OfficeExportPanel({ exportState, onChange, zones, totalAll, regionId, markupPct }: Props) {
  const [printing, setPrinting] = useState(false);
  const { docType, showForm, customer, contractor, address, phone, email, validDays,
    foremanName, foremanPhone, supplyName, supplyPhone } = exportState;

  const regionLabel = REGIONS.find(r => r.id === regionId)?.label ?? regionId;

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  return (
    <Card className="overflow-hidden">
      {/* Шапка */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b">
        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
          <Icon name="Printer" size={14} className="text-blue-600" />
          Сформировать документ
        </h3>
        <button
          onClick={() => onChange({ showForm: !showForm })}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {showForm ? "Скрыть" : "Реквизиты"}
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Тип документа */}
        <div className="flex gap-2">
          {(["smeta", "kp"] as const).map(t => (
            <button
              key={t}
              onClick={() => onChange({ docType: t })}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                docType === t
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-gray-200 text-gray-600 hover:border-blue-200"
              }`}
            >
              {t === "smeta" ? "📋 Смета" : "📄 Коммерческое предложение"}
            </button>
          ))}
        </div>

        {/* Форма реквизитов */}
        {showForm && (
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
        )}

        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePrint} disabled={printing}>
          {printing
            ? <Icon name="Loader2" size={15} className="animate-spin mr-2" />
            : <Icon name="Printer" size={15} className="mr-2" />
          }
          Печать / Сохранить PDF
        </Button>
      </div>

      {/* ── ПЕЧАТНАЯ ФОРМА ─────────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          body > *:not(#office-print-doc) { display: none !important; }
          #office-print-doc { display: block !important; }
          @page { margin: 15mm; }
        }
      `}</style>

      <div id="office-print-doc" style={{ display: "none" }}>
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#111" }}>
          {/* Заголовок */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h1 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>
              {docType === "smeta" ? "СМЕТА" : "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ"}
            </h1>
            <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>
              на выполнение работ по коммерческому помещению
            </div>
          </div>

          {/* Реквизиты */}
          {(customer || contractor || address) && (
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
              <tbody>
                {customer && <tr><td style={{ width: "140px", color: "#555", paddingBottom: "4px" }}>Заказчик:</td><td style={{ fontWeight: "bold" }}>{customer}</td></tr>}
                {contractor && <tr><td style={{ color: "#555", paddingBottom: "4px" }}>Подрядчик:</td><td style={{ fontWeight: "bold" }}>{contractor}</td></tr>}
                {address && <tr><td style={{ color: "#555", paddingBottom: "4px" }}>Адрес объекта:</td><td>{address}</td></tr>}
                {phone && <tr><td style={{ color: "#555", paddingBottom: "4px" }}>Телефон:</td><td>{phone}</td></tr>}
                {email && <tr><td style={{ color: "#555", paddingBottom: "4px" }}>E-mail:</td><td>{email}</td></tr>}
                <tr><td style={{ color: "#555", paddingBottom: "4px" }}>Регион:</td><td>{regionLabel}</td></tr>
                {docType === "kp" && <tr><td style={{ color: "#555", paddingBottom: "4px" }}>Срок действия:</td><td>{validDays} дней</td></tr>}
              </tbody>
            </table>
          )}

          {/* Ответственные */}
          {(foremanName || supplyName) && (
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px", backgroundColor: "#f9f9f9", padding: "8px" }}>
              <tbody>
                {foremanName && <tr><td style={{ width: "140px", color: "#555", paddingBottom: "4px" }}>Прораб:</td><td>{foremanName}{foremanPhone ? ` — ${foremanPhone}` : ""}</td></tr>}
                {supplyName && <tr><td style={{ color: "#555" }}>Снабженец:</td><td>{supplyName}{supplyPhone ? ` — ${supplyPhone}` : ""}</td></tr>}
              </tbody>
            </table>
          )}

          {/* Таблица по зонам */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
            <thead>
              <tr style={{ backgroundColor: "#1e3a5f", color: "white" }}>
                <th style={{ padding: "7px 10px", textAlign: "left", fontSize: "11px" }}>Зона / Помещение</th>
                <th style={{ padding: "7px 10px", textAlign: "right", fontSize: "11px" }}>Площадь, м²</th>
                {markupPct > 0 && <th style={{ padding: "7px 10px", textAlign: "right", fontSize: "11px" }}>Наценка</th>}
                <th style={{ padding: "7px 10px", textAlign: "right", fontSize: "11px" }}>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => (
                <tr key={z.id} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f5f7fa" }}>
                  <td style={{ padding: "6px 10px", borderBottom: "1px solid #e5e7eb" }}>{z.name}</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>{z.area}</td>
                  {markupPct > 0 && <td style={{ padding: "6px 10px", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>{markupPct}%</td>}
                  <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: "bold", borderBottom: "1px solid #e5e7eb" }}>{fmtPrice(z.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: "#1e3a5f", color: "white" }}>
                <td colSpan={markupPct > 0 ? 3 : 2} style={{ padding: "8px 10px", fontWeight: "bold" }}>ИТОГО</td>
                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "bold", fontSize: "14px" }}>{fmtPrice(totalAll)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Подписи */}
          <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", gap: "24px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ borderTop: "1px solid #111", paddingTop: "4px", fontSize: "11px", color: "#555" }}>
                Заказчик{customer ? `: ${customer}` : ""}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ borderTop: "1px solid #111", paddingTop: "4px", fontSize: "11px", color: "#555" }}>
                Подрядчик{contractor ? `: ${contractor}` : ""}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "20px", fontSize: "10px", color: "#888", textAlign: "center" }}>
            Расчёт ориентировочный. Окончательная стоимость определяется после выезда специалиста и подписания договора.
          </div>
        </div>
      </div>
    </Card>
  );
}
