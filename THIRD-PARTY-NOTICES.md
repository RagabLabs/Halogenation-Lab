# Third-party notices

The project MIT license covers original RagabLabs code and original application documentation. It does not relicense third-party components or the supplied lecture.

## Runtime code and fonts

| Component | Upstream license | Use |
|---|---|---|
| React and React DOM | MIT | Application rendering |
| Recharts | MIT | Charts |
| KaTeX | MIT | Equation rendering and bundled KaTeX font assets |
| Lucide | ISC | Icons |
| Inter | SIL Open Font License 1.1 | Bundled English typeface |
| IBM Plex Sans Arabic | SIL Open Font License 1.1 | Bundled Arabic typeface |

Runtime libraries have transitive dependencies with their own notices. The `licenses/` directory retains license and notice files found in the installed production dependency graph. Dependency versions and integrity hashes are locked in `package-lock.json`. Development-only tools are not distributed as `node_modules`; their package licenses remain upstream. No `node_modules` directory is included in the ZIP.

## Scientific data

Thermochemical facts are attributed to NIST Chemistry WebBook SRD 69 and Chase (1998), with selected values and source URLs documented in `docs/THERMODYNAMICS.md` and `docs/REFERENCES.md`. Atomic-weight conventions are attributed to CIAAW. These sources and their data are not represented as originally measured by RagabLabs or covered by the project's MIT license. NIST Standard Reference Data has its own statutory and website notices. Only the small factual dataset required for the educational calculations is included; source page prose and figures are not copied.

## Lecture

The supplied Dr. Ghada Kadry lecture is an educational reference reviewed at the user's request. Its PowerPoint, photos and historical flow diagrams are not redistributed. The reaction/process SVGs and molecular connectivity drawings in the app are newly authored code.
