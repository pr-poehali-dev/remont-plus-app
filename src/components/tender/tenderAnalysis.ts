export type Verdict = "good" | "fair" | "low" | "unknown";

export interface AnalyzeItem {
  name: string;
  type: "work" | "material";
  unit: string;
  qty: number;
  customerPrice: number;
  costPrice: number;
  customerTotal: number;
  costTotal: number;
  margin: number;
  verdict: Verdict;
  source: "book" | "estimated";
  note: string;
}

export interface AnalyzeSummary {
  revenue: number;
  cost: number;
  margin: number;
  marginPct: number;
  recommendation: string;
  risks: string[];
  missingWorks: string[];
}

export interface AnalyzeResult {
  mode: "analyze";
  title: string;
  summary: string;
  items: AnalyzeItem[];
  analysis: AnalyzeSummary;
}

export const VERDICT_META: Record<Verdict, { label: string; cls: string; dot: string }> = {
  good:    { label: "Выгодно",     cls: "text-emerald-700 bg-emerald-50", dot: "bg-emerald-500" },
  fair:    { label: "Средне",      cls: "text-amber-700 bg-amber-50",     dot: "bg-amber-500" },
  low:     { label: "В убыток",    cls: "text-red-700 bg-red-50",         dot: "bg-red-500" },
  unknown: { label: "—",           cls: "text-gray-500 bg-gray-50",       dot: "bg-gray-300" },
};

export const fmtRub = (n: number) => Math.round(n).toLocaleString("ru-RU");
