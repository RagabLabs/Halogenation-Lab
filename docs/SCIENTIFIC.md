# Scientific documentation

Halogenation introduces halogen atoms into an organic compound. This application focuses on methane substitution chlorination, not all halogenation chemistries. Its educational starting point is the supplied 32-slide *Halogenation Process* lecture by Dr. Ghada Kadry. Independent property sources and explicit mathematical models define the calculations.

## Distinct models

| Model | What is supplied | What can be calculated | What is not inferred |
|---|---|---|---|
| Stoichiometric network | Feeds and four extents | Component outlets, consumption, atoms, mass | Reaction rates, real distribution, equilibrium |
| Sample composition | Four product amounts | Mole/mass fractions and mean molar mass | Phase behavior, viscosity or density |
| Reference thermochemistry | Gas formation enthalpies at 298.15 K | Standard reaction enthalpies, extent-weighted reaction heat | Actual cooling-system duty |
| Adiabatic enthalpy balance | Feeds, fixed extents, Tin, Cp model | A mathematical root inside the data interval | Dissociation, phase change, transport, runaway behavior |
| Recovery split | Product amounts and four recovery fractions | Recovered and loss quantities/compositions | Distillation design, purity prediction or equipment sizing |
| Serial stages | Fresh feeds, added Cl₂ and four extents per stage | Stage and external overall balances | Recycle convergence or control recommendations |

## Conservation

All reactions conserve C, H and Cl. Optional N₂ passes unchanged and adds an N balance. Molecular weights are derived from the same rounded atomic weights, ensuring algebraic consistency between the elemental and mass balances. Display formatting does not alter internal full-precision values.

Nonnegative feeds and extents are required. Every outlet must be nonnegative within the documented floating-point tolerance. For a fresh CH₄/Cl₂ feed, feasibility implies:

\[
0\leq\xi_4\leq\xi_3\leq\xi_2\leq\xi_1\leq n_{CH_4,in},\qquad \sum_j\xi_j\leq n_{Cl_2,in}.
\]

For later stages, incoming intermediates may allow a later-step extent to exceed the newly formed quantity in that stage. Therefore, feasibility is checked using the complete component vector, not an incorrect global monotonicity rule.

## Conversion, selectivity and yield

Conversion uses reactant consumption over reactant feed. Calculator 7 can report either the chosen-product fraction of four chloromethane products or its molar ratio to the other three products. Calculator 20 uses chosen product / methane reacted as **carbon selectivity**, and chosen product / methane feed as **carbon yield**. With methane as the only incoming carbon source, these satisfy Y = X × S.

Calculator 8 has a different, explicitly named percentage-yield denominator: the maximum possible selected product from methane and chlorine, assuming no competing final chloromethane product. It does not imply that this theoretical distribution will actually occur.

Undefined ratios display an em dash. A zero total cannot define sample composition. A positive feed is necessary for conversion. A selected-product-to-other-products ratio with no other product is undefined, not silently capped.

## Numerical rules

- Inputs must parse as finite numbers. Required blanks, NaN, Infinity and unparseable values are rejected.
- Generic material amounts are limited to 10¹² in entered units to avoid unreasonable numerical magnitudes; this is a numerical bound, not an operating limit.
- Physical component feasibility uses tolerance `1e-10 × max(1, feed components, extents)`. A tiny negative roundoff outlet is clamped to zero; significant negative values are rejected.
- The mass closure is `100 × m_out / m_in`; it is undefined for zero total inlet mass. Signed residual is `m_out − m_in`.
- The adiabatic solver uses 90 bisection iterations, an enthalpy residual in kJ or kJ/h and no extrapolation outside 298.15–1000 K.
- Shomate integration uses definite primitives, removing fit offsets at the 298.15 K reference and maintaining a continuous N₂ integral across 500 K.

## Reading the lecture critically

The deck contains formulas, percentages, ratio-based hazard diagrams, historical process trains and phase-data statements that cannot be used as a calibrated design basis. [LECTURE-AUDIT.md](LECTURE-AUDIT.md) records every slide and the application's decisions. In particular, composition is never fixed at 20/53/27%, and feed ratio is never labelled safe or unsafe by this application.

## Arabic explanation

المختبر يربط المدخلات بمعادلات معلنة قابلة للمراجعة. امتدادات التفاعلات ليست نتائج حركية محسوبة، والاسترجاع ليس محاكاة تقطير، وحرارة التفاعل المرجعية ليست حمل تبريد فعليًا. يدعم النموذج الحراري تقديرًا رياضيًا غازيًا محدود المجال، ولا يتنبأ بالتفاعلات الجانبية أو تغير الأطوار. تُراجع الذرات والكتلة دون نقل الأخطاء الواردة بالمحاضرة إلى المحرك العلمي.
