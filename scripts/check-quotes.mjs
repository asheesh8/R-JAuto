// Verifies every excerpt in src/data/reviews.ts appears word for word in the
// scraped reviews. Run with `npm run check:quotes` before changing quotes.
import { readFileSync, existsSync } from 'node:fs';

const scrapePath = 'raw-assets/google/reviews.json';
if (!existsSync(scrapePath)) {
  console.log('No scrape found at', scrapePath, '- skipping quote check.');
  process.exit(0);
}
const scrape = JSON.parse(readFileSync(scrapePath, 'utf8'));
const sources = [...scrape.reviews, ...scrape.facebook];
const src = readFileSync('src/data/reviews.ts', 'utf8');
const norm = (t) => t.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();

const pairs = [...src.matchAll(/(?:name|by): '([^']+(?:’[^']*)?)'[^\n]*?quote: '([^']+)'/g)];
const pairs2 = [...src.matchAll(/by: '([^']+)',\s*\n\s*quote: '([^']+)'/g), ...src.matchAll(/featured = \{ name: '([^']+)', quote: '([^']+)'/g)];
let bad = 0;
for (const [, name, quote] of [...pairs, ...pairs2]) {
  const s = sources.find((r) => norm(r.name) === norm(name));
  if (!s || !norm(s.text).includes(norm(quote))) {
    console.error(`MISMATCH: ${name}: "${quote}"`);
    bad++;
  }
}
console.log(`${pairs.length + pairs2.length} quotes checked, ${bad} mismatches.`);
process.exit(bad ? 1 : 0);
