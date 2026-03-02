import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { ZoneConfig, fmtPrice, REGIONS } from "./officeCalcTypes";
import { OfficeExportState } from "./officeExportTypes";
import { getZoneLines } from "./officeExportHtml";
import { CSS } from "./officeExportHtml";

// ── Тип строки ведомости ────────────────────────────────────────────────────

export interface MatItem {
  id: string;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
  byZone: string;
  enabled: boolean;
}

// ── Сборка позиций из зон ──────────────────────────────────────────────────

function buildMatItems(zones: ZoneConfig[], regionId: string, markupPct: number): MatItem[] {
  const grouped = new Map<string, MatItem>();

  for (const z of zones) {
    if (!z.blockMaterials) continue;
    const lines = getZoneLines(z, regionId, markupPct);
    const matLines = lines.filter(l => l.section === "Материалы и расходники");

    for (const l of matLines) {
      const key = `${l.name}||${l.unit}||${l.unitPrice}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          name: l.name,
          unit: l.unit,
          qty: l.qty,
          unitPrice: l.unitPrice,
          byZone: z.name,
          enabled: true,
        });
      } else {
        const g = grouped.get(key)!;
        g.qty += l.qty;
        g.byZone += `, ${z.name}`;
      }
    }
  }

  return Array.from(grouped.values());
}

// ── HTML-генератор по итоговому списку ────────────────────────────────────

function buildHtmlFromItems(
  items: MatItem[],
  s: OfficeExportState,
  zones: ZoneConfig[],
  regionLabel: string,
  dateStr: string,
): string {
  const { customer, contractor, address, contractNumber, contractDate } = s;
  const active = items.filter(i => i.enabled && i.qty > 0);
  const grandTotal = active.reduce((sum, i) => sum + Math.round(i.qty * i.unitPrice), 0);

  const rows = active.map((item, idx) => `
    <tr style="background:${idx % 2 === 0 ? "#fff" : "#f5f7fa"}">
      <td style="text-align:center;color:#555">${idx + 1}</td>
      <td>${item.name}</td>
      <td style="text-align:right">${item.qty}</td>
      <td>${item.unit}</td>
      <td style="text-align:right">${item.unitPrice.toLocaleString("ru-RU")}</td>
      <td style="text-align:right"><b>${Math.round(item.qty * item.unitPrice).toLocaleString("ru-RU")}</b></td>
    </tr>`).join("");

  const activeZones = zones.filter(z => z.blockMaterials).map(z => `${z.name} (${z.area} м²)`).join(", ") || "—";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Ведомость материалов</title><style>${CSS}
  </style></head><body>
    <h1>ВЕДОМОСТЬ МАТЕРИАЛОВ И РАСХОДНИКОВ</h1>
    <p class="sub">на выполнение работ по коммерческому помещению · ${dateStr}</p>

    <div class="ks-box">
      <table>
        ${customer ? `<tr><td>Заказчик:</td><td><b>${customer}</b></td></tr>` : ""}
        ${contractor ? `<tr><td>Подрядчик / снабженец:</td><td><b>${contractor}</b></td></tr>` : ""}
        ${address ? `<tr><td>Адрес объекта:</td><td>${address}</td></tr>` : ""}
        ${contractNumber ? `<tr><td>Договор №:</td><td>${contractNumber}${contractDate ? " от " + contractDate : ""}</td></tr>` : ""}
        <tr><td>Регион:</td><td>${regionLabel}</td></tr>
        <tr><td>Дата:</td><td>${dateStr}</td></tr>
        <tr><td>Зоны:</td><td>${activeZones}</td></tr>
      </table>
    </div>

    ${active.length === 0
      ? `<p style="color:#888;text-align:center;padding:20px">Нет позиций для печати.</p>`
      : `<table style="margin-bottom:14px">
          <thead><tr>
            <th style="width:28px;text-align:center">№</th>
            <th>Наименование материала / расходника</th>
            <th style="text-align:right">Кол-во</th>
            <th>Ед.</th>
            <th style="text-align:right">Цена, ₽</th>
            <th style="text-align:right">Сумма, ₽</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr class="total-row">
            <td colspan="5">ИТОГО К ЗАКУПКЕ</td>
            <td style="text-align:right">${fmtPrice(grandTotal)}</td>
          </tr></tfoot>
        </table>
        <p style="font-size:9px;color:#888;margin-top:4px">
          * Количество рассчитано по нормам расхода. При закупке рекомендуется добавить 5–10% запаса.
          Цены ориентировочные — уточняйте у поставщиков.
        </p>`
    }

    <div class="signs" style="margin-top:24px">
      <div class="sign">Составил${contractor ? ": " + contractor : ""}<br><br>_____________ / ______________</div>
      <div class="sign">Принял${customer ? ": " + customer : ""}<br><br>_____________ / ______________</div>
    </div>
  </body></html>`;
}

// ── Компонент ──────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  exportState: OfficeExportState;
  zones: ZoneConfig[];
  regionId: string;
  markupPct: number;
}

export default function OfficeMatEditor({ open, onClose, exportState, zones, regionId, markupPct }: Props) {
  const [items, setItems] = useState<MatItem[]>([]);
  const [printing, setPrinting] = useState(false);

  const regionLabel = REGIONS.find(r => r.id === regionId)?.label ?? regionId;

  useEffect(() => {
    if (open) setItems(buildMatItems(zones, regionId, markupPct));
  }, [open, zones, regionId, markupPct]);

  const setQty = (id: string, val: string) => {
    const n = parseFloat(val);
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: isNaN(n) ? 0 : n } : i));
  };

  const setPrice = (id: string, val: string) => {
    const n = parseFloat(val);
    setItems(prev => prev.map(i => i.id === id ? { ...i, unitPrice: isNaN(n) ? 0 : n } : i));
  };

  const toggleEnabled = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
  };

  const handlePrint = () => {
    setPrinting(true);
    const dateStr = new Date().toLocaleDateString("ru-RU");
    const html = buildHtmlFromItems(items, exportState, zones, regionLabel, dateStr);
    const win = window.open("", "_blank", "width=960,height=720");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); setPrinting(false); }, 350);
    } else {
      setPrinting(false);
    }
  };

  const grandTotal = items
    .filter(i => i.enabled && i.qty > 0)
    .reduce((s, i) => s + Math.round(i.qty * i.unitPrice), 0);

  const activeCount = items.filter(i => i.enabled).length;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon name="Package" size={16} className="text-green-600" />
            Ведомость материалов и расходников
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            Отредактируй количество и цены, снимай галочку чтобы исключить позицию
          </p>
        </DialogHeader>

        {/* Таблица */}
        <div className="overflow-y-auto flex-1 px-5 py-3">
          {items.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-sm">
              <Icon name="PackageOpen" size={32} className="mx-auto mb-3 text-gray-300" />
              Нет зон с активным разделом «Материалы».<br />
              Включи раздел материалов в настройках зоны.
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-2 w-6 text-center text-gray-400 font-medium"></th>
                  <th className="py-2 text-left text-gray-600 font-medium">Наименование</th>
                  <th className="py-2 text-center text-gray-600 font-medium w-20">Кол-во</th>
                  <th className="py-2 text-center text-gray-600 font-medium w-12">Ед.</th>
                  <th className="py-2 text-center text-gray-600 font-medium w-24">Цена, ₽</th>
                  <th className="py-2 text-right text-gray-600 font-medium w-24">Сумма, ₽</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const rowTotal = Math.round(item.qty * item.unitPrice);
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 transition-opacity ${!item.enabled ? "opacity-40" : ""} ${idx % 2 === 0 ? "" : "bg-gray-50"}`}
                    >
                      <td className="py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => toggleEnabled(item.id)}
                          className="w-3.5 h-3.5 cursor-pointer accent-green-600"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <span className={!item.enabled ? "line-through text-gray-400" : ""}>{item.name}</span>
                        {item.byZone && (
                          <span className="block text-gray-400 text-[9px] leading-tight">{item.byZone}</span>
                        )}
                      </td>
                      <td className="py-1 px-1">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={item.qty}
                          onChange={e => setQty(item.id, e.target.value)}
                          disabled={!item.enabled}
                          className="h-6 text-xs text-center px-1 w-full"
                        />
                      </td>
                      <td className="py-1.5 text-center text-gray-500">{item.unit}</td>
                      <td className="py-1 px-1">
                        <Input
                          type="number"
                          min={0}
                          step={10}
                          value={item.unitPrice}
                          onChange={e => setPrice(item.id, e.target.value)}
                          disabled={!item.enabled}
                          className="h-6 text-xs text-center px-1 w-full"
                        />
                      </td>
                      <td className="py-1.5 text-right font-medium text-gray-800">
                        {item.enabled && item.qty > 0 ? rowTotal.toLocaleString("ru-RU") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Итог + кнопки */}
        <DialogFooter className="px-5 py-3 border-t flex items-center justify-between shrink-0 gap-3">
          <div className="text-sm">
            <span className="text-gray-500">{activeCount} поз. · </span>
            <span className="font-bold text-gray-900">Итого: {fmtPrice(grandTotal)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Отмена
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs"
              onClick={handlePrint}
              disabled={printing || items.length === 0}
            >
              {printing
                ? <Icon name="Loader2" size={13} className="animate-spin mr-1.5" />
                : <Icon name="Printer" size={13} className="mr-1.5" />
              }
              Печать / PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
