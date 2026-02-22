import type { EstimateItem } from "@/pages/Calculator";
import type { EstimateSavedItem } from "@/lib/lemanapro-data";

export interface PrintData {
  items: EstimateItem[];
  lemanaItems: EstimateSavedItem[];
  materialSurcharge: number;
  customer: string;
  contractor: string;
  address: string;
  phone?: string;
  email?: string;
  validDays?: string;
  docType?: "smeta" | "kp";
  inn?: string;
  kpp?: string;
  ogrn?: string;
  legalAddress?: string;
  bank?: string;
  bik?: string;
  checkingAccount?: string;
  totalMaterials: number;
  totalWorks: number;
  adjustedWorks: number;
  grandTotal: number;
  deliveryCost?: number;
  deliveryFloor?: number;
  deliveryHasElevator?: boolean;
  docNum: string;
  date: string;
}

export function fmt(n: number) {
  return n.toLocaleString("ru-RU") + " руб.";
}

export const COMMON_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&family=PT+Sans:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'PT Sans', Arial, sans-serif; font-size: 10pt; color: #000; background: #fff; }
  .page { max-width: 210mm; margin: 0 auto; padding: 18mm 18mm 22mm; }

  .doc-title { font-family: 'PT Serif', serif; font-size: 13pt; font-weight: 700; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .doc-subtitle { text-align: center; font-size: 9pt; color: #444; margin-bottom: 14px; }

  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9pt; }
  .meta-table td { padding: 3px 6px; vertical-align: top; }
  .meta-table td:first-child { width: 38%; font-weight: 700; color: #000; white-space: nowrap; }
  .meta-table td:last-child { border-bottom: 1px solid #999; color: #000; }

  section { margin-bottom: 14px; }
  section h2 { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 6px; }

  table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  thead th { background: #fff; border-top: 1.5px solid #000; border-bottom: 1px solid #000; padding: 4px 5px; text-align: left; font-weight: 700; }
  thead th.r { text-align: right; }
  thead th.c { text-align: center; }
  tbody td { padding: 3px 5px; border-bottom: 1px solid #ddd; vertical-align: top; }
  tbody td.r { text-align: right; }
  tbody td.c { text-align: center; }
  tbody tr:nth-child(even) td { background: #f7f7f7; }

  .totals { margin-top: 6px; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .totals .row { display: flex; gap: 16px; font-size: 9pt; color: #333; }
  .totals .row.grand { font-weight: 700; font-size: 10.5pt; color: #000; border-top: 1.5px solid #000; padding-top: 3px; margin-top: 3px; }
  .totals .val { min-width: 130px; text-align: right; }
  .totals .note { font-size: 8pt; color: #555; font-style: italic; }

  .conditions { margin-bottom: 14px; }
  .conditions h2 { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 6px; }
  .conditions ol { padding-left: 16px; font-size: 8.5pt; color: #222; line-height: 1.7; }

  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 20px; }
  .sig-block h3 { font-size: 9pt; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; }
  .sig-line { margin-bottom: 10px; font-size: 8.5pt; color: #222; }
  .sig-line .line { border-bottom: 1px solid #666; margin-top: 4px; height: 16px; }

  .footer { text-align: center; font-size: 7.5pt; color: #888; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 8px; }

  @media print {
    @page { size: A4 portrait; margin: 10mm 14mm 14mm; }
    .no-print { display: none !important; }
    body { font-size: 9.5pt; }
  }
`;
