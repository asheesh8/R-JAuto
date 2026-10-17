# R&J Auto Service

Website for R&J Auto Service, 460 North Main Street, Barre, Vermont.
Astro 7 on Vercel, three.js for the hero brake, a small admin panel for the
shop (see [ADMIN.md](ADMIN.md)).

```bash
npm install
npm run dev        # http://localhost:4541
npm run build
```

**Live:** https://r-j-auto.vercel.app (Vercel project for `asheesh8/R-JAuto`; `asheesh8/R-JAutoService` holds the same code — keep the two in step or retire one).

### Environment variables

Names only — set them in the Vercel project. Details in [ADMIN.md](ADMIN.md).

| Variable | Purpose |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Injected by Vercel when a Blob store is attached; stores admin edits |
| `ADMIN_PASSWORD` | Optional — overrides the built-in password hash |
| `ADMIN_SESSION_SECRET` | Optional — signs admin sessions (falls back to the password, then the Blob token) |

Requires Node 22.12+ (Astro 7). The site renders on Vercel through `@astrojs/vercel`; pushes to `main` deploy to production.

## Where things live

- `src/data/business.ts`: every fact on the site, plus the defaults the admin edits. Anything marked `TODO(rj)` needs John's confirmation before launch.
- `src/data/reviews.ts`: short review excerpts. `npm run check:quotes` verifies each one word for word against the scrape (kept out of git).
- `src/pages/index.astro`: the page, rendered per request so admin edits go live.
- `src/pages/admin/`, `src/pages/api/admin/`, `src/lib/`: the admin panel, auth and storage.
- `public/models/`: web-ready 3D parts. Rebuild from `raw-assets/3d/` with `npm run models`.
- `public/art/`: the engraved line drawings scattered through the page. Rebuild from `raw-assets/higgsfield/art/` with `npm run art`.

## Before launch

- Confirm hours with John. Google and MapQuest disagree (see `DEFAULT_HOURS`).
- Walk the service list with John and hide anything R&J does not do.
- Confirm John is the owner, the undercoating months, and the domain.
- Swap the AI-generated mood photos for real shop photos when we have them.
- Add a Blob store on Vercel so admin edits can save (see ADMIN.md).

Asset sources and licences: [raw-assets/SOURCES.md](raw-assets/SOURCES.md).
