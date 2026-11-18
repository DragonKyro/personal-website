import { useEffect, useRef } from 'react';
import type { SeasonEffect } from '../content/seasons';
import { prefersReducedMotion } from '../lib/motion';
import { type Theme, useTheme } from '../shell/Shell';

/**
 * Ambient seasonal particles behind the hero. Deliberately sparse and low-contrast,
 * pauses when off-screen or in a background tab, gently parts around the cursor,
 * and is skipped entirely for prefers-reduced-motion.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  phase: number;
  alpha: number;
  color: string;
}

type Ctx = CanvasRenderingContext2D;

interface Spec {
  /** Particles at 1440px wide; scales with the hero width. */
  density: number;
  colors: Record<Theme, string[]>;
  /** Pixels/second ranges. Negative vy rises. */
  vy: [number, number];
  vx?: [number, number];
  size: [number, number];
  alpha: [number, number];
  sway?: number;
  spin?: number;
  draw: (ctx: Ctx, p: Particle, t: number) => void;
  /** Custom motion instead of drift + sway. */
  step?: (p: Particle, dt: number, t: number) => void;
}

const TAU = Math.PI * 2;
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function withTransform(ctx: Ctx, p: Particle, flip: number, fn: () => void) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.scale(flip, 1);
  fn();
  ctx.restore();
}

const dot = (ctx: Ctx, p: Particle) => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, TAU);
  ctx.fill();
};

const SPECS: Record<Exclude<SeasonEffect, 'none'>, Spec> = {
  snow: {
    density: 70,
    colors: { dark: ['#ffffff', '#dbe7ff'], light: ['#9fb4d4', '#b8c8e2'] },
    vy: [14, 38],
    size: [0.8, 2.6],
    alpha: [0.25, 0.8],
    sway: 14,
    draw: dot,
  },
  petals: {
    density: 26,
    colors: { dark: ['#f9c5d5', '#f6a8c1', '#fde2ea'], light: ['#f08fb0', '#f4a7c2', '#e97aa0'] },
    vy: [18, 40],
    vx: [8, 24],
    size: [4, 7],
    alpha: [0.45, 0.85],
    sway: 18,
    spin: 1.2,
    draw: (ctx, p, t) =>
      withTransform(ctx, p, Math.cos(t * 0.0018 + p.phase), () => {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, TAU);
        ctx.fill();
      }),
  },
  leaves: {
    density: 20,
    colors: { dark: ['#e8833a', '#d9542b', '#d4a52c', '#b8642f'], light: ['#d9702a', '#c4471f', '#c0921c', '#a5562a'] },
    vy: [22, 48],
    vx: [-10, 10],
    size: [5, 9],
    alpha: [0.5, 0.9],
    sway: 26,
    spin: 1.4,
    draw: (ctx, p, t) =>
      withTransform(ctx, p, Math.cos(t * 0.0014 + p.phase), () => {
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(s * 0.95, -s * 0.15, 0, s);
        ctx.quadraticCurveTo(-s * 0.95, -s * 0.15, 0, -s);
        ctx.fill();
      }),
  },
  fireflies: {
    density: 28,
    colors: { dark: ['#f4f78a', '#d9f26b'], light: ['#c9a800', '#b39400'] },
    vy: [-6, 6],
    vx: [-6, 6],
    size: [1.2, 2.4],
    alpha: [0.4, 1],
    step: (p, dt, t) => {
      p.x += (p.vx + Math.cos(t * 0.0006 + p.phase) * 14) * dt;
      p.y += (p.vy + Math.sin(t * 0.0005 + p.phase * 1.7) * 12) * dt;
    },
    draw: (ctx, p, t) => {
      const pulse = 0.35 + 0.65 * Math.max(0, Math.sin(t * 0.0021 + p.phase));
      ctx.globalAlpha = p.alpha * pulse;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
      g.addColorStop(0, p.color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 6, 0, TAU);
      ctx.fill();
    },
  },
  lanterns: {
    density: 13,
    colors: { dark: ['#e8463c', '#f0573f'], light: ['#d8362c', '#e04a32'] },
    vy: [-16, -8],
    size: [7, 13],
    alpha: [0.55, 0.9],
    sway: 10,
    draw: (ctx, p) => {
      const s = p.size;
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 3);
      glow.addColorStop(0, 'rgba(255, 190, 90, 0.35)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, s * 3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, s * 0.8, s, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#f2c14e';
      ctx.fillRect(p.x - s * 0.35, p.y - s * 1.1, s * 0.7, s * 0.25);
      ctx.fillRect(p.x - s * 0.35, p.y + s * 0.85, s * 0.7, s * 0.25);
    },
  },
  ghosts: {
    density: 9,
    colors: { dark: ['#ffffff', '#e9e4ff'], light: ['#8f84c4', '#a59bd3'] },
    vy: [-14, -6],
    size: [8, 13],
    alpha: [0.18, 0.4],
    sway: 16,
    draw: (ctx, p, t) => {
      const s = p.size;
      const wobble = Math.sin(t * 0.004 + p.phase) * s * 0.12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, s, Math.PI, 0);
      ctx.lineTo(p.x + s, p.y + s * 1.2);
      for (let i = 0; i < 3; i++) {
        const x0 = p.x + s - (i * 2 * s) / 3;
        ctx.quadraticCurveTo(x0 - s / 3, p.y + s * 1.55 + (i % 2 ? -wobble : wobble), x0 - (2 * s) / 3, p.y + s * 1.2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = Math.min(1, p.alpha * 2.2);
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(p.x - s * 0.35, p.y - s * 0.05, s * 0.14, 0, TAU);
      ctx.arc(p.x + s * 0.35, p.y - s * 0.05, s * 0.14, 0, TAU);
      ctx.fill();
    },
  },
  confetti: {
    density: 55,
    colors: {
      dark: ['#ffd166', '#ef476f', '#06d6a0', '#7c6cff', '#4cc9f0'],
      light: ['#e8a400', '#d93a5f', '#05a87e', '#5b4ae0', '#1a9fd0'],
    },
    vy: [30, 70],
    vx: [-12, 12],
    size: [4, 8],
    alpha: [0.6, 0.95],
    sway: 20,
    spin: 3,
    draw: (ctx, p, t) =>
      withTransform(ctx, p, Math.cos(t * 0.004 + p.phase), () => ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)),
  },
  hearts: {
    density: 14,
    colors: { dark: ['#ff7aa2', '#ff4d7a', '#ffb3c8'], light: ['#e8467a', '#d92c62', '#f07aa0'] },
    vy: [-22, -10],
    size: [6, 11],
    alpha: [0.35, 0.7],
    sway: 14,
    draw: (ctx, p) =>
      withTransform(ctx, p, 1, () => {
        const s = p.size;
        ctx.beginPath();
        ctx.arc(-s / 4, 0, s / 4, Math.PI, 0);
        ctx.arc(s / 4, 0, s / 4, Math.PI, 0);
        ctx.lineTo(0, s * 0.6);
        ctx.closePath();
        ctx.fill();
      }),
  },
  pi: {
    density: 18,
    colors: { dark: ['#a5b4fc', '#67e8f9'], light: ['#4f46e5', '#0891b2'] },
    vy: [14, 30],
    size: [14, 24],
    alpha: [0.2, 0.45],
    sway: 10,
    spin: 0.4,
    draw: (ctx, p) =>
      withTransform(ctx, p, 1, () => {
        ctx.font = `${p.size}px 'Geist Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('π', 0, 0);
      }),
  },
};

export function SeasonalEffect({ effect }: { effect: SeasonEffect }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (effect === 'none' || !canvas || !ctx || prefersReducedMotion()) return;
    const spec = SPECS[effect];
    const colors = spec.colors[theme];

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let running = false;
    let frame = 0;
    let last = 0;
    const pointer = { x: -1e4, y: -1e4 };

    const spawn = (p: Partial<Particle>, initial: boolean): Particle => {
      const vy = rand(...spec.vy);
      Object.assign(p, {
        x: rand(-20, w + 20),
        y: initial ? rand(0, h) : vy < 0 ? h + 30 : -30,
        vx: spec.vx ? rand(...spec.vx) : 0,
        vy,
        size: rand(...spec.size),
        rot: rand(0, TAU),
        vr: spec.spin ? rand(-spec.spin, spec.spin) : 0,
        phase: rand(0, TAU),
        alpha: rand(...spec.alpha),
        color: pick(colors),
      });
      if (spec.step && !initial) p.y = rand(0, h); // wanderers fade in anywhere
      return p as Particle;
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(spec.density * Math.min(1.2, Math.max(0.45, w / 1440)));
      while (particles.length < count) particles.push(spawn({}, true));
      particles.length = count;
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        if (spec.step) spec.step(p, dt, now);
        else {
          p.x += (p.vx + Math.sin(now * 0.0009 + p.phase) * (spec.sway ?? 0)) * dt;
          p.y += p.vy * dt;
        }
        p.rot += p.vr * dt;

        // Part around the cursor.
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const push = (1 - d / 120) * 160 * dt;
          p.x += (dx / d) * push;
          p.y += (dy / d) * push;
        }

        const out = p.y > h + 40 || p.y < -40 || p.x < -60 || p.x > w + 60;
        if (out) spawn(p, false);

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        spec.draw(ctx, p, now);
      }
      ctx.globalAlpha = 1;
    };

    const setRunning = (next: boolean) => {
      if (next === running) return;
      running = next;
      if (running) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      } else cancelAnimationFrame(frame);
    };

    let onScreen = true;
    const sync = () => setRunning(onScreen && !document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    const ro = new ResizeObserver(resize);
    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };

    resize();
    io.observe(canvas);
    ro.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pointermove', onPointer, { passive: true });
    sync();

    return () => {
      setRunning(false);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pointermove', onPointer);
      particles = [];
    };
  }, [effect, theme]);

  return <canvas ref={ref} className="seasonal" aria-hidden />;
}
