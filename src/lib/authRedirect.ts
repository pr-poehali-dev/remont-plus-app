/**
 * Куда вернуть человека после входа или регистрации.
 * Понимает ?redirect= и ?back= (его ставит ProtectedRoute).
 * Пускает только внутренние пути сайта — внешние ссылки игнорируются.
 */
export function getAuthReturnPath(params: URLSearchParams): string | null {
  const raw = params.get("redirect") || params.get("back");
  if (!raw) return null;
  let path = raw;
  try {
    path = decodeURIComponent(raw);
  } catch {
    /* оставляем как есть */
  }
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (/^\/(login|register)(\/|\?|$)/.test(path)) return null;
  return path;
}

/** Хвост для ссылок «Войти» ↔ «Зарегистрироваться», сохраняющий возврат. */
export function authReturnQuery(path: string | null): string {
  return path ? `?redirect=${encodeURIComponent(path)}` : "";
}
