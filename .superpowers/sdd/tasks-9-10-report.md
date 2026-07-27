# Tasks 9-10 Report — Blog listing + post template

## Status: DONE_WITH_CONCERNS

Build succeeds; the blog listing and post both render with all functional
criteria met (byline, reading time, BlogPosting JSON-LD, category filter).
Two deviations from the verbatim spec are documented below — one fixed (typo),
one flagged for your decision (Astro 5 slug includes `.md`).

## Files created
- `src/components/PostCard.astro` — card component for the blog grid
- `src/styles/blog.css` — listing + post styles (real design tokens)
- `src/pages/blog/index.astro` — `/blog` listing with category filter
- `src/utils/reading-time.ts` — `readingTime(body)` → minutes (200 wpm, min 1)
- `src/layouts/BlogPostLayout.astro` — post layout with BlogPosting JSON-LD
- `src/pages/blog/[...slug].astro` — dynamic post route via `getStaticPaths`

## Build result
`npm run build` → `Complete! 3 page(s) built in 886ms`. No errors, no warnings.

## Dist artifacts
- `dist/blog/index.html` — present (the listing)
- `dist/blog/welcome-to-faast.md/index.html` — present, but path includes
  `.md` (see Concern 2). Spec expected `dist/blog/welcome-to-faast/index.html`.

## Post HTML verification (`dist/blog/welcome-to-faast.md/index.html`)
- Byline "Dr. Asim Iftikhar, DPT" — present (rendered twice: once in the
  JSON-LD `author.name`, once in the visible `.post__byline`)
- "min read" string — present (`.post__byline` third span)
- `<script type="application/ld+json">` with `"@type":"BlogPosting"` — present

## Listing HTML verification (`dist/blog/index.html`)
- Three filter buttons (`.blog-filter__btn`, `aria-pressed`)
- One `.post-card` with `data-category="news"` for the welcome post
- Post title rendered

## Concern 1 (FIXED) — import path typo in BlogPostLayout.astro
The spec body for `BlogPostLayout.astro` contained:
```ts
import '../../styles/blog.css';
```
That path is wrong: the file lives at `src/layouts/`, so `../../styles/`
resolves to `<root>/styles/` (which does not exist). The build failed with:
```
Could not resolve "../../styles/blog.css" from "src/layouts/BlogPostLayout.astro"
```
The sibling `BaseLayout.astro` at the same directory level uses
`'../styles/global.css'` (one `../`) and works, proving the correct path.
I changed the import to `'../styles/blog.css'` and the build passed. This is
a one-character typo fix, not a behavioral change; reverting would re-break
the build.

## Concern 2 (FLAGGED, not auto-fixed) — `.md` in the post URL
Astro 5's glob loader puts the file extension in `post.id`, so the spec's
`params: { slug: post.id }` and `slug={p.id}` produce URLs like
`/blog/welcome-to-faast.md/` instead of `/blog/welcome-to-faast/`. Result:
- Actual output dir:  `dist/blog/welcome-to-faast.md/index.html`
- Expected (spec):    `dist/blog/welcome-to-faast/index.html`

Internal links are consistent (the PostCard `href` and the route both use
`post.id`), so there are no broken links — every future post would just
carry `.md` in its public URL, which is atypical for a blog.

Not fixed automatically because the resolution is a spec-design decision,
not a typo. Two clean options if you want the prettier URL:

Option A — strip the extension at both use sites:
```ts
// in src/pages/blog/[...slug].astro getStaticPaths:
params: { slug: post.id.replace(/\.md$/, '') },
// in src/pages/blog/index.astro PostCard usage:
slug={p.id.replace(/\.md$/, '')}
```

Option B — keep `post.id` as-is and update this report's expected path to
`dist/blog/welcome-to-faast.md/index.html`.

Either is a one-line change per file; say the word and I'll apply it.

## No git operations were performed.
