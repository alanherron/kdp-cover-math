# kdp-cover-math

Pure-function Amazon KDP paperback **cover-wrap** and **interior-page** geometry. Returns the inch dimensions you need to lay out a print-ready cover or interior — trim, bleed, spine width, full wrap dimensions, safe areas, barcode box.

Zero dependencies. ESM + CJS + types. Works in Node, the browser, edge runtimes, and any TypeScript project.

```
npm i kdp-cover-math
```

## Why this exists

Every KDP paperback designer rebuilds the same math. The official numbers are spread across [KDP docs](https://kdp.amazon.com/help/), most third-party tools hide the math behind paid services, and the only open-source equivalents are buried inside coupled application code (or licensed under restrictive non-commercial terms).

This package extracts the math as plain functions you can import anywhere — no UI, no opinions on rendering, no telemetry.

## Quick start

```ts
import {
  coverDimensions,
  interiorPageDimensions,
  spineWidthInches,
  spineSupportsText,
  TRIM_SIZES,
} from "kdp-cover-math";

// Full cover wrap for a 40-page, 8.5"x11", white-paper paperback.
const cover = coverDimensions("8.5x11", 40, "white");
//          ^ trim id          ^ pages    ^ paper
// → {
//     trimWidthIn:  8.5,
//     trimHeightIn: 11,
//     spineIn:      0.09008,
//     bleedIn:      0.125,
//     fullWidthIn:  17.34008,        // 2 × 8.5 + spine + 2 × 0.125
//     fullHeightIn: 11.25,           // 11 + 2 × 0.125
//     safeInsetIn:  0.25,
//     barcodeBoxIn: { widthIn: 2.0, heightIn: 1.2 },
//   }

// Interior page dimensions including bleed (or not).
const page = interiorPageDimensions("8.5x11", "bleed");
// → { trimWidthIn: 8.5, trimHeightIn: 11, pageWidthIn: 8.625, pageHeightIn: 11.25, bleedIn: 0.125, safeInsetIn: 0.25, gutterInsetIn: 0.375 }

// Spine math.
spineWidthInches(120, "cream");     // → 0.3 in
spineSupportsText(60, "white");     // → false  (KDP requires ≥ 79 interior pages for spine text)
spineSupportsText(120, "cream");    // → true

// The four trim sizes this package knows about.
TRIM_SIZES;
// → [{ id: "8.5x11",  widthIn: 8.5, heightIn: 11,  label: '8.5" × 11"',  description: "..." },
//    { id: "8x10",    widthIn: 8,   heightIn: 10,  ... },
//    { id: "9.5x9.5", widthIn: 9.5, heightIn: 9.5, ... },
//    { id: "8.5x8.5", widthIn: 8.5, heightIn: 8.5, ... }]
```

## API

### Types

- `TrimSizeId` — `"8.5x11" | "8x10" | "9.5x9.5" | "8.5x8.5"`.
- `PaperType` — `"white" | "cream"`.
- `BleedSetting` — `"no-bleed" | "bleed"`.

### Constants

| Constant | Value | What it represents |
|---|---|---|
| `BLEED_INCHES` | `0.125` | Outer-edge bleed for both interior pages and the cover wrap. |
| `SAFE_AREA_INSET_IN` | `0.25` | Inset from trim where you should keep critical content. |
| `GUTTER_INSET_IN` | `0.375` | Extra inset on the inside edge of interior pages. |
| `SPINE_WHITE_PER_PAGE` | `0.002252` | Inches of spine thickness per page on white paper. |
| `SPINE_CREAM_PER_PAGE` | `0.0025` | Inches of spine thickness per page on cream paper. |
| `SPINE_TEXT_MIN_PAGES` | `79` | KDP's minimum interior page count for reliable printed spine text. |
| `SPINE_TEXT_MIN_INCHES` | `0.06` | The thinnest spine KDP will print readable text on. |

### Functions

- `getTrim(id: TrimSizeId): TrimDimensions` — look up one trim record.
- `interiorPageDimensions(trimId, bleed): InteriorPageDimensions` — page geometry for an interior layout.
- `spineWidthInches(pageCount, paper): number` — spine width in inches.
- `spineSupportsText(pageCount, paper): boolean` — whether KDP will print spine text on this book.
- `coverDimensions(trimId, pageCount, paper): CoverDimensions` — full cover wrap geometry.

### `TRIM_SIZES`

Read-only catalogue of every trim this package supports. Each entry exposes `id`, `label`, `widthIn`, `heightIn`, and a short `description` suitable for UI.

## Constraints and assumptions

- Paperback-only. No hardcover, no PDF cover proofing, no Kindle eBook geometry.
- Black-and-white interior assumption (the spine constants follow KDP's B&W price tier; color print uses different stocks and spine rates).
- USD-agnostic; this package does not do pricing math. See [PRICING] for the conventional separate package if you need that.
- Values are returned in **inches**. Convert to points or millimeters yourself if your renderer wants those.

## Compatibility

Tested on Node 18+. Pure ECMAScript with no platform APIs — works in:
- Node.js (ESM and CJS)
- Browser bundlers (Webpack / Vite / esbuild / Turbopack / Bun)
- Edge runtimes (Vercel Functions, Cloudflare Workers, Deno)
- React / Vue / Svelte / SolidJS / vanilla

## Sources

All formulas pulled from current KDP documentation:
- [Print options for paperbacks](https://kdp.amazon.com/help/topic/G201834180)
- [Cover sizing & bleed](https://kdp.amazon.com/help/topic/G201953020)
- [Spine text requirements](https://kdp.amazon.com/help/topic/G201834180)
- [Barcode safe area](https://kdp.amazon.com/help/topic/G201834200)

KDP can and does update these from time to time — file an issue if you spot drift.

## License

MIT © alanherron — use freely in commercial work, no attribution required (but appreciated).

## Related

This package was extracted from [starofthepage](https://starofthepage.com) — a coloring-book studio that turns photos into KDP-ready coloring books. The starofthepage app uses this package to compute every paperback wrap it lays out.
