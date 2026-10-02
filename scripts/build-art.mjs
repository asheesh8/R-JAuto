// Turns the Higgsfield ink drawings in raw-assets/higgsfield/art/ into
// transparent ink layers in public/art/. Ink darkness becomes alpha, so the
// site can use them as CSS masks and tint them any colour.
import sharp from 'sharp';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const dir = 'raw-assets/higgsfield/art';
// Merge into the existing manifest: the PNG sources are gitignored, so a fresh
// clone may only hold the drawings being added.
const manifest = 'src/data/art.json';
const sizes = existsSync(manifest) ? JSON.parse(readFileSync(manifest, 'utf8')) : {};
const wide = new Set(['barre', 'mountains', 'ridge']);
for (const file of readdirSync(dir).filter((f) => f.endsWith('.png'))) {
  const name = file.replace('.png', '');
  const max = wide.has(name) ? 1600 : 900;
  const grey = await sharp(`${dir}/${file}`)
    .greyscale()
    .trim({ background: '#ffffff', threshold: 18 })
    .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data, info } = grey;
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    // Paper (light) goes clear; ink keeps its weight, with a little contrast boost.
    const a = Math.max(0, Math.min(255, (235 - data[i]) * 1.35));
    rgba[i * 4 + 3] = a;
  }
  const out = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 60, alphaQuality: 70 })
    .toFile(`public/art/${name}.webp`);
  sizes[name] = [info.width, info.height];
  console.log(`${name}: ${info.width}x${info.height} ${Math.round(out.size / 1024)}KB`);
}
writeFileSync(manifest, JSON.stringify(sizes, null, 2) + '\n');
