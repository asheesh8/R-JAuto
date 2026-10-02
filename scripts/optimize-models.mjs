// Shrinks the licensed source models in raw-assets/3d/ into web-ready GLBs in
// public/models/ and writes src/data/models.json, the list of parts the site
// can actually show. Run with `npm run models`.
//
// Sources (see raw-assets/SOURCES.md):
//   rj_*.glb  Sketchfab, CC-BY. Credited in the footer via modelCredits.
//   hf_*.glb  Generated for this project with Higgsfield (image to 3D).
// A job whose source file is missing is skipped, and its part falls back to an
// icon on the site, so the build never depends on every download succeeding.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, quantize, meshopt, resample, textureCompress } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { existsSync, statSync, writeFileSync } from 'node:fs';

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

/** key: public/models/<key>.glb and the PartKey used in src/data/business.ts */
const jobs = [
  { key: 'tensioner', src: 'raw-assets/3d/hf_tensioner.glb', ratio: 0.5, error: 0.001, tex: 1024 },
  { key: 'radiator', src: 'raw-assets/3d/hf_radiator.glb', ratio: 0.5, error: 0.001, tex: 1024 },
  { key: 'sparkplug', src: 'raw-assets/3d/rj_spark_plug.glb', ratio: 1, error: 0, tex: 512 },
  { key: 'brake', src: 'raw-assets/3d/rj_disc_brake.glb', ratio: 0.7, error: 0.001, tex: 512 },
  { key: 'coilover', src: 'raw-assets/3d/rj_coilover.glb', ratio: 0.6, error: 0.001, tex: 512 },
  { key: 'oilfilter', src: 'raw-assets/3d/rj_oil_filter.glb', ratio: 0.6, error: 0.001, tex: 512 },
  { key: 'ratchet', src: 'raw-assets/3d/rj_ratchet.glb', ratio: 1, error: 0, tex: 512 },
  { key: 'jack', src: 'raw-assets/3d/rj_hydraulic_jack.glb', ratio: 0.7, error: 0.001, tex: 512 },
  { key: 'pistons', src: 'raw-assets/3d/rj_engine_pistons.glb', ratio: 0.5, error: 0.001, tex: 512 },
];

const available = {};

for (const job of jobs) {
  const out = `public/models/${job.key}.glb`;
  if (!existsSync(job.src)) {
    if (existsSync(out)) available[job.key] = true;
    console.log(`${job.key}: no source, ${existsSync(out) ? 'keeping existing build' : 'skipped'}`);
    continue;
  }

  const doc = await io.read(job.src);
  const steps = [prune(), dedup(), weld()];
  if (job.ratio < 1) steps.push(simplify({ simplifier: MeshoptSimplifier, ratio: job.ratio, error: job.error }));
  steps.push(
    resample(),
    prune(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [job.tex, job.tex], quality: 82 }),
    quantize(),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  await doc.transform(...steps);

  await io.write(out, doc);
  available[job.key] = true;
  const before = statSync(job.src).size / 1e6;
  const after = statSync(out).size / 1e6;
  console.log(`${out}: ${before.toFixed(1)}MB -> ${after.toFixed(2)}MB`);
}

writeFileSync('src/data/models.json', JSON.stringify(available, null, 2) + '\n');
console.log('available parts:', Object.keys(available).join(', '));
