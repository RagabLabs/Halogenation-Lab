# Lecture inspection and corrections

**Source:** Dr. Ghada Kadry, *Halogenation Process*, supplied file `halogenation (1)(1).ppt`, 32 slides. The old PowerPoint was converted for read-only text extraction and rendered for visual review. Original slides and images are not included in the released source archive.

All slides were inspected, including slides whose content is predominantly image-based. The table describes what is visible in the supplied deck, not independent validation of every historical process claim. The externally linked accident video was not used as process-design evidence.

| Slide | Inspected content | Adoption or correction |
|---:|---|---|
| 1 | Title and author | Retain bibliographic attribution only. |
| 2 | Halogenation definition and halogen family | Retain introductory definition. Scope of calculations restricted to methane chlorination. |
| 3 | Applications: solvents, refrigerants and other uses | Historical context. No product-use recommendation, regulatory claim or operating guidance. |
| 4 | Direct addition/substitution and HCl routes; image equations | The methane line produces CH3Cl and CH2Cl2 from one CH4/Cl2 line without balancing. Replace with four distinct balanced substitution reactions. Other routes are outside the engine scope. |
| 5 | Indirect chlorination and replacement equations | Reviewed visually; not generalized into the methane engine. |
| 6 | List of chlorinating agents and formulas | Use correct element symbols: COCl2, SOCl2, SO2Cl2. SO2Cl2 is **sulfuryl chloride**, not the generic sulfonyl-chloride class R–SO2Cl. See NIST sulfuryl chloride source. |
| 7 | Methane chlorination, four reactions, fixed percentages and phase statements | Correct methylene chloride from the displayed CH3Cl2 typo to **CH2Cl2**. Four balanced equations retained. Do not assume 20/53/27% as universal product fractions. The app's thermal model explicitly assumes gas-reference states rather than copying mixed-phase labels. |
| 8 | Reactor construction materials and equipment photos | Context only. No material-compatibility selection or construction recommendation. |
| 9 | Thermal/photochemical activation and catalyst list | Context only. No activation wavelength, catalyst choice or operating temperature is prescribed. |
| 10 | Feed ratio, reaction-rate and exothermicity claims, dilution and multistage concepts | A feed ratio alone is not a kinetic law. No rate proportionality is coded. Compute the four reaction heat effects from documented data; do not generalize to every halogenation chemistry. Dilution and stages are material accounts only. |
| 11 | Heat production/removal explanation and ratio illustration | Do not treat a heat-generation/removal equality as a complete fire or detonation assessment. No hazard boundary is generated. |
| 12 | Ratio diagram labelled safety/inflammation/detonation regions | Not reproduced or used to classify a feed ratio as safe. |
| 13 | Historical chlorinated-methane flowsheet, including recycle and separation equipment | Inspect network concept, not a calibrated operating design. Original SVG flow representation is newly authored. |
| 14 | Primary reactor/separation question and product labels | Model all four chloromethanes plus unreacted feeds and HCl. No assertion that a reactor has a fixed product distribution. |
| 15 | Reactor, cooling, main absorber and stripping sequence | Conceptual context. No absorber efficiency or solvent property data inferred. |
| 16 | Expanded washing, neutralization and drying train | Reviewed image labels. These operations are not simulated as detailed equipment. |
| 17 | Compression, condensation and first product columns | No compressor duty, pressure setpoint or equilibrium split inferred. |
| 18 | Accident photograph and external video question | No accident cause or prevention procedure derived from an image. External video not treated as verified design evidence. |
| 19 | Added secondary stage and product stream return | Supports a conceptual serial material-accounting extension only. |
| 20 | Expanded separation train around secondary stages | No tray counts, equilibrium constants or separation efficiencies invented. |
| 21 | More complete multistage product/recycle schematic | Serial-stage model preserves components; it does not claim to solve the drawn recycle plant. |
| 22 | Repeated expanded flowsheet | Cross-check stream connectivity; no new quantitative model data adopted. |
| 23 | Expanded flow arrangement and product/recycle lines | Context for component accounts only. |
| 24 | Full expanded process drawing and recycle path | No operational recycle fraction adopted. |
| 25 | Historical full chloromethane flowsheet repeated | Inspection confirms process sequence; no source image redistributed. |
| 26 | Image-based process description paragraph | Historical process context. Its equipment temperatures, acid concentration, phase behavior and product distribution claims are not executable model constants. |
| 27 | Equipment/flow illustration | Visual context only; not a source of quantitative specifications. |
| 28 | Packed-bed illustration | No packed-bed rate, pressure-drop or mass-transfer model inferred. |
| 29 | Compressor/partial-condenser question and listed boiling temperatures | Listed chloromethane “boiling points” are incorrect. Compare NIST phase-change summaries: roughly 247 K for CH3Cl, 313 K for CH2Cl2, 334.3 K for CHCl3, 349.8 K for CCl4. These are contextual values, not an equilibrium separation model. |
| 30 | Dryer explanation, blower definition and overlaid equipment photo | Do not adopt the unsupported broad chemical claim about water forming oxychlorides from chloromethanes. No drying chemistry or blower sizing is modeled. |
| 31 | CH3Cl/CH2Cl2 separation and preheating questions | “Very close” boiling points is not supported by the ~66 K difference between NIST summaries. Do not infer tray counts or packing. Temperature-rate discussion is qualitative, not a kinetic correlation; no preheat recommendation is generated. |
| 32 | Final reactor/absorption/neutralization/drying/condensation/fractionation flowsheet | Inform the educational process map, while explicitly limiting calculations to extents, material accounts, gas-reference thermochemistry and entered product recoveries. |

## Critical corrections with primary sources

1. Correct product formula **CH2Cl2**, CAS 75-09-2: [NIST](https://webbook.nist.gov/cgi/cbook.cgi?ID=C75092&Mask=1).
2. Correct **SO2Cl2** name, sulfuryl chloride: [NIST](https://webbook.nist.gov/cgi/cbook.cgi?ID=C7791255&Mask=1).
3. Phase data: [CH3Cl](https://webbook.nist.gov/cgi/cbook.cgi?ID=C74873&Mask=4), [CH2Cl2](https://webbook.nist.gov/cgi/cbook.cgi?ID=C75092&Mask=4), [CHCl3](https://webbook.nist.gov/cgi/cbook.cgi?ID=C67663&Mask=4), [CCl4](https://webbook.nist.gov/cgi/cbook.cgi?ID=C56235&Mask=4). The CH3Cl WebBook average is broadly reported as 247 ± 10 K; no false extra precision is introduced.
4. Reaction extents and conservation: [IUPAC extent of reaction](https://goldbook.iupac.org/terms/view/E02283). The application's four-reaction stoichiometric matrix is an explicit derivation, checked by independent atom/mass tests.

## ملخص بالعربية

تمت مراجعة الشرائح كلها، بما فيها النصوص داخل الصور. جرى تصحيح صيغة ثنائي كلورو الميثان ومعادلة الميثان غير الموزونة وتسمية كلوريد السلفوريل، مع توثيق اختلاف بيانات الغليان. لا يعتمد البرنامج نسب المنتجات أو مناطق السلامة المرسومة بالمحاضرة كحقائق عامة، ولا يحول مخططات المصنع التاريخية إلى تعليمات تشغيل أو تصميم معدات.
