import { ORDER, CARBON, MW, atoms } from "../data/species";
import { ScientificError, type Stream, type Balance } from "./types";
export const emptyStream = (): Stream =>
  Object.fromEntries(ORDER.map((s) => [s, 0])) as Stream;
export const fresh = (
  methane: number,
  chlorine: number,
  inert = 0,
): Stream => ({ ...emptyStream(), CH4: methane, Cl2: chlorine, N2: inert });
export const mass = (stream: Stream) =>
  ORDER.reduce((v, s) => v + (stream[s] * MW[s]) / 1000, 0);
export const react = (feed: Stream, xi: number[]): Stream => {
  if (
    xi.length !== 4 ||
    xi.some((v) => !Number.isFinite(v) || v < 0) ||
    ORDER.some((s) => !Number.isFinite(feed[s]) || feed[s] < 0)
  )
    throw new ScientificError("negative");
  const out = { ...feed };
  for (let j = 0; j < 4; j++) {
    out[CARBON[j]] -= xi[j];
    out[CARBON[j + 1]] += xi[j];
    out.Cl2 -= xi[j];
    out.HCl += xi[j];
  }
  const tol = 1e-10 * Math.max(1, ...Object.values(feed), ...xi);
  for (const s of ORDER) {
    if (out[s] < -tol) throw new ScientificError("overdraw", s);
    if (out[s] < 0) out[s] = 0;
  }
  return out;
};
export const checkBalance = (feed: Stream, out: Stream): Balance => {
  const inMass = mass(feed),
    outMass = mass(out);
  const elements = Object.fromEntries(
    (["C", "H", "Cl", "N"] as const).map((e, i) => {
      const a = ORDER.reduce((v, s) => v + feed[s] * atoms[s][i], 0),
        z = ORDER.reduce((v, s) => v + out[s] * atoms[s][i], 0);
      return [e, { in: a, out: z, residual: z - a }];
    }),
  ) as Balance["elements"];
  return {
    inMass,
    outMass,
    residual: outMass - inMass,
    closure: inMass === 0 ? null : (100 * outMass) / inMass,
    elements,
  };
};
