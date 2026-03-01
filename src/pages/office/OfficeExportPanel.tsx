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

    const dateStr = new Date().toLocaleDateString("ru-RU");
    const title = docType === "smeta" ? "СМЕТА" : "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ";

    const rowsBg = zones.map((z, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#f5f7fa"}">
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${z.name}</td>
        <td style="padding:6px 10px;text-align:right;border-bottom:1px solid #e5e7eb">${z.area} м²</td>
        ${markupPct > 0 ? `<td style="padding:6px 10px;text-align:right;border-bottom:1px solid #e5e7eb">${markupPct}%</td>` : ""}
        <td style="padding:6px 10px;text-align:right;font-weight:bold;border-bottom:1px solid #e5e7eb">${fmtPrice(z.totalPrice)}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 0; padding: 20mm; }
        @page { margin: 15mm; }
        table { width: 100%; border-collapse: collapse; }
        h1 { font-size: 16px; text-align: center; margin: 0 0 4px; }
        .sub { text-align: center; color: #555; font-size: 11px; margin-bottom: 16px; }
        .meta td { padding-bottom: 4px; }
        .meta td:first-child { width: 140px; color: #555; }
        .staff { background: #f9f9f9; margin-bottom: 14px; }
        .staff td { padding: 4px 8px; }
        .staff td:first-child { width: 140px; color: #555; }
        thead tr { background: #1e3a5f; color: white; }
        thead th { padding: 7px 10px; text-align: left; font-size: 11px; }
        thead th:not(:first-child) { text-align: right; }
        tfoot tr { background: #1e3a5f; color: white; }
        tfoot td { padding: 8px 10px; font-weight: bold; }
        tfoot td:last-child { text-align: right; font-size: 14px; }
        .signs { display: flex; gap: 40px; margin-top: 32px; }
        .sign { flex: 1; border-top: 1px solid #111; padding-top: 4px; font-size: 11px; color: #555; }
        .footer { margin-top: 20px; font-size: 10px; color: #888; text-align: center; }
      </style>
    </head><body>
      <h1>${title}</h1>
      <p class="sub">на выполнение работ по коммерческому помещению · ${dateStr}</p>

      <table class="meta" style="margin-bottom:14px">
        ${customer ? `<tr><td>Заказчик:</td><td><b>${customer}</b></td></tr>` : ""}
        ${contractor ? `<tr><td>Подрядчик:</td><td><b>${contractor}</b></td></tr>` : ""}
        ${address ? `<tr><td>Адрес объекта:</td><td>${address}</td></tr>` : ""}
        ${phone ? `<tr><td>Телефон:</td><td>${phone}</td></tr>` : ""}
        ${email ? `<tr><td>E-mail:</td><td>${email}</td></tr>` : ""}
        <tr><td>Регион:</td><td>${regionLabel}</td></tr>
        ${docType === "kp" ? `<tr><td>Срок действия КП:</td><td>${validDays} дней</td></tr>` : ""}
      </table>

      ${(foremanName || supplyName) ? `
      <table class="staff" style="margin-bottom:14px">
        ${foremanName ? `<tr><td>Прораб:</td><td>${foremanName}${foremanPhone ? " — " + foremanPhone : ""}</td></tr>` : ""}
        ${supplyName ? `<tr><td>Снабженец:</td><td>${supplyName}${supplyPhone ? " — " + supplyPhone : ""}</td></tr>` : ""}
      </table>` : ""}

      <table style="margin-bottom:16px">
        <thead>
          <tr>
            <th style="text-align:left">Зона / Помещение</th>
            <th style="text-align:right">Площадь</th>
            ${markupPct > 0 ? `<th style="text-align:right">Наценка</th>` : ""}
            <th style="text-align:right">Сумма</th>
          </tr>
        </thead>
        <tbody>${rowsBg}</tbody>
        <tfoot>
          <tr>
            <td colspan="${markupPct > 0 ? 3 : 2}">ИТОГО</td>
            <td style="text-align:right">${fmtPrice(totalAll)}</td>
          </tr>
        </tfoot>
      </table>

      <div class="signs">
        <div class="sign">Заказчик${customer ? ": " + customer : ""}</div>
        <div class="sign">Подрядчик${contractor ? ": " + contractor : ""}</div>
      </div>
      <p class="footer">Расчёт ориентировочный. Окончательная стоимость определяется после выезда специалиста и подписания договора.</p>
    </body></html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); setPrinting(false); }, 300);
    } else {
      setPrinting(false);
    }
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

    </Card>
  );
}