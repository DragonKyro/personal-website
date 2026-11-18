// Keeps package-lock.json pointing at the public npm registry.
//
// A private registry (e.g. a corporate Artifactory) in your npm config gets written into
// the lockfile's "resolved" URLs. That leaks an internal hostname into a public repo and
// breaks `npm ci` on GitHub Actions, which can't reach it. Artifactory's npm remote is a
// mirror of npmjs, so the tarballs and integrity hashes are identical — only the host changes.
//
// Locally nothing breaks: npm's default `replace-registry-host=npmjs` fetches
// registry.npmjs.org entries through whatever registry you have configured.
//
//   node scripts/public-lockfile.mjs          rewrite in place (runs on postinstall)
//   node scripts/public-lockfile.mjs --check  fail if any non-public URL remains (CI)

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const PUBLIC = 'https://registry.npmjs.org/';
const file = new URL('../package-lock.json', import.meta.url);
const check = process.argv.includes('--check');

if (!existsSync(file)) process.exit(0);

const original = readFileSync(file, 'utf8');
// Artifactory layout: https://<host>/artifactory/api/npm/<repo>/<pkg>/-/<pkg>-<ver>.tgz
const fixed = original.replace(/"resolved": "https?:\/\/[^"]*?\/api\/npm\/[^/"]+\//g, `"resolved": "${PUBLIC}`);

const leftovers = [...fixed.matchAll(/"resolved": "(https?:\/\/[^"]+)"/g)]
  .map((m) => m[1])
  .filter((url) => !url.startsWith(PUBLIC));

if (check) {
  const bad = original === fixed ? leftovers : ['(private registry URLs present)', ...leftovers];
  if (bad.length) {
    console.error('package-lock.json has non-public registry URLs. Run `node scripts/public-lockfile.mjs` and commit.');
    console.error(bad.slice(0, 5).join('\n'));
    process.exit(1);
  }
  console.log('package-lock.json: all packages resolve from registry.npmjs.org');
  process.exit(0);
}

if (fixed !== original) {
  writeFileSync(file, fixed);
  console.log('package-lock.json: rewrote private registry URLs to registry.npmjs.org');
}
if (leftovers.length) {
  console.warn(`package-lock.json: ${leftovers.length} URL(s) from an unknown registry need a manual look:`);
  console.warn(leftovers.slice(0, 5).join('\n'));
}
