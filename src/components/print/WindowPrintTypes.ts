import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import type { WindowConfig } from "@/components/calculator/windows/WindowTypes";

export interface WindowPrintState extends ExportConfirmData {
  configs: WindowConfig[];
  markupPct: number;
  totalSum: number;
  docNum: string;
  date: string;
}

export function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export const WINDOW_PRINT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&family=PT+Sans:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'PT Sans', Arial, sans-serif; font-size: 10pt; color: #000; background: #fff; }
  .page { max-width: 210mm; margin: 0 auto; padding: 16mm 16mm 20mm; }
  .doc-title { font-family: 'PT Serif', serif; font-size: 13pt; font-weight: 700; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .doc-subtitle { text-align: center; font-size: 9pt; color: #444; margin-bottom: 14px; }
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9pt; }
  .meta-table td { padding: 3px 6px; vertical-align: top; }
  .meta-table td:first-child { width: 38%; font-weight: 700; }
  .meta-table td:last-child { border-bottom: 1px solid #999; }
  section { margin-bottom: 16px; }
  section h2 { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  thead th { border-top: 1.5px solid #000; border-bottom: 1px solid #000; padding: 4px 5px; text-align: left; font-weight: 700; }
  thead th.r { text-align: right; }
  thead th.c { text-align: center; }
  tbody td { padding: 3px 5px; border-bottom: 1px solid #ddd; vertical-align: top; }
  tbody td.r { text-align: right; }
  tbody td.c { text-align: center; }
  tbody tr:nth-child(even) td { background: #f7f7f7; }
  .totals { margin-top: 6px; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .totals .row { display: flex; gap: 16px; font-size: 9pt; }
  .totals .row.grand { font-weight: 700; font-size: 11pt; border-top: 1.5px solid #000; padding-top: 4px; margin-top: 4px; }
  .totals .val { min-width: 130px; text-align: right; }
  .window-block { break-inside: avoid; margin-bottom: 18px; border: 1px solid #ccc; border-radius: 4px; padding: 10px 12px; }
  .window-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .window-num { font-size: 9pt; font-weight: 700; color: #555; }
  .window-title { font-size: 10pt; font-weight: 700; }
  .window-body { display: grid; grid-template-columns: 160px 1fr; gap: 12px; align-items: start; }
  .scheme-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .window-specs { font-size: 8.5pt; }
  .window-specs table { font-size: 8.5pt; }
  .window-specs td { padding: 2px 4px; border: none; border-bottom: 1px solid #eee; }
  .window-specs td:first-child { color: #555; width: 120px; }
  .window-specs td:last-child { font-weight: 600; }
  .window-price { margin-top: 8px; display: flex; justify-content: flex-end; gap: 16px; font-size: 9pt; }
  .window-price .total { font-weight: 700; font-size: 10.5pt; }
  .sig-block { margin-top: 20px; }
  .sig-block h3 { font-size: 9pt; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .sig-line { margin-bottom: 8px; font-size: 8.5pt; }
  .sig-line .line { border-bottom: 1px solid #666; margin-top: 4px; height: 16px; }
  .footer { text-align: center; font-size: 7.5pt; color: #888; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 8px; }
  .no-print { display: block; }
  @media print {
    @page { size: A4 portrait; margin: 10mm 14mm 14mm; }
    .no-print { display: none !important; }
    body { font-size: 9.5pt; }
  }
`;
