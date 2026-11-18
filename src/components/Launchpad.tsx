import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { APPS_PAGE } from '../content/site';
import { type ResolvedApp, useHostedApps } from '../lib/github';
import { useInView, useSpotlight } from '../lib/motion';
import { searchScore, timeAgo } from '../lib/text';
import { AppIcon } from './AppIcon';
import { GitHubIcon, Reveal, SectionHeading } from './ui';
import './Launchpad.css';

/**
 * Every hosted GitHub Pages project. `section` sits on the home page;
 * `page` is the standalone /apps/ bookmark with search and keyboard shortcuts.
 */
export function Launchpad({ variant }: { variant: 'section' | 'page' }) {
  const { apps, synced } = useHostedApps();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const groupRef = useSpotlight<HTMLDivElement>();
  const [gridRef, inView] = useInView<HTMLDivElement>('0px 0px -5% 0px');
  const isPage = variant === 'page';

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const app of apps) counts.set(app.category, (counts.get(app.category) ?? 0) + 1);
    return [['All', apps.length] as const, ...counts];
  }, [apps]);

  const visible = useMemo(() => {
    const inCategory = category === 'All' ? apps : apps.filter((a) => a.category === category);
    if (!query.trim()) return inCategory;
    return inCategory
      .map((app) => ({ app, score: searchScore(query, [app.title, app.repo], [app.blurb, app.category]) }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.app);
  }, [apps, category, query]);

  // "/" focuses search on the launchpad page.
  useEffect(() => {
    if (!isPage) return;
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable]');
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [isPage]);

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && visible[0]) {
      if (e.metaKey || e.ctrlKey) window.open(visible[0].url, '_blank', 'noopener');
      else location.href = visible[0].url;
    } else if (e.key === 'Escape') {
      setQuery('');
    }
  };

  const heading = isPage ? (
    <Reveal className="launchpad__page-head">
      <h1 className="launchpad__page-title">Launchpad</h1>
      <p className="launchpad__page-desc">
        Everything I host on GitHub Pages, in one place.{' '}
        <span className="launchpad__sync" data-synced={synced}>
          <span aria-hidden />
          {synced ? 'Synced with GitHub' : 'Offline list'}
        </span>
      </p>
    </Reveal>
  ) : (
    <SectionHeading
      index="03"
      label="Launchpad"
      title="Everything I’ve shipped"
      description="Every project I host on GitHub Pages. New deployments show up here automatically."
      action={
        <a className="link-arrow" href={APPS_PAGE}>
          Open full launchpad <ArrowUpRight />
        </a>
      }
    />
  );

  return (
    <section id="launchpad" className={`section launchpad launchpad--${variant}`}>
      <div className="container">
        {heading}

        <Reveal delay={80} className="launchpad__controls">
          {isPage && (
            <label className="search">
              <Search aria-hidden />
              <input
                ref={searchRef}
                type="search"
                placeholder="Search apps…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKey}
                autoFocus
                aria-label="Search apps"
              />
              {query ? (
                <button type="button" className="search__clear" onClick={() => setQuery('')} aria-label="Clear search">
                  <X />
                </button>
              ) : (
                <kbd>/</kbd>
              )}
            </label>
          )}
          <div className="chips" role="group" aria-label="Filter by category">
            {categories.map(([name, count]) => (
              <button
                key={name}
                type="button"
                className="chip"
                aria-pressed={category === name}
                onClick={() => setCategory(name)}
              >
                {name}
                <span className="chip__count">{count}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div ref={groupRef} className="spotlight-group">
          <div ref={gridRef} className={`launchpad__grid-wrap ${inView ? 'is-in' : ''}`}>
            {/* Re-keyed on filter change so the tiles replay their entrance. */}
            <div key={`${category}|${query}`} className="launchpad__grid">
              {visible.map((app, i) => (
                <AppTile key={app.repo} app={app} index={i} />
              ))}
            </div>
            {visible.length === 0 && (
              <p className="launchpad__empty">
                Nothing matches “{query}”.{' '}
                <button type="button" onClick={() => setQuery('')}>
                  Clear search
                </button>
              </p>
            )}
          </div>
        </div>

        {isPage && visible.length > 0 && (
          <p className="launchpad__hint">
            <kbd>↵</kbd> opens the top result · <kbd>/</kbd> to search
          </p>
        )}
      </div>
    </section>
  );
}

function AppTile({ app, index }: { app: ResolvedApp; index: number }) {
  return (
    <article
      className="tile spotlight"
      data-spotlight
      style={{ '--i': Math.min(index, 12) } as CSSProperties}
    >
      <div className="tile__top">
        <AppIcon icon={app.icon} glyph={app.glyph} hue={app.hue} className="tile__icon" />
        <ArrowUpRight className="tile__arrow" aria-hidden />
      </div>
      <h3 className="tile__title">
        <a href={app.url} className="stretched-link">
          {app.title}
        </a>
      </h3>
      <p className="tile__blurb">{app.blurb}</p>
      <div className="tile__meta">
        <span className="status status--live">{app.discovered ? 'New' : 'Live'}</span>
        {app.updatedAt && <span className="tile__updated">· {timeAgo(app.updatedAt)}</span>}
        <a href={app.sourceUrl} className="tile__source" aria-label={`${app.title} source on GitHub`}>
          <GitHubIcon />
        </a>
      </div>
    </article>
  );
}
