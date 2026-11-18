export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);
export const modKey = isMac ? '⌘' : 'Ctrl';

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

export function timeAgo(iso: string): string {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

/**
 * Tiny fuzzy matcher: contiguous substring matches beat scattered subsequences,
 * and earlier matches beat later ones. Returns -1 for no match.
 */
export function fuzzyScore(query: string, text: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const t = text.toLowerCase();
  const idx = t.indexOf(q);
  if (idx !== -1) return 1000 - idx - (idx > 0 && t[idx - 1] !== ' ' ? 50 : 0);
  let ti = 0;
  let gaps = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return -1;
    gaps += found - ti;
    ti = found + 1;
  }
  return 500 - gaps;
}

/**
 * Every word in the query has to match something: names (title, repo…) are fuzzy-matched,
 * long text like descriptions only by substring — otherwise short queries would match nearly
 * every paragraph as a subsequence. A name containing the whole phrase ranks first.
 */
export function searchScore(query: string, names: string[], text: string[] = []): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const words = q.split(/\s+/);
  const lowerText = text.map((t) => t.toLowerCase());
  let total = 0;
  for (const word of words) {
    let best = -1;
    for (const name of names) best = Math.max(best, fuzzyScore(word, name));
    if (best < 0 && lowerText.some((t) => t.includes(word))) best = 100;
    if (best < 0) return -1;
    total += best;
  }
  const phraseBonus = names.some((n) => n.toLowerCase().includes(q)) ? 1000 : 0;
  return total / words.length + phraseBonus;
}

export function hashHue(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 360;
}

export const titleCase = (slug: string) =>
  slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
