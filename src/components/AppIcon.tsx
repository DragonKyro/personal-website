import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';

/** Gradient "app icon" tile used by the launchpad, palette and project covers. */
export function AppIcon({
  icon: Icon,
  glyph,
  hue,
  size = 44,
  className = '',
}: {
  icon?: LucideIcon;
  glyph?: string;
  hue: number;
  size?: number;
  className?: string;
}) {
  const Fallback = Icon ?? Sparkles;
  return (
    <span className={`app-icon ${className}`} style={{ '--hue': hue, '--size': `${size}px` } as CSSProperties} aria-hidden>
      {glyph ? <span className="app-icon__glyph">{glyph}</span> : <Fallback strokeWidth={1.75} />}
    </span>
  );
}
