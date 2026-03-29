const AB_STORAGE_KEY = "ab_tests";

export interface ABAssignment {
  test: string;
  variant: string;
  ts: number;
}

function getAssignments(): Record<string, ABAssignment> {
  try {
    const raw = localStorage.getItem(AB_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAssignments(data: Record<string, ABAssignment>) {
  localStorage.setItem(AB_STORAGE_KEY, JSON.stringify(data));
}

export function getVariant(testName: string, variants: string[] = ["A", "B"]): string {
  const assignments = getAssignments();
  if (assignments[testName]) return assignments[testName].variant;

  const variant = variants[Math.floor(Math.random() * variants.length)];
  assignments[testName] = { test: testName, variant, ts: Date.now() };
  saveAssignments(assignments);
  return variant;
}

const AB_EVENTS_URL = "https://functions.poehali.dev/85d1f13f-3446-417d-85a1-7cc975466f50";

const sentAB = new Set<string>();

export function trackABEvent(
  testName: string,
  variant: string,
  event: "impression" | "lead" | "dismiss",
  meta?: Record<string, string>,
) {
  const key = `${testName}:${variant}:${event}:${meta?.source || ""}`;
  if (event === "impression" && sentAB.has(key)) return;
  sentAB.add(key);

  fetch(AB_EVENTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      calc_type: `ab:${testName}`,
      event_type: `${variant}:${event}`,
      user_id: null,
      meta: meta || {},
    }),
  }).catch(() => {});
}

export default getVariant;