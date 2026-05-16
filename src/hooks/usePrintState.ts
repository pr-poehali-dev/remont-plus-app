import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

export interface PrintStateOptions {
  storageKey: string;
  buildTitle: (state: Record<string, unknown>) => string;
}

export function usePrintState<T>({ storageKey, buildTitle }: PrintStateOptions): T | null {
  const location = useLocation();

  const state = useMemo<T | null>(() => {
    if (location.state) return location.state as T;
    try {
      const raw = sessionStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }, [location.state, storageKey]);

  useEffect(() => {
    if (state) {
      document.title = buildTitle(state as unknown as Record<string, unknown>);
    }
  }, [state, buildTitle]);

  return state;
}

export interface MissingPrintStateProps {
  backHref: string;
  accentClass?: string;
}

export function getMissingStateMessage({ backHref, accentClass = "text-teal-600" }: MissingPrintStateProps) {
  return {
    backHref,
    accentClass,
    text: "Данные не переданы. Вернитесь в калькулятор.",
  };
}
