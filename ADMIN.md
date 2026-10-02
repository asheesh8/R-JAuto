# Admin panel: setup and handover

The site reads its services, promotions, announcement bar and hours from one
small JSON document, and ships a password-protected panel at `/admin` where
John edits them. The homepage renders per request, so a save shows up on the
live site within about 15 seconds (the page is CDN-cached for 15s). No deploy.

## What John can change

| Section | What it does |
| --- | --- |
| Services | Rename, reorder, add, remove. Each one is **Offered**, **Seasonal** (only bookable between two months, e.g. undercoating April to November), **Paused** (greyed out with a note), or **Hidden**. Seasonal services flip on and off by themselves on the first of the month, in Vermont time. |
| Promotions | Headline, details, small label, fine print, optional start and end dates, on/off switch. The first live one shows in the green bar at the top; all live ones show under the reviews. |
| Notice bar | One line across the top of every page ("Closed Friday for the holiday"). Replaces the promo bar while it is on. Green or yellow. |
| Hours | Per-day open/close or closed, plus an optional note. Drives the "Open now" label, the hours table and the Google structured data. |

Everything else (copy, photos, reviews, 3D) is in code. `src/data/business.ts`
holds every default and every factual claim.

## Deploying to Vercel

1. Import `asheesh8/R-JAutoService` at vercel.com/new. `vercel.json` pins the
   framework to Astro.
2. **Add a Blob store**: Project, Storage, Create, Blob. Vercel injects
   `BLOB_READ_WRITE_TOKEN`.
3. **Set the admin password**: add `ADMIN_PASSWORD` (a long passphrase) and,
   optionally, `ADMIN_SESSION_SECRET` (any long random string).
4. Redeploy.

Until step 2 the public site renders on its built-in defaults and `/admin`
says storage is missing. Nothing breaks.

## The admin password

Without `ADMIN_PASSWORD` the panel accepts the demo password
**`NORTHMAIN460`**. This repository is public, so that password is public
knowledge, and it also signs the session cookie. Fine for showing John the
panel; not fine once the site is live. Setting `ADMIN_PASSWORD` replaces it
completely and signs everyone out. The panel shows a yellow warning while the
demo password is active.

## How storage works

`src/lib/store/` picks a driver at runtime:

| Driver | When |
| --- | --- |
| `vercel-blob` | `BLOB_READ_WRITE_TOKEN` is set. The document lives at `rj-site/data.json`. |
| `local-disk` | `npm run dev` with no token. Writes to `.data/` (gitignored). |
| none | Production without a token. Reads fall back to defaults; saves fail with a clear message. |

Saved values are validated twice (on save and on read, `cleanStore` in
`src/lib/content.ts`), so a bad document can never break the public page.
Saves are last-write-wins; with one or two people editing that is fine.

## Worth knowing

- `/admin` is `noindex` but not hidden; anyone who finds it sees the password prompt.
- There is no rate limit on sign-in, only a 400 ms delay on a wrong password. Make the real password long.
- Services John adds himself use the shop-at-dusk photo. To give one its own photo, add `src/assets/photos/services/<id>.jpg` (the id is the service name, lowercased with dashes).
