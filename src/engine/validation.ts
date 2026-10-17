import { ScientificError, type Inputs } from "./types";
export const num = (p: Inputs, key: string, min = 0, max = 1e12): number => {
  const v = p[key];
  if (v === undefined || v === null || String(v).trim() === "")
    throw new ScientificError("number", key);
  const n = Number(v);
  if (!Number.isFinite(n)) throw new ScientificError("number", key);
  if (n < min) throw new ScientificError(min === 0 ? "negative" : "range", key);
  if (n > max) throw new ScientificError("range", key);
  return n;
};
export const positive = (p: Inputs, key: string) => {
  const v = num(p, key);
  if (v === 0) throw new ScientificError("empty", key);
  return v;
};
export const fraction = (p: Inputs, key: string) => num(p, key, 0, 1);
export const integer = (p: Inputs, key: string, min: number, max: number) => {
  const n = num(p, key, min, max);
  if (!Number.isInteger(n)) throw new ScientificError("range", key);
  return n;
};
export const ratio = (a: number, b: number) => (b === 0 ? null : a / b);
export const pct = (a: number, b: number) => (b === 0 ? null : (100 * a) / b);
export const near = (a: number, b: number) =>
  Math.abs(a - b) <= 1e-10 * Math.max(1, Math.abs(a), Math.abs(b));
