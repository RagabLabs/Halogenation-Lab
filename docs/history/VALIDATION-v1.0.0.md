# Release validation · v1.0.0

Validation performed on 16 October 2026 (UTC). These are executed checks, not projected coverage.

| Check | Executed result |
|---|---|
| Scientific tests | **113 / 113 passed** |
| Report and print-geometry unit tests | **8 / 8 passed** |
| Total Vitest tests | **121 / 121 passed** |
| Browser tests | **65 / 65 passed**, Chromium headless |
| TypeScript checking | Passed as part of `npm run build` |
| Vite production build | Passed |
| Calculator coverage | All 20, in English and Arabic |
| Responsive widths | 360, 390, 768, 1024, 1440 CSS pixels |
| Zoom | 200% CSS zoom at 1440px, both languages |
| Exports | CSV, JSON and HTML downloads on all 20 calculators in both languages |
| PDF / print | Print API invocation verified on all tools; exact static print plots checked; integrated English/Arabic print-layout PDFs rendered and visually inspected, seven pages each |
| Asset/routing checks | Browser suite used the built `/Halogenation-Lab/` deployment path; no asset 404 or JavaScript page error in the calculator export checks |
| Conservation | Independent C/H/Cl/N and mass checks; 400 deterministic feasible network cases within the scientific suite |

## Scope of review

- Every calculator has at least five named scientific checks: reference, boundary, invalid input, unit consistency and scientific consistency.
- Nine representative surfaces were checked for page overflow at each of five widths in both languages, including home, tool list, diagrams, methods and the larger calculator forms.
- Interaction checks cover language, RTL, theme persistence, filtering, navigation, reaction-diagram keyboard activation, all process blocks, invalid inputs, stale exports, reset/example controls, unit changes, custom property data and JSON import.
- Plot values in printed reports are rendered from the same calculated result data with fixed SVG geometry, independent of chart animation and resize timing. Screen charts use Recharts with animation disabled.
- Original lecture: all 32 slides reviewed, including image-based diagrams; see `LECTURE-AUDIT.md`.

## Limits

This is verification of educational calculations and the local production build. No live GitHub deployment was created or tested. The native print dialog's final destination is selected by the user. Chromium was tested; other browser engines and every operating-system printer driver were not independently tested. Model limitations in `SCIENTIFIC.md` and `THERMODYNAMICS.md` remain applicable.

Raw browser screenshots and transient traces were used for internal inspection and are not included as project deliverables. No real factory, reactor or measured plant dataset is used by the preset examples.
