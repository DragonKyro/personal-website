import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { ArrowDown, Rocket } from 'lucide-react';
import { APPS_PAGE, site } from '../content/site';
import { hasFinePointer, prefersReducedMotion, useMagnetic } from '../lib/motion';
import { modKey } from '../lib/text';
import { useSeason } from '../shell/Shell';
import { SeasonalEffect } from './SeasonalEffect';
import './Hero.css';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export function Hero() {
  const { season } = useSeason();
  const heroRef = useRef<HTMLElement>(null);
  const ctaRef = useMagnetic<HTMLAnchorElement>(0.2);
  const status = season?.greeting ?? site.status;

  // Feed the cursor position to CSS so the dot grid lights up around it.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !hasFinePointer()) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--hx', `${e.clientX - r.left}px`);
        hero.style.setProperty('--hy', `${e.clientY - r.top}px`);
        hero.dataset.pointer = 'on';
      });
    };
    const onLeave = () => delete hero.dataset.pointer;
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="top" className="hero" ref={heroRef}>
      <div className="hero__bg" aria-hidden>
        <div className="hero__aurora hero__aurora--a" />
        <div className="hero__aurora hero__aurora--b" />
        <div className="hero__grid">
          <div className="hero__grid-lit" />
        </div>
        {season && <SeasonalEffect key={season.id} effect={season.effect} />}
      </div>

      <div className="container hero__inner">
        {status && (
          <p className="hero__status hero-in" style={delay(0)}>
            <span className="hero__status-dot" />
            {status}
          </p>
        )}

        <h1 className="hero__name" aria-label={site.name}>
          <WavyText text={site.name} />
        </h1>

        <p className="hero__headline hero-in" style={delay(480)}>
          {site.headline} <RotatingWords words={site.rotatingWords} />
        </p>

        <p className="hero__intro hero-in" style={delay(580)}>
          {site.intro}
        </p>

        <div className="hero__ctas hero-in" style={delay(680)}>
          <a ref={ctaRef} href="#work" className="btn btn--primary">
            View my work <ArrowDown className="icon-nudge-down" />
          </a>
          <a href={APPS_PAGE} className="btn btn--ghost">
            <Rocket /> Launchpad
          </a>
        </div>

        <p className="hero__hint hero-in" style={delay(820)}>
          or press <kbd>{modKey}</kbd> <kbd>K</kbd> to jump anywhere
        </p>
      </div>

      <a href="#about" className="hero__scroll" aria-label="Scroll to About">
        <span />
      </a>
    </section>
  );
}

/** Letters rise in on load, and ripple when hovered. */
function WavyText({ text }: { text: string }) {
  let i = 0;
  return (
    <span aria-hidden>
      {text.split(' ').map((word, w) => (
        <span key={w}>
          {w > 0 && ' '}
          <span className="hero__word">
            {[...word].map((ch) => {
              const idx = i++;
              return (
                <span key={idx} className="hero__letter" style={{ '--i': idx } as CSSProperties}>
                  {ch}
                </span>
              );
            })}
          </span>
        </span>
      ))}
    </span>
  );
}

function RotatingWords({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (words.length < 2 || prefersReducedMotion()) return;
    const id = window.setInterval(() => setIndex((n) => (n + 1) % words.length), 2600);
    return () => window.clearInterval(id);
  }, [words.length]);

  const prev = (index - 1 + words.length) % words.length;
  return (
    <span className="rotator">
      <span className="sr-only">{words[0]}</span>
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden
          className={`rotator__word gradient-text ${i === index ? 'is-active' : ''} ${i === prev && words.length > 1 ? 'is-prev' : ''}`}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
