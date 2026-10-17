import type { Inputs, Species } from "./types";
import { PRODUCTS, CARBON } from "../data/species";
import { amountToMol, molToAmount, extentScale } from "./units";
// A basis change between amounts and rates is a reinterpretation, not a time conversion.
export function convertInputs(p: Inputs, to: string): Inputs {
  const from = String(p.unit),
    out: Inputs = { ...p, unit: to };
  const map: Record<string, Species> = {
    methane: "CH4",
    chlorine: "Cl2",
    inert: "N2",
    substrate: CARBON[Number(p.reaction) - 1] ?? "CH4",
    feed: p.species === "Cl2" ? "Cl2" : "CH4",
    remaining: p.species === "Cl2" ? "Cl2" : "CH4",
    actual: (p.selected as Species) ?? "CH3Cl",
    target: (p.selected as Species) ?? "CH3Cl",
  };
  PRODUCTS.forEach((s) => (map[`p${s}`] = s));
  for (let j = 1; j <= 5; j++) map[`s${j}cl2`] = "Cl2";
  for (const [key, s] of Object.entries(map)) {
    if (String(p[key] ?? "").trim() !== "" && Number.isFinite(Number(p[key])))
      out[key] = molToAmount(amountToMol(Number(p[key]), from, s), to, s);
  }
  for (const key of Object.keys(p)) {
    if (
      (/^x[1-4]$/.test(key) ||
        /^s[1-5]x[1-4]$/.test(key) ||
        key === "extent") &&
      String(p[key]).trim() !== "" &&
      Number.isFinite(Number(p[key]))
    )
      out[key] = (Number(p[key]) * extentScale(from)) / extentScale(to);
  }
  return out;
}
