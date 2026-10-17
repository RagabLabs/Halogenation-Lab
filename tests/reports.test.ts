import { describe, it, expect } from "vitest";
import { calculators, defaults } from "../src/data/calculators";
import { calculate } from "../src/engine/calculate";
import {
  htmlReport,
  csvReport,
  caseReport,
  parseCase,
} from "../src/reports/exports";
import { staticPlot } from "../src/reports/static-plot";
import { APP_VERSION } from "../src/data/version";
describe("Reports and deterministic print geometry", () => {
  it("HTML includes input snapshot, all integrated charts and exact balance values", () => {
    const c = calculators[19],
      p = defaults(20),
      r = calculate(20, p),
      html = htmlReport(c, p, r, "en");
    expect(html).toContain("Submitted input snapshot");
    expect(html).toContain("171.85");
    expect(html.match(/<svg /g)?.length).toBe(3);
    expect(html).toContain("NIST-JANAF · Chase 1998");
  });
  it("HTML escapes a custom scientific source", () => {
    const c = calculators[19],
      p = {
        ...defaults(20),
        thermoMode: "custom",
        thermoSource: "<script>alert(1)</script>",
      },
      r = calculate(20, p),
      html = htmlReport(c, p, r, "en");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
  it("CSV quotes text, retains UTF-8 Arabic and guards spreadsheet formulas", () => {
    const p = { ...defaults(20), thermoMode: "custom", thermoSource: "=2+2" },
      csv = csvReport(calculators[19], p, calculate(20, p), "ar");
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain("'=2+2");
    expect(csv).toContain("نسخة المدخلات المستخدمة");
  });
  it("JSON roundtrip retains inputs but does not use serialized results", () => {
    const p = defaults(20),
      data = JSON.parse(caseReport(calculators[19], p, calculate(20, p), "en"));
    data.results.metrics[0].value = -999;
    const parsed = parseCase(JSON.stringify(data));
    expect(calculate(parsed.id, parsed.inputs).metrics[0].value).toBe(80);
  });
  it("invalid and oversized JSON case files are rejected", () => {
    for (const s of ["{}", "[]", "bad", "x".repeat(1000001)])
      expect(() => parseCase(s)).toThrow();
  });
  it("negative heat bars are anchored below the zero baseline with visible labels", () => {
    const svg = staticPlot(
      [
        { name: "R1", value: -100 },
        { name: "R2", value: -50 },
      ],
      "kJ",
    );
    expect(svg).toContain("-100");
    expect(svg).toContain("-50");
    expect(svg).toContain("R1");
    expect(svg).toContain('viewBox="0 0 720 305"');
    expect(svg).not.toContain("NaN");
  });
  it("line export identifies temperature axis and supports signed residuals", () => {
    const svg = staticPlot(
      [
        { name: "298", value: -10 },
        { name: "500", value: 0 },
        { name: "1000", value: 30 },
      ],
      "kJ",
      true,
    );
    expect(svg).toContain("polyline");
    expect(svg).toContain("T (K)");
    expect(svg).toContain("1000");
  });
  it("all-zero print values produce finite geometry", () => {
    const svg = staticPlot(
      [
        { name: "Cl₂", value: 0 },
        { name: "HCl", value: 0 },
      ],
      "mol",
    );
    expect(svg).not.toMatch(/NaN|Infinity/);
    expect(svg).toContain("Cl₂");
  });
  it("CSV protects textual formulas while retaining numeric negative heat", () => {
    const p = { ...defaults(20), thermoMode: "custom", thermoSource: "  -1+2" };
    const csv = csvReport(calculators[19], p, calculate(20, p), "en");
    expect(csv).toContain("'  -1+2");
    const numeric = csv.match(/"Reference reaction heat","(-[0-9.]+)"/);
    expect(numeric).not.toBeNull();
    expect(Number(numeric![1])).toBeCloseTo(-129047.8369, 6);
  });
  it("CSV has empty optional cells instead of an undefined string", () => {
    const p = defaults(13);
    expect(csvReport(calculators[12], p, calculate(13, p), "en")).not.toContain('"undefined"');
  });
  it("all report formats identify the same application version", () => {
    const c = calculators[19], p = defaults(20), r = calculate(20, p);
    expect(JSON.parse(caseReport(c, p, r, "en")).version).toBe(APP_VERSION);
    expect(csvReport(c, p, r, "en")).toContain(`Halogenation Lab ${APP_VERSION}`);
    expect(htmlReport(c, p, r, "en")).toContain(`RagabLabs / Halogenation Lab / ${APP_VERSION}`);
  });
});
