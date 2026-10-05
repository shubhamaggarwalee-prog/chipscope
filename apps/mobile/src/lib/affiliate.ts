import { Linking } from 'react-native';

/**
 * Affiliate plumbing — the "keep it free" engine.
 *
 * HONEST STATUS (verified 2026-10-04):
 *  - Amazon Associates: real program, sign up at affiliate-program.amazon.com.
 *    Works with mobile apps. You must drive 3 qualifying sales in 180 days
 *    to keep the account approved.
 *  - ShareASale / Awin: affiliate NETWORKS — search their merchant directories
 *    for electronics/component retailers with programs, then add the tag here.
 *    (You already know ShareASale from the Pinterest playbook.)
 *  - Mouser / DigiKey / LCSC: no public self-serve affiliate program could be
 *    verified. Their buttons below work as plain part-search links (still
 *    useful), they just don't earn until/unless a program is found.
 *
 * HOW TO EARN: join Amazon Associates (and any network merchants you find),
 * paste your IDs into AFFILIATE_IDS below, rebuild. Until then the buttons
 * still work as plain search links — you just don't earn.
 *
 * FTC note: every screen that shows these links also shows a commission
 * disclosure. Don't remove it.
 */

const AFFILIATE_IDS: Record<string, string> = {
  amazon: '',
  mouser: '',
  digikey: '',
  lcsc: '',
};

export interface Distributor {
  id: string;
  name: string;
  blurb: string;
  /** Plain search URL for a query (works with no affiliate ID). */
  searchUrl: (query: string) => string;
  /** Query param the network uses for the affiliate tag. */
  tagParam: string;
}

export const DISTRIBUTORS: Distributor[] = [
  {
    id: 'mouser',
    name: 'Mouser',
    blurb: 'Newest parts, no minimum order',
    searchUrl: (q) => `https://www.mouser.com/Search/Refine?Keyword=${encodeURIComponent(q)}`,
    tagParam: 'aff',
  },
  {
    id: 'digikey',
    name: 'Digi-Key',
    blurb: 'Huge catalog, fast shipping',
    // Format confirmed as best-effort (DigiKey blocks bots); verify once in a real browser.
    searchUrl: (q) => `https://www.digikey.com/en/search?keywords=${encodeURIComponent(q)}`,
    tagParam: 'aff',
  },
  {
    id: 'lcsc',
    name: 'LCSC',
    blurb: 'Best prices on Asian components',
    searchUrl: (q) => `https://www.lcsc.com/search?q=${encodeURIComponent(q)}`,
    tagParam: 'aff',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    blurb: 'Modules, tools & dev boards',
    searchUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
    tagParam: 'tag',
  },
];

/** Full URL for a distributor search, with affiliate tag when configured. */
export function partUrl(d: Distributor, query: string): string {
  const base = d.searchUrl(query);
  const id = (AFFILIATE_IDS[d.id] || '').trim();
  if (!id) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}${d.tagParam}=${encodeURIComponent(id)}`;
}

export function openParts(d: Distributor, query: string): void {
  Linking.openURL(partUrl(d, query)).catch(() => {});
}

/** True once at least one affiliate ID is configured. */
export function isEarning(): boolean {
  return Object.values(AFFILIATE_IDS).some((v) => v.trim().length > 0);
}
