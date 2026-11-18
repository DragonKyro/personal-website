# personal-website

Kyle Lui's personal site, and the one bookmark for everything else I host.

- **Home** — https://dragonkyro.github.io/personal-website/
- **Launchpad** — https://dragonkyro.github.io/personal-website/apps/ (every GitHub Pages project, searchable)

Built with React 19, TypeScript and Vite. Deployed to GitHub Pages by GitHub Actions on every push to `master`.

## Features

- **Launchpad.** Lists every project hosted on GitHub Pages. A curated list (`src/content/apps.ts`) is merged with a live GitHub API lookup, so a newly deployed repo shows up automatically, along with when it was last updated.
- **Command palette.** <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> on any page jumps to sections, opens apps, copies the email address, or switches theme. On `/apps/`, <kbd>/</kbd> focuses search and <kbd>Enter</kbd> opens the top result.
- **Seasonal themes.** The accent colours and a light particle layer behind the hero follow the calendar: four seasons, plus Lunar New Year, Pi Day, Mid-Autumn, Halloween, the winter holidays and New Year. Content sections are never themed.
- **Motion that stays out of the way.** Scroll reveals, cursor spotlights, card tilt and a circular theme-switch transition. All of it turns off under `prefers-reduced-motion`, and pointer effects only run with a mouse.
- **Light and dark mode.** Follows the OS setting until you choose one.

## Editing content

Everything personal is in [`src/content/`](src/content/). Search for `PLACEHOLDER` to find the filler.

| File | What's in it |
| --- | --- |
| [`site.ts`](src/content/site.ts) | Work-in-progress banner (`wipBanner`, `null` removes it), name, hero text, about paragraphs, quick facts, "Now" list, email, socials, résumé, portrait |
| [`projects.ts`](src/content/projects.ts) | "Selected work" cards. The first one is the large card; five fills the grid neatly |
| [`experience.ts`](src/content/experience.ts) | Timeline entries, newest first |
| [`apps.ts`](src/content/apps.ts) | Launchpad entries: title, blurb, category, icon, colour. `hidden: true` keeps one off the site; `status: 'offline'` hides it until it's deployed (delete that line once it's live) |
| [`seasons.ts`](src/content/seasons.ts) | Seasonal themes and their dates. `seasonOverride` pins one |

Images (portrait, project screenshots, résumé PDF) go in `public/` and are referenced by path, e.g. `portrait: 'portrait.jpg'`.

### Seasons

Preview any theme with a query string such as `?season=halloween`, `?season=lunar-new-year` or `?season=off`. You can also pick one from the command palette by typing "season", or click the "… edition" badge in the footer. Lunar New Year and Mid-Autumn dates are listed through 2030 in `seasons.ts`; add later years there.

## Development

```sh
npm install
npm run dev          # http://localhost:5173/personal-website/
npm run build        # typecheck + production build into dist/
npm run preview      # serve dist/ locally
```

Requires Node 20.19+ (CI uses 22).

## Deployment

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and publishes on every push to `master`. You can also run it manually from the Actions tab. In the repo settings, **Pages → Source** must be set to **GitHub Actions**.

The site is served from `/personal-website/`. To move it to the root (`https://dragonkyro.github.io/`), rename the repo to `DragonKyro.github.io` and set `base: '/'` in [`vite.config.ts`](vite.config.ts).

### About `package-lock.json`

The lockfile must only reference `registry.npmjs.org`. A private registry in your npm config (for example a corporate Artifactory mirror) gets written into the lockfile's `resolved` URLs. That breaks `npm ci` in Actions and leaks an internal hostname.

[`scripts/public-lockfile.mjs`](scripts/public-lockfile.mjs) handles this:

- It runs on `postinstall` and rewrites mirror URLs back to npmjs. The tarballs and integrity hashes are identical.
- CI runs it with `--check` and fails if any private URL is left.
- Local installs still go through your configured registry, because npm's default `replace-registry-host=npmjs` redirects registry.npmjs.org entries.
