# Worked examples

These are illustrative numerical cases, not operating recommendations or plant data. Input quantities are arbitrary educational examples. The UI marks its preset as a worked example.

## Four-reaction network

Feed: CH₄ = 1 kmol/h, Cl₂ = 2 kmol/h. Extents: ξ₁ = 0.8, ξ₂ = 0.35, ξ₃ = 0.10, ξ₄ = 0.02 kmol/h. Optional N₂ = 0.5 kmol/h for the integrated balance.

| Species | Outlet kmol/h | Derivation |
|---|---:|---|
| CH₄ | 0.20 | 1 − 0.8 |
| CH₃Cl | 0.45 | 0.8 − 0.35 |
| CH₂Cl₂ | 0.25 | 0.35 − 0.10 |
| CHCl₃ | 0.08 | 0.10 − 0.02 |
| CCl₄ | 0.02 | ξ₄ |
| Cl₂ | 0.73 | 2 − (0.8+0.35+0.10+0.02) |
| HCl | 1.27 | Σ ξ_j |
| N₂ | 0.50 | Unchanged |

The four chloromethanes total 0.8 kmol/h. Their mole percentages are **56.25%, 31.25%, 10%, 2.5%**. Methane conversion X = 80%. For CH₃Cl, carbon selectivity S = 0.45/0.8 = 56.25% and carbon yield Y = 0.45/1 = 45%. X × S = 0.8 × 0.5625 = 0.45.

Using project molecular weights, inlet mass with N₂ = 16.043 + 2×70.9 + 0.5×28.014 = **171.85 kg/h**. The summed outlet mass is the same, within floating-point precision. Chlorine utilization is 1.27/2 = **63.5%**.

Reference reaction heat:

Q = 800(−101.11891) + 350(−104.15315) + 100(−99.96787) + 20(−85.11597)

= **−129047.8369 kJ/h** (approximately −35.8466 kW reaction contribution). Ideal reference isothermal heat removal is 129047.8369 kJ/h. This is not an actual cooling-system duty.

With each chloromethane recovery set to 0.9, recovered amounts are 0.405, 0.225, 0.072 and 0.018 kmol/h. Recovered total = **0.72 kmol/h**. The other gases are outside this product-only split.

## Single substitution

With CH₄ = 1 kmol/h, Cl₂ = 2 kmol/h and ξ = 0.6 kmol/h, R1 produces 0.6 kmol/h CH₃Cl and 0.6 kmol/h HCl, leaving 0.4 kmol/h CH₄ and 1.4 kmol/h Cl₂. Conversion is 60%. Changing to methane-conversion mode with X=0.6 gives the same result.

## Limiting reagent for R3

Take CH₂Cl₂ = 84.927 g and Cl₂ = 70.9 g. Both equal 1 mol under the project atomic weights. The maximum extent is 1 mol and the maximum CHCl₃ is 1 mol = 119.369 g. HCl is 1 mol = 36.458 g. Total mass: 155.827 g before and after.

## Feed target

Target CH₃Cl = 0.4 kmol/h, X_CH4 = 0.8, and selected product carbon fraction S = 0.6. Required methane = 0.4/(0.8×0.6) = **0.8333333333 kmol/h**. Reacted methane is 0.6666666667 kmol/h and unreacted methane 0.1666666667 kmol/h. This does not uniquely determine the other product fractions or total chlorine requirement.

## Ideal-gas mixture

CH₄ = 1, Cl₂ = 2, N₂ = 0.5 kmol/h; T = 298.15 K and P = 1 bar absolute. Total = 3500 mol/h. Volume = nRT/P = **86.763496 m³/h** (rounded). The expression uses only molar flow, not a mixture-density correlation. Entering 25 °C and 100 kPa gives the same value.

## Adiabatic mathematical estimate

Use calculator 15's preset: CH₄ = 1, Cl₂ = 2, N₂ = 5 kmol/h, extents 0.02, 0.005, 0.001, 0 kmol/h and Tin = 298.15 K. The root is computed from the temperature-dependent heat capacities, not copied into the app as a fixed temperature. The included numerical example files record its computed result. Its small extent is for illustrating a bounded reference-state calculation, not process operation.

## Invalid examples

- Fresh methane feed 1 kmol/h with ξ₁=0.8 and ξ₂=0.9 would produce negative CH₃Cl and is rejected.
- ξ₄ larger than the available CHCl₃ balance is rejected.
- Actual product above its chosen stoichiometric maximum is rejected.
- A zero denominator is reported as undefined, or as an input error when the entire requested model requires it to be positive.
- A thermal root above 1000 K is rejected instead of extrapolated.
