/**
 * Amazon KDP paperback cover-wrap and interior-page geometry.
 *
 * Pure functions. No dependencies. Inputs are trim id + page count + paper
 * type + bleed setting; outputs are inches.
 *
 * Sources (all KDP docs current as of 2026-05):
 * - Spine width: white paper × 0.002252 in/page, cream × 0.0025 in/page.
 * - Spine text minimum: 79 interior pages (KDP refuses to print spine text below this).
 * - Bleed: 0.125 in on all outer edges.
 * - Safe area: 0.25 in inset from trim.
 * - Gutter: 0.375 in for paperback interior pages.
 * - Barcode safe box: 2.0 × 1.2 in on back cover.
 */

/** One of the trim sizes KDP offers and we render math for. */
export type TrimSizeId = "8.5x11" | "8x10" | "9.5x9.5" | "8.5x8.5" | "5.5x8.5";

/** Paper stock — affects spine thickness math. */
export type PaperType = "white" | "cream";

/** Whether the interior includes 0.125" bleed on all outer edges. */
export type BleedSetting = "no-bleed" | "bleed";

export interface TrimDimensions {
  id: TrimSizeId;
  label: string;
  widthIn: number;
  heightIn: number;
  description: string;
}

export const TRIM_SIZES: readonly TrimDimensions[] = [
  {
    id: "8.5x11",
    label: '8.5" × 11"',
    widthIn: 8.5,
    heightIn: 11,
    description: "Most popular for adult and family coloring books.",
  },
  {
    id: "8x10",
    label: '8" × 10"',
    widthIn: 8,
    heightIn: 10,
    description: "A compact portrait format — feels gift-able.",
  },
  {
    id: "9.5x9.5",
    label: '9.5" × 9.5"',
    widthIn: 9.5,
    heightIn: 9.5,
    description: "Large square — great for mandalas and pattern books.",
  },
  {
    id: "8.5x8.5",
    label: '8.5" × 8.5"',
    widthIn: 8.5,
    heightIn: 8.5,
    description: "Classic square — friendly for kids' books.",
  },
  {
    id: "5.5x8.5",
    label: '5.5" × 8.5"',
    widthIn: 5.5,
    heightIn: 8.5,
    description: "Half-letter pocket size — compact, gift-able coil pads.",
  },
];

export function getTrim(id: TrimSizeId): TrimDimensions {
  const trim = TRIM_SIZES.find((t) => t.id === id);
  if (!trim) {
    throw new Error(`Unknown trim size: ${id}`);
  }
  return trim;
}

export const BLEED_INCHES = 0.125;
export const SAFE_AREA_INSET_IN = 0.25;
export const GUTTER_INSET_IN = 0.375;

export interface InteriorPageDimensions {
  trimWidthIn: number;
  trimHeightIn: number;
  pageWidthIn: number;
  pageHeightIn: number;
  bleedIn: number;
  safeInsetIn: number;
  gutterInsetIn: number;
}

export function interiorPageDimensions(
  trimId: TrimSizeId,
  bleed: BleedSetting,
): InteriorPageDimensions {
  const trim = getTrim(trimId);
  const bleedIn = bleed === "bleed" ? BLEED_INCHES : 0;
  return {
    trimWidthIn: trim.widthIn,
    trimHeightIn: trim.heightIn,
    pageWidthIn: trim.widthIn + bleedIn,
    pageHeightIn: trim.heightIn + 2 * bleedIn,
    bleedIn,
    safeInsetIn: SAFE_AREA_INSET_IN,
    gutterInsetIn: GUTTER_INSET_IN,
  };
}

/**
 * KDP spine width approximations.
 *   - white paper: pageCount × 0.002252 in
 *   - cream paper: pageCount × 0.0025 in
 *
 * KDP officially recommends at least 79 interior pages before printed spine
 * text is reliable; below that they can't guarantee the text won't bleed onto
 * the front or back face.
 */
export const SPINE_WHITE_PER_PAGE = 0.002252;
export const SPINE_CREAM_PER_PAGE = 0.0025;
export const SPINE_TEXT_MIN_INCHES = 0.06;
export const SPINE_TEXT_MIN_PAGES = 79;

export function spineWidthInches(pageCount: number, paper: PaperType): number {
  const rate = paper === "cream" ? SPINE_CREAM_PER_PAGE : SPINE_WHITE_PER_PAGE;
  return Math.max(0, pageCount) * rate;
}

export function spineSupportsText(pageCount: number, paper: PaperType): boolean {
  return (
    pageCount >= SPINE_TEXT_MIN_PAGES &&
    spineWidthInches(pageCount, paper) >= SPINE_TEXT_MIN_INCHES
  );
}

export interface CoverDimensions {
  trimWidthIn: number;
  trimHeightIn: number;
  spineIn: number;
  bleedIn: number;
  fullWidthIn: number;
  fullHeightIn: number;
  safeInsetIn: number;
  barcodeBoxIn: { widthIn: number; heightIn: number };
}

/**
 * Full cover wrap dimensions for a KDP paperback.
 *   fullWidth  = 2 × trimWidth + spine + 2 × 0.125" bleed
 *   fullHeight = trimHeight + 2 × 0.125" bleed
 *
 * Bleed on the cover wrap is always 0.125" regardless of interior bleed setting.
 */
export function coverDimensions(
  trimId: TrimSizeId,
  pageCount: number,
  paper: PaperType,
): CoverDimensions {
  const trim = getTrim(trimId);
  const spine = spineWidthInches(pageCount, paper);
  const bleed = BLEED_INCHES;
  return {
    trimWidthIn: trim.widthIn,
    trimHeightIn: trim.heightIn,
    spineIn: spine,
    bleedIn: bleed,
    fullWidthIn: 2 * trim.widthIn + spine + 2 * bleed,
    fullHeightIn: trim.heightIn + 2 * bleed,
    safeInsetIn: SAFE_AREA_INSET_IN,
    barcodeBoxIn: { widthIn: 2.0, heightIn: 1.2 },
  };
}
