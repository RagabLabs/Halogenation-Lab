# Reaction network and material balances

The species order is:

`[CH4, CH3Cl, CH2Cl2, CHCl3, CCl4, Cl2, HCl, N2]`.

## Balanced substitutions

1. CH₄ + Cl₂ → CH₃Cl + HCl
2. CH₃Cl + Cl₂ → CH₂Cl₂ + HCl
3. CH₂Cl₂ + Cl₂ → CHCl₃ + HCl
4. CHCl₃ + Cl₂ → CCl₄ + HCl

Each reaction has one mole of carbon substrate, one mole of chlorine, one mole of chlorinated carbon product and one mole of HCl. The total number of gas moles is unchanged under the all-gas interpretation, although total product mass increases by replacing hydrogen with chlorine.

## Stoichiometric matrix

| Species | R1 | R2 | R3 | R4 |
|---|---:|---:|---:|---:|
| CH₄ | −1 | 0 | 0 | 0 |
| CH₃Cl | +1 | −1 | 0 | 0 |
| CH₂Cl₂ | 0 | +1 | −1 | 0 |
| CHCl₃ | 0 | 0 | +1 | −1 |
| CCl₄ | 0 | 0 | 0 | +1 |
| Cl₂ | −1 | −1 | −1 | −1 |
| HCl | +1 | +1 | +1 | +1 |
| N₂ | 0 | 0 | 0 | 0 |

For any inlet vector: **n_out = n_in + N ξ**. The implementation computes each vector update and then checks every component for feasibility.

For fresh methane/chlorine feeds:

| Outlet | Amount |
|---|---|
| CH₄ | n_CH4,in − ξ₁ |
| CH₃Cl | ξ₁ − ξ₂ |
| CH₂Cl₂ | ξ₂ − ξ₃ |
| CHCl₃ | ξ₃ − ξ₄ |
| CCl₄ | ξ₄ |
| Cl₂ | n_Cl2,in − Σ ξ_j |
| HCl | Σ ξ_j |
| N₂ | n_N2,in |

## Elemental matrix

Each species has an atom-count vector `[C,H,Cl,N]`. Multiplying the atom matrix by the stoichiometric matrix gives zero. Each reported balance is evaluated independently from the inlet and outlet vectors. Atomic weights (g/mol of atoms): C = 12.011, H = 1.008, Cl = 35.45, N = 14.007.

Total mass in kg = Σ n_i M_i / 1000, where n is in mol and M in g/mol. With hourly input, n is mol/h and the same equation gives kg/h. Neither a changing phase nor reaction enthalpy changes this elemental mass account in the model.

## Serial stages

For stage s, the preceding outlet plus that stage's optional fresh Cl₂ becomes its inlet. Four local extents update that complete stream. The external overall balance uses initial feeds plus **all** stage-added chlorine. No unreported stream is removed between stages. There is no recycle loop solver.

## SVG diagrams

The reaction drawing shows the five carbon species and four clickable reaction steps, with Cl₂ consumption and HCl formation at each step. Mobile uses a vertical version with the same reaction definitions. The process drawing links feed, reaction, mixture, recovery and product accounts. Its gas bypass indicates that the component recovery model applies only to the four chloromethanes.

Original molecular SVGs show connectivity: each carbon has exactly four single bonds. Cl₂ and HCl each have one single bond. The drawings do not claim a planar methane geometry or a calculated 3D conformation.
