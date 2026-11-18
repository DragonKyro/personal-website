import { type DateRule, type Season, seasonOverride, seasons } from '../content/seasons';

const pad = (n: number) => String(n).padStart(2, '0');
const monthDay = (d: Date) => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const DAY = 86_400_000;

function matches(rule: DateRule, date: Date): boolean {
  if ('from' in rule) {
    const md = monthDay(date);
    return rule.from <= rule.to ? md >= rule.from && md <= rule.to : md >= rule.from || md <= rule.to;
  }
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return rule.dates.some((iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    const anchor = new Date(y, m - 1, d).getTime();
    return today >= anchor - (rule.daysBefore ?? 0) * DAY && today <= anchor + (rule.daysAfter ?? 0) * DAY;
  });
}

export function seasonForDate(date: Date): Season | null {
  return seasons.find((s) => s.when.some((rule) => matches(rule, date))) ?? null;
}

export const findSeason = (id: string) => seasons.find((s) => s.id === id) ?? null;

const STORAGE_KEY = 'season';

/** 'auto' follows the calendar; 'off' disables; anything else is a season id. */
export type SeasonChoice = 'auto' | 'off' | (string & {});

/** URL param beats saved preference beats the config override beats the calendar. */
export function initialChoice(): SeasonChoice {
  const fromUrl = new URLSearchParams(location.search).get('season');
  if (fromUrl) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
  } catch {
    /* storage unavailable */
  }
  return seasonOverride ?? 'auto';
}

export function saveChoice(choice: SeasonChoice) {
  try {
    if (choice === 'auto') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* storage unavailable */
  }
}

export function resolveSeason(choice: SeasonChoice, date = new Date()): Season | null {
  if (choice === 'off') return null;
  if (choice === 'auto') return seasonForDate(date);
  return findSeason(choice) ?? seasonForDate(date);
}
