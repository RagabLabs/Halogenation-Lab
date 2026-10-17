import { b, type Species } from "../engine/types";
// Conventional rounded atomic weights. CIAAW abridged table; see docs/REFERENCES.md.
export const ATOMIC = { C: 12.011, H: 1.008, Cl: 35.45, N: 14.007 };
export const ORDER: Species[] = [
  "CH4",
  "CH3Cl",
  "CH2Cl2",
  "CHCl3",
  "CCl4",
  "Cl2",
  "HCl",
  "N2",
];
export const PRODUCTS: Species[] = ["CH3Cl", "CH2Cl2", "CHCl3", "CCl4"];
export const CARBON: Species[] = ["CH4", ...PRODUCTS];
export const atoms: Record<Species, [number, number, number, number]> = {
  CH4: [1, 4, 0, 0],
  CH3Cl: [1, 3, 1, 0],
  CH2Cl2: [1, 2, 2, 0],
  CHCl3: [1, 1, 3, 0],
  CCl4: [1, 0, 4, 0],
  Cl2: [0, 0, 2, 0],
  HCl: [0, 1, 1, 0],
  N2: [0, 0, 0, 2],
};
export const MW = Object.fromEntries(
  ORDER.map((s) => [
    s,
    atoms[s].reduce((v, n, i) => v + n * Object.values(ATOMIC)[i], 0),
  ]),
) as Record<Species, number>;
export const names = {
  CH4: b("Methane", "الميثان"),
  CH3Cl: b("Chloromethane", "كلورو الميثان"),
  CH2Cl2: b("Dichloromethane", "ثنائي كلورو الميثان"),
  CHCl3: b("Chloroform", "الكلوروفورم"),
  CCl4: b("Carbon tetrachloride", "رباعي كلوريد الكربون"),
  Cl2: b("Chlorine", "الكلور"),
  HCl: b("Hydrogen chloride", "كلوريد الهيدروجين"),
  N2: b("Nitrogen", "النيتروجين"),
};
export const formula: Record<Species, string> = {
  CH4: "CH₄",
  CH3Cl: "CH₃Cl",
  CH2Cl2: "CH₂Cl₂",
  CHCl3: "CHCl₃",
  CCl4: "CCl₄",
  Cl2: "Cl₂",
  HCl: "HCl",
  N2: "N₂",
};
export const cas: Record<Species, string> = {
  CH4: "C74828",
  CH3Cl: "C74873",
  CH2Cl2: "C75092",
  CHCl3: "C67663",
  CCl4: "C56235",
  Cl2: "C7782505",
  HCl: "C7647010",
  N2: "C7727379",
};
export const nist = (s: Species) =>
  `https://webbook.nist.gov/cgi/cbook.cgi?ID=${cas[s]}&Mask=1`;
export const reactions = PRODUCTS.map(
  (s, i) => `${formula[CARBON[i]]} + Cl₂ → ${formula[s]} + HCl`,
);
// Gas-phase formation enthalpies at 298.15 K (kJ/mol), Chase 1998 NIST-JANAF.
// Use the H entry in the corresponding Shomate table, rather than mixing evaluations.
export const HF: Record<Species, number> = {
  CH4: -74.8731,
  CH3Cl: -83.68,
  CH2Cl2: -95.52114,
  CHCl3: -103.177,
  CCl4: -95.98096,
  Cl2: 0,
  HCl: -92.31201,
  N2: 0,
};
// A..E in Cp[J/(mol K)] = A + Bt + Ct² + Dt³ + E/t², t=T/1000.
// Application limits all thermal models to the common interval 298.15–1000 K.
export const SHOMATE: Record<Species, number[]> = {
  CH4: [-0.703029, 108.4773, -42.52157, 5.862788, 0.678565],
  CH3Cl: [3.52469, 136.9277, -82.14196, 20.22797, 0.278032],
  CH2Cl2: [19.17351, 136.8444, -95.12993, 26.03105, -0.119405],
  CHCl3: [44.24706, 114.6734, -88.81837, 25.89992, -0.522808],
  CCl4: [103.1134, 4.188644, -1.126475, 0.095677, -1.919624],
  Cl2: [33.0506, 12.2294, -12.0651, 4.38533, -0.159494],
  HCl: [32.12392, -13.45805, 19.86852, -6.853936, -0.049672],
  N2: [28.98641, 1.853978, -9.647459, 16.63537, 0.000117],
};
export const N2_HIGH = [19.50583, 19.88705, -8.598535, 1.369784, 0.527601];
export const REF_T = 298.15;
