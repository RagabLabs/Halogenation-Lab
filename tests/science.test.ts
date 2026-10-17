import { describe, it, expect } from "vitest";
import { calculate } from "../src/engine/calculate";
import { convertInputs } from "../src/engine/convert-inputs";
import { defaults } from "../src/data/calculators";
import { MW, HF, ORDER } from "../src/data/species";
import { cp, sensible, reactionEnthalpies } from "../src/engine/thermo";
import { react, fresh, checkBalance } from "../src/engine/network";
import {
  ScientificError,
  type Inputs,
  type CalcResult,
} from "../src/engine/types";
type Check = (r: CalcResult) => void;
const close = (r: CalcResult, key: string, n: number) =>
  expect(r.values[key], key).toBeCloseTo(n, 7);
const zeroX = { x1: 0, x2: 0, x3: 0, x4: 0 };
const cases: {
  id: number;
  ref: Check;
  boundary: Inputs;
  edge: Check;
  invalid: Inputs;
  consistent: Check;
}[] = [
  {
    id: 1,
    ref: (r) => close(r, "product", 600),
    boundary: { extent: 0 },
    edge: (r) => close(r, "CH4", 1000),
    invalid: { extent: 2 },
    consistent: (r) => expect(r.balance!.residual).toBeCloseTo(0, 9),
  },
  {
    id: 2,
    ref: (r) => close(r, "ratio", 2),
    boundary: { chlorine: 0 },
    edge: (r) => expect(r.values.inverse).toBeNull(),
    invalid: { methane: -1 },
    consistent: (r) =>
      expect(
        r.values.methaneFraction! + r.values.chlorineFraction!,
      ).toBeCloseTo(1, 12),
  },
  {
    id: 3,
    ref: (r) => close(r, "maximum", 1000),
    boundary: { substrate: 0 },
    edge: (r) => close(r, "product", 0),
    invalid: { reaction: 5 },
    consistent: (r) => expect(r.balance!.residual).toBeCloseTo(0, 9),
  },
  {
    id: 4,
    ref: (r) => close(r, "conversion", 0.8),
    boundary: { remaining: 1 },
    edge: (r) => close(r, "conversion", 0),
    invalid: { remaining: 2 },
    consistent: (r) =>
      expect(r.values.consumed! + r.values.remaining!).toBeCloseTo(
        r.values.feed!,
        9,
      ),
  },
  {
    id: 5,
    ref: (r) => {
      close(r, "CH3Cl", 450);
      close(r, "Cl2", 730);
      close(r, "HCl", 1270);
    },
    boundary: zeroX,
    edge: (r) => close(r, "CH4", 1000),
    invalid: { x2: 0.9 },
    consistent: (r) =>
      Object.values(r.balance!.elements).forEach((v) =>
        expect(v.residual).toBeCloseTo(0, 9),
      ),
  },
  {
    id: 6,
    ref: (r) => close(r, "yCH3Cl", 0.5625),
    boundary: { pCH2Cl2: 0, pCHCl3: 0, pCCl4: 0 },
    edge: (r) => close(r, "yCH3Cl", 1),
    invalid: { pCH3Cl: -1 },
    consistent: (r) =>
      expect(
        r.values.yCH3Cl! +
          r.values.yCH2Cl2! +
          r.values.yCHCl3! +
          r.values.yCCl4!,
      ).toBeCloseTo(1, 12),
  },
  {
    id: 7,
    ref: (r) => close(r, "selectivity", 0.5625),
    boundary: { pCH2Cl2: 0, pCHCl3: 0, pCCl4: 0 },
    edge: (r) => {
      close(r, "selectivity", 1);
      expect(r.values.selectivityRatio).toBeNull();
    },
    invalid: { selected: "CH4" },
    consistent: (r) =>
      expect(r.values.selectivityRatio).toBeCloseTo(0.45 / 0.35, 10),
  },
  {
    id: 8,
    ref: (r) => close(r, "yield", 0.5),
    boundary: { actual: 0 },
    edge: (r) => close(r, "yield", 0),
    invalid: { actual: 2 },
    consistent: (r) =>
      expect(r.values.productMass).toBeCloseTo(
        (r.values.actual! * MW.CH3Cl) / 1000,
        9,
      ),
  },
  {
    id: 9,
    ref: (r) => close(r, "consumed", 1270),
    boundary: zeroX,
    edge: (r) => close(r, "consumed", 0),
    invalid: { chlorine: 0.1 },
    consistent: (r) =>
      expect(r.values.consumed! + r.values.Cl2!).toBeCloseTo(2000, 9),
  },
  {
    id: 10,
    ref: (r) => close(r, "hcl", 1270),
    boundary: zeroX,
    edge: (r) => close(r, "hcl", 0),
    invalid: { x4: 0.2 },
    consistent: (r) => expect(r.values.HCl).toBeCloseTo(r.values.consumed!, 9),
  },
  {
    id: 11,
    ref: (r) => close(r, "feed", 400 / (0.8 * 0.6)),
    boundary: { target: 0 },
    edge: (r) => close(r, "feed", 0),
    invalid: { selectivity: 0 },
    consistent: (r) =>
      expect(r.values.reacted! + r.values.unreacted!).toBeCloseTo(
        r.values.feed!,
        9,
      ),
  },
  {
    id: 12,
    ref: (r) => close(r, "closure", 100),
    boundary: { ...zeroX, methane: 0, chlorine: 0, inert: 0 },
    edge: (r) => {
      close(r, "inMass", 0);
      expect(r.values.closure).toBeNull();
    },
    invalid: { x1: 1.1 },
    consistent: (r) =>
      Object.values(r.balance!.elements).forEach((e) =>
        expect(e.in).toBeCloseTo(e.out, 8),
      ),
  },
  {
    id: 13,
    ref: (r) => close(r, "enthalpy", -101.11891),
    boundary: { reaction: 4 },
    edge: (r) => close(r, "enthalpy", -85.11597),
    invalid: { thermoMode: "custom", thermoSource: "" },
    consistent: (r) =>
      expect(
        [1, 2, 3, 4].reduce((v, j) => v + r.values[`dh${j}`]!, 0),
      ).toBeCloseTo(HF.CCl4 + 4 * HF.HCl - HF.CH4, 8),
  },
  {
    id: 14,
    ref: (r) =>
      close(
        r,
        "heat",
        800 * -101.11891 + 350 * -104.15315 + 100 * -99.96787 + 20 * -85.11597,
      ),
    boundary: zeroX,
    edge: (r) => close(r, "heat", 0),
    invalid: { x1: -0.1 },
    consistent: (r) => expect(r.values.removal).toBeCloseTo(-r.values.heat!, 9),
  },
  {
    id: 15,
    ref: (r) => {
      expect(r.values.temperature).toBeGreaterThan(298.15);
      expect(r.values.temperature).toBeLessThan(320);
    },
    boundary: zeroX,
    edge: (r) => close(r, "temperature", 298.15),
    invalid: { x1: 0.8, x2: 0.35, x3: 0.1, x4: 0.02, inert: 0 },
    consistent: (r) =>
      expect(Math.abs(r.values.energyResidual!)).toBeLessThan(1e-6),
  },
  {
    id: 16,
    ref: (r) => close(r, "volume", (3500 * 8.31446261815324 * 298.15) / 100000),
    boundary: { inert: 0, chlorine: 0 },
    edge: (r) => close(r, "methaneFraction", 1),
    invalid: { pressure: 0 },
    consistent: (r) =>
      expect(
        r.values.methaneFraction! +
          r.values.chlorineFraction! +
          r.values.inertFraction!,
      ).toBeCloseTo(1, 12),
  },
  {
    id: 17,
    ref: (r) => close(r, "productTotal", 800),
    boundary: { pCH2Cl2: 0, pCHCl3: 0, pCCl4: 0 },
    edge: (r) => close(r, "meanMW", MW.CH3Cl),
    invalid: { pCH3Cl: 0, pCH2Cl2: 0, pCHCl3: 0, pCCl4: 0 },
    consistent: (r) =>
      expect((r.values.meanMW! * r.values.productTotal!) / 1000).toBeCloseTo(
        r.values.productMass!,
        9,
      ),
  },
  {
    id: 18,
    ref: (r) => close(r, "recovered", 405),
    boundary: { rCH3Cl: 0 },
    edge: (r) => close(r, "recovered", 0),
    invalid: { rCH3Cl: 1.1 },
    consistent: (r) => {
      close(r, "recoveryMassResidual", 0);
      expect(r.values.recovered! + r.values.loss!).toBeCloseTo(
        r.values.feed!,
        9,
      );
    },
  },
  {
    id: 19,
    ref: (r) => close(r, "CH4", 200),
    boundary: { stages: 1, s1x1: 0, s1x2: 0, s1x3: 0, s1x4: 0 },
    edge: (r) => close(r, "CH4", 1000),
    invalid: { s2x1: 10 },
    consistent: (r) => expect(r.balance!.residual).toBeCloseTo(0, 9),
  },
  {
    id: 20,
    ref: (r) => {
      close(r, "selectivity", 0.5625);
      close(r, "yield", 0.45);
    },
    boundary: zeroX,
    edge: (r) => {
      expect(r.values.selectivity).toBeNull();
      close(r, "yield", 0);
    },
    invalid: { rCHCl3: -1 },
    consistent: (r) =>
      expect(r.values.conversion! * r.values.selectivity!).toBeCloseTo(
        r.values.yield!,
        12,
      ),
  },
];
describe.each(cases)("Calculator $id scientific acceptance", (c) => {
  it("reference case with independently specified expected values", () =>
    c.ref(calculate(c.id, defaults(c.id))));
  it("boundary case", () =>
    c.edge(calculate(c.id, { ...defaults(c.id), ...c.boundary })));
  it("invalid input is rejected", () =>
    expect(() => calculate(c.id, { ...defaults(c.id), ...c.invalid })).toThrow(
      ScientificError,
    ));
  it("unit consistency across mol, kmol, g and kg hourly bases", () => {
    const p = defaults(c.id),
      ref = calculate(c.id, p);
    for (const unit of ["mol/h", "g/h", "kg/h"]) {
      const r = calculate(c.id, convertInputs(p, unit));
      for (const [k, v] of Object.entries(ref.values)) {
        if (v === null) expect(r.values[k], k).toBeNull();
        else expect(r.values[k], k).toBeCloseTo(v, 6);
      }
    }
  });
  it("scientific consistency", () =>
    c.consistent(calculate(c.id, defaults(c.id))));
});
describe("Additional model safeguards", () => {
  it("conserves mass and atoms across 400 deterministic feasible networks", () => {
    for (let j = 1; j <= 400; j++) {
      const a = j * 0.013,
        xi = [a, a * 0.63, a * 0.26, a * 0.08],
        f = fresh(a * 2, xi.reduce((v, n) => v + n, 0) * 1.2, j / 10),
        out = react(f, xi),
        z = checkBalance(f, out);
      expect(z.residual).toBeCloseTo(0, 10);
      for (const e of Object.values(z.elements))
        expect(e.residual).toBeCloseTo(0, 10);
    }
  });
  it("temperature-dependent Cp is positive and integrates consistently", () => {
    for (const s of ORDER) {
      expect(sensible(s, 298.15)).toBe(0);
      for (const T of [300, 499.9, 500.1, 800, 999]) {
        expect(cp(s, T)).toBeGreaterThan(0);
        const derivative =
          ((sensible(s, T + 0.001) - sensible(s, T - 0.001)) / 0.002) * 1000;
        expect(derivative).toBeCloseTo(cp(s, T), 5);
      }
    }
  });
  it("nitrogen sensible enthalpy is continuous at 500 K", () =>
    expect(
      sensible("N2", 500.000001) - sensible("N2", 499.999999),
    ).toBeLessThan(1e-6));
  it("custom constant-Cp adiabatic model agrees with an independent linear solution", () => {
    const p: Inputs = {
      ...defaults(15),
      cpModel: "constant",
      cpSource: "Test constants only",
    };
    const r = calculate(15, p),
      out = r.stream!;
    const q =
        20 * reactionEnthalpies()[0] +
        5 * reactionEnthalpies()[1] +
        reactionEnthalpies()[2],
      capacity = ORDER.reduce(
        (v, s) => v + (out[s] * Number(p[`cp${s}`])) / 1000,
        0,
      );
    expect(r.values.temperature).toBeCloseTo(298.15 - q / capacity, 7);
  });
  it("rejects nonfinite, blank and unparseable inputs", () => {
    for (const value of ["", Infinity, NaN, "7foo"])
      expect(() => calculate(1, { ...defaults(1), methane: value })).toThrow(
        ScientificError,
      );
  });
  it("uses mass flows in the selected reactant and product molecular weights", () => {
    const r = calculate(3, {
      ...defaults(3),
      reaction: 3,
      substrate: MW.CH2Cl2,
      chlorine: MW.Cl2,
      unit: "g",
    });
    close(r, "maximum", 1);
  });
  it("temperature and pressure units preserve ideal gas volume", () => {
    const p = defaults(16),
      r = calculate(16, p),
      other = calculate(16, {
        ...p,
        temperature: 25,
        temperatureUnit: "C",
        pressure: 100,
        pressureUnit: "kPa",
      });
    expect(other.values.volume).toBeCloseTo(r.values.volume!, 10);
  });
  it("component splits conserve all product mass even with different recoveries", () => {
    const r = calculate(18, {
      ...defaults(18),
      rCH3Cl: 0.1,
      rCH2Cl2: 0.3,
      rCHCl3: 0.8,
      rCCl4: 1,
    });
    close(r, "recoveryMassResidual", 0);
  });
  it("interstage extents may consume intermediate supplied by a prior stage", () => {
    const p = {
      ...defaults(19),
      stages: 2,
      s1x1: 0.5,
      s1x2: 0,
      s1x3: 0,
      s1x4: 0,
      s2x1: 0,
      s2x2: 0.4,
      s2x3: 0,
      s2x4: 0,
    };
    const r = calculate(19, p);
    close(r, "CH3Cl", 100);
    close(r, "CH2Cl2", 400);
  });
  it("interstage chlorine additions are included in the external mass balance", () => {
    const r = calculate(19, { ...defaults(19), s2cl2: 0.3, s3cl2: 0.2 });
    close(r, "addedChlorine", 500);
    expect(r.balance!.closure).toBeCloseTo(100, 9);
  });
  it("custom formation data must state their source", () =>
    expect(() =>
      calculate(20, {
        ...defaults(20),
        thermoMode: "custom",
        thermoSource: " ",
      }),
    ).toThrow(ScientificError));
  it("rejects temperatures outside the thermal data range", () =>
    expect(() => calculate(15, { ...defaults(15), tin: 200 })).toThrow(
      ScientificError,
    ));
  it("batch heat has no invented power output", () => {
    const r = calculate(14, convertInputs(defaults(14), "mol"));
    expect(r.metrics.some((m) => m.unit === "kW")).toBe(false);
  });
});
