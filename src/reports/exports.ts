import katex from "katex";
import { staticPlot } from "./static-plot";
import type { Calculator, Field } from "../data/calculators";
import { fieldsFor } from "../data/calculators";
import { tr, type Lang, type Inputs, type CalcResult } from "../engine/types";
import { ui } from "../data/ui";
import { moleUnit } from "../engine/units";
import { ORDER, nist, formula } from "../data/species";
import { APP_VERSION } from "../data/version";
export const format = (v: number | string | null) =>
  v === null
    ? "—"
    : typeof v === "string"
      ? v
      : Math.abs(v) < 1e-10
        ? "0"
        : Math.abs(v) >= 1e7 || Math.abs(v) < 1e-4
          ? v.toExponential(6)
          : new Intl.NumberFormat("en", { maximumSignificantDigits: 8 }).format(
              v,
            );
export const escape = (x: unknown) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function download(content: string, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const csvCell = (v: unknown) => {
  let text = v == null ? "" : String(v);
  if (typeof v === "string" && (/^[\t\r\n]/.test(text) || /^\s*[=+@-]/.test(text))) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
};
export function csvReport(c: Calculator, p: Inputs, r: CalcResult, lang: Lang) {
  const rows: unknown[][] = [
    [tr(c.title, lang), `Halogenation Lab ${APP_VERSION}`],
    [tr(ui.generated, lang), new Date().toISOString()],
    [tr(ui.unit, lang), p.unit],
    [],
    [tr(ui.submitted, lang)],
  ];
  for (const f of fieldsFor(c, p))
    rows.push([
      tr(f.label, lang),
      displayInput(f, p, lang),
      fieldUnit(f.unit, p),
    ]);
  rows.push([], [tr(ui.results, lang)]);
  for (const m of r.metrics) rows.push([tr(m.label, lang), m.value, m.unit]);
  for (const table of r.tables) {
    rows.push(
      [],
      [tr(table.title, lang)],
      table.headers.map((h) => (typeof h === "string" ? h : tr(h, lang))),
      ...table.rows,
    );
  }
  rows.push([], [tr(ui.steps, lang)]);
  for (const s of r.steps) rows.push([tr(s.text, lang), s.formula ?? ""]);
  rows.push([], [tr(ui.assumptions, lang)]);
  for (const a of [...c.assumptions, ...r.notes]) rows.push([tr(a, lang)]);
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
export function caseReport(
  c: Calculator,
  p: Inputs,
  r: CalcResult,
  lang: Lang,
) {
  return JSON.stringify(
    {
      application: "Halogenation Lab",
      version: APP_VERSION,
      calculatorId: c.id,
      language: lang,
      createdAt: new Date().toISOString(),
      inputs: p,
      results: r,
    },
    null,
    2,
  );
}
export function parseCase(text: string): { id: number; inputs: Inputs } {
  if (text.length > 1000000) throw new Error("size");
  const data = JSON.parse(text);
  if (
    data.application !== "Halogenation Lab" ||
    !/^1\./.test(data.version) ||
    !Number.isInteger(data.calculatorId) ||
    data.calculatorId < 1 ||
    data.calculatorId > 20 ||
    !data.inputs ||
    typeof data.inputs !== "object" ||
    Array.isArray(data.inputs)
  )
    throw new Error("format");
  const p: Inputs = {};
  for (const [key, value] of Object.entries(data.inputs)) {
    if (
      !/^[a-zA-Z0-9]+$/.test(key) ||
      key.length > 30 ||
      !["string", "number"].includes(typeof value) ||
      String(value).length > 10000 ||
      (typeof value === "number" && !Number.isFinite(value))
    )
      throw new Error("value");
    p[key] = value as string | number;
  }
  return { id: data.calculatorId, inputs: p };
}
export function displayInput(f: Field, p: Inputs, lang: Lang) {
  const option = f.options?.find((o) => o.value === String(p[f.key]));
  return option ? tr(option.label, lang) : p[f.key];
}
export function fieldUnit(unit: string | undefined, p: Inputs) {
  return unit === "amount"
    ? String(p.unit)
    : unit === "extent"
      ? moleUnit(String(p.unit))
      : unit === "fraction"
        ? "0–1"
        : unit === "temp"
          ? p.temperatureUnit === "C"
            ? "°C"
            : "K"
          : unit === "pressure"
            ? String(p.pressureUnit)
            : unit === "hf"
              ? "kJ/mol"
              : unit === "cp"
                ? "J/(mol·K)"
                : "";
}
export function equationMarkup(tex: string) {
  return katex.renderToString(tex, {
    displayMode: true,
    throwOnError: false,
    output: "mathml",
  });
}
function chartSvg(r: CalcResult) {
  return staticPlot(r.chart, r.chartUnit, r.chartType === "line");
}
export function htmlReport(
  c: Calculator,
  p: Inputs,
  r: CalcResult,
  lang: Lang,
) {
  const t = (x: typeof ui.home) => escape(tr(x, lang));
  const table = (
    title: string,
    headers: string[],
    rows: (string | number | null)[][],
  ) =>
    `<section><h2>${escape(title)}</h2><table><thead><tr>${headers.map((h) => `<th>${escape(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td dir="auto">${escape(format(cell))}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`;
  const inputRows = fieldsFor(c, p).map((f) => [
    tr(f.label, lang),
    displayInput(f, p, lang),
    fieldUnit(f.unit, p),
  ]);
  return `<!doctype html><html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(tr(c.title, lang))} · Halogenation Lab</title><style>*{box-sizing:border-box}body{margin:40px auto;padding:0 24px;max-width:1100px;font:18px/1.7 Arial,Tahoma,sans-serif;color:#13283d}header{border-bottom:3px solid #008c91;padding-bottom:24px}h1{font-size:34px}h2{font-size:25px;margin-top:30px}small{font-size:15px}.metrics{display:flex;flex-wrap:wrap;gap:15px}.metric{padding:16px;border:1px solid #c6d8df;flex:1;min-width:220px}.metric strong{display:block;font-size:30px}table{border-collapse:collapse;width:100%;font-size:16px}td,th{padding:10px;border:1px solid #c6d8df;text-align:start}th{background:#eaf3f6}svg{max-width:100%}math{font-size:24px}a{color:#00676c}section{overflow-wrap:anywhere}li{margin-bottom:10px}footer{margin-top:30px;border-top:1px solid #c6d8df;padding-top:15px}@media print{body{margin:0;max-width:none;padding:0}table{font-size:12px}td,th{padding:6px}tr,.metric{break-inside:avoid}h2{break-after:avoid}a{color:inherit}button{display:none}@page{size:A4;margin:15mm}}</style></head><body><header><small>RagabLabs / Halogenation Lab / ${APP_VERSION}</small><h1>${escape(tr(c.title, lang))}</h1><p>${escape(tr(c.overview, lang))}</p><small>${t(ui.generated)} · ${escape(new Date().toISOString())}</small></header><h2>${t(ui.results)}</h2><div class="metrics">${r.metrics.map((m) => `<div class="metric">${escape(tr(m.label, lang))}<strong dir="ltr">${escape(format(m.value))} <small>${escape(m.unit)}</small></strong></div>`).join("")}</div><h2>${t(ui.equation)}</h2><div dir="ltr">${equationMarkup(c.equation)}</div><h2>${escape(tr(r.chartTitle, lang))} (${escape(r.chartUnit)})</h2><div dir="ltr">${chartSvg(r)}</div>${(r.extraCharts ?? []).map((q) => `<h2>${escape(tr(q.title, lang))} (${escape(q.unit)})</h2><div dir="ltr">${staticPlot(q.data, q.unit)}</div>`).join("")}${table(tr(ui.submitted, lang), [tr(ui.inputs, lang), tr(ui.value, lang), tr(ui.mainUnit, lang)], inputRows)}${r.tables
    .map((q) =>
      table(
        tr(q.title, lang),
        q.headers.map((h) => (typeof h === "string" ? h : tr(h, lang))),
        q.rows,
      ),
    )
    .join(
      "",
    )}<section><h2>${t(ui.steps)}</h2><ol>${r.steps.map((s) => `<li>${escape(tr(s.text, lang))}${s.formula ? `<div dir="ltr">${equationMarkup(s.formula)}</div>` : ""}</li>`).join("")}</ol></section><section><h2>${t(ui.assumptions)}</h2><ul>${[...c.assumptions, ...r.notes].map((a) => `<li>${escape(tr(a, lang))}</li>`).join("")}</ul></section><section><h2>${t(ui.references)}</h2><p>NIST-JANAF, Chase (1998), NIST Chemistry WebBook SRD 69. CIAAW abridged atomic weights. IUPAC Gold Book, extent of reaction E02283.</p><ul>${ORDER.map((s) => `<li>${formula[s]}: <a href="${nist(s)}">${escape(nist(s))}</a></li>`).join("")}</ul></section><footer>${t(ui.scope)}<br>${t(ui.privacy)}</footer></body></html>`;
}
