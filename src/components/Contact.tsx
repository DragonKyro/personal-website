import { useRef, useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import { site } from '../content/site';
import { useMagnetic } from '../lib/motion';
import { useToast } from '../shell/Shell';
import { Reveal, SocialGlyph } from './ui';
import './sections.css';

export function Contact() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);
  const mailRef = useMagnetic<HTMLAnchorElement>(0.2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      toast('Email copied to clipboard');
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      location.href = `mailto:${site.email}`;
    }
  };

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <Reveal className="contact__card">
          <div className="contact__glow" aria-hidden />
          <div className="eyebrow">
            <span className="eyebrow__index">05</span>
            Contact
          </div>
          <h2 className="contact__title">
            Let’s make something <span className="gradient-text">fun.</span>
          </h2>
          <p className="contact__text">{site.contact}</p>

          <div className="contact__actions">
            <a ref={mailRef} href={`mailto:${site.email}`} className="btn btn--primary">
              <Mail /> Say hello
            </a>
            <button type="button" className="btn btn--ghost contact__copy" onClick={copy} data-copied={copied}>
              <span className="contact__copy-icons" aria-hidden>
                <Copy />
                <Check />
              </span>
              {site.email}
            </button>
          </div>

          <ul className="contact__socials">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="icon-btn" aria-label={s.label} title={s.label}>
                  <SocialGlyph icon={s.icon} />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
