import type { LucideIcon } from 'lucide-react';
import { Bird, Bomb, Ghost, Heart, Hexagon, Layers, TreeDeciduous, TreePalm, VenetianMask } from 'lucide-react';

/**
 * Everything hosted on GitHub Pages under DragonKyro.
 *
 * This list is the curated source of truth (nice titles, icons, ordering). On top of it,
 * the site asks the GitHub API at runtime for any *other* repo with Pages enabled and
 * appends it automatically, so a newly deployed project shows up without editing this file.
 */

export interface HostedApp {
  /** Repo name; the URL defaults to https://dragonkyro.github.io/<repo>/ */
  repo: string;
  title: string;
  blurb: string;
  category: string;
  /** A Lucide icon, or a short text glyph. */
  icon?: LucideIcon;
  glyph?: string;
  /** 0–360, drives the icon gradient. */
  hue: number;
  /** 'offline' = Pages is enabled but nothing is served yet. Hidden until you delete this line. */
  status?: 'live' | 'offline';
  /** Override the default github.io URL (e.g. a custom domain). */
  url?: string;
  /** Keep it off the site without deleting the entry. */
  hidden?: boolean;
}

export const hostedApps: HostedApp[] = [
  {
    repo: 'catan',
    title: 'Catan',
    blurb: 'Settle, trade and build — base game plus expansions.',
    category: 'Board games',
    icon: Hexagon,
    hue: 28,
  },
  {
    repo: 'wingspan',
    title: 'Wingspan',
    blurb: 'The bird engine-builder, with Wyrmspan and Finspan variants.',
    category: 'Board games',
    icon: Bird,
    hue: 165,
  },
  {
    repo: 'Spirit-Island',
    title: 'Spirit Island',
    blurb: 'Solo Spirit Island, free in the browser.',
    category: 'Board games',
    icon: TreePalm,
    hue: 120,
  },
  {
    repo: 'ghost-stories',
    title: 'Ghost Stories',
    blurb: 'The co-op game of holding the village against the night.',
    category: 'Board games',
    icon: Ghost,
    hue: 250,
  },
  {
    repo: 'tractor',
    title: 'Tractor · 升级',
    blurb: 'Shengji, the trick-taking card game for four.',
    category: 'Cards & tiles',
    glyph: '升',
    hue: 352,
  },
  {
    repo: 'mahjong',
    title: 'Mahjong',
    blurb: 'Cantonese-style mahjong, tiles and all.',
    category: 'Cards & tiles',
    glyph: '中',
    hue: 8,
  },
  {
    repo: 'card-collecting',
    title: 'Card Collecting',
    blurb: 'Drafting and set-collection: Sushi Go, Sea Salt & Paper, 7 Wonders.',
    category: 'Cards & tiles',
    icon: Layers,
    hue: 200,
  },
  {
    repo: 'chaotic-games',
    title: 'Chaotic Games',
    blurb: 'Exploding Kittens, Unstable Unicorns, Here to Slay and friends.',
    category: 'Cards & tiles',
    icon: Bomb,
    hue: 300,
    status: 'offline', // Hidden: Pages is on, but the last deploy workflow failed.
  },
  {
    repo: 'social-deduction',
    title: 'Social Deduction',
    blurb: 'Werewolf, Avalon, Secret Hitler, Coup — plus sims hunting for GTO plays.',
    category: 'Party',
    icon: VenetianMask,
    hue: 275,
  },
  {
    repo: 'dating-sim',
    title: 'Dating Sim',
    blurb: 'What happens when you hook an AI up to a dating sim?',
    category: 'Experiments',
    icon: Heart,
    hue: 335,
    status: 'offline', // Hidden: Pages is on, but nothing has been deployed yet.
  },
  {
    repo: 'family-tree',
    title: 'Family Tree',
    blurb: 'The Lui + Shum family tree.',
    category: 'Personal',
    icon: TreeDeciduous,
    hue: 95,
    hidden: true,
  },
];

/** Repos with Pages enabled that should never be auto-listed. */
export const excludedRepos = ['personal-website'];
