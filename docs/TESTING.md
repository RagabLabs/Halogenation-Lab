# Test instructions

## Scientific suite

```bash
npm ci
npm test
```

`tests/science.test.ts` contains **113 tests**. Twenty calculator groups each run five named tests:

1. A reference case with independently specified expected output.
2. A boundary case, such as zero extent, complete conversion or a pure product sample.
3. An invalid input case, including infeasible extents and excessive yields/recoveries.
4. Unit consistency across mol/h, kmol/h, g/h and kg/h.
5. A conservation identity or other scientific consistency check.

Thirteen additional tests cover 400 deterministic feasible networks, positive variable Cp and its integral derivative, the N₂ fit boundary, a closed-form constant-Cp check, invalid numeric strings, molecular-weight-specific mass conversion, temperature/pressure units, recovery closure, incoming intermediates in later stages, external chlorine additions, custom-source requirements, thermal range rejection and absence of invented batch power.

The randomized-style network loop is deterministic and reproducible. It counts as one named test, not 400 separate tests. Unit consistency similarly loops within one named test per calculator.

Eight additional tests in `tests/reports.test.ts` cover HTML input/plot completeness, safe source escaping, CSV encoding and formula protection, JSON re-evaluation, malformed imports and deterministic signed/zero print geometry. Release 1.0.1 adds three CSV/version regression cases, for **124** total unit/report tests (113 scientific and 11 report tests).

## Browser suite

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite uses the **production build**, served under `/Halogenation-Lab/` by a small static host that returns actual asset 404s rather than hiding them behind an index fallback.

- All 20 calculators in both Arabic and English: example, calculation, result, chart, CSV, JSON, HTML and print invocation.
- Nine representative surfaces at each of 360, 390, 768, 1024 and 1440 CSS pixels, in both languages. This includes home, tools, network, process, methods, and calculators 1, 15, 19 and 20.
- Language/RTL and theme persistence, search/filtering, diagram clicks and keyboard activation, process links, invalid data, stale result suppression, clearing, unit conversion, local case restore, input modes, custom thermochemistry and JSON round-trip.
- 200% CSS zoom at a 1440px viewport, in both languages. Layout uses container queries so it responds to available layout width even when viewport media queries alone would not.

The PDF/print button test verifies that the app invokes the browser print API. It cannot automate an operating-system print destination choice. Separately generated print-layout PDFs are inspected visually during release QA. The user chooses “Save as PDF” in the native print dialog.

To use an existing compatible Chromium executable:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/absolute/path/to/chromium npm run test:e2e
```

On Windows PowerShell, set `$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE` if needed. Usually `npx playwright install chromium` is sufficient.

## Build check

```bash
npm run build
```

This runs TypeScript checking and Vite production compilation. It does not run tests implicitly. CI runs the checks in sequence and publishes only after success.

## Verification limits

Tests are educational reference and consistency checks, not certification for industrial reactor operation. Browser automation is Chromium-based; Safari, Firefox, assistive-technology combinations, every printer driver and the live GitHub deployment are not independently certified. No claim is made that a live GitHub URL has been tested before deployment.

## Portable offline test cases

`tests/browser/portable.spec.ts` adds six cases (English/Arabic): all 20 calculators with the browser context offline, export/import/print behavior, and mobile layout with language/theme persistence. The suite now contains 71 browser tests. These cases require an installed Chromium executable. Release 1.0.1 could not launch that executable in the current environment, so its browser tests are recorded as blocked, not passed. The previous release’s 65 successful browser checks are retained in `docs/history/`.
