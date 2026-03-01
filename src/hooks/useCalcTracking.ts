const CALC_EVENTS_URL = 'https://functions.poehali.dev/85d1f13f-3446-417d-85a1-7cc975466f50';

function getUser(): { id?: number } {
  try {
    const saved = localStorage.getItem('avangard_user');
    if (saved) return JSON.parse(saved);
  } catch (_e) {
    // ignore
  }
  return {};
}

export function trackCalcEvent(calcType: string, eventType: 'open' | 'calc' | 'lead') {
  const user = getUser();
  fetch(CALC_EVENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calc_type: calcType, event_type: eventType, user_id: user.id || null }),
  }).catch((_e) => { /* fire and forget */ });
}
