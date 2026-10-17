# Calculator equations and definitions

Amounts n are in mol internally, extents ξ in mol of reaction. With hourly feeds, use mol/h and mol/h of reaction consistently. M is g/mol. Each calculation supplies bilingual substituted steps and the appropriate numeric tables.

| # | Equations | Conditions and interpretation |
|---|---|---|
| 01 | ξ_max = min(n_CH4, n_Cl2); ξ = X n_CH4 if conversion mode; n_CH3Cl = n_HCl = ξ | Only R1. Reject ξ above either feed. |
| 02 | R = n_Cl2/n_CH4; inverse = n_CH4/n_Cl2; y_i = n_i/Σn; n_Cl2,required = selected ξ | First substitution theoretical requirement. The selected ξ cannot exceed methane feed; a chlorine shortfall is reported separately. |
| 03 | ξ_max = min(n_substrate, n_Cl2); products each ξ_max | One chosen 1:1 substitution. Its starting carbon species is independently supplied. |
| 04 | n_cons = n_in − n_out; X = n_cons/n_in | Same species and time basis at inlet/outlet. Requires n_in > 0 and 0 ≤ n_out ≤ n_in. |
| 05 | n_out = n_in + N ξ | Four reactions; complete component feasibility. |
| 06 | y_i = n_i/Σ_products n_j; w_i = n_i M_i/Σ_products n_j M_j | Four chloromethane products only. Manual composition or feasible network result. |
| 07 | S_fraction = n_p/Σ_products n_i; S_ratio = n_p/Σ_other products n_i | Selected definition explicitly displayed. These are product-sample selectivities, not a kinetic model. |
| 08 | k = 1,2,3,4 for CH3Cl,CH2Cl2,CHCl3,CCl4; n_p,max = min(n_CH4,n_Cl2/k); Y = n_actual/n_p,max | Hypothetical maximum all selected final product. Also reports actual product mass n_actual M_p/1000. |
| 09 | n_Cl2,cons = Σ ξ_j; n_Cl2,out = n_Cl2,in − Σ ξ_j; utilization = consumed/feed | One mole Cl2 per extent in each reaction. |
| 10 | n_HCl,formed = Σ ξ_j; m_HCl = n_HCl M_HCl/1000 | HCl is gas-reference anhydrous HCl; water absorption is not modeled. Rate only with hourly basis. |
| 11 | n_CH4,feed = n_target/(X S); n_reacted = X n_feed; n_unreacted = (1−X)n_feed | X and carbon-product fraction S must both be positive and ≤1. Other product distribution remains unspecified. |
| 12 | m = Σ n_i M_i/1000; elemental in/out = Σ n_i a_ei; ε_m = m_out−m_in; closure = 100 m_out/m_in | Includes optional N2. Undefined closure at zero total feed. |
| 13 | ΔrH_j° = ΔfH_product° + ΔfH_HCl° − ΔfH_substrate° − ΔfH_Cl2° | Gas standard reference at 298.15 K, kJ/mol reaction. Negative is exothermic. |
| 14 | Q_rxn = Σ ξ_j ΔrH_j°; ideal removal = max(−Q_rxn,0) | Reference isothermal reaction contribution only. If basis is hourly, Q is kJ/h and power = Q/3600 kW. |
| 15 | h_i(T) = ΔfH_i° + ∫298.15^T Cp_i(T)dT; f(T) = Σ n_i,out h_i(T) − Σ n_i,in h_i(T_in) = 0 | Frozen ideal-gas composition, 298.15–1000 K, numerical bisection. Constant Cp requires a user source and justification. |
| 16 | n_tot = Σ_feed n_i; y_i = n_i/n_tot; Mbar = Σ y_i M_i; V = nRT/P | CH4,Cl2,N2; T in K, P absolute in Pa, R=8.31446261815324 J/(mol K). V in m³ or m³/h. |
| 17 | Mbar = Σ n_i M_i/Σn_i; m_i = n_iM_i/1000; y_i,w_i as in 06 | Compositional properties only, no physical mixture density or nonideal property model. |
| 18 | n_i,recovered = r_i n_i; n_i,loss = (1−r_i)n_i; y_i,R = n_i,R/Σ n_j,R | Four independent 0–1 recoveries. Recovered composition requires nonzero recovered total. |
| 19 | n_s,out = n_s,in + N ξ_s; n_s,in = n_(s−1),out + added Cl2_s | 1–5 serial stages, complete stream transfer. External balance includes all additions. |
| 20 | Network + X = ξ1/n_CH4,in; S_p = n_p/ξ1; Y_p = n_p/n_CH4,in; Y_p = X S_p; Q and recovery as above | S is undefined without methane reaction. Thermal contribution at 298.15 K. |

## Units

| Entered unit | Internal amount conversion | Extent unit |
|---|---|---|
| mol | n = entered | mol |
| kmol | n = 1000 × entered | kmol |
| g | n = entered / M_i | mol |
| kg | n = 1000 × entered / M_i | kmol |
| Any of the above /h | Same numeric conversion, retaining hourly basis | Corresponding molar /h |

Changing material units in the UI updates all entered material amounts and molar extents. A switch between a batch amount and a flow rate reinterprets the time basis without applying a duration. This distinction is displayed beside the selector.

Temperatures: K = °C + 273.15. Absolute pressure: 1 kPa = 1000 Pa, 1 bar = 100000 Pa, 1 atm = 101325 Pa.
