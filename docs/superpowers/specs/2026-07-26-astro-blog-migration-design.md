# FAAST Physical Therapy - Astro Migration + Blog

**Date:** 2026-07-26
**Status:** Design approved; awaiting implementation plan
**Stack:** Astro (static output)

## Goal

Migrate the existing single-page static site (index.html / styles.css / app.js) to Astro, and add a Markdown blog that supports a biweekly posting cadence. The blog is structured so Decap CMS can be added later without a refactor. The verified look, behavior, and performance of the current site are preserved exactly.

## Confirmed decisions

- **Migration shape: full migration (Approach A).** The homepage becomes an Astro page; the blog joins it. One stack, one nav, one deploy. The working homepage is touched, but HTML/CSS/JS are relocated verbatim, so behavior is preserved and verifiable against the live static site.
- **Authoring: Markdown in Git, Decap-ready.** Posts are `.md` files committed through the GitHub web editor. No CMS at launch. Field names are chosen so a future Decap `config.yml` can point at the same folder with matching fields - adding the CMS later is additive, not a rewrite.
- **Blog type: Mixed.** Educational health articles (the SEO play) and clinic news/announcements. The schema separates them via a `category` field, and the listing offers a category filter.
- **Author byline: defaults to "Dr. Asim Iftikhar, DPT"** - the name and credentials already published in the site's provider section and JSON-LD. Posts may override per author.

## Non-goals (MVP)

- Decap CMS - deferred; structure supports adding it later.
- MDX / interactive post components - plain Markdown for now; `@astrojs/mdx` is a one-line add if a post ever needs it.
- Promoting the Cal.com username to an environment variable - kept as the existing `CAL_USERNAME` placeholder; flagged as an optional later improvement.
- Any change to the homepage's design, copy, palette, or section order.

## Architecture

A standard Astro static project. Existing files relocate, not rewrite.

```
Physical-Therapist/
+- astro.config.mjs        # site URL, output:'static', @astrojs/sitemap
+- netlify.toml            # build: npm run build; publish: dist; NODE_VERSION=20
+- package.json            # astro, @astrojs/sitemap, @astrojs/rss
+- public/
|  +- app.js               # current client script, UNCHANGED, no bundler transform
|  +- favicon.*
+- src/
+- content.config.ts      # Zod collection schema (Astro 5 config location)
|  +- content/blog/
|  |  +- *.md              # the posts
|  +- components/          # Nav, Footer, BaseLayout, PainMap, BookingSection,
|  |                       #   LocationsSection, FaqSection, PostCard
|  +- layouts/
|  |  +- BaseLayout.astro       # <html> shell: head, fonts, global CSS, Cal loader, JSON-LD slot
|  |  +- BlogPostLayout.astro   # article chrome (wraps BaseLayout)
|  +- pages/
|  |  +- index.astro           # the migrated homepage
|  |  +- blog/index.astro      # listing (paginated)
|  |  +- blog/[...slug].astro  # post template
|  |  +- rss.xml.js            # feed
|  +- styles/global.css   # current styles.css, verbatim
```

### How each existing file maps

- **styles.css -> `src/styles/global.css`**, imported once in `BaseLayout`. One sheet, not fragmented. Every token, media query, and the `:root` palette are preserved. Zero behavioral change - CSS is CSS.
- **app.js -> `public/app.js`**, referenced `<script src="/app.js" defer>`. Kept in `public/` (not bundled) because it is an IIFE with no imports - no transform means no risk. Identical to today.
- **index.html** is decomposed: the `<head>` shell + fonts + Cal loader become `BaseLayout`; the nav and footer become `Nav` and `Footer`; large self-contained homepage sections become `PainMap`, `BookingSection`, `LocationsSection`, `FaqSection`. The section order and all attributes (including the nav's `data-full`/`data-short` condensation ladder) are preserved.
- **Cal.com embed loader stub** stays inline in `BaseLayout` `<head>` - it must run early. `#calEmbed` remains a `<div>`, `renderCal()` calls `Cal("inline", ...)`, same as today. The `cal.libs` ready-check is preserved (do not revert to `cal.apply` - that recurses).

### Component boundaries

Principle: extract where there is reuse or clarity; keep inline where it is just content.

- **Shared across all pages (must extract):** `BaseLayout`, `Nav`, `Footer` - the blog reuses them.
- **Homepage-only, but worth a component** for readability of a long page: `PainMap`, `BookingSection` (Cal embed + callback form), `LocationsSection`, `FaqSection`.
- **Blog-only:** `PostCard` (listing item) and `BlogPostLayout` (article shell).

## Blog content model

```ts
// src/content/blog/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    excerpt: z.string(),                          // listing + meta description + OG
    category: z.enum(['article', 'news']),        // educational vs. clinic update
    tags: z.array(z.string()).default([]),
    author: z.string().default('Dr. Asim Iftikhar, DPT'),
    image: z.object({ url: z.string(), alt: z.string() }).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- `category` separates SEO articles from clinic news; the listing gets a filter (All / Articles / Clinic News).
- `author` defaults to 'Dr. Asim Iftikhar, DPT', the name already published on the site. Posts may override per author.
- `draft` and `pubDate` map directly onto Decap fields, so the CMS is a future additive change.

## Blog pages

- **Listing (`/blog`):** all posts, newest-first; a `PostCard` per post (title, date, excerpt, category chip, tags). A progressive-enhancement category filter (All / Articles / Clinic News) shows/hides cards client-side; with JavaScript disabled, all posts are visible (graceful degradation). Empty state shows "First post coming soon," not a broken page.
- **Pagination:** deferred. Added via Astro `paginate()` once the list exceeds ~20 posts (~10 months at a biweekly cadence). MVP renders the full list so the client-side filter operates over every card.
- **Post (`/blog/<slug>`):** byline (author, date, reading time), optional hero image, rendered Markdown body, tags, and a CTA back to booking. Emits `BlogPosting` JSON-LD per post. Reading time is computed from the rendered body word count.

## SEO

- `@astrojs/sitemap` produces `sitemap.xml` automatically. `site` is set in `astro.config.mjs` to the production domain (to be confirmed at deploy time).
- `@astrojs/rss` produces `/rss.xml`.
- Per-post `BlogPosting` structured data.
- The homepage's existing `PhysicalTherapy` and `FAQPage` JSON-LD is preserved verbatim (Carle Place stays out of JSON-LD - address unverified).
- A **Blog** link is added to the desktop nav and the mobile menu.

## Build and deploy (Netlify)

`netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

`NODE_VERSION` is pinned to 20 (LTS) rather than the local 24 for Netlify stability. The site's build settings in Netlify change from "no build command, publish `.`" to "command `npm run build`, publish `dist`". Branch `main` auto-deploy is unchanged.

`astro.config.mjs` sets `output: 'static'` and `site` to the production domain (confirm the final domain).

## Edge cases and honesty constraints (carried over from the static build)

- **Cal username** stays the `CAL_USERNAME` placeholder until Dr. Iftikhar confirms it. The placeholder fails silently and the page stays interactive (verified behavior).
- **Carle Place** stays out of JSON-LD (address unverified). **Phone** 516 stays the primary tap-to-call (the 516-vs-646 conflict is unresolved). **No PHI** in any form; intake is routed to Jane App. **Unknown media** (provider/staff photos, facility video) stays as the same dashed placeholder slots - nothing is invented.
- **Drafts** are excluded from production builds; shown only in `dev`.
- **Future-dated posts** are excluded from production (a post scheduled for a later date does not appear until that date).

## Verification

This is a migration of an already-verified site. No test framework - verification is visual + functional diff + build check, the same approach that caught the earlier bugs.

1. **Behavioral parity** - `npm run build && npm run preview`, then diff the migrated homepage against the live static site at the same breakpoints (1440 / 1140 / 900 / 820 / 390):
   - Screenshots match the existing verified layout.
   - Pain-map zone clicks update the panel and the Cal embed.
   - Location sync (hero bar, book toggle, callback form) stays in sync.
   - Mobile menu opens/closes and auto-closes on widen past 821px.
   - Nav condensation ladder fires at the right breakpoints.
   - FAQ accordion closes others on open.
   - Zero horizontal overflow at any breakpoint; nav height locked.
2. **Build correctness** - `astro build` succeeds; `dist/index.html`, `dist/blog/**`, `sitemap.xml`, and `rss.xml` are present.
3. **Content** - schema validates; a sample post renders; a draft is excluded from production.
4. **Deploy** - Netlify builds with the new settings, publishes `dist`, site is live.

## Open items (human-side; not invented)

- Cal.com username (currently `CAL_USERNAME`).
- Carle Place real address and hours.
- Phone-number conflict resolution (516 vs 646).
- Production domain for `astro.config.mjs` `site` and canonical URLs.
- Reviewer names, provider/staff photos, facility video, languages spoken, transit/landmark/parking per location.
- A2P 10DLC registration (SMS consent already captured in the form).
