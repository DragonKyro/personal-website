import { ArrowUp } from 'lucide-react';
import { site } from '../content/site';
import { usePalette, useSeason } from '../shell/Shell';
import './sections.css';

export function Footer() {
  const { season } = useSeason();
  const { openPalette } = usePalette();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <button type="button" className="footer__season" onClick={() => openPalette('season')}>
          <span className="footer__season-dot" aria-hidden />
          {season ? `${season.name} edition` : 'Classic edition'}
          <span className="footer__season-change">change</span>
        </button>
        <button type="button" className="link-arrow footer__top" onClick={() => scrollTo({ top: 0 })}>
          Back to top <ArrowUp />
        </button>
      </div>
    </footer>
  );
}
