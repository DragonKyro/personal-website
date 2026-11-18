import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { defaultHues, type Season } from '../content/seasons';
import { prefersReducedMotion } from '../lib/motion';
import { initialChoice, resolveSeason, saveChoice, type SeasonChoice } from '../lib/seasons';
import { CommandPalette } from '../components/CommandPalette';
import { Toaster } from '../components/Toaster';
import { WipBanner } from '../components/WipBanner';

/* ---------------------------------------------------------------- theme */

export type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  /** Pass the click position for a circular reveal from that point. */
  toggleTheme: (origin?: { x: number; y: number }) => void;
}

/* --------------------------------------------------------------- season */

interface SeasonCtx {
  season: Season | null;
  choice: SeasonChoice;
  setChoice: (choice: SeasonChoice) => void;
}

/* -------------------------------------------------------- palette/toast */

interface PaletteCtx {
  open: boolean;
  query: string;
  openPalette: (query?: string) => void;
  closePalette: () => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);
const SeasonContext = createContext<SeasonCtx | null>(null);
const PaletteContext = createContext<PaletteCtx | null>(null);
const ToastContext = createContext<((message: string) => void) | null>(null);

function use<T>(ctx: React.Context<T | null>, name: string): T {
  const value = useContext(ctx);
  if (!value) throw new Error(`${name} must be used inside <Shell>`);
  return value;
}
export const useTheme = () => use(ThemeContext, 'useTheme');
export const useSeason = () => use(SeasonContext, 'useSeason');
export const usePalette = () => use(PaletteContext, 'usePalette');
export const useToast = () => use(ToastContext, 'useToast');

function applyHues(season: Season | null) {
  const { hue, hue2 } = season ?? defaultHues;
  const root = document.documentElement.style;
  root.setProperty('--accent-h', String(hue));
  root.setProperty('--accent2-h', String(hue2));
}

export function Shell({ children }: { children: ReactNode }) {
  /* theme */
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme as Theme) ?? 'dark');

  const toggleTheme = useCallback<ThemeCtx['toggleTheme']>((origin) => {
    const next: Theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    const apply = () => {
      document.documentElement.dataset.theme = next;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#09090b' : '#fafaf9');
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* storage unavailable */
      }
      flushSync(() => setTheme(next));
    };

    if (!document.startViewTransition || prefersReducedMotion()) return apply();

    const x = origin?.x ?? innerWidth - 40;
    const y = origin?.y ?? 40;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  }, []);

  /* season */
  const [choice, setChoiceState] = useState<SeasonChoice>(initialChoice);
  const season = useMemo(() => resolveSeason(choice), [choice]);
  useEffect(() => applyHues(season), [season]);
  const setChoice = useCallback((next: SeasonChoice) => {
    saveChoice(next);
    setChoiceState(next);
  }, []);

  /* palette */
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const openPalette = useCallback((query = '') => {
    setPaletteQuery(query);
    setPaletteOpen(true);
  }, []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
        setPaletteQuery('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* toast */
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastTimer = useRef<number>(undefined);
  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const themeValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  const seasonValue = useMemo(() => ({ season, choice, setChoice }), [season, choice, setChoice]);
  const paletteValue = useMemo(
    () => ({ open: paletteOpen, query: paletteQuery, openPalette, closePalette }),
    [paletteOpen, paletteQuery, openPalette, closePalette],
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <SeasonContext.Provider value={seasonValue}>
        <ToastContext.Provider value={showToast}>
          <PaletteContext.Provider value={paletteValue}>
            <WipBanner />
            {children}
            <CommandPalette />
            <Toaster toast={toast} />
          </PaletteContext.Provider>
        </ToastContext.Provider>
      </SeasonContext.Provider>
    </ThemeContext.Provider>
  );
}
