export type Lang = "en" | "ar";
export type B = { en: string; ar: string };
export const b = (en: string, ar: string): B => ({ en, ar });
export const tr = (text: B, lang: Lang) => text[lang];
export type Species =
  | "CH4"
  | "CH3Cl"
  | "CH2Cl2"
  | "CHCl3"
  | "CCl4"
  | "Cl2"
  | "HCl"
  | "N2";
export type Stream = Record<Species, number>;
export type Inputs = Record<string, number | string>;
export interface Metric {
  label: B;
  value: number | string | null;
  unit?: string;
}
export interface Table {
  title: B;
  headers: (B | string)[];
  rows: (number | string | null)[][];
}
export interface Step {
  text: B;
  formula?: string;
}
export interface ChartPoint {
  name: string;
  value: number;
}
export interface CalcResult {
  values: Record<string, number | null>;
  metrics: Metric[];
  tables: Table[];
  steps: Step[];
  notes: B[];
  chart: ChartPoint[];
  chartTitle: B;
  chartUnit: string;
  chartType?: "bar" | "line";
  extraCharts?: { data: ChartPoint[]; title: B; unit: string }[];
  stream?: Stream;
  balance?: Balance;
}
export interface Balance {
  inMass: number;
  outMass: number;
  residual: number;
  closure: number | null;
  elements: Record<
    "C" | "H" | "Cl" | "N",
    { in: number; out: number; residual: number }
  >;
}
export type ErrorCode =
  | "number"
  | "negative"
  | "range"
  | "empty"
  | "overdraw"
  | "reaction"
  | "unit"
  | "thermalRange"
  | "root"
  | "source"
  | "stage"
  | "yield"
  | "conversion"
  | "unknown";
export class ScientificError extends Error {
  constructor(
    public code: ErrorCode,
    public field = "",
  ) {
    super(code);
    this.name = "ScientificError";
  }
}
