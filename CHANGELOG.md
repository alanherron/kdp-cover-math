# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — initial release

Extracted from the [starofthepage](https://starofthepage.com) coloring-book studio.

### Added

- Trim sizes: `8.5x11`, `8x10`, `9.5x9.5`, `8.5x8.5`.
- Paper types: `white`, `cream`.
- Bleed settings: `no-bleed`, `bleed`.
- `coverDimensions(trimId, pageCount, paper)` — full cover wrap geometry (front + spine + back + bleed).
- `interiorPageDimensions(trimId, bleed)` — interior page geometry including gutter and safe inset.
- `spineWidthInches(pageCount, paper)` — KDP spine thickness formula.
- `spineSupportsText(pageCount, paper)` — whether KDP will print spine text (≥ 79 pages and ≥ 0.06").
- `getTrim(id)` — lookup helper.
- `TRIM_SIZES` — read-only catalogue with `id`, `label`, `widthIn`, `heightIn`, `description`.
- Constants: `BLEED_INCHES`, `SAFE_AREA_INSET_IN`, `GUTTER_INSET_IN`, `SPINE_WHITE_PER_PAGE`, `SPINE_CREAM_PER_PAGE`, `SPINE_TEXT_MIN_INCHES`, `SPINE_TEXT_MIN_PAGES`.
- Zero runtime dependencies. ESM + CJS + types.
- MIT licensed.
