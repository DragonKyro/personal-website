import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  Copy,
  CornerDownLeft,
  FileText,
  Hash,
  House,
  Moon,
  Palette,
  Rocket,
  Search,
  Sun,
} from 'lucide-react';
import { seasons } from '../content/seasons';
import { APPS_PAGE, BASE, sections, site } from '../content/site';
import { useHostedApps } from '../lib/github';
import { modKey, searchScore } from '../lib/text';
import { usePalette, useSeason, useTheme, useToast } from '../shell/Shell';
import { AppIcon } from './AppIcon';
import { SocialGlyph } from './ui';
import './CommandPalette.css';

type Group = 'Navigate' | 'Apps' | 'Links' | 'Actions' | 'Seasons';
const GROUP_ORDER: Group[] = ['Navigate', 'Apps', 'Links', 'Actions', 'Seasons'];

interface Item {
  id: string;
  group: Group;
  label: string;
  hint?: string;
  icon: ReactNode;
  keywords?: string[];
  /** Only listed once you start typing. */
  searchOnly?: boolean;
  run: (opts: { newTab: boolean }) => void;
}

function go(url: string, newTab: boolean) {
  if (newTab) window.open(url, '_blank', 'noopener');
  else location.href = url;
}

function goToSection(id: string, newTab: boolean) {
  const el = document.getElementById(id);
  if (el && !newTab) {
    el.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
  } else go(`${BASE}#${id}`, newTab);
}

export function CommandPalette() {
  const { open, query: initialQuery, closePalette } = usePalette();
  const { theme, toggleTheme } = useTheme();
  const { season, choice, setChoice } = useSeason();
  const toast = useToast();
  const { apps } = useHostedApps();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const items = useMemo<Item[]>(() => {
    const nav: Item[] = [
      { id: 'home', group: 'Navigate', label: 'Home', icon: <House />, run: ({ newTab }) => (document.getElementById('top') && !newTab ? scrollTo({ top: 0, behavior: 'smooth' }) : go(BASE, newTab)) },
      ...sections.map<Item>((s) => ({
        id: `section-${s.id}`,
        group: 'Navigate',
        label: s.label,
        icon: <Hash />,
        run: ({ newTab }) => goToSection(s.id, newTab),
      })),
      { id: 'launchpad-page', group: 'Navigate', label: 'Launchpad page', hint: 'bookmarkable', icon: <Rocket />, keywords: ['apps', 'bookmark'], run: ({ newTab }) => go(APPS_PAGE, newTab) },
    ];

    const appItems = apps.map<Item>((app) => ({
      id: `app-${app.repo}`,
      group: 'Apps',
      label: app.title,
      hint: app.category,
      icon: <AppIcon icon={app.icon} glyph={app.glyph} hue={app.hue} size={22} />,
      keywords: [app.repo, app.blurb, app.category],
      run: ({ newTab }) => go(app.url, newTab),
    }));

    const links: Item[] = [
      ...site.socials.map<Item>((s) => ({
        id: `social-${s.label}`,
        group: 'Links',
        label: s.label,
        icon: <SocialGlyph icon={s.icon} />,
        run: ({ newTab }) => go(s.href, newTab),
      })),
      {
        id: 'copy-email',
        group: 'Links',
        label: 'Copy email address',
        hint: site.email,
        icon: <Copy />,
        keywords: ['contact', 'mail'],
        run: () => navigator.clipboard.writeText(site.email).then(() => toast('Email copied to clipboard')),
      },
    ];
    if (site.resumeUrl) {
      const href = /^https?:/.test(site.resumeUrl) ? site.resumeUrl : `${BASE}${site.resumeUrl}`;
      links.push({ id: 'resume', group: 'Links', label: 'Résumé', icon: <FileText />, keywords: ['cv', 'resume'], run: ({ newTab }) => go(href, newTab) });
    }

    const actions: Item[] = [
      {
        id: 'toggle-theme',
        group: 'Actions',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
        icon: theme === 'dark' ? <Sun /> : <Moon />,
        keywords: ['theme', 'dark', 'light'],
        run: () => toggleTheme(),
      },
      {
        id: 'season-auto',
        group: 'Actions',
        label: 'Seasonal theme: follow the calendar',
        hint: choice === 'auto' ? 'current' : undefined,
        icon: <CalendarDays />,
        keywords: ['season', 'holiday', 'theme', 'auto'],
        run: () => setChoice('auto'),
      },
      {
        id: 'season-off',
        group: 'Actions',
        label: 'Seasonal theme: off',
        hint: choice === 'off' ? 'current' : undefined,
        icon: <Palette />,
        keywords: ['season', 'holiday', 'theme', 'classic', 'disable'],
        run: () => setChoice('off'),
      },
    ];

    const seasonItems = seasons.map<Item>((s) => ({
      id: `season-${s.id}`,
      group: 'Seasons',
      label: `Preview ${s.name}`,
      hint: season?.id === s.id ? 'active' : undefined,
      icon: <CalendarDays />,
      keywords: ['season', s.id, s.effect],
      searchOnly: true,
      run: () => setChoice(s.id),
    }));

    return [...nav, ...appItems, ...links, ...actions, ...seasonItems];
  }, [apps, theme, toggleTheme, choice, season, setChoice, toast]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return items.filter((i) => !i.searchOnly);
    const scored = items
      .map((item) => ({ item, score: searchScore(q, [item.label], [...(item.keywords ?? []), item.group]) }))
      .filter((r) => r.score >= 0);
    // Groups are ordered by their best match, items by score within a group.
    const best = new Map<Group, number>();
    for (const { item, score } of scored) best.set(item.group, Math.max(best.get(item.group) ?? -1, score));
    return scored
      .sort(
        (a, b) =>
          (best.get(b.item.group)! - best.get(a.item.group)!) ||
          GROUP_ORDER.indexOf(a.item.group) - GROUP_ORDER.indexOf(b.item.group) ||
          b.score - a.score,
      )
      .map((r) => r.item);
  }, [items, query]);

  // Open/close the native <dialog>, which gives us focus trapping and Esc for free.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setQuery(initialQuery);
      setActive(0);
      dialog.showModal();
      requestAnimationFrame(() => inputRef.current?.select());
    } else if (!open && dialog.open) dialog.close();
  }, [open, initialQuery]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const run = (item: Item | undefined, newTab: boolean) => {
    if (!item) return;
    closePalette();
    // Let the dialog close (and restore focus) before navigating/scrolling.
    requestAnimationFrame(() => item.run({ newTab }));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = results.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (n ? (a + 1) % n : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (n ? (a - 1 + n) % n : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[active], e.metaKey || e.ctrlKey);
    }
  };

  let lastGroup: Group | null = null;

  return (
    <dialog
      ref={dialogRef}
      className="palette"
      aria-label="Command palette"
      onClose={closePalette}
      onClick={(e) => e.target === e.currentTarget && closePalette()}
    >
      <div className="palette__panel" onKeyDown={onKeyDown}>
        <div className="palette__search">
          <Search aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps, sections, links…"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
            aria-autocomplete="list"
            spellCheck={false}
          />
          <kbd>esc</kbd>
        </div>

        <ul ref={listRef} id="palette-list" className="palette__list" role="listbox">
          {results.length === 0 && <li className="palette__empty">No results for “{query}”</li>}
          {results.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={item.id} role="presentation">
                {header && <div className="palette__group">{header}</div>}
                <div
                  id={`palette-${item.id}`}
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  className="palette__item"
                  onMouseMove={() => i !== active && setActive(i)}
                  onClick={(e) => run(item, e.metaKey || e.ctrlKey)}
                >
                  <span className="palette__icon">{item.icon}</span>
                  <span className="palette__label">{item.label}</span>
                  {item.hint && <span className="palette__hint">{item.hint}</span>}
                  <CornerDownLeft className="palette__enter" aria-hidden />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="palette__footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>{modKey}</kbd>
            <kbd>↵</kbd> new tab
          </span>
        </div>
      </div>
    </dialog>
  );
}
