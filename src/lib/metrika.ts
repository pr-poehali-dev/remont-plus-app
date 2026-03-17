const METRIKA_ID = 106944583;

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
  }
}

export function reachGoal(goal: string, params?: Record<string, unknown>) {
  try {
    if (window.ym) {
      window.ym(METRIKA_ID, "reachGoal", goal, params);
    }
  } catch {
    // ignore
  }
}

export default reachGoal;
