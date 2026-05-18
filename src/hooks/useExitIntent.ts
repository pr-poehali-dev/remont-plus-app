import { useEffect, useRef } from "react";

interface ExitIntentOptions {
  /** Минимальное время на странице перед активацией триггера, мс. Default: 5000 */
  delay?: number;
  /** Триггер сработает только если выполнено условие (например, есть валидная сумма) */
  enabled?: boolean;
  /** Ключ для localStorage — после успешного срабатывания не повторять в течение TTL */
  storageKey?: string;
  /** TTL «не показывать снова» в минутах. Default: 60 */
  cooldownMin?: number;
  /** Колбэк при срабатывании. Должен возвращать boolean — был ли показ (если false, cooldown не записывается) */
  onTrigger: () => boolean | void;
}

/**
 * Отслеживает попытку покинуть страницу:
 * - desktop: курсор движется вверх к адресной строке (clientY <= 0)
 * - mobile: scroll вверх после прокрутки вниз (scroll-up gesture)
 * - tab visibility — потенциальное переключение на другую вкладку
 *
 * Не срабатывает чаще чем cooldownMin минут (хранится в localStorage).
 */
export function useExitIntent({
  delay = 5000,
  enabled = true,
  storageKey,
  cooldownMin = 60,
  onTrigger,
}: ExitIntentOptions) {
  const armedRef = useRef(false);
  const firedRef = useRef(false);
  const triggerRef = useRef(onTrigger);

  // Всегда держим актуальную ссылку на колбэк
  triggerRef.current = onTrigger;

  useEffect(() => {
    if (!enabled) return;

    // Проверяем cooldown
    if (storageKey) {
      try {
        const last = parseInt(localStorage.getItem(storageKey) || "0", 10);
        if (last && Date.now() - last < cooldownMin * 60 * 1000) {
          return; // ещё не остыл
        }
      } catch { /* ignore */ }
    }

    const armTimer = setTimeout(() => { armedRef.current = true; }, delay);

    const tryFire = (): boolean => {
      if (!armedRef.current || firedRef.current) return false;
      const shown = triggerRef.current();
      // Если колбэк явно вернул false — не считаем за успешный показ
      if (shown === false) return false;
      firedRef.current = true;
      if (storageKey) {
        try { localStorage.setItem(storageKey, String(Date.now())); } catch { /* ignore */ }
      }
      return true;
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) tryFire();
    };

    let lastScrollY = window.scrollY;
    let scrollDownReached = false;
    const handleScroll = () => {
      const y = window.scrollY;
      // Отслеживаем: пользователь сначала скроллил вниз > 400px, потом резко вверх
      if (y > 400) scrollDownReached = true;
      if (scrollDownReached && y < lastScrollY - 80 && y < 200) tryFire();
      lastScrollY = y;
    };

    const handleVisibilityChange = () => {
      // Потенциальное переключение на другую вкладку — мягкий триггер
      if (document.visibilityState === "hidden") {
        // Не закрываем сразу, просто помечаем намерение
        // (на мобилках это срабатывает при сворачивании браузера)
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, delay, storageKey, cooldownMin]);
}
