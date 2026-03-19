import { useEffect, useRef, useCallback } from "react";

const CALC_EVENTS_URL = 'https://functions.poehali.dev/85d1f13f-3446-417d-85a1-7cc975466f50';

type EventType = 'open' | 'calc' | 'lead' | 'interact' | 'result_view' | 'export_click' | 'form_open';

const sent = new Set<string>();

function getUser(): { id?: number } {
  try {
    const saved = localStorage.getItem('avangard_user');
    if (saved) return JSON.parse(saved);
  } catch (_e) { /* ignore */ }
  return {};
}

export function trackCalcEvent(calcType: string, eventType: EventType) {
  const user = getUser();
  fetch(CALC_EVENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calc_type: calcType, event_type: eventType, user_id: user.id || null }),
  }).catch(() => {});
}

function trackOnce(calcType: string, eventType: EventType) {
  const key = `${calcType}:${eventType}`;
  if (sent.has(key)) return;
  sent.add(key);
  trackCalcEvent(calcType, eventType);
}

export function useCalcFunnel(calcType: string) {
  const interacted = useRef(false);

  useEffect(() => {
    trackOnce(calcType, 'open');
  }, [calcType]);

  const trackInteract = useCallback(() => {
    if (interacted.current) return;
    interacted.current = true;
    trackOnce(calcType, 'interact');
  }, [calcType]);

  const trackResultView = useCallback(() => {
    trackOnce(calcType, 'result_view');
  }, [calcType]);

  const trackExportClick = useCallback(() => {
    trackCalcEvent(calcType, 'export_click');
  }, [calcType]);

  const trackFormOpen = useCallback(() => {
    trackCalcEvent(calcType, 'form_open');
  }, [calcType]);

  const trackLead = useCallback(() => {
    trackCalcEvent(calcType, 'lead');
  }, [calcType]);

  return { trackInteract, trackResultView, trackExportClick, trackFormOpen, trackLead };
}

export default useCalcFunnel;