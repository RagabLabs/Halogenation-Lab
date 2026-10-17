# References and provenance

Sources were inspected on **16 October 2026 (UTC)**. Property values are factual data transcribed with source attribution; the original lecture, third-party page text and third-party diagrams are not redistributed.

## Lecture supplied by the user

Dr. Ghada Kadry, *Halogenation Process*, 32-slide PowerPoint, supplied as `halogenation (1)(1).ppt`. Reviewed by text extraction and rendering, including the image-only process diagrams. This is an educational context source. Corrections and adoption decisions are recorded in [LECTURE-AUDIT.md](LECTURE-AUDIT.md).

## Reaction extent, stoichiometry and terminology

- IUPAC Gold Book, **extent of reaction**, entry E02283, DOI [10.1351/goldbook.E02283](https://doi.org/10.1351/goldbook.E02283): https://goldbook.iupac.org/terms/view/E02283
- IUPAC Gold Book, **selectivity**, entry S05563: https://goldbook.iupac.org/terms/view/S05563 . The application declares its chosen ratio/fraction denominator explicitly.
- IUPAC Gold Book, **chemical yield**, entry C01041: https://goldbook.iupac.org/terms/view/C01041 . Calculator 8 and calculator 20 use different stated yield denominators.

The component equations and stoichiometric matrix in this project are direct derivations from the four balanced substitution reactions, not empirical correlations.

## Molecular weights

- CIAAW, **Abridged Standard Atomic Weights**: https://www.ciaaw.org/abridged-atomic-weights.htm
- CIAAW, **Standard Atomic Weights**: https://www.ciaaw.org/atomic-weights.htm

Selected conventional rounded values: C 12.011, H 1.008, Cl 35.45, N 14.007. Molecular weights are derived from these exact project constants. They can differ slightly from older values printed in NIST WebBook because the underlying atomic-weight conventions differ.

## Thermochemistry: primary data source

NIST Chemistry WebBook, SRD 69, https://webbook.nist.gov/chemistry/ . Gas formation enthalpies and Shomate A–E coefficients use the **Chase 1998** entries:

Chase, M. W., Jr., *NIST-JANAF Thermochemical Tables, Fourth Edition*, Journal of Physical and Chemical Reference Data, Monograph 9, 1998, 1–1951.

| Species | CAS | WebBook gas thermochemistry and Shomate tables |
|---|---|---|
| Methane | 74-82-8 | https://webbook.nist.gov/cgi/cbook.cgi?ID=C74828&Mask=1 |
| Chloromethane | 74-87-3 | https://webbook.nist.gov/cgi/cbook.cgi?ID=C74873&Mask=1 |
| Dichloromethane | 75-09-2 | https://webbook.nist.gov/cgi/cbook.cgi?ID=C75092&Mask=1 |
| Chloroform | 67-66-3 | https://webbook.nist.gov/cgi/cbook.cgi?ID=C67663&Mask=1 |
| Carbon tetrachloride | 56-23-5 | https://webbook.nist.gov/cgi/cbook.cgi?ID=C56235&Mask=1 |
| Chlorine | 7782-50-5 | https://webbook.nist.gov/cgi/cbook.cgi?ID=C7782505&Mask=1 |
| Hydrogen chloride | 7647-01-0 | https://webbook.nist.gov/cgi/cbook.cgi?ID=C7647010&Mask=1 |
| Nitrogen | 7727-37-9 | https://webbook.nist.gov/cgi/cbook.cgi?ID=C7727379&Mask=1 |

The more recent alternative evaluation **Manion, J. A. (2002), Evaluated Enthalpies of Formation of the Stable Closed Shell C1 and C2 Chlorinated Hydrocarbons**, J. Phys. Chem. Ref. Data 31(1), 123–172, DOI [10.1063/1.1420703](https://doi.org/10.1063/1.1420703), is listed on these pages. The application does not mix its formation values with the selected Chase set. Dataset differences are acknowledged, not hidden.

## Phase-data checks for lecture corrections

These values are context only and are not used in the separation calculations:

| Species | Approximate boiling summary (K) | Source |
|---|---:|---|
| CH₃Cl | 247 ± 10 (WebBook average) | https://webbook.nist.gov/cgi/cbook.cgi?ID=C74873&Mask=4 |
| CH₂Cl₂ | 313 ± 1 | https://webbook.nist.gov/cgi/cbook.cgi?ID=C75092&Mask=4 |
| CHCl₃ | 334.3 ± 0.2 | https://webbook.nist.gov/cgi/cbook.cgi?ID=C67663&Mask=4 |
| CCl₄ | 349.8 ± 0.3 | https://webbook.nist.gov/cgi/cbook.cgi?ID=C56235&Mask=4 |

Approximate 66 K difference between the first two summaries contradicts the slide's “very close boiling points” justification. This observation does not establish a full distillation design or pressure recommendation.

## Nomenclature check

- NIST, **sulphuryl dichloride / sulfuryl chloride**, SO₂Cl₂, CAS 7791-25-5: https://webbook.nist.gov/cgi/cbook.cgi?ID=C7791255&Mask=1
- NIST-JANAF sulfuryl chloride table: https://janaf.nist.gov/tables/Cl-105.html

## Software sources

React: https://react.dev/ ; TypeScript: https://www.typescriptlang.org/ ; Vite: https://vite.dev/ ; Tailwind CSS: https://tailwindcss.com/ ; KaTeX: https://katex.org/ ; Recharts: https://recharts.org/ ; Lucide: https://lucide.dev/ ; Vitest: https://vitest.dev/ ; Playwright: https://playwright.dev/ . Locked package versions are in `package-lock.json`. These are software acknowledgments, not chemical data sources.
