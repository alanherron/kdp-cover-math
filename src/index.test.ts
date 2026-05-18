import { describe, expect, it } from "vitest";
import {
  BLEED_INCHES,
  SPINE_CREAM_PER_PAGE,
  SPINE_TEXT_MIN_INCHES,
  SPINE_TEXT_MIN_PAGES,
  SPINE_WHITE_PER_PAGE,
  coverDimensions,
  getTrim,
  interiorPageDimensions,
  spineSupportsText,
  spineWidthInches,
} from "./index";

describe("getTrim", () => {
  it("returns dimensions for known trim sizes", () => {
    expect(getTrim("8.5x11")).toMatchObject({ widthIn: 8.5, heightIn: 11 });
    expect(getTrim("8x10")).toMatchObject({ widthIn: 8, heightIn: 10 });
    expect(getTrim("9.5x9.5")).toMatchObject({ widthIn: 9.5, heightIn: 9.5 });
    expect(getTrim("8.5x8.5")).toMatchObject({ widthIn: 8.5, heightIn: 8.5 });
  });

  it("throws on an unknown trim id", () => {
    // @ts-expect-error testing runtime guard
    expect(() => getTrim("999x999")).toThrow(/Unknown trim size/);
  });
});

describe("spineWidthInches", () => {
  it("applies the white-paper rate", () => {
    expect(spineWidthInches(100, "white")).toBeCloseTo(
      100 * SPINE_WHITE_PER_PAGE,
      6,
    );
  });

  it("applies the cream-paper rate", () => {
    expect(spineWidthInches(100, "cream")).toBeCloseTo(
      100 * SPINE_CREAM_PER_PAGE,
      6,
    );
  });

  it("returns 0 for 0 pages", () => {
    expect(spineWidthInches(0, "white")).toBe(0);
  });

  it("treats negative page counts as 0", () => {
    expect(spineWidthInches(-50, "cream")).toBe(0);
  });
});

describe("spineSupportsText", () => {
  it("rejects books under KDP's 79-page recommendation", () => {
    expect(spineSupportsText(10, "white")).toBe(false);
    expect(spineSupportsText(60, "cream")).toBe(false);
    expect(spineSupportsText(SPINE_TEXT_MIN_PAGES - 1, "white")).toBe(false);
  });

  it("accepts books at or above the 79-page threshold", () => {
    expect(spineSupportsText(SPINE_TEXT_MIN_PAGES, "white")).toBe(true);
    expect(spineSupportsText(SPINE_TEXT_MIN_PAGES, "cream")).toBe(true);
    expect(spineSupportsText(120, "white")).toBe(true);
  });

  it("still requires a non-trivial spine thickness above the page threshold", () => {
    expect(SPINE_TEXT_MIN_PAGES * SPINE_WHITE_PER_PAGE).toBeGreaterThan(
      SPINE_TEXT_MIN_INCHES,
    );
  });
});

describe("coverDimensions", () => {
  it("computes the full wrap for an 8.5x11 white-paper 40-page book", () => {
    const c = coverDimensions("8.5x11", 40, "white");
    expect(c.trimWidthIn).toBe(8.5);
    expect(c.trimHeightIn).toBe(11);
    expect(c.spineIn).toBeCloseTo(40 * SPINE_WHITE_PER_PAGE, 6);
    expect(c.bleedIn).toBe(BLEED_INCHES);
    expect(c.fullWidthIn).toBeCloseTo(
      8.5 * 2 + 40 * SPINE_WHITE_PER_PAGE + 2 * BLEED_INCHES,
      6,
    );
    expect(c.fullHeightIn).toBeCloseTo(11 + 2 * BLEED_INCHES, 6);
  });

  it("uses the cream rate when paper is cream", () => {
    const c = coverDimensions("8.5x11", 40, "cream");
    expect(c.spineIn).toBeCloseTo(40 * SPINE_CREAM_PER_PAGE, 6);
  });

  it("provides a 2x1.2 barcode safe box", () => {
    const c = coverDimensions("8.5x11", 30, "white");
    expect(c.barcodeBoxIn).toEqual({ widthIn: 2, heightIn: 1.2 });
  });
});

describe("interiorPageDimensions", () => {
  it("matches trim when bleed is off", () => {
    const i = interiorPageDimensions("8.5x11", "no-bleed");
    expect(i.pageWidthIn).toBe(8.5);
    expect(i.pageHeightIn).toBe(11);
    expect(i.bleedIn).toBe(0);
  });

  it("adds bleed to outer edges only when bleed is on", () => {
    const i = interiorPageDimensions("8.5x11", "bleed");
    expect(i.bleedIn).toBe(BLEED_INCHES);
    expect(i.pageWidthIn).toBeCloseTo(8.5 + BLEED_INCHES, 6);
    expect(i.pageHeightIn).toBeCloseTo(11 + 2 * BLEED_INCHES, 6);
  });

  it("exposes safe-inset and gutter constants", () => {
    const i = interiorPageDimensions("8x10", "no-bleed");
    expect(i.safeInsetIn).toBeGreaterThan(0);
    expect(i.gutterInsetIn).toBeGreaterThan(0);
  });
});
