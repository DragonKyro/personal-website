import { useEffect, useRef } from 'react';
import { experience } from '../content/experience';
import { FileText } from 'lucide-react';
import { BASE, site } from '../content/site';
import { Reveal, SectionHeading } from './ui';
import './sections.css';

export function Experience() {
  const listRef = useRef<HTMLOListElement>(null);

  // The timeline rail fills as you scroll; dots light up as the fill passes them.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = list.getBoundingClientRect();
      const line = innerHeight * 0.62;
      const progress = Math.min(1, Math.max(0, (line - rect.top) / rect.height));
      list.style.setProperty('--progress', progress.toFixed(4));
      list.querySelectorAll<HTMLElement>('.timeline__item').forEach((item) => {
        item.toggleAttribute('data-passed', item.getBoundingClientRect().top + 14 < line);
      });
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

  return (
    <section id="experience" className="section">
      <div className="container">
        <SectionHeading
          index="04"
          label="Experience"
          title="Where I’ve been"
          action={
            site.resumeUrl && (
              <a className="link-arrow" href={/^https?:/.test(site.resumeUrl) ? site.resumeUrl : `${BASE}${site.resumeUrl}`}>
                <FileText /> Full résumé
              </a>
            )
          }
        />
        <ol className="timeline" ref={listRef}>
          {experience.map((item, i) => (
            <li key={`${item.org}-${item.period}`} className="timeline__item">
              <Reveal delay={i * 60} className="timeline__row">
                <div className="timeline__period">{item.period}</div>
                <div className="timeline__dot" aria-hidden />
                <div className="timeline__body">
                  <h3 className="timeline__title">
                    {item.title}{' '}
                    <span className="timeline__org">
                      · {item.href ? <a href={item.href}>{item.org}</a> : item.org}
                    </span>
                  </h3>
                  {item.location && <p className="timeline__location">{item.location}</p>}
                  <p className="timeline__summary">{item.summary}</p>
                  {item.tags && (
                    <div className="timeline__tags">
                      {item.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
