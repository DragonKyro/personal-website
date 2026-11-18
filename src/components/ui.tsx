import type { CSSProperties, ReactNode, SVGProps } from 'react';
import { FileText, Mail, Moon, Search, Sun } from 'lucide-react';
import type { SocialIcon } from '../content/site';
import { site, BASE } from '../content/site';
import { useInView } from '../lib/motion';
import { modKey } from '../lib/text';
import { usePalette, useTheme } from '../shell/Shell';

/** Fades/lifts its children in the first time they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  className = '',
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} ${className}`}
      style={{ ...style, '--delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  index,
  label,
  title,
  description,
  action,
}: {
  index: string;
  label: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Reveal className="section-head">
      <div>
        <div className="eyebrow">
          <span className="eyebrow__index">{index}</span>
          {label}
        </div>
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-desc">{description}</p>}
      </div>
      {action}
    </Reveal>
  );
}

/* Brand marks aren't in Lucide, so these two are inline. */
export function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function SocialGlyph({ icon, ...props }: { icon: SocialIcon } & SVGProps<SVGSVGElement>) {
  switch (icon) {
    case 'github':
      return <GitHubIcon {...props} />;
    case 'linkedin':
      return <LinkedInIcon {...props} />;
    case 'mail':
      return <Mail {...props} />;
    case 'resume':
      return <FileText {...props} />;
  }
}

export function Brand() {
  return (
    <a href={BASE} className="brand" aria-label={`${site.name} — home`}>
      <span className="brand__mark" aria-hidden>
        {site.initials[0]}
      </span>
      <span className="brand__name">{site.name}</span>
    </a>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      className="icon-btn theme-toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
    >
      <span className="theme-toggle__icons" data-theme-icon={theme}>
        <Sun />
        <Moon />
      </span>
    </button>
  );
}

export function PaletteButton({ compact = false }: { compact?: boolean }) {
  const { openPalette } = usePalette();
  return (
    <button type="button" className="palette-btn" onClick={() => openPalette()} aria-label="Open command palette">
      <Search />
      {!compact && <span className="palette-btn__label">Jump to…</span>}
      <kbd>
        {modKey}
        {modKey === 'Ctrl' ? ' ' : ''}K
      </kbd>
    </button>
  );
}
