/**
 * Everything personal about the site lives in this folder.
 * Anything marked PLACEHOLDER is filler sized to roughly the length the layout expects.
 */

export type SocialIcon = 'github' | 'linkedin' | 'mail' | 'resume';

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
}

export interface SiteConfig {
  name: string;
  initials: string;
  githubUser: string;
  /** Work-in-progress bar across the top of every page. Set to null to remove it. */
  wipBanner: string | null;
  /** Small pill above your name. Set to null to hide it. */
  status: string | null;
  /** Hero line, followed by one of `rotatingWords`. */
  headline: string;
  rotatingWords: string[];
  intro: string;
  about: string[];
  facts: { label: string; value: string }[];
  now: string[];
  /** Month the "Now" list was last touched, e.g. "Nov 2026". */
  nowUpdated: string;
  /** Line under the contact heading. */
  contact: string;
  email: string;
  /** Path to a PDF in /public (e.g. "resume.pdf") or a full URL. null hides it. */
  resumeUrl: string | null;
  /** Path to an image in /public (e.g. "portrait.jpg"). null shows a monogram instead. */
  portrait: string | null;
  socials: SocialLink[];
}

export const site: SiteConfig = {
  name: 'Kyle Lui',
  initials: 'KL',
  githubUser: 'DragonKyro',

  wipBanner: 'This site is still being built — some content is placeholder.',

  status: 'Currently building a shelf of browser board games',

  headline: 'Software engineer who builds',
  rotatingWords: ['board games.', 'game AIs.', 'tools for friends.', 'weekend side quests.'],

  // PLACEHOLDER
  intro:
    'One or two sentences about what you do and what you care about. Keep it short — the rest of the page does the talking.',

  // PLACEHOLDER
  about: [
    'Where you are in your career, the kinds of problems that pull you in, and what teammates come to you for. Two to three sentences reads best here.',
    'Something more personal — the board-game nights, the math competitions, the bridge table, the side projects that got out of hand. The stuff that makes the work yours.',
  ],

  // PLACEHOLDER
  facts: [
    { label: 'Based in', value: 'City, State' },
    { label: 'Focus', value: 'Full-stack · Game AI' },
    { label: 'Studied', value: 'EECS @ University' },
    { label: 'Playing', value: 'Spirit Island, solo' },
  ],

  // PLACEHOLDER
  now: [
    'Porting my favourite tabletop games to the browser',
    'Teaching bots to play social deduction games well',
    'Reading: a book you’re into right now',
  ],
  nowUpdated: 'Nov 2026',

  // PLACEHOLDER
  contact:
    'Say what you’re open to — new roles, collaborations, or just a game night. Email is the fastest way to reach me.',
  email: 'you@example.com', // PLACEHOLDER
  resumeUrl: null,
  portrait: null,

  socials: [
    { label: 'GitHub', href: 'https://github.com/DragonKyro', icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-handle', icon: 'linkedin' }, // PLACEHOLDER
  ],
};

/** Sections on the home page, in order. Used by the nav and the command palette. */
export const sections = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'launchpad', label: 'Launchpad' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
] as const;

export const BASE = import.meta.env.BASE_URL;
export const APPS_PAGE = `${BASE}apps/`;
