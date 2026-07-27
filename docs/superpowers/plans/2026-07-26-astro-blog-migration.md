# Astro Migration + Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing single-page static site (index.html / styles.css / app.js) to Astro, preserving its verified look and behavior exactly, and add a Markdown blog with a content collection that supports a biweekly cadence and is structured for a future Decap CMS.

**Architecture:** Full migration (Approach A). The homepage becomes `src/pages/index.astro`; large self-contained sections become `.astro` components; the shared `<head>`, nav, and footer become `BaseLayout` + `Nav` + `Footer` so blog pages reuse them. `styles.css` moves verbatim to one global stylesheet; `app.js` moves verbatim to `public/` (no bundler transform). The blog uses Astro's content-layer collection (Zod schema), a listing page with a client-side category filter, and a post template with reading time and `BlogPosting` JSON-LD.

**Tech Stack:** Astro 5 (static output), `@astrojs/sitemap`, `@astrojs/rss`. Node 20 LTS for the Netlify build. No test framework - verification is build + dev-server smoke checks + a final behavioral-parity pass (see Task 12).

## Global Constraints

- **Git is user-owned.** The agent never runs `git add`, `git commit`, `git branch`, or `git push`. Each task ends with a **Checkpoint**: the agent leaves the working tree changed and stops; the user reviews and commits. Suggested commit messages are provided in italics.
- **Preserve the homepage verbatim.** Sections are *moved*, not rewritten. When a task says "copy index.html lines A-B verbatim," copy that exact range including indentation, attributes, IDs, and comments - app.js queries these IDs (e.g. `#calEmbed`, `#bookToggle`, `#panelTitle`, `.zone`, `.treat-item`) and they must not change.
- **No confabulation.** Do not invent business facts. `CAL_USERNAME` stays a placeholder. Carle Place stays out of JSON-LD. Phone stays `(516) 789-6322` primary. Unknown media keeps its dashed placeholder slots.
- **Pinned versions:** Astro `^5`, `@astrojs/sitemap` `^3`, `@astrojs/rss` `^4`, Node `20` on Netlify.
- **Root files kept until Task 12.** During migration, leave root `index.html`, `styles.css`, `app.js` in place as the verbatim copy source (Astro ignores them - it builds only from `src/pages`). They are deleted in Task 12 cleanup.

---

## File Structure

What gets created and what each file owns:

- `package.json` - deps and scripts (`dev`, `build`, `preview`).
- `astro.config.mjs` - `site`, `output: 'static'`, sitemap integration.
- `tsconfig.json` - Astro strict preset.
- `netlify.toml` - build command, publish dir, Node version.
- `.gitignore` - append `dist/`, `.astro/`.
- `public/app.js` - verbatim copy of root `app.js` (client script, unbundled).
- `src/styles/global.css` - verbatim copy of root `styles.css`.
- `src/styles/blog.css` - blog-only styles, using the existing design tokens.
- `src/layouts/BaseLayout.astro` - `<html>` shell: meta, fonts, global.css, Cal loader, schema slot, skip-link, `<Nav/>`, `<main>`, `<Footer/>`, app.js.
- `src/components/Nav.astro` - verbatim nav + Blog link + absolute anchors.
- `src/components/Footer.astro` - verbatim footer + absolute anchors.
- `src/components/PainMap.astro` - the "What we treat" section (SVG + zones + panel).
- `src/components/LocationsSection.astro` - the locations + hours section.
- `src/components/FaqSection.astro` - the FAQ accordion.
- `src/components/BookingSection.astro` - Cal embed stage + Netlify callback form.
- `src/components/PostCard.astro` - one listing item.
- `src/layouts/BlogPostLayout.astro` - article chrome (wraps BaseLayout).
- `src/utils/reading-time.ts` - word-count to minutes.
- `src/content.config.ts` - collection schema (Astro 5 loads the config from here, not from `src/content/blog/`).
- `src/content/blog/*.md` - the posts.
- `src/pages/index.astro` - the migrated homepage.
- `src/pages/blog/index.astro` - listing + category filter.
- `src/pages/blog/[...slug].astro` - post template.
- `src/pages/rss.xml.js` - the feed.

---

## Task 1: Scaffold Astro project and prove the build

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `netlify.toml`
- Modify: `.gitignore` (append two lines)
- Create: `src/styles/global.css` (verbatim copy of root `styles.css`)
- Create: `public/app.js` (verbatim copy of root `app.js`)
- Create: `src/pages/index.astro` (minimal placeholder, replaced in Task 3)

**Interfaces:**
- Produces: a working `npm run build` that emits `dist/index.html`; `global.css` and `public/app.js` available for later tasks.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "faast-physical-therapy",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/rss": "^4.0.0",
    "@astrojs/sitemap": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

The `site` value matches the placeholder already used in the existing JSON-LD (`faastpt.example`). Replace it with the real domain at deploy time (open item in the spec).

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://faastpt.example',
  output: 'static',
  integrations: [sitemap()],
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

- [ ] **Step 5: Append to `.gitignore`**

Add these two lines (the file already ignores `node_modules`, `.env`, `chat.md`):

```
dist/
.astro/
```

- [ ] **Step 6: Copy `styles.css` to `src/styles/global.css` verbatim**

Create `src/styles/global.css` with the exact contents of root `styles.css`. Do not edit - every token, media query, and rule is preserved.

- [ ] **Step 7: Copy `app.js` to `public/app.js` verbatim**

Create `public/app.js` with the exact contents of root `app.js`. Do not edit.

- [ ] **Step 8: Create a minimal `src/pages/index.astro`**

This throwaway page only proves the toolchain. It is replaced in Task 3.

```astro
---
import '../styles/global.css';
---
<!DOCTYPE html>
<html lang="en">
  <body><h1>Migration in progress</h1></body>
</html>
```

- [ ] **Step 9: Install and build**

Run: `npm install`
Expected: completes, creates `node_modules/` and `package-lock.json`.

Run: `npm run build`
Expected: completes with no errors; `dist/index.html` exists; `dist/_astro/*.css` exists.

- [ ] **Checkpoint** - working tree has the scaffold. The user reviews and commits.
* suggested message: `chore: scaffold astro project, move css/js into place`

---

## Task 2: Shared shell - BaseLayout, Nav, Footer

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/pages/index.astro` (use BaseLayout; temporary body)

**Interfaces:**
- Produces: `BaseLayout` (props: `title`, `description`, optional `ogTitle`/`ogDescription`; named slot `schema` for page JSON-LD; default slot for page body). `Nav` and `Footer` take no props.

- [ ] **Step 1: Create `src/components/Nav.astro`**

Copy `index.html` lines 91-127 (the `<!-- NAV -->` header through `</header>`) verbatim into the component body. Then make three edits so the nav works on every page:

1. Change the wordmark `href="#top"` to `href="/"` (line 94 region).
2. In the desktop `nav-links` (lines 98-104), change each anchor from an in-page hash to an absolute path, and add a **Blog** link as the first item. The desktop block becomes:

```html
<nav class="nav-links" aria-label="Primary">
  <a class="nav-link" href="/blog" data-full="Blog" data-short="Blog">Blog</a>
  <a class="nav-link" href="/#insurance" data-full="Insurance" data-short="Insurance">Insurance</a>
  <a class="nav-link" href="/#treat" data-full="Treatments" data-short="Treat">Treatments</a>
  <a class="nav-link" href="/#provider" data-full="Therapist" data-short="Therapist">Therapist</a>
  <a class="nav-link" href="/#reviews" data-full="Reviews" data-short="Reviews">Reviews</a>
  <a class="nav-link" href="/#locations" data-full="Hours &amp; location" data-short="Hours">Hours&nbsp;&amp;&nbsp;location</a>
</nav>
```

3. In the `nav-actions` (lines 106-115), change the Book button `href="#book"` to `href="/#book"`. Leave the `tel:` link and the toggle button unchanged.

4. In the `mobile-menu` (lines 118-126), make anchors absolute and add Blog at the top:

```html
<div class="mobile-menu" id="mobileMenu" hidden>
  <a href="/blog">Blog</a>
  <a href="/#insurance">Insurance</a>
  <a href="/#treat">Treatments</a>
  <a href="/#provider">Therapist</a>
  <a href="/#reviews">Reviews</a>
  <a href="/#locations">Hours &amp; location</a>
  <a href="/#book">Book an appointment</a>
  <a class="mm-call" href="tel:+15167896322">(516) 789-6322</a>
</div>
```

- [ ] **Step 2: Create `src/components/Footer.astro`**

Copy `index.html` lines 696-725 (the `<!-- FOOTER -->` block through `</footer>`) verbatim, then change every in-page anchor to an absolute path: `#treat` -> `/#treat`, `#provider` -> `/#provider`, `#reviews` -> `/#reviews`, `#locations` -> `/#locations`, `#faq` -> `/#faq`, and the contact `#book` -> `/#book`. Leave the `tel:` link and the address lines unchanged.

- [ ] **Step 3: Create `src/layouts/BaseLayout.astro`**

```astro
---
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
}
const { title, description, ogTitle = title, ogDescription = description } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="theme-color" content="#1E3A2B" />

  <!-- Open Graph -->
  <meta property="og:title" content={ogTitle} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:type" content="website" />

  <!-- Fonts: Fraunces (display, serif) + Albert Sans (body) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&display=swap" rel="stylesheet" />

  <!-- Cal.com embed loader (verbatim from the static site; is:inline so Astro leaves it alone) -->
  <script is:inline>
    (function (C, A) {
      C.Cal = C.Cal || function () {
        var cal = C.Cal, ar = arguments;
        if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || [];
          C.document.head.appendChild(C.document.createElement("script")).src = A;
          cal.loaded = true; }
        return cal.libs ? cal.apply(null, ar) : cal.q.push(ar);
      };
    })(window, "https://cal.com/embed.js");
  </script>

  <slot name="schema" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <Nav />
  <main id="main">
    <slot />
  </main>
  <Footer />
  <script src="/app.js" defer></script>
</body>
</html>
```

- [ ] **Step 4: Point the placeholder page at BaseLayout**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="FAAST Physical Therapy - Get moving again | Floral Park & Carle Place, NY"
  description="One-on-one physical therapy with Dr. Asim Iftikhar in Floral Park and Carle Place, NY. Most insurance accepted, plus No-Fault and Workers' Comp. No referral needed to start.">
  <p>Shell works. Homepage body arrives in Task 3.</p>
</BaseLayout>
```

- [ ] **Step 5: Build and smoke-check**

Run: `npm run build`
Expected: no errors; `dist/index.html` contains the fonts, the Cal loader, a `/app.js` script tag, the skip-link, the nav (with the Blog link), and the footer.

Run: `npm run dev` and open `http://localhost:4321/`
Expected: page renders with the site's styling (global.css applied), nav visible with a Blog link, mobile menu markup present.

- [ ] **Checkpoint** - the user reviews and commits.
* suggested message: `feat: add base layout, nav (with blog link), footer`

---

## Task 3: Migrate the full homepage body into index.astro

**Files:**
- Modify: `src/pages/index.astro` (replace placeholder with the real homepage)

**Interfaces:**
- Produces: a complete migrated homepage at `/`. Later tasks extract four sections into components without changing what renders.

- [ ] **Step 1: Wrap the homepage in BaseLayout and add the top anchor**

Replace `src/pages/index.astro` with a file whose frontmatter imports `BaseLayout`, opens `<BaseLayout title=... description=...>` (same title/description as Task 2 Step 4), and immediately places `<span id="top"></span>` (this is `index.html` line 130 - the wordmark target).

- [ ] **Step 2: Paste the homepage sections, in order, verbatim**

Into the `BaseLayout` default slot, paste these `index.html` line ranges in this exact order. Copy each block including its opening `<!-- ===...=== -->` comment. Do not edit the markup:

1. Lines 132-172 - HERO (includes `#heroBookingBar` and `#heroBookBtn`).
2. Lines 174-190 - STATS.
3. Lines 192-254 - INSURANCE (`#insurance`).
4. Lines 256-291 - FIRST-VISIT (`#first-visit`).
5. Lines 293-407 - WHAT WE TREAT / pain map (`#treat`, `#figureStage`, `#panelTitle`, `#panelBody`, `.zone`, `.treat-item`).
6. Lines 409-435 - PROVIDER (`#provider`).
7. Lines 437-464 - TEAM (`#team`).
8. Lines 466-485 - FACILITY VIDEO (`#facility`).
9. Lines 487-523 - REVIEWS (`#reviews`).
10. Lines 525-586 - LOCATIONS (`#locations`).
11. Lines 588-615 - FAQ (`#faq`).
12. Lines 617-693 - BOOKING (`#book`, `#bookToggle`, `#calEmbed`, the Netlify callback form with `#cb-name`, `#cb-phone`, `#cb-loc`).

Close with `</BaseLayout>`.

- [ ] **Step 3: Add the homepage JSON-LD into the schema slot**

Inside `<BaseLayout ...>`, before the `<span id="top">`, add a named-slot fragment that carries the two existing JSON-LD blocks verbatim (Hillside-only `PhysicalTherapy` + `FAQPage`). Copy `index.html` lines 49-86 (both `<script type="application/ld+json">` blocks and their leading comments):

```astro
<Fragment slot="schema">
  <!-- paste index.html lines 49-86 here, verbatim -->
</Fragment>
```

- [ ] **Step 4: Build and verify the full page**

Run: `npm run build`
Expected: no errors.

Run: `npm run dev`
Expected: the full homepage renders - hero, pain map figure, locations grid, FAQ, and the booking section with the Cal stage div. Clicking a pain-map zone updates the panel (app.js is wired). The mobile menu opens/closes. No horizontal scrollbar at desktop width.

- [ ] **Checkpoint** - the user reviews and commits.
* suggested message: `feat: migrate homepage body to index.astro with JSON-LD`

---

## Task 4: Extract the PainMap component

**Files:**
- Create: `src/components/PainMap.astro`
- Modify: `src/pages/index.astro` (replace the inline pain-map block with `<PainMap />`)

**Interfaces:**
- Produces: `PainMap` (no props) rendering the `#treat` section exactly as before.

- [ ] **Step 1: Create `src/components/PainMap.astro`**

Move the verbatim block that is currently inline in `index.astro` (originally `index.html` lines 293-407, the `<!-- WHAT WE TREAT -->` section) into `PainMap.astro` as the component body. No edits to the markup.

- [ ] **Step 2: Reference it from index.astro**

In `src/pages/index.astro`: add `import PainMap from '../components/PainMap.astro';` to the frontmatter, and replace the inline pain-map block with `<PainMap />` in the same position (between the FIRST-VISIT and PROVIDER sections).

- [ ] **Step 3: Build and verify**

Run: `npm run build` then `npm run dev`.
Expected: the pain map renders identically; clicking `.zone` and `.treat-item` still updates `#panelTitle` / `#panelBody` (the IDs are unchanged because the markup is unchanged).

- [ ] **Checkpoint** - the user reviews and commits.
* suggested message: `refactor: extract PainMap component`

---

## Task 5: Extract the LocationsSection component

**Files:**
- Create: `src/components/LocationsSection.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `LocationsSection` (no props) rendering the `#locations` section exactly as before.

- [ ] **Step 1: Create `src/components/LocationsSection.astro`**

Move the inline `#locations` block (originally `index.html` lines 525-586) into the component. No edits.

- [ ] **Step 2: Reference it from index.astro**

Import `LocationsSection` and replace the inline block with `<LocationsSection />` in the same position (between REVIEWS and FAQ).

- [ ] **Step 3: Build and verify**

Run: `npm run build` then `npm run dev`.
Expected: the two-column locations grid renders; collapses to one column under 900px (the responsive rule lives in global.css and is unchanged).

- [ ] **Checkpoint** - the user reviews and commits.
* suggested message: `refactor: extract LocationsSection component`

---

## Task 6: Extract the FaqSection component

**Files:**
- Create: `src/components/FaqSection.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `FaqSection` (no props) rendering the `#faq` section exactly as before.

- [ ] **Step 1: Create `src/components/FaqSection.astro`**

Move the inline `#faq` block (originally `index.html` lines 588-615) into the component. No edits.

- [ ] **Step 2: Reference it from index.astro**

Import `FaqSection` and replace the inline block with `<FaqSection />` in the same position (between LOCATIONS and BOOKING).

- [ ] **Step 3: Build and verify**

Run: `npm run build` then `npm run dev`.
Expected: FAQ renders; opening one item closes the others (the accordion-lite behavior in app.js).

- [ ] **Checkpoint** - the user reviews and commits.
* suggested message: `refactor: extract FaqSection component`

---

## Task 7: Extract the BookingSection component

**Files:**
- Create: `src/components/BookingSection.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `BookingSection` (no props) rendering the `#book` section, including `#bookToggle`, `#calEmbed`, and the Netlify callback form.

- [ ] **Step 1: Create `src/components/BookingSection.astro`**

Move the inline `#book` block (originally `index.html` lines 617-693) into the component. No edits - this includes the `data-netlify` callback form and the `<div id="calEmbed" class="cal-stage">`.

- [ ] **Step 2: Reference it from index.astro**

Import `BookingSection` and replace the inline block with `<BookingSection />` as the last section before `</BaseLayout>`.

- [ ] **Step 3: Build and verify**

Run: `npm run build` then `npm run dev`.
Expected: booking section renders; the location toggle switches `#calEmbed` (with the `CAL_USERNAME` placeholder it fails silently and the page stays interactive - the verified behavior). The callback form markup is intact.

- [ ] **Checkpoint** - the user reviews and commits. The homepage migration is now complete.
* suggested message: `refactor: extract BookingSection component`

---

## Task 8: Blog content collection and a sample post

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/blog/welcome-to-faast.md` (sample post)

**Interfaces:**
- Produces: a `blog` collection validated by Zod. Posts have `title`, `pubDate`, `excerpt`, `category` (`'article' | 'news'`), `tags`, `author`, optional `image`, `draft`.

- [ ] **Step 1: Create `src/content.config.ts`**

Astro 5 content-layer API (`glob` loader, not the legacy `type: 'content'`):

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    excerpt: z.string(),
    category: z.enum(['article', 'news']),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Dr. Asim Iftikhar, DPT'),
    image: z.object({ url: z.string(), alt: z.string() }).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: Create the sample post `src/content/blog/welcome-to-faast.md`**

```markdown
---
title: Welcome to the FAAST Physical Therapy blog
pubDate: 2026-07-26
excerpt: What we will post here, and how often. A short note on what to expect from this blog.
category: news
tags: ["clinic news"]
author: Dr. Asim Iftikhar, DPT
draft: false
---

This is where we will share practical guidance on recovering from injury, what
to expect at your first visit, and clinic updates from Floral Park and Carle
Place. New posts land about every two weeks.

If you have a question you would like answered here, mention it at your next
visit and we may write the next post about it.
```

- [ ] **Step 3: Verify the collection is recognized**

Run: `npm run dev`
Expected: no schema errors in the console. (The post is not yet linked anywhere - that comes in Task 9. This step only confirms the collection validates.)

- [ ] **Checkpoint** - the user reviews and commits.
* suggested message: `feat: add blog content collection and sample post`

---

## Task 9: Blog listing page with category filter

**Files:**
- Create: `src/components/PostCard.astro`
- Create: `src/styles/blog.css`
- Create: `src/pages/blog/index.astro`

**Interfaces:**
- Consumes: the `blog` collection from Task 8.
- Produces: `/blog` listing all non-draft posts newest-first, with a progressive-enhancement category filter.

- [ ] **Step 1: Create `src/components/PostCard.astro`**

```astro
---
interface Props {
  title: string;
  pubDate: Date;
  excerpt: string;
  category: 'article' | 'news';
  tags?: string[];
  slug: string;
}
const { title, pubDate, excerpt, category, tags = [], slug } = Astro.props;
const dateStr = pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
---
<article class="post-card" data-category={category}>
  <a class="post-card__link" href={`/blog/${slug}/`}>
    <span class="post-card__chip">{category === 'article' ? 'Article' : 'Clinic news'}</span>
    <h3 class="post-card__title">{title}</h3>
    <time class="post-card__date" datetime={pubDate.toISOString()}>{dateStr}</time>
    <p class="post-card__excerpt">{excerpt}</p>
    {tags.length > 0 && (
      <ul class="post-card__tags">{tags.map(t => <li>{t}</li>)}</ul>
    )}
  </a>
</article>
```

- [ ] **Step 2: Create `src/styles/blog.css`**

Uses the existing design tokens defined in `global.css` `:root`: colors `--forest`, `--cream`, `--sage`, `--copper`, `--ink` (body text on cream), `--sage-deep` (muted text); fonts `--font-display`, `--font-body`. (Earlier draft used non-existent `--c-*` names - corrected to the real tokens.)

```css
.blog-index { max-width: 1100px; margin: 0 auto; padding: clamp(2.5rem, 6vw, 5rem) 1.25rem; }
.blog-index__head { margin-bottom: 2rem; }
.blog-index__title { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3rem); color: var(--forest); }
.blog-index__lede { color: var(--forest); opacity: 0.85; max-width: 60ch; }

.blog-filter { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1.5rem 0 2.5rem; }
.blog-filter__btn {
  appearance: none; cursor: pointer; font: inherit;
  padding: 0.45rem 1rem; border-radius: 999px;
  border: 1px solid var(--sage); background: transparent; color: var(--forest);
}
.blog-filter__btn[aria-pressed="true"] { background: var(--forest); color: var(--cream); border-color: var(--forest); }

.post-grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.post-card { background: var(--cream); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.post-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.post-card__link { display: block; padding: 1.4rem; color: inherit; text-decoration: none; }
.post-card__chip { display: inline-block; font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--copper); margin-bottom: 0.5rem; }
.post-card__title { font-family: var(--font-display); font-size: 1.35rem; color: var(--forest); margin: 0 0 0.4rem; }
.post-card__date { font-size: 0.85rem; color: var(--forest); opacity: 0.7; }
.post-card__excerpt { margin: 0.6rem 0 0; color: var(--forest); opacity: 0.85; }
.post-card__tags { list-style: none; padding: 0; margin: 0.8rem 0 0; display: flex; flex-wrap: wrap; gap: 0.4rem; }
.post-card__tags li { font-size: 0.72rem; padding: 0.15rem 0.55rem; border-radius: 999px; background: var(--sage); color: var(--forest); }

.blog-empty { padding: 3rem 0; text-align: center; color: var(--forest); opacity: 0.7; }
.blog-empty[hidden] { display: none; }
```

- [ ] **Step 3: Create `src/pages/blog/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { getCollection } from 'astro:content';
import '../../styles/blog.css';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
<BaseLayout
  title="Blog - FAAST Physical Therapy | Floral Park & Carle Place, NY"
  description="Practical physical therapy guidance and clinic news from FAAST PT."
  ogTitle="FAAST Physical Therapy - Blog">
  <section class="blog-index">
    <div class="blog-index__head">
      <h1 class="blog-index__title">The FAAST blog</h1>
      <p class="blog-index__lede">Recovery guidance, what to expect, and clinic updates. New posts about every two weeks.</p>
    </div>

    <div class="blog-filter" role="group" aria-label="Filter posts by type">
      <button class="blog-filter__btn" data-filter="all" aria-pressed="true">All</button>
      <button class="blog-filter__btn" data-filter="article" aria-pressed="false">Articles</button>
      <button class="blog-filter__btn" data-filter="news" aria-pressed="false">Clinic news</button>
    </div>

    {posts.length === 0 ? (
      <p class="blog-empty">First post coming soon.</p>
    ) : (
      <div class="post-grid">
        {posts.map(p => (
          <PostCard
            title={p.data.title}
            pubDate={p.data.pubDate}
            excerpt={p.data.excerpt}
            category={p.data.category}
            tags={p.data.tags}
            slug={p.id}
          />
        ))}
      </div>
    )}
    <p class="blog-empty" data-empty hidden>No posts in this category yet.</p>
  </section>

  <script>
    const buttons = document.querySelectorAll<HTMLButtonElement>('.blog-filter__btn');
    const cards = document.querySelectorAll<HTMLElement>('.post-card');
    const empty = document.querySelector<HTMLElement>('[data-empty]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        let visible = 0;
        cards.forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          card.hidden = !show;
          if (show) visible++;
        });
        if (empty) empty.hidden = visible !== 0;
      });
    });
  </script>
</BaseLayout>
```

- [ ] **Step 4: Build and verify**

Run: `npm run build` then `npm run dev`; open `http://localhost:4321/blog`.
Expected: the sample post appears as a card with the "Clinic news" chip; the All / Articles / Clinic News filter shows/hides cards; with JavaScript off, all cards remain visible (graceful degradation). The nav Blog link and footer reach this page.

- [ ] **Checkpoint** - the user reviews and commits.
* suggested message: `feat: add /blog listing with category filter and PostCard`

---

## Task 10: Blog post template

**Files:**
- Create: `src/utils/reading-time.ts`
- Create: `src/layouts/BlogPostLayout.astro`
- Create: `src/pages/blog/[...slug].astro`
- Modify: `src/styles/blog.css` (append post styles)

**Interfaces:**
- Consumes: the `blog` collection; `readingTime(body: string): number`.
- Produces: `/blog/<slug>/` rendered from each post's Markdown, with byline, reading time, tags, a booking CTA, and `BlogPosting` JSON-LD.

- [ ] **Step 1: Create `src/utils/reading-time.ts`**

```ts
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
```

- [ ] **Step 2: Append post styles to `src/styles/blog.css`**

```css
.post { max-width: 760px; margin: 0 auto; padding: clamp(2.5rem, 6vw, 4.5rem) 1.25rem; }
.post__byline { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: baseline; color: var(--forest); opacity: 0.8; font-size: 0.9rem; margin-bottom: 1.5rem; }
.post__chip { display: inline-block; font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--copper); }
.post__title { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 2.8rem); color: var(--forest); margin: 0 0 0.5rem; }
.post__hero { width: 100%; border-radius: 14px; margin: 1.5rem 0 2rem; }
.post__body { font-family: var(--font-body); font-size: 1.1rem; line-height: 1.7; color: var(--forest); }
.post__body h2 { font-family: var(--font-display); margin-top: 2rem; }
.post__body a { color: var(--copper); }
.post__tags { list-style: none; padding: 0; margin: 2.5rem 0 0; display: flex; flex-wrap: wrap; gap: 0.4rem; }
.post__tags li { font-size: 0.78rem; padding: 0.2rem 0.7rem; border-radius: 999px; background: var(--sage); color: var(--forest); }
.post__cta { margin-top: 3rem; padding: 1.5rem; background: var(--cream); border-radius: 14px; text-align: center; }
.post__cta a.btn { display: inline-block; margin-top: 0.75rem; }
.post__back { display: inline-block; margin-top: 2rem; color: var(--forest); opacity: 0.7; text-decoration: none; }
```

- [ ] **Step 3: Create `src/layouts/BlogPostLayout.astro`**

This wraps `BaseLayout` and renders the article chrome plus the `BlogPosting` JSON-LD through the schema slot.

```astro
---
import BaseLayout from './BaseLayout.astro';
import '../../styles/blog.css';

interface Props {
  title: string;
  pubDate: Date;
  author: string;
  excerpt: string;
  image?: { url: string; alt: string };
  tags?: string[];
  url: string;
  minutes: number;
}
const { title, pubDate, author, excerpt, image, tags = [], url, minutes } = Astro.props;
const dateStr = pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: title,
  description: excerpt,
  datePublished: pubDate.toISOString(),
  author: { '@type': 'Person', name: author },
  mainEntityOfPage: url,
  ...(image ? { image: image.url } : {}),
};
---
<BaseLayout title={`${title} - FAAST Physical Therapy`} description={excerpt} ogTitle={title}>
  <Fragment slot="schema">
    <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  </Fragment>

  <article class="post">
    <span class="post__chip">FAAST blog</span>
    <h1 class="post__title">{title}</h1>
    <div class="post__byline">
      <span>{author}</span>
      <time datetime={pubDate.toISOString()}>{dateStr}</time>
      <span>{minutes} min read</span>
    </div>

    {image && <img class="post__hero" src={image.url} alt={image.alt} loading="lazy" />}

    <div class="post__body">
      <slot />
    </div>

    {tags.length > 0 && (
      <ul class="post__tags">{tags.map(t => <li>{t}</li>)}</ul>
    )}

    <div class="post__cta">
      <p>Ready to get moving again?</p>
      <a class="btn btn-copper-solid" href="/#book">Book an appointment</a>
    </div>

    <a class="post__back" href="/blog">&larr; Back to all posts</a>
  </article>
</BaseLayout>
```

- [ ] **Step 4: Create `src/pages/blog/[...slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import BlogPostLayout from '../../layouts/BlogPostLayout.astro';
import { readingTime } from '../../utils/reading-time';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
const minutes = readingTime(post.body ?? '');
const url = `/blog/${post.id}/`;
---
<BlogPostLayout
  title={post.data.title}
  pubDate={post.data.pubDate}
  author={post.data.author}
  excerpt={post.data.excerpt}
  image={post.data.image}
  tags={post.data.tags}
  url={url}
  minutes={minutes}
>
  <Content />
</BlogPostLayout>
```

The `minutes` value is passed as a prop; `BlogPostLayout` (Task 10 Step 3) declares `minutes: number` in its `Props` and renders `{minutes}`.

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: `dist/blog/welcome-to-faast/index.html` exists (or `welcome-to-faast.html`), containing the post title, byline "Dr. Asim Iftikhar, DPT", a reading time, the rendered body, and a `BlogPosting` JSON-LD script.

Run: `npm run dev`; open the post from the listing.
Expected: post page renders with styles; the "Book an appointment" CTA links to `/#book`; "Back to all posts" returns to `/blog`.

- [ ] **Checkpoint** - the user reviews and commits.
* suggested message: `feat: add blog post template with reading time and BlogPosting JSON-LD`

---

## Task 11: SEO - sitemap and RSS feed

**Files:**
- Modify: `astro.config.mjs` (sitemap already added in Task 1; confirm)
- Create: `src/pages/rss.xml.js`

**Interfaces:**
- Produces: `/sitemap-index.xml` (from the integration) and `/rss.xml`.

- [ ] **Step 1: Confirm the sitemap integration**

`astro.config.mjs` from Task 1 already imports and registers `@astrojs/sitemap` and sets `site`. No change needed unless `site` is still the placeholder - leave it; it is a flagged deploy-time replacement.

- [ ] **Step 2: Create `src/pages/rss.xml.js`**

```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return rss({
    title: 'FAAST Physical Therapy - Blog',
    description: 'Physical therapy guidance and clinic news from FAAST PT, Floral Park & Carle Place, NY.',
    site: context.site,
    items: posts.map(p => ({
      title: p.data.title,
      pubDate: p.data.pubDate,
      description: p.data.excerpt,
      categories: p.data.tags,
      link: `/blog/${p.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: `dist/sitemap-index.xml` and `dist/rss.xml` both exist. Open `dist/rss.xml` and confirm the sample post appears.

- [ ] **Checkpoint** - the user reviews and commits.
* suggested message: `feat: add RSS feed; confirm sitemap`

---

## Task 12: Behavioral-parity verification, cleanup, deploy notes

**Files:**
- Delete: root `index.html`, root `styles.css`, root `app.js` (now at Astro paths)
- Verify: the full migrated site against the original behavior

**Interfaces:** none - this is the final gate.

- [ ] **Step 1: Build and preview the production output**

Run: `npm run build && npm run preview`
Expected: served at `http://localhost:4321/` with no console errors.

- [ ] **Step 2: Behavioral-parity checks (homepage)**

At breakpoints 1440 / 1140 / 900 / 820 / 390 (use the browser device toolbar), confirm:
- No horizontal overflow at any width; nav height stays locked (the `--nav-h` token).
- Pain-map zone clicks update `#panelTitle` and `#panelBody`; the active zone pulses red.
- Location sync stays wired: clicking a hero-bar location option updates the book toggle, `#cb-loc`, and `#calEmbed` (with the `CAL_USERNAME` placeholder it fails silently - page stays interactive).
- Mobile menu opens on toggle, closes on link click, and auto-closes when widened past 821px.
- Nav condensation ladder fires at 1140px (long labels -> short labels).
- FAQ opens one item at a time.
- Booking callback form fields (`#cb-name`, `#cb-phone`, `#cb-loc`) are present.

- [ ] **Step 3: Blog checks**

- `/blog` lists the sample post; the category filter works; the Blog nav link reaches it from the homepage and back.
- `/blog/welcome-to-faast/` renders with byline, reading time, body, CTA, and `BlogPosting` JSON-LD.
- `/rss.xml` and `/sitemap-index.xml` are reachable.

- [ ] **Step 4: Delete the root static files**

Now that the homepage is fully served from Astro, delete `index.html`, `styles.css`, and `app.js` from the project root (their content lives at `src/pages/index.astro`, `src/styles/global.css`, and `public/app.js`). Leave `chat.md` (gitignored source material).

- [ ] **Step 5: Build once more after cleanup**

Run: `npm run build`
Expected: still succeeds; `dist/` unchanged in structure (the deleted root files were never part of the Astro build).

- [ ] **Step 6: Deploy notes for the user**

Before pushing: replace `site` in `astro.config.mjs` with the real production domain (it drives canonical URLs in the sitemap and RSS). In Netlify, update the site's build settings from the old static config ("no build command, publish `.`") to **Build command `npm run build`**, **Publish directory `dist`** (these match `netlify.toml`, but confirm in the UI). Branch `main` auto-deploy stays as-is.

- [ ] **Checkpoint** - final. The user reviews and commits the cleanup.
* suggested message: `chore: remove root static files; migration complete`

---

## Self-Review (completed)

**Spec coverage:** Every spec section maps to a task - architecture/files (Task 1), BaseLayout/Nav/Footer + Blog link + absolute anchors (Task 2), homepage migration + JSON-LD (Task 3), the four extracted components (Tasks 4-7), content model/schema (Task 8), listing + filter (Task 9), post template + reading time + BlogPosting JSON-LD (Task 10), sitemap + RSS (Task 11), verification + cleanup + deploy (Task 12). Honesty constraints and the Decap-ready schema are carried in Task 8. No spec requirement is unimplemented.

**Placeholder scan:** No "TBD"/"TODO" outside the one flagged, real unknown (the production domain in `astro.config.mjs`, which the existing JSON-LD already uses as `faastpt.example`). All code blocks are complete; migration steps cite exact `index.html` line ranges rather than restating 600 lines of HTML (the source exists - restating it would be duplication, not completeness).

**Type/name consistency:** `PostCard` props (`title`, `pubDate`, `excerpt`, `category`, `tags`, `slug`) match what `blog/index.astro` passes; `slug={p.id}` matches the `[...slug].astro` `params: { slug: post.id }`. `render(post)` and `getCollection` use the Astro 5 content-layer API consistently. One internal inconsistency was caught and fixed inline: `BlogPostLayout` reads `minutes` as a prop (declared in Task 10 Step 3's `Props`), matching the `minutes={minutes}` that `[...slug].astro` passes in Step 4.
