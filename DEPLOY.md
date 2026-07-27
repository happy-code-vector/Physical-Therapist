# Task 12 — Verification, Cleanup & Deploy Notes

**Date:** 2026-07-26
**Status:** Migration functionally complete and verified. Ready for the user to commit + deploy.

## Verification results (all PASS)

Built with `npm run build` → `3 page(s) built`, no errors/warnings. Output:

```
dist/
├── index.html                          # migrated homepage
├── app.js                              # byte-identical to public/app.js (md5 match)
├── rss.xml                             # feed, 1 item
├── sitemap-index.xml + sitemap-0.xml   # 3 URLs
├── _astro/_slug_.C6Bidvs8.css          # bundled global.css + blog.css (shared by all pages)
└── blog/
    ├── index.html                      # listing
    └── welcome-to-faast/index.html     # post (clean URL, no .md)
```

| Check | Result |
|---|---|
| Build green | ✅ 3 pages + sitemap + rss |
| Homepage JSON-LD vs original | ✅ identical structure (PhysicalTherapy + FAQPage; same `@type` tree incl. PostalAddress/GeoCoordinates/OpeningHoursSpecification/AggregateRating/4×Question/Answer) |
| Cal loader, fonts (Fraunces+Albert Sans), theme-color, OG, app.js ref | ✅ all present in built `<head>` |
| `dist/app.js` byte-identical to source | ✅ md5 `4d8b56…` match |
| CSS applied on all 3 pages, **no horizontal overflow** at 1440/1140/900/820/390 | ✅ |
| Pain-map zone clicks → panel updates | ✅ |
| Location sync (hero bar ↔ book toggle ↔ callback form ↔ Cal) | ✅ both directions |
| FAQ accordion single-open | ✅ |
| Mobile menu open/close + auto-close past 821px | ✅ |
| Nav condensation ladder (data-full/data-short) | ✅ |
| Blog nav link (desktop + mobile) | ✅ |
| `/blog/` filter (All/Articles/Clinic news) | ✅ |
| Post page: byline, reading time, BlogPosting JSON-LD, `/#book` CTA, back link | ✅ |
| RSS discovery `<link rel="alternate">` in head | ✅ |
| RSS feed valid (title, link, pubDate RFC-822) | ✅ |
| Sitemap valid (3 URLs, clean slugs) | ✅ |
| Draft exclusion (build + rss + sitemap) | ✅ verified with temp draft, then removed |

Behavioral parity was verified by driving the **real built `dist/` files** (the actual `dist/app.js`, the bundled CSS, and `dist/index.html`) through a browser at every breakpoint — every interaction passed. This is stronger than an HTTP probe.

### Known verification limitation (not a site defect)
`astro preview` could not be reached via `curl` or PowerShell `Invoke-WebRequest` on this machine: the preview server binds **IPv6-only** (`[::1]`), while `localhost` resolves to IPv4 here. This is a local Windows networking quirk. It does not affect the build or Netlify (which serves `dist/` over HTTP/HTTPS by default). The behaviors were verified directly against the built files instead.

## Cleanup (DEFERRED — user decision, git is yours)

These root files are the **original static site**. They are now redundant (Astro builds the site into `dist/`), but they are also the **currently-live site** until Netlify's publish dir is switched to `dist`. **Do not delete until after the deploy switch is confirmed working:**

- `index.html` (root) — superseded by `src/pages/index.astro`
- `styles.css` (root) — superseded by `src/styles/global.css`
- `app.js` (root) — superseded by `public/app.js`

Recommended sequence: switch Netlify → confirm new site live → then delete the three root files in a separate commit. Keeping them until then gives a one-click rollback.

Other root artifacts (`desktop-hero.png`, `pain-map.png`, `mobile-hero-390.png`, `chat.md`) are reference/design scratch files, not site assets — leave or remove at your discretion.

## Deploy notes (Netlify)

1. **Build settings** (Site settings → Build & deploy):
   - Build command: `npm run build`  (was: none)
   - Publish directory: `dist`  (was: `.`)
   - Leave branch = `main`, auto-deploy on.
2. **Node version** is pinned to 20 in `netlify.toml` (`[build.environment] NODE_VERSION = "20"`). Netlify reads this automatically.
3. **Production domain** — replace the placeholder in `astro.config.mjs`:
   ```js
   site: 'https://faastpt.example',   // ← change to the real domain
   ```
   This drives every absolute URL: sitemap, RSS, and post `mainEntityOfPage`. The placeholder currently appears in all three (verified). Do this before deploy so search engines and feed readers see real URLs.
4. **First deploy** will run `npm install` then `npm run build`. Expect the 3 transitive-dependency npm-audit vulns (1 low, 2 high) to print — they are build-time-only and do not ship in `dist/`. Optional pre-deploy cleanup, not a blocker.
5. **Forms** — the callback form uses Netlify Forms (`data-netlify="true"`). Astro emits it as static HTML, so Netlify's form detection works unchanged. No action needed.

## Open items (human-side; not invented — carried from the spec)

- **Cal.com username** — still the `CAL_USERNAME` placeholder in `public/app.js`. Booking widget fails silently until Dr. Iftikhar confirms it (verified behavior).
- **Production domain** for `astro.config.mjs` `site` (see deploy note 3).
- Carle Place real address/hours (kept OUT of JSON-LD — unverified).
- Phone-number conflict (516 primary vs 646).
- Real reviewer names, provider/staff photos, facility video, languages, transit/parking per location.
