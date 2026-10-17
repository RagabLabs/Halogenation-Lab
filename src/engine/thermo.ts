import { ORDER, CARBON, HF, REF_T, SHOMATE, N2_HIGH } from "../data/species";
import {
  ScientificError,
  type Inputs,
  type Stream,
  type Species,
} from "./types";
import { num } from "./validation";
export const validateTemperature = (t: number) => {
  if (!Number.isFinite(t) || t < REF_T || t > 1000)
    throw new ScientificError("thermalRange");
  return t;
};
export const cp = (s: Species, T: number) => {
  validateTemperature(T);
  const [a, b, c, d, e] = s === "N2" && T >= 500 ? N2_HIGH : SHOMATE[s],
    t = T / 1000;
  return a + b * t + c * t * t + d * t * t * t + e / (t * t);
};
function primitive(coeff: number[], T: number) {
  const [a, b, c, d, e] = coeff,
    t = T / 1000;
  return (
    a * t +
    (b * t * t) / 2 +
    (c * t * t * t) / 3 +
    (d * t * t * t * t) / 4 -
    e / t
  );
}
// Definite integral anchors exactly at 298.15 K and is continuous across N2's fit break.
export const sensible = (s: Species, T: number) => {
  validateTemperature(T);
  if (s === "N2" && T > 500)
    return (
      primitive(SHOMATE.N2, 500) -
      primitive(SHOMATE.N2, REF_T) +
      primitive(N2_HIGH, T) -
      primitive(N2_HIGH, 500)
    );
  return primitive(SHOMATE[s], T) - primitive(SHOMATE[s], REF_T);
};
export const formation = (p: Inputs): Record<Species, number> => {
  if (
    p.thermoMode !== undefined &&
    !["reference", "custom"].includes(String(p.thermoMode))
  )
    throw new ScientificError("range", "thermoMode");
  if (p.thermoMode !== "custom") return { ...HF };
  if (!String(p.thermoSource ?? "").trim()) throw new ScientificError("source");
  return Object.fromEntries(
    ORDER.map((s) => [s, num(p, `hf${s}`, -1e5, 1e5)]),
  ) as Record<Species, number>;
};
export const reactionEnthalpies = (h: Record<Species, number> = HF) =>
  CARBON.slice(0, 4).map((s, i) => h[CARBON[i + 1]] + h.HCl - h[s] - h.Cl2);
export function adiabatic(feed: Stream, out: Stream, Tin: number, p: Inputs) {
  if (!["shomate", "constant"].includes(String(p.cpModel)))
    throw new ScientificError("range", "cpModel");
  validateTemperature(Tin);
  const hf = formation(p);
  const constant = p.cpModel === "constant";
  if (constant && !String(p.cpSource ?? "").trim())
    throw new ScientificError("source");
  const cpValues = constant
    ? (Object.fromEntries(
        ORDER.map((s) => {
          const c = num(p, `cp${s}`, 0, 1000);
          if (c === 0) throw new ScientificError("range", `cp${s}`);
          return [s, c];
        }),
      ) as Record<Species, number>)
    : null;
  const h = (stream: Stream, t: number) =>
    ORDER.reduce(
      (v, s) =>
        v +
        stream[s] *
          (hf[s] +
            (constant ? (cpValues![s] * (t - REF_T)) / 1000 : sensible(s, t))),
      0,
    );
  const Hin = h(feed, Tin),
    residual = (t: number) => h(out, t) - Hin;
  if (ORDER.reduce((v, s) => v + out[s], 0) === 0)
    throw new ScientificError("empty");
  let lo = REF_T,
    hi = 1000;
  const rlo = residual(lo),
    rhi = residual(hi);
  if (rlo > 1e-7 || rhi < -1e-7) throw new ScientificError("root");
  for (let i = 0; i < 90; i++) {
    const mid = (lo + hi) / 2;
    if (residual(mid) > 0) hi = mid;
    else lo = mid;
  }
  const T = (lo + hi) / 2;
  return {
    T,
    delta: T - Tin,
    residual: residual(T),
    Hin,
    Hout: h(out, T),
    curve: Array.from({ length: 25 }, (_, i) => {
      const temp = REF_T + ((1000 - REF_T) * i) / 24;
      return { name: temp.toFixed(0), value: residual(temp) };
    }),
  };
}
