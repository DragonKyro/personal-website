import { ArrowLeft } from 'lucide-react';
import { Footer } from '../components/Footer';
import { Launchpad } from '../components/Launchpad';
import { Brand, PaletteButton, ThemeToggle } from '../components/ui';
import { BASE } from '../content/site';
import '../components/Nav.css';

/** /apps/ — the bookmarkable launchpad. */
export function AppsPage() {
  return (
    <>
      <header className="apps-header">
        <div className="container apps-header__inner">
          <Brand />
          <nav className="apps-header__actions" aria-label="Site">
            <a href={BASE} className="link-arrow">
              <ArrowLeft /> Home
            </a>
            <PaletteButton compact />
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="apps-main">
        <Launchpad variant="page" />
      </main>
      <Footer />
    </>
  );
}
