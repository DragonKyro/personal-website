/**
 * Seasonal themes. The site picks the first entry whose dates match today, so holidays
 * sit above the four base seasons (which together cover the whole year).
 *
 * A season only changes two things, so it never competes with your content:
 *   1. the accent hues (links, highlights, glows), and
 *   2. a light ambient particle layer behind the hero.
 *
 * Preview any of them with ?season=<id> (or ?season=off), or from the ⌘K palette.
 */

export type SeasonEffect =
  | 'snow'
  | 'petals'
  | 'leaves'
  | 'fireflies'
  | 'lanterns'
  | 'ghosts'
  | 'confetti'
  | 'hearts'
  | 'pi'
  | 'none';

/** 'MM-DD' inclusive range (may wrap the new year), or fixed dates with a window around them. */
export type DateRule =
  | { from: string; to: string }
  | { dates: string[]; daysBefore?: number; daysAfter?: number };

export interface Season {
  id: string;
  name: string;
  /** Replaces the hero status pill while active. */
  greeting?: string;
  /** OKLCH hues for --accent and --accent-2. */
  hue: number;
  hue2: number;
  effect: SeasonEffect;
  when: DateRule[];
}

/**
 * Pin a season regardless of the date (e.g. for a game launch or a pop-culture moment),
 * or set to 'off' for the default look. null = follow the calendar.
 */
export const seasonOverride: string | null = null;

/** Used when seasons are turned off. */
export const defaultHues = { hue: 285, hue2: 40 };

export const seasons: Season[] = [
  {
    id: 'new-year',
    name: 'New Year',
    greeting: 'Happy New Year',
    hue: 85,
    hue2: 300,
    effect: 'confetti',
    when: [{ from: '12-31', to: '01-02' }],
  },
  {
    id: 'lunar-new-year',
    name: 'Lunar New Year',
    greeting: '恭喜發財 · Happy Lunar New Year',
    hue: 27,
    hue2: 85,
    effect: 'lanterns',
    // Runs through the Lantern Festival. Add future years as needed.
    when: [{ dates: ['2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13', '2030-02-03'], daysBefore: 2, daysAfter: 14 }],
  },
  {
    id: 'valentines',
    name: 'Valentine’s',
    hue: 355,
    hue2: 320,
    effect: 'hearts',
    when: [{ from: '02-12', to: '02-14' }],
  },
  {
    id: 'pi-day',
    name: 'Pi Day',
    greeting: 'Happy π day · 3.14159…',
    hue: 255,
    hue2: 190,
    effect: 'pi',
    when: [{ from: '03-14', to: '03-14' }],
  },
  {
    id: 'mid-autumn',
    name: 'Mid-Autumn',
    greeting: '中秋節快樂 · Happy Mid-Autumn Festival',
    hue: 70,
    hue2: 30,
    effect: 'lanterns',
    when: [{ dates: ['2026-09-25', '2027-09-15', '2028-10-03', '2029-09-22', '2030-09-12'], daysBefore: 3, daysAfter: 2 }],
  },
  {
    id: 'halloween',
    name: 'Halloween',
    greeting: 'Spooky season',
    hue: 305,
    hue2: 55,
    effect: 'ghosts',
    when: [{ from: '10-24', to: '10-31' }],
  },
  {
    id: 'holidays',
    name: 'Holidays',
    greeting: 'Happy holidays',
    hue: 220,
    hue2: 80,
    effect: 'snow',
    when: [{ from: '12-15', to: '12-30' }],
  },

  // Base seasons — together these cover every day of the year.
  { id: 'winter', name: 'Winter', hue: 235, hue2: 200, effect: 'snow', when: [{ from: '12-01', to: '02-29' }] },
  { id: 'spring', name: 'Spring', hue: 345, hue2: 150, effect: 'petals', when: [{ from: '03-01', to: '05-31' }] },
  { id: 'summer', name: 'Summer', hue: 195, hue2: 70, effect: 'fireflies', when: [{ from: '06-01', to: '08-31' }] },
  { id: 'autumn', name: 'Autumn', hue: 50, hue2: 25, effect: 'leaves', when: [{ from: '09-01', to: '11-30' }] },
];
