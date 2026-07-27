# Task 2 — Shared Shell (Nav / Footer / BaseLayout)

## Status
**DONE** — `npm run build` passes; `dist/index.html` contains all required elements.

## Files created
- `src/components/Nav.astro` — site header with primary nav (Blog + absolute in-page anchors: `/#insurance`, `/#treat`, `/#provider`, `/#reviews`, `/#locations`), Call/Book CTAs, and mobile menu.
- `src/components/Footer.astro` — footer with brand block, Explore column, Contact column, copyright with `#year`, demo-note.
- `src/layouts/BaseLayout.astro` — full HTML shell: meta/Open Graph tags, theme-color `#1E3A2B`, Fraunces + Albert Sans Google Fonts, Cal.com embed loader (`is:inline`, verbatim), `<slot name="schema" />`, skip-link, `<Nav />`, `<main id="main"><slot /></main>`, `<Footer />`, `<script src="/app.js" defer>`.

## Files modified
- `src/pages/index.astro` — replaced the Task 1 placeholder with a `BaseLayout` wrapper rendering a placeholder paragraph ("Shell works. Homepage body arrives in Task 3.").

## Build result
`npm run build` → **Complete!** 1 page built in 446 ms, no errors, no warnings.

## dist/index.html smoke-check (22/22 PASS)
Confirmed present in rendered output:
- Fraunces + Albert Sans Google Fonts link (preconnect + stylesheet)
- Cal.com embed loader — preserved **verbatim** (the `is:inline` directive kept Astro from touching it)
- `<script src="/app.js" defer>` (outside the inlined Cal block — Astro kept it as a plain deferred tag pointing at the root `app.js`)
- Skip-link targeting `#main`
- `<header id="nav">` with a **Blog** link to `/blog` and the five absolute in-page anchors (`/#insurance`, `/#treat`, `/#provider`, `/#reviews`, `/#locations`)
- Mobile menu with the same links plus Book and `(516) 789-6322` call link
- `<footer class="footer">` with brand, Explore column (incl. `/#faq`), Contact column, copyright (`<span id="year">2026</span>`), demo-note
- `<main id="main">`, OG tags, theme-color, placeholder paragraph

## Concerns
None blocking. Minor notes for downstream tasks:
- The `#year` span and mobile-menu toggle rely on `/app.js` (the static site's script). `app.js` is copied to `dist/app.js` via `public/` (or root) — confirm in Task 3 that interactive wiring still works as the page body lands.
- Footer addresses ("Hillside Ave, Floral Park, NY" / "Carle Place, NY") and the demo-note are placeholders pending verification with Dr. Iftikhar, as flagged in the memory.
- Page `<title>` uses a literal en dash (`-`) per the spec; rendered correctly in the build output.
