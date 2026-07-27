# Subagent-Driven Development Progress

- **Plan:** `docs/superpowers/plans/2026-07-26-astro-blog-migration.md`
- **Started:** 2026-07-26

## Git policy (user-owned)
The user owns all git operations. The agent runs NO git commands (no add/commit/branch/push/status). Reviews are file-based (reviewers read created/modified files directly - no review-package). The user commits at the end, on `main`, whenever they choose.

## Plan-mandated deviations from default review rubric (user-approved in spec)
1. **No unit-test framework.** Verification = `npm run build` + dev-server smoke check + final behavioral-parity pass. A reviewer flagging "no tests" is adjudicated as plan-mandated.
2. **Verbatim HTML duplication** in migration tasks (Tasks 3-7): copying exact `index.html` line ranges into components to preserve a verified site. A reviewer flagging "duplicate markup" is adjudicated as plan-mandated.

## Task status
- [x] Task 1: Scaffold Astro project + prove build
- [x] Task 2: Shared shell (BaseLayout, Nav, Footer)
- [x] Task 3: Migrate full homepage body + JSON-LD
- [x] Task 4: Extract PainMap component
- [x] Task 5: Extract LocationsSection component
- [x] Task 6: Extract FaqSection component
- [x] Task 7: Extract BookingSection component
- [x] Task 8: Blog content collection + sample post
- [x] Task 9: /blog listing + category filter
- [x] Task 10: Blog post template
- [x] Task 11: Sitemap + RSS feed
- [x] Task 12: Verification + cleanup + deploy notes

## Completed
- Task 1 (uncommitted, user owns git): scaffold + toolchain green. Files: package.json, astro.config.mjs, tsconfig.json, netlify.toml, .gitignore(+dist/.astro/), src/styles/global.css (verbatim), public/app.js (verbatim), src/pages/index.astro (throwaway). `npm run build` clean. Review: spec OK, quality approved. npm audit note: 3 transitive-dep vulns (1 low, 2 high) - build-time only, revisit before deploy.
- Task 8 (uncommitted): blog collection + sample post. Files: `src/content.config.ts` (corrected during impl - Astro 5 loads config from here, NOT `src/content/blog/config.ts` as the plan first said; plan+spec updated), `src/content/blog/welcome-to-faast.md`. Schema in force (build prints `[content] Synced content`, no auto-generate warning). Real CSS tokens confirmed in global.css: --forest/--cream/--sage/--copper/--ink/--sage-deep/--font-display/--font-body (plan blog.css corrected from non-existent --c-* names).
- Tasks 9-10 (uncommitted): blog listing + post template. Files: `src/components/PostCard.astro`, `src/styles/blog.css` (real tokens, 15 vars all verified real by reviewer), `src/pages/blog/index.astro`, `src/utils/reading-time.ts`, `src/layouts/BlogPostLayout.astro`, `src/pages/blog/[...slug].astro`. Review: spec ✅, quality APPROVED. Two impl deviations resolved: (1) `BlogPostLayout` import path `../styles/blog.css` (spec had wrong depth `../../`); (2) `.md` leaking into post URL - FIXED at source via `generateId` in glob loader (`src/content.config.ts`), so all consumers (listing, post route, RSS, sitemap) get clean `/blog/<slug>/`. Zero-posts edge case fixed: filter+grid+per-category-empty moved inside the truthy branch. Build green (3 pages), clean URLs confirmed, BlogPosting JSON-LD present, JS-off degrades to all-visible.
- Task 11 (uncommitted): sitemap (auto via `@astrojs/sitemap`, already wired in Task 1 - confirmed `sitemap-index.xml` + 3 URLs) + `src/pages/rss.xml.js` (1 item, clean link, RFC-822 pubDate) + RSS discovery `<link rel="alternate">` added to BaseLayout head. All verified in dist.
- Task 12 (uncommitted): verification + cleanup + deploy notes written to `.superpowers/sdd/task-12-verification-deploy.md`. VERIFICATION ALL PASS: build green; homepage JSON-LD structurally identical to original (2 blocks, same @type tree); app.js md5-identical; no overflow at 1440/1140/900/820/390; all interactions PASS (pain map, location sync both directions, FAQ accordion, mobile menu + auto-close, nav condensation, blog filter, BlogPosting JSON-LD); draft exclusion verified (build/rss/sitemap). Limitation: `astro preview` unreachable via curl/PS due to local IPv6-only-bind + IPv4-localhost quirk; parity verified directly against built dist files instead (stronger). Cleanup: root index.html/styles.css/app.js DEFERRED (currently-live, switch Netlify first). Deploy: Netlify build=`npm run build` publish=`dist`; replace `site:'https://faastpt.example'` placeholder with real domain before deploy (drives sitemap/rss/canonical).

## MIGRATION COMPLETE (2026-07-26)
All 12 tasks done + reviewed. Final whole-branch review (opus): **SHIP-WITH-NOTES** — no migration-introduced defects; all honesty constraints hold. One hardening applied (BlogPostLayout JSON-LD `<`-escaping). Pre-existing launch-readiness items flagged to user (NOT auto-fixed — content/asset decisions): (1) verify homepage `aggregateRating` vs real Google Business Profile; (2) provide OG image + wire `og:image`/`canonical` (BaseLayout currently has none); (3) replace `site` domain placeholder; (4) switch Netlify build settings to command `npm run build` / publish `dist`, then delete root originals. Build-status memory updated. **User owns git — hand off all changes for them to commit.** No git operations were run by the agent at any point.
