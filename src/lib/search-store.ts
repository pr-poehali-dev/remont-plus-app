import func2url from '../../backend/func2url.json';

const SITES_API = func2url['sites-api'];
const BLOCKED_API = func2url['blocked-api'];
const ADMIN_KEY = 'searchengine_admin';

export interface SiteEntry {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  favicon?: string;
  addedAt: string;
}

export interface BlockedSite {
  id: string;
  urlPattern: string;
  reason: string;
  blockedAt: string;
}

export async function getSites(): Promise<SiteEntry[]> {
  const res = await fetch(SITES_API);
  if (!res.ok) return [];
  return res.json();
}

export async function searchSites(query: string): Promise<SiteEntry[]> {
  if (!query.trim()) return [];
  const res = await fetch(`${SITES_API}?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function addSite(site: Omit<SiteEntry, 'id' | 'addedAt'>): Promise<SiteEntry | null> {
  const res = await fetch(SITES_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(site),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function removeSite(id: string): Promise<void> {
  await fetch(`${SITES_API}?id=${id}`, { method: 'DELETE' });
}

export async function getBlockedSites(): Promise<BlockedSite[]> {
  const res = await fetch(BLOCKED_API);
  if (!res.ok) return [];
  return res.json();
}

export async function blockSite(urlPattern: string, reason: string): Promise<BlockedSite | null> {
  const res = await fetch(BLOCKED_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urlPattern, reason }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function unblockSite(id: string): Promise<void> {
  await fetch(`${BLOCKED_API}?id=${id}`, { method: 'DELETE' });
}

export async function isSiteBlocked(url: string): Promise<BlockedSite | null> {
  const res = await fetch(`${BLOCKED_API}?check=${encodeURIComponent(url)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.blocked ? data.entry : null;
}

export function isAdmin(): boolean {
  try {
    const v = localStorage.getItem(ADMIN_KEY);
    return v ? JSON.parse(v) : false;
  } catch {
    return false;
  }
}

export function setAdmin(value: boolean): void {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(value));
}
