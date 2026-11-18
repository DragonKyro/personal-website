import { useEffect, useMemo, useState } from 'react';
import { excludedRepos, type HostedApp, hostedApps } from '../content/apps';
import { site } from '../content/site';
import { hashHue, titleCase } from './text';

export interface ResolvedApp extends HostedApp {
  url: string;
  sourceUrl: string;
  updatedAt?: string;
  /** Found via the GitHub API rather than listed in content/apps.ts. */
  discovered?: boolean;
}

interface RepoInfo {
  name: string;
  description: string | null;
  has_pages: boolean;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
}

const CACHE_KEY = `gh-repos:${site.githubUser}`;
const TTL = 30 * 60_000; // unauthenticated API allows 60 req/hr; this keeps us well under
const user = site.githubUser;

export const pagesUrl = (repo: string) => `https://${user.toLowerCase()}.github.io/${repo}/`;
export const repoUrl = (repo: string) => `https://github.com/${user}/${repo}`;

function readCache(): { at: number; repos: RepoInfo[] } | null {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

let inflight: Promise<RepoInfo[] | null> | null = null;

function fetchRepos(): Promise<RepoInfo[] | null> {
  const cached = readCache();
  if (cached && Date.now() - cached.at < TTL) return Promise.resolve(cached.repos);
  inflight ??= fetch(`https://api.github.com/users/${user}/repos?per_page=100&type=owner`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then((data: RepoInfo[]) => {
      const repos = data.map(({ name, description, has_pages, fork, archived, pushed_at }) => ({
        name,
        description,
        has_pages,
        fork,
        archived,
        pushed_at,
      }));
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos }));
      } catch {
        /* storage full or unavailable */
      }
      return repos;
    })
    .catch(() => cached?.repos ?? null) // rate-limited or offline: fall back to stale data or the static list
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function resolve(repos: RepoInfo[] | null): ResolvedApp[] {
  const byName = new Map(repos?.map((r) => [r.name.toLowerCase(), r]));
  const curated = hostedApps
    .filter((app) => !app.hidden && app.status !== 'offline')
    .map<ResolvedApp>((app) => ({
      ...app,
      url: app.url ?? pagesUrl(app.repo),
      sourceUrl: repoUrl(app.repo),
      updatedAt: byName.get(app.repo.toLowerCase())?.pushed_at,
    }));

  const known = new Set([...hostedApps.map((a) => a.repo), ...excludedRepos].map((n) => n.toLowerCase()));
  const discovered = (repos ?? [])
    .filter((r) => r.has_pages && !r.fork && !r.archived && !known.has(r.name.toLowerCase()))
    .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
    .map<ResolvedApp>((r) => ({
      repo: r.name,
      title: titleCase(r.name),
      blurb: r.description ?? 'Freshly deployed — no description yet.',
      category: 'New',
      hue: hashHue(r.name),
      url: pagesUrl(r.name),
      sourceUrl: repoUrl(r.name),
      updatedAt: r.pushed_at,
      discovered: true,
    }));

  return [...curated, ...discovered];
}

/** Curated apps, enriched with live GitHub data and any newly deployed Pages sites. */
export function useHostedApps() {
  const [repos, setRepos] = useState<RepoInfo[] | null>(() => readCache()?.repos ?? null);
  useEffect(() => {
    let alive = true;
    fetchRepos().then((r) => alive && r && setRepos(r));
    return () => {
      alive = false;
    };
  }, []);
  const apps = useMemo(() => resolve(repos), [repos]);
  return { apps, synced: repos !== null };
}
