# Release validation · v1.0.1

Checked on 17 October 2026 (UTC).

| Check | Current result |
|---|---|
| Scientific tests | **113 / 113 passed** |
| Report/CSV/version regression tests | **11 / 11 passed** |
| Total Vitest tests | **124 / 124 passed** |
| TypeScript and production build | Passed |
| Standalone IIFE build | Passed; scripts, styles and fonts embedded |
| Standalone artifact structure and JavaScript syntax | Passed; one classic embedded script, 75 embedded font URLs, no external stylesheet or script dependency |
| New browser validation | **Blocked**: Chromium executable is absent; its official Playwright download did not produce a usable archive |
| Browser suite available for execution elsewhere | 71 tests, including six new offline file tests |

## Current review

The 20 calculators use the same scientific engine as v1.0.0. Their 113 scientific tests were rerun successfully. Three report regressions were added, covering CSV textual formulas, empty optional cells and consistent release version labels. The worked-example documentation's reference heat was corrected to −129047.8369 kJ/h; the engine calculation is unchanged.

Open-Halogenation-Lab.html was built from the same React application using a classic IIFE script and embedded styles/font data URLs. Its embedded JavaScript was compiled with Node's JavaScript parser. Structural checks verify that it does not load external scripts or styles. These are build and syntax checks; they do not establish a fresh browser rendering or interaction pass.

## Browser limitation

The environment could not launch Chromium. The attempted Playwright cases stopped before page interaction because the executable was missing. Installation failed with an unusable downloaded browser archive. No new portable-file browser check is claimed as passing. The six added file/offline cases are provided for future execution, not reported as successfully run here.

To run the full suite in an environment with Chromium:

```bash
npm ci
npm test
npm run build
npm run check:portable
npx playwright install chromium
npm run test:e2e
```

## Prior evidence

v1.0.0's executed 65-test browser pass and print-layout review are preserved in docs/history/. They cover the earlier hosted/static application and are not presented as verification of the new standalone file. No live GitHub deployment was created or tested for this update.
