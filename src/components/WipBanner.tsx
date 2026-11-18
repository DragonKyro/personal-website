import { useLayoutEffect, useState } from 'react';
import { Construction, X } from 'lucide-react';
import { site } from '../content/site';
import './WipBanner.css';

const KEY = 'wip-banner-dismissed';

/**
 * Slim "work in progress" bar pinned above the nav. Dismissing it is remembered per
 * message, so changing `site.wipBanner` shows it again. Set it to null to remove it.
 */
export function WipBanner() {
  const message = site.wipBanner;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(KEY) === message;
    } catch {
      return false;
    }
  });
  const visible = Boolean(message) && !dismissed;

  // The nav, mobile menu and anchor offsets read --banner-h from this class.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('has-banner', visible);
  }, [visible]);

  if (!visible || !message) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, message);
    } catch {
      /* storage unavailable */
    }
    setDismissed(true);
  };

  return (
    <div className="wip-banner" role="status">
      <div className="container wip-banner__inner">
        <Construction className="wip-banner__icon" aria-hidden />
        <p className="wip-banner__text">
          <strong>Work in progress</strong>
          <span className="wip-banner__sep" aria-hidden>
            ·
          </span>
          <span className="wip-banner__message">{message}</span>
        </p>
        <button type="button" className="wip-banner__close" onClick={dismiss} aria-label="Dismiss work-in-progress notice">
          <X />
        </button>
      </div>
    </div>
  );
}
