import { MW } from "../data/species";
import { ScientificError, type Species } from "./types";
export const UNITS = [
  "mol",
  "kmol",
  "g",
  "kg",
  "mol/h",
  "kmol/h",
  "g/h",
  "kg/h",
];
export const unitInfo = (u: string) => {
  if (!UNITS.includes(u)) throw new ScientificError("unit");
  return {
    rate: u.endsWith("/h"),
    scale: u.startsWith("k") ? 1000 : 1,
    mass: u.startsWith("g") || u.startsWith("kg"),
  };
};
export const amountToMol = (value: number, u: string, s: Species) => {
  const x = unitInfo(u);
  return (value * x.scale) / (x.mass ? MW[s] : 1);
};
export const molToAmount = (value: number, u: string, s: Species) => {
  const x = unitInfo(u);
  return (value * (x.mass ? MW[s] : 1)) / x.scale;
};
export const extentScale = (u: string) => unitInfo(u).scale;
export const moleUnit = (u: string) =>
  `${unitInfo(u).scale === 1000 ? "kmol" : "mol"}${unitInfo(u).rate ? "/h" : ""}`;
export const massUnit = (u: string) => `kg${unitInfo(u).rate ? "/h" : ""}`;
export const heatUnit = (u: string) => `kJ${unitInfo(u).rate ? "/h" : ""}`;
export const toKelvin = (v: number, u: string) => {
  if (!["K", "C"].includes(u)) throw new ScientificError("unit");
  return u === "C" ? v + 273.15 : v;
};
export const toPa = (v: number, u: string) => {
  if (!["Pa", "kPa", "bar", "atm"].includes(u))
    throw new ScientificError("unit");
  return v * ({ Pa: 1, kPa: 1000, bar: 100000, atm: 101325 }[u] ?? 1);
};
