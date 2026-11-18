import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const hasFinePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/** rAF-throttled pointer handler; the latest event wins. */
function throttled(fn: (e: PointerEvent) => void) {
  let frame = 0;
  let last: PointerEvent | null = null;
  const handler = (e: PointerEvent) => {
    last = e;
    if (!frame)
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (last) fn(last);
      });
  };
  return { handler, cancel: () => cancelAnimationFrame(frame) };
}

/** True once the element has scrolled into view (then stays true). */
export function useInView<T extends Element>(rootMargin = '0px 0px -12% 0px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, inView] as const;
}

/**
 * Cursor-following glow across a group of cards. Every `[data-spotlight]` child gets
 * --mx/--my relative to itself, so neighbouring cards' borders light up too.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !hasFinePointer()) return;
    const { handler, cancel } = throttled((e) => {
      root.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
    root.addEventListener('pointermove', handler);
    return () => {
      root.removeEventListener('pointermove', handler);
      cancel();
    };
  }, []);
  return ref;
}

/** Subtle 3D tilt toward the cursor. Sets --rx/--ry; CSS applies the transform. */
export function useTilt<T extends HTMLElement>(maxDeg = 5) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    const { handler, cancel } = throttled((e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', `${(-py * maxDeg).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(px * maxDeg).toFixed(2)}deg`);
    });
    const reset = () => {
      cancel();
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    };
    el.addEventListener('pointermove', handler);
    el.addEventListener('pointerleave', reset);
    return () => {
      el.removeEventListener('pointermove', handler);
      el.removeEventListener('pointerleave', reset);
      cancel();
    };
  }, [maxDeg]);
  return ref;
}

/** Element drifts slightly toward the cursor while hovered. */
export function useMagnetic<T extends HTMLElement>(strength = 0.25) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    const { handler, cancel } = throttled((e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.translate = `${dx * strength}px ${dy * strength}px`;
    });
    const reset = () => {
      cancel();
      el.style.translate = '';
    };
    el.addEventListener('pointermove', handler);
    el.addEventListener('pointerleave', reset);
    return () => {
      el.removeEventListener('pointermove', handler);
      el.removeEventListener('pointerleave', reset);
      cancel();
    };
  }, [strength]);
  return ref;
}
