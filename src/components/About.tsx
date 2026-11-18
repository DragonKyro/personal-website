import { BASE, site } from '../content/site';
import { useTilt } from '../lib/motion';
import { Reveal, SectionHeading } from './ui';
import './sections.css';

export function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHeading index="01" label="About" title="A little about me" />

        <div className="about">
          <div className="about__text">
            {site.about.map((para, i) => (
              <Reveal key={i} delay={i * 90}>
                <p className="about__para">{para}</p>
              </Reveal>
            ))}

            <Reveal delay={220} className="now">
              <div className="now__head">
                <span className="now__live" aria-hidden />
                <h3>Now</h3>
                <span className="now__updated">updated {site.nowUpdated}</span>
              </div>
              <ul className="now__list">
                {site.now.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={140} className="about__aside">
            <Portrait />
            <dl className="facts">
              {site.facts.map((fact) => (
                <div key={fact.label} className="facts__row">
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Portrait() {
  const ref = useTilt<HTMLDivElement>(8);
  const src = site.portrait && (/^https?:/.test(site.portrait) ? site.portrait : `${BASE}${site.portrait}`);
  return (
    <div ref={ref} className="portrait">
      <div className="portrait__inner">
        {src ? (
          <img src={src} alt={site.name} loading="lazy" />
        ) : (
          <span className="portrait__monogram" aria-hidden>
            {site.initials}
          </span>
        )}
      </div>
    </div>
  );
}
