# FAAST PT — Astro Migration Final Whole-Branch Review

Date: 2026-07-26
Scope: working-tree source of the Astro migration + Markdown blog. File-based review (no git, no build re-run — verified results trusted).

## 1. Honesty / Compliance — PASS (with one pre-existing note)

| Rule | Status | Evidence |
|---|---|---|
| Cal.com username stays literal `CAL_USERNAME` | PASS | `public/app.js:85-86` — `hillside: "CAL_USERNAME/hillside"`, `carle: "CAL_USERNAME/carle-place"`. Comment at L82 flags it as a deploy-time replace. Untouched, not fabricated. |
| Carle Place ABSENT from all JSON-LD | PASS | Only `PostalAddress` is `src/pages/index.astro:25-31` (Hillside Ave / Floral Park / 11001). `BlogPosting` JSON-LD (`BlogPostLayout.astro`) has no address. `dist/index.html` confirms Carle Place appears only in visible HTML (L54, L111), never inside an `ld+json` block. |
| Phone `(516) 789-6322` primary tap-to-call, consistent | PASS | Every `tel:` is `+15167896322` (Nav, Footer, PainMap, FaqSection, BookingSection, LocationsSection, hero). No `646` anywhere in `src/`. The documented 516-vs-646 conflict created no inconsistency on-site. |
| Provider name exactly `Dr. Asim Iftikhar, DPT` (no drift) | PASS | `content.config.ts:19` default author, `welcome-to-faast.md:7` frontmatter, and `index.astro:227` provider title all match byte-for-byte. Byline renders `{author}` from the same prop. No "Dr. Asim" / "Asim Iftikhar, DPT" truncation. |
| No PHI in callback form | PASS | `BookingSection.astro:43-71` fields = `name`, `phone`, `preferred_location`, `sms_consent`, honeypot. Copy explicitly says "No medical details here, please." `public/app.js` only reads `cb-loc`/`calEmbed`/buttons — it never touches the name/phone/consent inputs, so no PHI is handled client-side. |
| No invented content added by migration | PASS | Reviews / staff / provider photo / facility video / Carle Place hours+address all remain visibly dashed `.slot-text`/`.photo-slot`/`.video-slot`/`.slot-inline` placeholders. Insurance list is hedged with "Your plan - confirm" + a "Confirm with Dr. Iftikhar" cue on No-Fault/Workers' Comp billing. The one new body of content (the welcome blog post + its `BlogPosting` JSON-LD) is honest and correctly attributed. |

> NOTE (pre-existing, not migration-introduced — surfaced for launch awareness): `index.astro:33-36` publishes `aggregateRating { ratingValue: "5.0", reviewCount: "3" }` while the three review cards are still placeholders ("Real Google review text to be added here"). If the Google Business Profile does not genuinely reflect a 5.0/3-review state, Google may treat this as misleading review schema. This was inherited verbatim from the original homepage; the migration did not add it. Severity: Important to verify before go-live, but not a migration regression.

## 2. Security — PASS

- **`set:html` audit:** exactly one occurrence — `src/layouts/BlogPostLayout.astro:31`. It renders `JSON.stringify(jsonLd)` where every field is server-controlled frontmatter (`title`, `excerpt`, `pubDate`, `author`, `url`, optional `image.url`) validated by the Zod schema in `content.config.ts`. No user/submitted content reaches it. The homepage JSON-LD (`index.astro:14-50`) is hardcoded static JSON, not `set:html`. PASS.
- **Minor hardening (not blocking):** `JSON.stringify` does not escape `<` or `</script>`. The current blog content is trusted (practice-authored markdown), so there is no live XSS path, but a future post whose title/excerpt contained `</script>` would break out of the script block. Defense-in-depth fix when convenient: `<script type="application/ld+json" set:html={JSON.stringify(jsonLd).replace(/</g, '\\u003c')} />`. Severity: Minor.
- **Netlify Forms:** `BookingSection.astro:43-45` — `name="callback"`, `data-netlify="true"`, hidden `form-name="callback"` (matches), `netlify-honeypot="bot-field"` with matching honeypot input. Correctly wired. Static site, no reflected parameters. PASS.
- **Secrets:** none. Cal.com is loaded via the public `https://cal.com/embed.js` loader and the placeholder `CAL_USERNAME` link. No tokens/keys in any reviewed file. PASS.

## 3. Cross-File Consistency / Correctness — PASS

- **Slug derivation is uniform.** `content.config.ts:10` strips `.md` via `generateId` so `post.id === "welcome-to-faast"`. Every consumer uses `post.id` consistently:
  - listing: `PostCard` receives `slug={p.id}` (`blog/index.astro:39`) → href `/blog/${slug}/`.
  - detail route: `[...slug].astro:9` `params: { slug: post.id }` and `:17` `url = /blog/${post.id}/`.
  - feed: `rss.xml.js:16` `link: /blog/${post.id}/`.
  No mismatch → no 404. `dist/rss.xml` confirms `<link>.../blog/welcome-to-faast/</link>`.
- **Layout nesting + CSS import paths correct.** `BlogPostLayout` wraps `BaseLayout` (`./BaseLayout.astro`). Import depths: BaseLayout `../styles/global.css`, BlogPostLayout `../styles/blog.css`, `blog/index.astro` `../../styles/blog.css` — all resolve correctly. (`blog.css` is imported in two places — BlogPostLayout and blog/index.astro — but Astro dedupes; harmless.)
- **`minutes` prop threaded correctly.** `[...slug].astro:16` computes `readingTime(post.body ?? '')` and passes it as a prop (`:27 minutes={minutes}`). `BlogPostLayout` declares `minutes: number` in `Props` and renders `{minutes} min read`. Not read from `Astro.locals`. PASS.
- **Reading-time math correct.** `src/utils/reading-time.ts` — `body.trim().split(/\s+/).filter(Boolean).length` / 200, `Math.max(1, Math.round(...))`. 200 wpm, min 1, sourced from `post.body`. Correct.
- **No dead code / unused imports.** All imports in `index.astro` (BaseLayout, PainMap, LocationsSection, FaqSection, BookingSection) are rendered. Nav/Footer imported once in BaseLayout. No leftover throwaway `index.astro` scaffolding — `src/pages/index.astro` is the full homepage, and the `src/` tree is clean (7 components, 2 layouts, 3 pages, 1 util, 1 post, 1 config).

## 4. Architecture / Quality

- **`blog.css` is correctly split — the stated concern does not apply.** `BaseLayout` imports only `global.css`; `blog.css` is imported solely on blog routes (BlogPostLayout + blog/index.astro). The homepage ships `global.css` only — `blog.css` (~2KB) is NOT loaded on `/`. Restructuring is unnecessary; the split is already right.
- **`astro.config.mjs` `site: 'https://faastpt.example'`** uses the reserved `.example` TLD (RFC 2606) — clearly a deploy-time placeholder, not a mistake. Must be set to the real domain at deploy because RSS (`<link>https://faastpt.example/</link>`) and sitemap derive from it. `dist/rss.xml` currently carries the placeholder, as expected.
- **Missing social/OG image (launch gap, pre-existing).** `public/assets/` is empty, but `index.astro:23` references `"image": "assets/og-image.jpg"` in the PhysicalTherapy JSON-LD (a relative URL — schema.org image should be absolute). `BaseLayout` also emits no `<meta property="og:image">` and no `<link rel="canonical">` / `og:url`. Social shares therefore render no preview image. Consistent with the site's known "assets pending" state (footer L27), but worth fixing before launch.
- **No favicon.** `BaseLayout` has no `<link rel="icon">` → browsers 404 on `/favicon.ico`. Minor.
- **Root-level pre-migration originals not gitignored (hygiene).** Repo root still holds the original static-site files `index.html`, `styles.css`, `app.js` (the verbatim source the migration was based on). `.gitignore` covers `chat.md` and `dist/` but NOT these three. They are not served (Netlify publishes `dist/`) so there is no functional conflict, but committing them risks future editors editing dead files. Recommend delete or add to `.gitignore`.
- **`BlogPostLayout.astro:31` self-closing `<script ... />`** — Astro handles this correctly at build (verified in `dist/`); no action needed, just noting it parses fine because Astro's compiler, not the HTML parser, processes the template.

## Overall Verdict: SHIP-WITH-NOTES

The migration itself is faithful, clean, and correct. It introduces **no** new dishonest content, **no** security regression, **no** slug/routing mismatch, and **no** broken import paths. Every compliance constraint (CAL_USERNAME placeholder, Carle Place kept out of JSON-LD, phone consistency, exact provider byline, no PHI, no fabricated facts) holds.

The items below are launch-readiness / hygiene, **not** migration blockers:
- (Important, verify-at-launch) `aggregateRating` published as a hard fact while review cards are placeholders — `index.astro:36` (pre-existing).
- (Important, launch) No OG image + broken relative JSON-LD image ref (`index.astro:23`, `public/assets/` empty) and missing `og:image`/`canonical` in `BaseLayout` (pre-existing).
- (Minor) `set:html` `<`-escaping hardening — `BlogPostLayout.astro:31`.
- (Minor) `astro.config.mjs` `site` placeholder must be set to the real domain at deploy.
- (Minor) Root `index.html` / `styles.css` / `app.js` leftovers should be deleted or gitignored.
- (Minor) No favicon link.

No Critical findings. No migration-introduced Important findings. Safe to ship the migration; address the launch-readiness notes before the public go-live.
