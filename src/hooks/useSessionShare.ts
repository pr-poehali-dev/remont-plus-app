import { useEffect, useState } from "react";

/**
 * Универсальный хук для шаринга состояния калькулятора между устройствами.
 *
 * Кодирует state в base64, кладёт в ?session= и возвращает ссылку + QR.
 * При монтировании читает ?session= из URL и вызывает onRestore.
 */
export function useSessionShare<T>(
  state: T,
  storageKey: string,
  onRestore?: (restored: T) => void,
) {
  const [restored, setRestored] = useState(false);

  // Восстановление из URL при первой загрузке
  useEffect(() => {
    if (restored) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const sessionParam = params.get("session");
      if (sessionParam) {
        const decoded = decodeURIComponent(escape(atob(sessionParam)));
        const payload = JSON.parse(decoded) as T;
        onRestore?.(payload);
        // Очищаем URL
        const url = new URL(window.location.href);
        url.searchParams.delete("session");
        window.history.replaceState({}, "", url.toString());
      }
      setRestored(true);
    } catch {
      setRestored(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildShareUrl = (): string => {
    const json = JSON.stringify(state);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?session=${encoded}`;
  };

  const buildQrUrl = (size = 320): string => {
    const shareUrl = buildShareUrl();
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(
      shareUrl,
    )}`;
  };

  // Дополнительно: автосейв в localStorage по ключу
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* quota — ок */
    }
  }, [state, storageKey]);

  return { buildShareUrl, buildQrUrl };
}
