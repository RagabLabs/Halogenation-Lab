# Thermodynamic data and assumptions

## Reference dataset

Default formation enthalpies are the H entries of the NIST Chemistry WebBook gas-phase Shomate tables attributed to **Chase, 1998, NIST-JANAF Thermochemical Tables, Fourth Edition**. This keeps a single documented evaluation across the network. More recent evaluations can differ; the app offers custom source-labelled gas data rather than implying that the default values are uniquely definitive.

| Species | ΔfH°(gas, 298.15 K), kJ/mol |
|---|---:|
| CH₄ | −74.87310 |
| CH₃Cl | −83.68000 |
| CH₂Cl₂ | −95.52114 |
| CHCl₃ | −103.17700 |
| CCl₄ | −95.98096 |
| Cl₂ | 0 |
| HCl | −92.31201 |
| N₂ | 0 |

Elemental reference gases Cl₂ and N₂ have zero standard formation enthalpy by convention. The CCl₄ entry above is the **H parameter** of the Chase gas Shomate table, not the WebBook's separate averaged formation enthalpy (−100 ± 20 kJ/mol). Liquid-state formation enthalpies are never substituted for gas-state values.

The resulting reference reaction enthalpies (kJ/mol reaction) are:

| Reaction | ΔrH° |
|---|---:|
| R1 | −101.11891 |
| R2 | −104.15315 |
| R3 | −99.96787 |
| R4 | −85.11597 |

These are reference thermochemical differences. Actual operating heat effects also depend on temperature, phases, side reactions and stream sensible enthalpies.

## Shomate heat capacities

For t = T/1000:

\[
C_p^\circ = A + Bt + Ct^2 + Dt^3 + E/t^2 \quad [J\,mol^{-1}K^{-1}].
\]

A primitive in kJ/mol is:

\[
P(T)=At+Bt^2/2+Ct^3/3+Dt^4/4-E/t.
\]

The definite sensible enthalpy is P(T)−P(298.15). This anchors the reference exactly, avoiding small fitted F−H offsets. For N₂ above 500 K, integrate the low-temperature fit to 500 K and add the high-temperature definite integral from 500 K to T.

| Species / interval used | A | B | C | D | E |
|---|---:|---:|---:|---:|---:|
| CH₄, 298.15–1000 K | −0.703029 | 108.4773 | −42.52157 | 5.862788 | 0.678565 |
| CH₃Cl, 298.15–1000 K | 3.524690 | 136.9277 | −82.14196 | 20.22797 | 0.278032 |
| CH₂Cl₂, 298.15–1000 K | 19.17351 | 136.8444 | −95.12993 | 26.03105 | −0.119405 |
| CHCl₃, 298.15–1000 K | 44.24706 | 114.6734 | −88.81837 | 25.89992 | −0.522808 |
| CCl₄, 298.15–1000 K | 103.1134 | 4.188644 | −1.126475 | 0.095677 | −1.919624 |
| Cl₂, 298.15–1000 K | 33.05060 | 12.22940 | −12.06510 | 4.385330 | −0.159494 |
| HCl, 298.15–1000 K | 32.12392 | −13.45805 | 19.86852 | −6.853936 | −0.049672 |
| N₂, 298.15–500 K | 28.98641 | 1.853978 | −9.647459 | 16.63537 | 0.000117 |
| N₂, 500–1000 K | 19.50583 | 19.88705 | −8.598535 | 1.369784 | 0.527601 |

The source fit ranges are wider for several species. The application deliberately uses their common **298.15–1000 K** subinterval. See the species links in [REFERENCES.md](REFERENCES.md) for source ranges and attribution.

## Adiabatic balance

\[
h_i(T)=\Delta_fH_i^\circ+\int_{298.15}^{T}C_{p,i}(T)dT,
\]

\[
f(T)=\sum_i n_{i,out}h_i(T)-\sum_i n_{i,in}h_i(T_{in})=0.
\]

The model assumes all inlet streams share the entered Tin, frozen user-supplied reaction extents, ideal gas behavior, no phase change, no dissociation, no shaft work and no heat transfer. Bisection only proceeds when a root is bracketed inside the supported interval. An out-of-range root is an explicit error. The model is not an equilibrium flame-temperature calculation, a dynamic reactor model or a runaway assessment.

A default example has only small extents and additional N₂ so that its mathematical root lies near the reference temperature. It is an illustrative balance, not a recommendation for a real feed or diluent amount.

## Custom constants

Users may replace gas formation enthalpies with their own source-labelled values. For calculator 15, a constant-Cp approximation additionally requires a textual source, validity range and justification, and positive Cp values for each species. The application does not establish whether that user's approximation is appropriate. Preset numeric Cp values in this mode are evaluated from the bundled Shomate curves at 298.15 K and are not new experimental measurements.

## Reference heat versus cooling duty

Calculator 14 and the integrated tool use Q_rxn = Σ ξ_j ΔrH_j° at 298.15 K. Negative Q denotes released heat. The ideal reference isothermal removal is max(−Q,0). This is **only the reaction contribution**. A real cooling duty requires stream enthalpies, phase transitions, equipment heat capacity, losses, heat-transfer data and any additional reactions. No coolant flow or equipment sizing is reported.

With a batch amount basis, heat is kJ. With hourly flows, heat effect is kJ/h and the optional power conversion is Q/3600 kW. No power is invented for batch quantities.
