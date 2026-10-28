// After `expo export`: replace dist/index.html with the lightweight landing page
// (no app code, so it shows instantly from an ad) and let the browser quietly
// prefetch the app code the next screen needs.
// Run: npm run build:web
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const next = readFileSync(join(dist, 'gaya.html'), 'utf8');
const scripts = [...next.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
if (scripts.length === 0) throw new Error('No app scripts found in dist/gaya.html');

const prefetch = scripts.map((src) => `<link rel="prefetch" href="${src}" as="script">`).join('\n');
const page = readFileSync(join(root, 'landing', 'index.html'), 'utf8').replace('<!--PREFETCH-->', prefetch);
writeFileSync(join(dist, 'index.html'), page);
console.log(`Landing page written (${page.length} bytes), prefetching ${scripts.length} app files.`);
