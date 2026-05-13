/**
 * Универсальная утилита share-ссылок для смет/расчётов.
 * Хранит снапшот сметы в localStorage + кодирует токен в URL.
 * При открытии /estimate/shared/:token читаем из localStorage (если своё устройство)
 * либо декодируем base64-payload из query-параметра ?d= (если ссылка с другого устройства).
 */

export interface SharedEstimate {
  type: string;
  title: string;
  total: number;
  region?: string;
  config?: Record<string, unknown>;
  items?: Array<{ name: string; price: number; qty?: number; unit?: string }>;
  createdAt: string;
  author?: string;
}

const STORAGE_PREFIX = "avangard_shared_estimate_";

function genToken(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

function encodePayload(data: SharedEstimate): string {
  try {
    const json = JSON.stringify(data);
    const utf8 = new TextEncoder().encode(json);
    let bin = "";
    utf8.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return "";
  }
}

export function decodePayload(encoded: string): SharedEstimate | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (encoded.length % 4)) % 4);
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as SharedEstimate;
  } catch {
    return null;
  }
}

export function createShareLink(data: SharedEstimate): { token: string; url: string } {
  const token = genToken();
  try {
    localStorage.setItem(STORAGE_PREFIX + token, JSON.stringify(data));
  } catch { /* ignore quota */ }
  const payload = encodePayload(data);
  const base = `${window.location.origin}/estimate/shared/${token}`;
  const url = payload ? `${base}?d=${payload}` : base;
  return { token, url };
}

export function readShareFromStorage(token: string): SharedEstimate | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + token);
    if (!raw) return null;
    return JSON.parse(raw) as SharedEstimate;
  } catch {
    return null;
  }
}

export function formatRub(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n));
}
