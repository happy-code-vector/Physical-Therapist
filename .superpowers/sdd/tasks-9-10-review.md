# Tasks 9-10 Review — Blog listing + post template

Reviewer: file-based review (no git, no build re-run). Verified against source +
built HTML in `dist/blog/`.

## Spec compliance: ✅

Every spec requirement is met in source and confirmed in built output.

**Listing `/blog`** (`src/pages/blog/index.astro` + `src/components/PostCard.astro`)
- All non-draft posts, newest-first — `getCollection('blog', ({ data }) => !data.draft)` sorted `b.pubDate - a.pubDate`. ✅
- `PostCard` shows title, date (`<time>` w/ ISO `datetime`), excerpt, category chip, tags. ✅
- Progressive-enhancement filter — buttons `All` / `Articles` / `Clinic news` with `data-filter` + `aria-pressed`; click handler toggles `card.hidden`. ✅
- **JS disabled → all visible** — confirmed in `dist/blog/index.html`: the single post-card has NO `hidden` attr; the filter `<script type="module">` is the ONLY thing that sets `hidden` on cards. ✅ (graceful degradation holds)
- Empty state "First post coming soon." when `posts.length === 0`. ✅
- Per-category empty state `<p class="blog-empty" data-empty hidden>No posts in this category yet.</p>`, revealed by the script when a filter yields 0 visible. ✅

**Post `/blog/<slug>/`** (`[...slug].astro` + `src/layouts/BlogPostLayout.astro`)
- Byline (author, date, reading time) — confirmed in `dist/blog/welcome-to-faast/index.html`: `<span>Dr. Asim Iftikhar, DPT</span>`, `<time datetime="2026-07-26T00:00:00.000Z">July 26, 2026</time>`, `<span>1 min read</span>`. ✅
- Optional hero image — `{image && <img ... />}`; welcome post has none, omitted cleanly. ✅
- Rendered Markdown body, tags list, CTA `<a class="btn btn-copper-solid" href="/#book">Book an appointment</a>`. ✅
- `BlogPosting` JSON-LD emitted. ✅

**Reading time** (`src/utils/reading-time.ts`)
- 200 wpm, `Math.max(1, Math.round(words / 200))`. ✅
- Computed from `post.body` (`readingTime(post.body ?? '')` in `[...slug].astro:16`) — matches the explicit "from `post.body`" instruction. (The Post bullet says "rendered body word count"; `post.body` is the raw markdown — the two diverge only on heavy markdown syntax; for this post both yield 1 min. Code follows the more specific spec line.) ✅
- Empty-body safe: `"".split(/\s+/).filter(Boolean).length` → 0 → `max(1, 0)` → 1, no NaN. ✅

**`minutes` is a prop** — passed `minutes={minutes}` from `[...slug].astro:27` into `BlogPostLayout`; layout reads it from `Astro.props`. No `Astro.locals` anywhere. ✅

**Design tokens** — every `var(--…)` in `blog.css` resolves to a real `:root` token (see audit below). ✅

**BlogPosting JSON-LD structure** (`dist/blog/welcome-to-faast/index.html`):
```json
{"@context":"https://schema.org","@type":"BlogPosting","headline":"Welcome to the FAAST Physical Therapy blog","description":"…","datePublished":"2026-07-26T00:00:00.000Z","author":{"@type":"Person","name":"Dr. Asim Iftikhar, DPT"},"mainEntityOfPage":"/blog/welcome-to-faast/"}
```
Valid `@context`, `@type: BlogPosting`, `headline`, ISO `datePublished`, `author` as Person object, `mainEntityOfPage` present. ✅

**Honesty constraints** — author defaults to the published "Dr. Asim Iftikhar, DPT"; no PHI; no invented images/reviews; Cal username not touched. ✅

Nothing missing; nothing extra/unrequested.

## Code quality: Approved (1 Minor)

**Minor — dual empty-state when there are zero posts.**
- File: `src/pages/blog/index.astro:20-42`
- What: the filter buttons and the `<p data-empty>` per-category empty state render unconditionally, *outside* the `posts.length === 0` ternary. When there are genuinely no posts, the page shows "First post coming soon." AND, the moment a user clicks any filter button, the script sets `empty.hidden = (visible !== 0)` → reveals the second message "No posts in this category yet." Both empty states then appear stacked. Does not occur with the current 1-post dataset; only manifests at true zero posts.
- Fix: render the filter block and `[data-empty]` only when `posts.length > 0` (move them inside the truthy branch of the ternary, wrapping the grid), e.g.:
  ```astro
  {posts.length === 0 ? (
    <p class="blog-empty">First post coming soon.</p>
  ) : (
    <>
      <div class="blog-filter" …>…</div>
      <div class="post-grid">…</div>
      <p class="blog-empty" data-empty hidden>No posts in this category yet.</p>
    </>
  )}
  ```
  (Guard the script's `[data-empty]` lookup is already null-safe via `if (empty)`.)

No Critical or Important issues.

### Notes (not defects, no change required)
- `mainEntityOfPage` is a relative URL string. Schema.org accepts a URL string here and it parses fine; Google prefers `{"@type":"WebPage","@id":"<absolute>"}`. Optional SEO hardening only — not required by spec.
- Filter tab label "Articles" (plural) vs card chip "Article" (singular) is intentional and correct (a filter names the category group; a chip names one post).
- `.blog-empty[hidden] { display: none; }` in `blog.css` is redundant with the UA `[hidden]` rule; harmless. Cards rely on the UA `[hidden]` rule (no author `display:` on `.post-card` conflicts with it) — confirmed correct.

## Token audit (blog.css → global.css `:root`)

15 distinct `var(--…)` tokens used; all real, 0 NOT-FOUND.

| Token | Status |
|---|---|
| `--font-display` | real |
| `--fs-h2` | real |
| `--forest` | real |
| `--sage-deep` | real |
| `--fs-lg` | real |
| `--sage` | real |
| `--cream` | real |
| `--cream-3` | real |
| `--radius` | real |
| `--shadow-card` | real |
| `--copper` | real |
| `--ink` | real |
| `--wrap-narrow` | real |
| `--font-body` | real |
| `--fs-base` | real |

## Cannot-verify-from-source items
- JS-off runtime behavior: reasoned from markup (cards server-rendered with no `hidden`; only the bundled module script sets `hidden`). Cannot execute JS-off in this review, but the static HTML + script logic demonstrate the graceful-degradation contract holds. No ⚠️ blockers.

## Verdict: APPROVE_WITH_MINOR

The one Minor issue (dual empty-state at zero posts) is a non-blocking UX nit that
does not affect the current dataset. Ship as-is; fold the filter/empty-state guard
into the next tidy pass if desired.
