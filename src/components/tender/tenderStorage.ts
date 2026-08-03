import funcUrls from "@/../backend/func2url.json";

const API = (funcUrls as Record<string, string>)["tender-estimates"];

export interface SavedEstimateMeta {
  id: number;
  title: string;
  mode: "estimate" | "analyze";
  total: number;
  created_at: string;
  updated_at: string;
}

export interface EstimatePayload {
  result: unknown;
  analyzeResult?: unknown;
  regionId: string;
  seasonId: string;
  markupPct: number;
  profitPct: number;
  overheads: unknown;
}

function identity(): { user_id?: number; email?: string } {
  let user: { id?: number; email?: string } | null = null;
  try { user = JSON.parse(localStorage.getItem("avangard_user") || "null"); } catch { user = null; }
  const email = user?.email || localStorage.getItem("tender_email") || undefined;
  return { user_id: user?.id, email: email || undefined };
}

function authHeaders(): Record<string, string> {
  const { user_id, email } = identity();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (user_id) h["X-User-Id"] = String(user_id);
  if (email) h["X-User-Email"] = email;
  return h;
}

/** Есть ли чем идентифицировать пользователя (id или email). */
export function canSaveEstimates(): boolean {
  const { user_id, email } = identity();
  return !!(user_id || email);
}

export async function listEstimates(): Promise<SavedEstimateMeta[]> {
  const res = await fetch(API, { headers: authHeaders() });
  const data = await res.json();
  return (data.estimates || []) as SavedEstimateMeta[];
}

export async function getEstimate(id: number): Promise<{ id: number; title: string; mode: string; total: number; payload: EstimatePayload }> {
  const res = await fetch(`${API}?id=${id}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Не удалось загрузить смету");
  return data.estimate;
}

export async function saveEstimate(input: {
  id?: number;
  title: string;
  mode: "estimate" | "analyze";
  total: number;
  payload: EstimatePayload;
}): Promise<number> {
  const res = await fetch(API, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || !data.saved) throw new Error(data.error || "Не удалось сохранить смету");
  return data.id as number;
}

export async function deleteEstimate(id: number): Promise<void> {
  await fetch(`${API}?id=${id}`, { method: "DELETE", headers: authHeaders() });
}
