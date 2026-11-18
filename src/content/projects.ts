import type { LucideIcon } from 'lucide-react';
import { Bot, Cpu, Spade, VenetianMask } from 'lucide-react';
import { APPS_PAGE } from './site';

/**
 * "Selected work" on the home page. The first project gets the large tile.
 * Five projects fills the grid neatly; four or six also work.
 */

export interface Project {
  title: string;
  summary: string;
  tags: string[];
  year: string;
  live?: string;
  source?: string;
  /** Screenshot in /public (e.g. "work/catan.png"). Without one, a generated cover is used. */
  image?: string;
  /** Generated cover: 'launchpad' renders a mini grid of your hosted apps. */
  cover: 'launchpad' | { icon: LucideIcon; hue: number };
}

const gh = (repo: string) => `https://github.com/DragonKyro/${repo}`;

export const projects: Project[] = [
  {
    title: 'The Tabletop Shelf',
    summary:
      'Browser-playable versions of the board and card games I play with friends — Catan, Wingspan, Spirit Island, Mahjong, Tractor and more — with bots for when nobody else is around.',
    tags: ['TypeScript', 'React', 'Game AI'],
    year: '2026',
    live: APPS_PAGE,
    source: 'https://github.com/DragonKyro?tab=repositories',
    cover: 'launchpad',
  },
  {
    title: 'Social Deduction Lab',
    summary: 'One Night Werewolf, Avalon, Secret Hitler and Coup, plus simulations to find game-theory-optimal plays.',
    tags: ['TypeScript', 'Simulation'],
    year: '2026',
    live: 'https://dragonkyro.github.io/social-deduction/',
    source: gh('social-deduction'),
    cover: { icon: VenetianMask, hue: 275 },
  },
  {
    title: 'Bridge Master',
    summary: 'Software for studying the play of the cards in contract bridge.',
    tags: ['Python'],
    year: '2026',
    source: gh('Bridge-Master'),
    cover: { icon: Spade, hue: 210 },
  },
  {
    // PLACEHOLDER copy — say what the robot did and which part you owned.
    title: 'EECS 106A Robotics',
    summary: 'Final project for intro robotics: one sentence on what the robot did and the piece you built.',
    tags: ['Robotics', 'Python'],
    year: '2022',
    source: gh('eecs106a-final-project'),
    cover: { icon: Bot, hue: 30 },
  },
  {
    // PLACEHOLDER copy
    title: 'ISAACS Search',
    summary: 'A search algorithm for the ISAACS research project. One sentence on the problem and the result.',
    tags: ['Research', 'Jupyter'],
    year: '2021',
    source: gh('ISAACS-Search'),
    cover: { icon: Cpu, hue: 180 },
  },
];
