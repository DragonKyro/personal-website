import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  // Served from https://dragonkyro.github.io/personal-website/.
  // If you move this to a DragonKyro.github.io repo, change this to '/'.
  base: '/personal-website/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      // Two real HTML pages, so /apps/ is a clean, bookmarkable URL on GitHub Pages
      // without any client-side routing or 404 hacks.
      input: {
        main: page('./index.html'),
        apps: page('./apps/index.html'),
      },
    },
  },
});
