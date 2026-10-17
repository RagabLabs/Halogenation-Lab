# GitHub Pages deployment

The requested repository is `Halogenation-Lab`. The code is configured for the GitHub project-page base path `/Halogenation-Lab/`.

## From the ZIP

1. Extract the ZIP and open its `Halogenation-Lab` directory.
2. Upload its contents to the root of the GitHub repository. Do not nest the entire directory one extra level. Include `.github/workflows/pages.yml` and `package-lock.json`.
3. Use the `main` branch. If using another branch, edit the workflow's push branch filter.
4. In repository Settings → Pages, set Source to **GitHub Actions**.
5. Push a commit, or manually run the workflow. It installs locked dependencies, runs scientific tests, builds the app, installs Chromium, runs browser tests, uploads `dist`, then deploys only after verification succeeds.

For the account `ragablabs`, the expected URL is https://ragablabs.github.io/Halogenation-Lab/ . The delivered ZIP does not itself create a GitHub repository or establish that this URL is live.

## Build contract

```bash
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Production output is `dist/`. HTML script/style URLs use the configured base. Font and icon assets are bundled. No API keys, backend or environment secrets are required. Hash navigation permits calculator links such as:

`https://ragablabs.github.io/Halogenation-Lab/#/calculator/20`

Changing the repository name requires changing the Vite `base`, the preview server base and the Playwright `baseURL`. Root-domain hosting requires `/` instead; this package intentionally targets the requested repository path.

## Local prebuilt use

```bash
node tests/serve.mjs
```

Visit http://127.0.0.1:4173/Halogenation-Lab/ . The Node static server serves the supplied build without `node_modules`. This server binds loopback only. For development with hot reload, use `npm ci` followed by `npm run dev`.

## Failure checks

| Symptom | Check |
|---|---|
| Blank page or JS/CSS 404 | `dist/index.html` must be hosted under `/Halogenation-Lab/`; inspect whether files were nested an extra directory. |
| Pages workflow absent | Include the hidden `.github` directory in the repository. |
| No Pages deployment | Select GitHub Actions as Pages source and enable Actions for the repository. |
| Direct calculator URL fails | Use `#/calculator/ID`, not `/calculator/ID` after the base. |
| Outdated build | Rebuild with `npm ci && npm run build`, or allow the workflow to build the source. |
| Imported case changes results | The file's input data are re-evaluated with the current scientific engine; serialized prior results are never trusted. |

## Publication status

The source archive and production build are delivered. No external GitHub push or publication is performed as part of this local ZIP delivery.

Workflow action versions were checked against [GitHub Pages custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and the official [setup-node repository](https://github.com/actions/setup-node). The workflow uses checkout v6, setup-node v6, configure-pages v5, upload-pages-artifact v4 and deploy-pages v4.

## Standalone file in release 1.0.1

`npm run build` also creates `Open-Halogenation-Lab.html` in the project root. It contains a classic IIFE script, styles, and font data URLs and can be opened directly from the filesystem. It is separate from the normal `dist/` deployment. To regenerate only this file, run `npm run build:portable`. No new runtime dependency is introduced.
