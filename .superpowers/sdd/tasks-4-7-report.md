# Tasks 4-7: Astro Component Extractions

Status: **DONE** — four homepage sections extracted from `src/pages/index.astro` into
standalone Astro components. Rendered output is unchanged (verified by build + ID
presence in `dist/index.html`).

## Component files created

All four were extracted **verbatim** with `sed -n 'A,Bp'` (byte-for-byte copy of the
original block, including the leading `<!-- ===== ... ===== -->` comment and the
`<section>...</section>` wrapper). No markup was edited.

| # | File | Source block (original `index.astro` lines) | Lines | Anchor IDs preserved |
|---|------|---------------------------------------------|-------|----------------------|
| 4 | `src/components/PainMap.astro`        | 212-326 | 115 | `treat`, `figureStage`, `treatList`, `panelTitle`, `panelBody`, `zone` |
| 5 | `src/components/LocationsSection.astro` | 444-505 | 62  | `locations`, `loc-card`, `loc-hours` |
| 6 | `src/components/FaqSection.astro`     | 507-534 | 28  | `faq`, `faq-item` |
| 7 | `src/components/BookingSection.astro` | 536-612 | 77  | `book`, `bookToggle`, `calEmbed`, `cb-name`, `cb-phone`, `cb-loc` |

## `src/pages/index.astro` changes

**Frontmatter** (after the existing `BaseLayout` import, still inside the `---` fence):

```astro
import PainMap from '../components/PainMap.astro';
import LocationsSection from '../components/LocationsSection.astro';
import FaqSection from '../components/FaqSection.astro';
import BookingSection from '../components/BookingSection.astro';
```

**Body** — each inline block replaced (in the same position) with its component tag:

| Tag        | Position (neighbors)                                                  |
|------------|-----------------------------------------------------------------------|
| `<PainMap />`          | between FIRST-VISIT (close) and PROVIDER                |
| `<LocationsSection />` | between REVIEWS (close) and `<FaqSection />`            |
| `<FaqSection />`       | between `<LocationsSection />` and `<BookingSection />` |
| `<BookingSection />`   | last section, immediately before `</BaseLayout>`        |

Section order is otherwise unchanged: HERO, STATS, INSURANCE, FIRST-VISIT, **PainMap**,
PROVIDER, TEAM, FACILITY, REVIEWS, **Locations**, **FAQ**, **Booking**, `</BaseLayout>`.

Confirmed: no leftover fragments of the moved sections remain inline in `index.astro`
(grep for `id="treat"`, `id="locations"`, `id="faq"`, `id="book"`, `id="calEmbed"`,
`faq-item`, `loc-card`, `loc-hours` returns nothing — they now live only in the
components).

The surgery was performed by a one-shot Node script that read `index.astro`, replaced
the four known line-ranges with the tags, and inserted the four imports; it wrote to
`index.astro.new`, which was structurally verified (frontmatter, ordering, neighbors,
no leftovers) before being moved over the original. The temp script (`_transform.cjs`)
was deleted afterward.

File shrank from 614 lines to 340 (−274: removed 282 block lines, added 4 tags + 4 imports).

## Build result

```
npm run build
```

Result: **success, no errors.** Output (excerpt):

```
[build] output: "static"
[build] ▶ src/pages/index.astro
[build]   └─ /index.html (+6ms)
[build] 1 page(s) built in 534ms
[build] Complete!
```

## Critical IDs in `dist/index.html`

All required IDs are present in the built output ( Astro resolved every component tag
into its section markup — none of the `<…Section />` / `<PainMap />` tags leak into
the HTML):

- `id="treat"`        ✓
- `id="locations"`    ✓
- `id="faq"`          ✓
- `id="book"`         ✓
- `id="calEmbed"`     ✓
- `id="panelTitle"`   ✓

Also confirmed present (secondary anchors): `figureStage`, `treatList`, `panelBody`,
`bookToggle`, `cb-name`, `cb-phone`, `cb-loc`.

Rendered content counts in `dist/index.html`:
- 14 `zone` elements (SVG mannequin pain zones)
- 4 `faq-item` elements
- 2 `loc-card` articles (the two locations)

No git commands were run.
