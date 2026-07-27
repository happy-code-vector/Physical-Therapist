# Task 3 — Homepage body migration into Astro

## Status: DONE

## Files modified
- `src/pages/index.astro` — replaced the Task-2 placeholder with the full homepage:
  imports `BaseLayout`, passes the verbatim `title`/`description`, and renders the
  two JSON-LD blocks inside `<Fragment slot="schema">` (so they land in `<head>`)
  followed by `<span id="top">` and the 12 homepage sections (Hero → Booking).

## Method
Root `index.html` was the copy source (untouched). The two ranges were extracted
byte-for-byte with `sed -n` (no manual retyping → no transcription risk) and
assembled between heredoc-written Astro scaffolding:
- PASTE POINT A — `index.html` lines 49-86 → inside `<Fragment slot="schema">`
- PASTE POINT B — `index.html` lines 132-693 → after `<span id="top"></span>`

Lines 129-131 (`<main id="top">` wrapper / `<span id="top">`) were NOT copied —
`BaseLayout` already renders `<main id="main">`, and `<span id="top">` lives in
the new skeleton. Nav, footer, and `<script src="/app.js">` were NOT copied —
they live in `BaseLayout`/`Nav`/`Footer`. Final file is 614 lines
(8 head + 38 JSON-LD + 4 mid + 562 body + 2 tail).

## Build result
`npm run build` → exit 0, no errors, no warnings.
`1 page(s) built` — `src/pages/index.astro` → `dist/index.html` (+5 ms).
Sitemap generated.

## dist/index.html verification (grep occurrence counts)
- Two JSON-LD `<script type="application/ld+json">` blocks present in `<head>`,
  content verbatim incl. `"@type": "PhysicalTherapy"`, `"@type": "FAQPage"`,
  `"@type": "Question"` (×4), address/geo/aggregateRating intact.
- Pain-map mannequin: `id="figureStage"` ✓, `data-zone=` ×14
  (7 mannequin zones + 7 treat-list items, matching source).
- Booking: `id="calEmbed"` ✓, `id="bookToggle"` ✓, `id="cb-name"`/`cb-phone`/`cb-loc` ✓.
- Hero: `id="heroBookingBar"` ✓, `id="heroBookBtn"` ✓, `onsubmit="return false;"` ✓.
- All 10 section anchors present: `insurance`, `first-visit`, `treat`, `provider`,
  `team`, `facility`, `reviews`, `locations`, `faq`, `book`.
- `<svg>` ×10 (9 body + nav phone icon via BaseLayout).
- `class="faq-item"` ×4. `data-loc=` ×4.
- From BaseLayout: `<main id="main">` ✓, `src="/app.js"` ✓, `.nav` ✓, `.footer` ✓.
- No `PASTE POINT` placeholder comments leaked into output.

## Dev server
`npm run dev` started cleanly across three runs (Astro v5.18.2,
"ready in ~160-196 ms"), zero compile errors/warnings, clean
"watching for file changes" state. HTTP `curl` probe to localhost returned
exit 7 (connection refused) — a sandbox loopback-networking limitation in this
environment, not a page defect; the production build is the authoritative
content/compile check and it passed.

## Pre-migration risk check (Astro `{` / `}` expression parsing)
Grepped all `{`/`}` in the copy ranges. Two clusters, both safe:
- Lines 51-85 — inside `<script type="application/ld+json">`; Astro treats
  script-tag content as raw text (build confirmed — JSON-LD is byte-identical).
- Line 643 — `{ hillside: "CAL_USERNAME/hillside", ... }` sits inside an HTML
  comment (`<!-- ... -->`); comment content is not parsed as an expression.

No Astro template parse errors occurred.

## Concerns
None blocking. Minor note: the JSON-LD source lines keep their original 2-space
indent from `index.html` (the task skeleton showed them at 4-space under the
`<Fragment>`), but the task prioritizes verbatim copy over cosmetic indentation,
and the rendered `<head>` output is unaffected.
