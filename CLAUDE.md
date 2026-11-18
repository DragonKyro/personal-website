# CLAUDE.md

Kyle Lui's personal site plus a launchpad linking every GitHub Pages project under `DragonKyro`. It's the one page the user bookmarks. Vite 8 + React 19 + TypeScript 7, plain CSS, `lucide-react` icons. No router, no CSS framework, no animation library.

## Commands

- `npm run dev`: dev server at `/personal-website/`
- `npm run build`: `tsc --noEmit` + `vite build` into `dist/`. Run it after every change; there are no unit tests.
- `npm run preview`: serve `dist/`
- `npm run check:lockfile`: confirm the lockfile only uses registry.npmjs.org

## Layout

- `index.html` and `apps/index.html` are two real Vite entries (`build.rolldownOptions.input`). `/apps/` is a clean bookmarkable URL on GitHub Pages without client routing or 404 tricks. Entries: `src/main.tsx`, `src/apps-main.tsx`.
- `src/content/` holds all personal data and copy (site, apps, projects, experience, seasons). Content edits go here, not in components. Filler is marked `PLACEHOLDER`.
- `src/shell/Shell.tsx` provides the theme, season, command-palette and toast contexts, and renders `<CommandPalette>` and `<Toaster>`. Both pages are wrapped in it.
- `src/lib/`
  - `github.ts`: `useHostedApps()` merges the curated `apps.ts` with an unauthenticated GitHub API call, cached 30 min in localStorage. It falls back to the static list.
  - `motion.ts`: `useInView`, `useSpotlight`, `useTilt`, `useMagnetic`
  - `seasons.ts`: date matching and choice resolution
  - `text.ts`: fuzzy search, relative time
- `src/components/`: one component per section, each with a co-located CSS file. Shared primitives are in `ui.tsx`.

## Conventions and gotchas

- **Base path.** The site lives under `/personal-website/`. Build internal URLs from `BASE` / `APPS_PAGE` in `content/site.ts`; never hardcode `/`.
- **Accent colours** derive from the OKLCH hues `--accent-h` / `--accent2-h`, which seasons set at runtime. Use `var(--accent)` / `var(--accent-2)`; never hardcode an accent colour. Per-app icon colours come from each app's `hue`.
- **Seasonal styling** is limited to the accent hues and the hero particle canvas (`SeasonalEffect.tsx`). Keep it out of the content sections; the user doesn't want the theming to compete with the content.
- **Motion.** Every animation must respect `prefers-reduced-motion`: the global CSS kill-switch covers CSS animations, and JS effects check `prefersReducedMotion()`. Pointer effects only run when `hasFinePointer()` is true. Throttle pointer and scroll handlers with rAF.
- **CSS order.** Import `global.css` first in the entry files so component CSS can override it.
- **Top offsets.** The fixed nav, mobile sheet, sticky apps header and `scroll-margin-top` all add `var(--banner-h)`. It's 0 unless the work-in-progress banner (`site.wipBanner`, `WipBanner.tsx`) is showing. Anything new pinned to the top needs the same offset.
- **Fixed-position children** of an element with `backdrop-filter` or `transform` get trapped by it. That's why the mobile `.nav-sheet` is rendered outside `<header>`.
- **Spotlight groups.** `useSpotlight` attaches to a stable element. Don't put the ref on something that is re-keyed (the launchpad grid is re-keyed to replay its entrance animation).
- **Search.** `searchScore` requires every query word to match. Names are fuzzy-matched; long text is substring-only.

## Dependencies and the lockfile

- The author's machine resolves npm through a corporate Artifactory mirror. Public registry.npmjs.org is **not reachable** from it, so don't add an `.npmrc` that points this project at the public registry.
- `package-lock.json` must contain only `https://registry.npmjs.org/` URLs. Never commit private-registry hostnames. `scripts/public-lockfile.mjs` runs on `postinstall` to rewrite them, and CI runs it with `--check`. After any `npm install <pkg>`, confirm with `npm run check:lockfile`.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds on every push to `master` and deploys through `actions/deploy-pages`. It's the same workflow as the user's other repos, with an added lockfile check. The repo's Pages source must be set to "GitHub Actions". The old `gh-pages` branch flow is gone.

## Verifying UI changes

Chrome is installed at `C:/Program Files/Google/Chrome/Application/chrome.exe`. To screenshot or drive the built site, install `puppeteer-core` in a temp directory outside the repo, point it at that executable, and run it against `npm run preview` (`http://localhost:4173/personal-website/`). Check 390 px, 768 px and 1440 px widths, in both colour schemes.
