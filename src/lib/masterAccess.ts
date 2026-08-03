// Единый автономный доступ ко всем платным разделам сайта.
// Активация: любая страница с параметром ?unlock=КОД (например /account?unlock=avangard-master-2026).
// Флаг сохраняется в localStorage и действует на устройстве постоянно.

const MASTER_KEY = "avangard_master_access";
export const MASTER_CODE = "avangard-master-2026";

/** Активен ли автономный доступ на этом устройстве. */
export function isMasterAccess(): boolean {
  try {
    return localStorage.getItem(MASTER_KEY) === "1";
  } catch {
    return false;
  }
}

/** Включить автономный доступ. */
export function enableMasterAccess(): void {
  try {
    localStorage.setItem(MASTER_KEY, "1");
  } catch {
    /* noop */
  }
}

/** Выключить автономный доступ. */
export function disableMasterAccess(): void {
  try {
    localStorage.removeItem(MASTER_KEY);
  } catch {
    /* noop */
  }
}

/**
 * Проверяет URL на код активации ?unlock=КОД.
 * При совпадении включает доступ и убирает код из адреса.
 * Возвращает true, если доступ был только что активирован.
 */
export function checkUnlockParam(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("unlock") === MASTER_CODE) {
      enableMasterAccess();
      params.delete("unlock");
      const clean = window.location.pathname + (params.toString() ? `?${params}` : "") + window.location.hash;
      window.history.replaceState({}, "", clean);
      return true;
    }
  } catch {
    /* noop */
  }
  return false;
}
