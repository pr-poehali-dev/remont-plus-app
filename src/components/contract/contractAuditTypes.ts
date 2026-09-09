export type RiskLevel = "critical" | "high" | "medium" | "info";

export interface AuditIssue {
  clause: string;
  quote: string;
  risk: RiskLevel;
  category: string;
  problem: string;
  money_risk: string;
  fix: string;
}

export interface AuditMissing {
  what: string;
  why: string;
  text: string;
}

export interface AuditResult {
  title: string;
  verdict: "sign" | "fix" | "reject";
  verdict_text: string;
  risk_score: number;
  summary: string;
  parties: { customer: string; contractor: string; amount: string; term: string };
  issues: AuditIssue[];
  missing: AuditMissing[];
  negotiation: string[];
  counts: { critical: number; high: number; medium: number; info: number };
  model?: string;
}

export const RISK_META: Record<RiskLevel, { label: string; badge: string; dot: string; icon: string }> = {
  critical: { label: "Критично", badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", icon: "OctagonAlert" },
  high: { label: "Высокий риск", badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", icon: "TriangleAlert" },
  medium: { label: "Средний риск", badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400", icon: "CircleAlert" },
  info: { label: "На заметку", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-400", icon: "Info" },
};

export const VERDICT_META = {
  reject: { label: "Подписывать нельзя", cls: "bg-red-50 border-red-200 text-red-700", icon: "OctagonX" },
  fix: { label: "Подписывать после правок", cls: "bg-amber-50 border-amber-200 text-amber-700", icon: "FilePen" },
  sign: { label: "Можно подписывать", cls: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: "FileCheck" },
} as const;
