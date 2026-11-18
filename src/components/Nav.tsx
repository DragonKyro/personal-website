import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { sections } from '../content/site';
import { Brand, PaletteButton, ThemeToggle } from './ui';
import './Nav.css';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pill, setPill] = useState({ x: 0, w: 0 });
  const [layoutTick, setLayoutTick] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  // Glass background once scrolled + reading-progress bar.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = scrollY;
      setScrolled(y > 12);
      const max = document.documentElement.scrollHeight - innerHeight;
      progressRef.current?.style.setProperty('--progress', String(max > 0 ? Math.min(1, y / max) : 0));
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Which section is in the middle of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id === 'top' ? null : entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ['top', ...sections.map((s) => s.id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Re-measure the pill when fonts load or the bar resizes.
  useEffect(() => {
    const el = linksRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLayoutTick((n) => n + 1));
    ro.observe(el);
    document.fonts?.ready.then(() => setLayoutTick((n) => n + 1));
    return () => ro.disconnect();
  }, []);

  const target = hovered ?? active;
  useLayoutEffect(() => {
    const link = target ? linksRef.current?.querySelector<HTMLElement>(`[data-id="${target}"]`) : null;
    if (link) setPill({ x: link.offsetLeft, w: link.offsetWidth });
  }, [target, layoutTick]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-open' : ''}`}>
        <div className="nav__progress" ref={progressRef} />
        <div className="container nav__inner">
          <Brand />

          <nav aria-label="Sections">
            <div className="nav__links" ref={linksRef} onMouseLeave={() => setHovered(null)}>
              <span
                className="nav__pill"
                data-visible={target !== null}
                style={{ '--x': `${pill.x}px`, '--w': `${pill.w}px` } as CSSProperties}
                aria-hidden
              />
              <ul>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      data-id={s.id}
                      aria-current={active === s.id ? 'true' : undefined}
                      onMouseEnter={() => setHovered(s.id)}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="nav__actions">
            <PaletteButton />
            <ThemeToggle />
            <button
              type="button"
              className="icon-btn nav__menu-btn"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Outside <header>: its backdrop-filter would trap this fixed sheet inside the 64px bar. */}
      <div id="mobile-menu" className={`nav-sheet ${menuOpen ? 'is-open' : ''}`} inert={!menuOpen}>
        <ul>
          {sections.map((s, i) => (
            <li key={s.id} style={{ '--i': i } as CSSProperties}>
              <a href={`#${s.id}`} onClick={() => setMenuOpen(false)}>
                <span className="nav-sheet__index">0{i + 1}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
