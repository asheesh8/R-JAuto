# Asset sources

Gathered 2026-10-01.

## Facts and reviews
- Google Maps listing for R & J Auto Service (unclaimed): address, phone, hours, 13 reviews (4.9). Full text scraped to `google/reviews.json` (gitignored) for quote checking only.
- MapQuest and BBB listings: address and phone match; MapQuest hours differ (Mon to Fri 9 to 6, Sat closed).
- Public Facebook post by Leo DiSanto, Aug 15, 2020 (Saturday no-appointment cooling system flush).
- There are no owner or customer photos of the shop on Google or Facebook.

## 3D models (`3d/`, gitignored; optimized copies in `public/models/`)
- `brake.glb`: "6-Lug Brake Rotor and Brembo brake calipers" by DRIVER-FIRE, Sketchfab, CC BY 4.0. Brembo wordmark mesh removed. Reused from the Helping Hands build.
- `sparkplug.glb`: "Spark Plug" by Vaughan.Staehr, Sketchfab, CC BY 4.0.
- `tensioner.glb`, `radiator.glb`: generated for this project with Higgsfield (image to 3D) from Higgsfield product shots.
- Credits render in the site footer for whichever models ship (`modelCredits` in `src/data/business.ts`).
- Still to download (Chrome blocked the batch): Joko_P "Car Disc Brake", coilover, oil filter, ratchet, hydraulic jack, JuanG3D "Engine". Drop them in `3d/` as `rj_<name>.glb` and run `npm run models`.

## Images (`higgsfield/`, PNG sources gitignored)
All generated with Higgsfield (gpt_image_2_5) for this site. None of them show R&J's actual shop or staff; the footer says so.
- Service photos: `svc-*.png`, `belt-tensioner.png`, `cooling.png`, `undercoating.png`.
- Mood: `garage-bay-dusk.png`, `winter-road.png`.
- Line art: `art/*.png`, converted to transparent ink layers by `scripts/build-art.mjs`.
- Granite texture: `granite-slab.png`.
