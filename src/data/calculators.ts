import { b, type B, type Inputs } from "../engine/types";
import { ORDER, PRODUCTS, HF, formula } from "./species";
import { cp } from "../engine/thermo";
export type FieldKind = "number" | "select" | "text";
export interface Field {
  key: string;
  label: B;
  kind?: FieldKind;
  unit?: "amount" | "extent" | "fraction" | "temp" | "pressure" | "hf" | "cp";
  options?: { value: string; label: B }[];
  min?: number;
  max?: number;
  hint?: B;
}
export interface Calculator {
  id: number;
  group: string;
  title: B;
  short: B;
  overview: B;
  equation: string;
  fields: Field[];
  model: B;
  assumptions: B[];
}
const f = (
  key: string,
  en: string,
  ar: string,
  unit: Field["unit"] = "amount",
): Field => ({ key, label: b(en, ar), unit });
const select = (key: string, label: B, options: [string, B][]): Field => ({
  key,
  label,
  kind: "select",
  options: options.map(([value, label]) => ({ value, label })),
});
export const methane = f(
  "methane",
  "Methane feed · CH₄",
  "تغذية الميثان · CH₄",
);
export const chlorine = f(
  "chlorine",
  "Chlorine feed · Cl₂",
  "تغذية الكلور · Cl₂",
);
export const inert = f("inert", "Nitrogen feed · N₂", "تغذية النيتروجين · N₂");
export const extentFields = Array.from({ length: 4 }, (_, i) =>
  f(
    `x${i + 1}`,
    `Reaction extent ξ${i + 1}`,
    `امتداد التفاعل ξ${i + 1}`,
    "extent",
  ),
);
const network = [methane, chlorine, ...extentFields];
const products = PRODUCTS.map((s) =>
  f(`p${s}`, `${formula[s]} amount`, `${formula[s]} · الكمية`),
);
export const productSelect = select(
  "selected",
  b("Selected product", "المنتج المختار"),
  PRODUCTS.map((s) => [s, b(formula[s], formula[s])]),
);
const reactionSelect = select(
  "reaction",
  b("Reaction", "التفاعل"),
  [1, 2, 3, 4].map((i) => [String(i), b(`Reaction ${i}`, `التفاعل ${i}`)]),
);
const temperature = f("temperature", "Temperature", "درجة الحرارة", "temp");
const tin = f("tin", "Inlet temperature", "درجة حرارة الدخول", "temp");
const tUnit = select("temperatureUnit", b("Temperature unit", "وحدة الحرارة"), [
  ["K", b("K", "K")],
  ["C", b("°C", "°C")],
]);
const recoveries = PRODUCTS.map((s) => ({
  ...f(
    `r${s}`,
    `${formula[s]} recovery fraction`,
    `${formula[s]} · كسر الاسترجاع`,
    "fraction",
  ),
  max: 1,
}));
export const thermalFields: Field[] = [
  select(
    "thermoMode",
    b("Formation enthalpy dataset", "بيانات إنثالبي التكوين"),
    [
      ["reference", b("NIST-JANAF · Chase 1998", "NIST-JANAF · Chase 1998")],
      ["custom", b("User-supplied gas data", "بيانات غازية يحددها المستخدم")],
    ],
  ),
  {
    key: "thermoSource",
    kind: "text",
    label: b("Custom data source and state", "مصدر البيانات المخصصة وحالتها"),
  },
  ...ORDER.map((s) =>
    f(
      `hf${s}`,
      `ΔfH° · ${formula[s]} (gas)`,
      `ΔfH° · ${formula[s]} (غاز)`,
      "hf",
    ),
  ),
];
const cpFields: Field[] = [
  select("cpModel", b("Heat capacity model", "نموذج السعة الحرارية"), [
    [
      "shomate",
      b(
        "NIST Shomate · temperature dependent",
        "معادلة شوميت · متغيرة مع الحرارة",
      ),
    ],
    ["constant", b("Custom constant Cp approximation", "تقريب Cp ثابتة مخصصة")],
  ]),
  {
    key: "cpSource",
    kind: "text",
    label: b(
      "Cp source, range and justification",
      "مصدر Cp ومجالها ومبرر التقريب",
    ),
  },
  ...ORDER.map((s) =>
    f(`cp${s}`, `Cp · ${formula[s]}`, `Cp · ${formula[s]}`, "cp"),
  ),
];
const stoich = b("Stoichiometric model", "نموذج ستوكيومتري");
const note = b(
  "Extents are supplied by the user. No kinetics, equilibrium, or actual product distribution is predicted.",
  "امتدادات التفاعلات يحددها المستخدم. لا يتنبأ النموذج بالحركية أو الاتزان أو التوزيع الفعلي للمنتجات.",
);
const amountNote = b(
  "Amounts and hourly flow rates are separate bases. All inputs in a calculation use one time basis; extents always use molar units.",
  "الكميات والتدفقات بالساعة أساسان منفصلان. تستخدم المدخلات أساسًا زمنيًا واحدًا، وتظل امتدادات التفاعل بوحدات مولية.",
);
const compositionNote = b(
  "Composition describes the entered sample only. It does not predict phase behavior, density, or separation performance.",
  "التركيب يصف العينة المدخلة فقط، ولا يتنبأ بالأطوار أو الكثافة أو أداء الفصل.",
);
const thermoNote = b(
  "Gas-phase reference states at 298.15 K. NIST-JANAF values are one documented evaluation, not a claim of the latest or uniquely best evaluation.",
  "حالات مرجعية غازية عند 298.15 K. قيم NIST-JANAF تقييم موثّق، ولا تُقدَّم بوصفها الأحدث أو التقييم الأفضل الوحيد.",
);
function c(
  id: number,
  group: string,
  title: B,
  short: B,
  overview: B,
  equation: string,
  fields: Field[],
  model = stoich,
  assumptions: B[] = [note, amountNote],
): Calculator {
  return {
    id,
    group,
    title,
    short,
    overview,
    equation,
    fields,
    model,
    assumptions,
  };
}
export const calculators: Calculator[] = [
  c(
    1,
    "A",
    b("Methane chlorination stoichiometry", "ستوكيومترية كلورة الميثان"),
    b("Single reaction", "تفاعل واحد"),
    b(
      "Track a single substitution reaction using an entered extent or methane conversion. The other three reactions are excluded.",
      "تتبّع تفاعل استبدال واحد باستخدام امتداد مدخل أو تحويل الميثان، مع استبعاد التفاعلات الثلاثة الأخرى.",
    ),
    "\\mathrm{CH_4+Cl_2\\rightarrow CH_3Cl+HCl}",
    [
      methane,
      chlorine,
      select("mode", b("Calculation basis", "أساس الحساب"), [
        ["extent", b("Reaction extent", "امتداد التفاعل")],
        ["conversion", b("Methane conversion", "تحويل الميثان")],
      ]),
      f("extent", "Reaction extent ξ", "امتداد التفاعل ξ", "extent"),
      {
        ...f(
          "conversion",
          "Methane conversion X",
          "تحويل الميثان X",
          "fraction",
        ),
        max: 1,
      },
    ],
  ),
  c(
    2,
    "A",
    b("Chlorine-to-methane molar ratio", "النسبة المولية للكلور إلى الميثان"),
    b("Feed ratio", "نسبة التغذية"),
    b(
      "Convert feed amounts to moles and compare a requested first-substitution extent with the available chlorine.",
      "حوّل التغذية إلى مولات وقارن احتياج الكلور لامتداد الاستبدال الأول مع الكلور المتاح.",
    ),
    "R=\\frac{n_{Cl_2}}{n_{CH_4}}",
    [
      methane,
      chlorine,
      f(
        "extent",
        "Selected first-reaction extent",
        "امتداد التفاعل الأول المختار",
        "extent",
      ),
    ],
  ),
  c(
    3,
    "A",
    b("Limiting reactant", "المتفاعل المحدد"),
    b("Theoretical limit", "الحد النظري"),
    b(
      "Find the limiting reagent for any one of the four substitutions, treating its carbon substrate as a fresh feed.",
      "حدّد المتفاعل المحدد لأي خطوة من خطوات الاستبدال الأربع، باعتبار مادتها الكربونية تغذية مستقلة.",
    ),
    "\\xi_{max}=\\min(n_{substrate},n_{Cl_2})",
    [
      reactionSelect,
      f("substrate", "Carbon substrate feed", "تغذية المادة الكربونية"),
      chlorine,
    ],
  ),
  c(
    4,
    "A",
    b("Chlorination conversion", "تحويل المتفاعل"),
    b("Consumed / fed", "المستهلك / المغذّى"),
    b(
      "Calculate conversion from inlet and outlet amounts of the same reactant. This is a species account, not a complete reactor balance.",
      "احسب التحويل من كمية الدخول والخروج للمتفاعل نفسه. هذه موازنة مكوّن وليست موازنة مفاعل كاملة.",
    ),
    "X=\\frac{n_{in}-n_{out}}{n_{in}}",
    [
      select("species", b("Reactant", "المتفاعل"), [
        ["CH4", b("CH₄", "CH₄")],
        ["Cl2", b("Cl₂", "Cl₂")],
      ]),
      f("feed", "Reactant inlet", "المتفاعل عند الدخول"),
      f("remaining", "Reactant outlet", "المتفاعل عند الخروج"),
    ],
  ),
  c(
    5,
    "B",
    b("Sequential chlorination stoichiometry", "ستوكيومترية الكلورة المتتابعة"),
    b("Four reaction network", "شبكة أربعة تفاعلات"),
    b(
      "Solve all seven reactive outlet components from four independent reaction extents. Every intermediate and chlorine balance is checked.",
      "احسب المكونات السبعة عند الخروج من أربعة امتدادات تفاعل، مع التحقق من رصيد كل مركب وسيط والكلور.",
    ),
    "\\mathbf{n}_{out}=\\mathbf{n}_{in}+\\mathbf{N}\\boldsymbol{\\xi}",
    network,
  ),
  c(
    6,
    "B",
    b("Chloromethane product distribution", "توزيع منتجات الكلوروميثان"),
    b("Mole and mass fractions", "كسور مولية وكتلية"),
    b(
      "Compare measured product amounts or amounts calculated from a feasible reaction network. Fractions exclude methane, HCl, chlorine and nitrogen.",
      "قارن كميات منتجات مقاسة أو محسوبة من شبكة تفاعل ممكنة. تستبعد الكسور الميثان وHCl والكلور والنيتروجين.",
    ),
    "y_i=\\frac{n_i}{\\sum_{products}n_j},\\quad w_i=\\frac{n_iM_i}{\\sum_{products}n_jM_j}",
    [
      select("compositionMode", b("Composition source", "مصدر التركيب"), [
        ["manual", b("Entered product amounts", "كميات منتجات مدخلة")],
        ["network", b("Reaction network", "شبكة التفاعل")],
      ]),
      ...products,
      ...network,
    ],
    b("Composition accounting", "حساب التركيب"),
    [compositionNote, amountNote],
  ),
  c(
    7,
    "B",
    b("Chloromethane selectivity", "انتقائية الكلوروميثان"),
    b("Define your basis", "حدّد أساسك"),
    b(
      "Choose product mole fraction or desired-to-other product molar ratio. All chloromethanes contain one carbon atom.",
      "اختر الكسر المولي للمنتج أو نسبة مولاته إلى بقية المنتجات. يحتوي كل كلوروميثان على ذرة كربون واحدة.",
    ),
    "S_{fraction}=\\frac{n_p}{\\sum n_i},\\quad S_{ratio}=\\frac{n_p}{\\sum_{i\\ne p}n_i}",
    [
      ...products,
      productSelect,
      select(
        "selectivityBasis",
        b("Selectivity definition", "تعريف الانتقائية"),
        [
          [
            "fraction",
            b(
              "Fraction of chloromethane products",
              "كسر من منتجات الكلوروميثان",
            ),
          ],
          [
            "ratio",
            b("Desired / other products", "المنتج المرغوب / المنتجات الأخرى"),
          ],
        ],
      ),
    ],
    b("Product accounting", "حساب المنتجات"),
    [compositionNote, amountNote],
  ),
  c(
    8,
    "B",
    b("Chloromethane yield", "مردود الكلوروميثان"),
    b("Actual / theoretical", "الفعلي / النظري"),
    b(
      "Compare an entered actual amount with the stoichiometric maximum for the selected product. This maximum assumes all converted carbon reaches that product.",
      "قارن الإنتاج الفعلي المدخل بالحد الستوكيومتري للمنتج المختار، بافتراض وصول كل الكربون المتحوّل إلى هذا المنتج.",
    ),
    "n_{p,max}=\\min(n_{CH_4},n_{Cl_2}/k),\\quad Y=\\frac{n_{p,actual}}{n_{p,max}}",
    [
      methane,
      chlorine,
      productSelect,
      f("actual", "Actual product amount", "كمية المنتج الفعلية"),
    ],
  ),
  c(
    9,
    "C",
    b("Chlorine consumption", "استهلاك الكلور"),
    b("Four contributions", "أربع مساهمات"),
    b(
      "Sum chlorine consumption across a validated sequential reaction network. One mole of chlorine is consumed per mole of extent in each step.",
      "اجمع استهلاك الكلور عبر شبكة تفاعلات متتابعة صحيحة، حيث يستهلك مول كلور واحد لكل مول امتداد في كل خطوة.",
    ),
    "n_{Cl_2,cons}=\\xi_1+\\xi_2+\\xi_3+\\xi_4",
    network,
  ),
  c(
    10,
    "C",
    b("Hydrogen chloride byproduct", "الناتج الجانبي كلوريد الهيدروجين"),
    b("HCl formation", "تكوّن HCl"),
    b(
      "Calculate HCl formation and each reaction contribution. A production rate is reported only when the selected input basis is hourly.",
      "احسب تكوّن HCl ومساهمة كل تفاعل. يُعرض معدل إنتاج فقط عندما يكون أساس الإدخال بالساعة.",
    ),
    "n_{HCl}=\\sum_{j=1}^{4}\\xi_j",
    network,
  ),
  c(
    11,
    "C",
    b("Methane feed requirement", "احتياج تغذية الميثان"),
    b("Target production", "الإنتاج المستهدف"),
    b(
      "Determine methane feed from a target product, methane conversion, and selected-product fraction of converted methane carbon.",
      "احسب تغذية الميثان من هدف الإنتاج وتحويل الميثان وكسر المنتج المختار من كربون الميثان المتحوّل.",
    ),
    "n_{CH_4,in}=\\frac{n_{p,target}}{X_{CH_4}S_p}",
    [
      productSelect,
      f("target", "Target product amount", "كمية المنتج المستهدفة"),
      f("conversion", "Methane conversion X", "تحويل الميثان X", "fraction"),
      f(
        "selectivity",
        "Selected product carbon fraction S",
        "الكسر الكربوني للمنتج المختار S",
        "fraction",
      ),
    ],
  ),
  c(
    12,
    "C",
    b(
      "Integrated chlorination mass balance",
      "الموازنة الكتلية الشاملة للكلورة",
    ),
    b("Mass and atoms", "الكتلة والذرات"),
    b(
      "Audit every outlet component, total mass and the independent C, H, Cl and N elemental balances.",
      "راجع كل مكوّن عند الخروج والكتلة الكلية وموازنات عناصر C وH وCl وN المستقلة.",
    ),
    "\\sum_i n_{i,in}M_i=\\sum_i n_{i,out}M_i",
    [...network, inert],
  ),
  c(
    13,
    "D",
    b("Chlorination reaction enthalpy", "إنثالبي تفاعلات الكلورة"),
    b("Hess’s law", "قانون هس"),
    b(
      "Evaluate all four standard reaction enthalpies from gas-phase formation data at 298.15 K. Inspect or replace the documented dataset.",
      "احسب إنثالبي التفاعلات الأربعة من بيانات التكوين الغازية عند 298.15 K، مع إمكانية مراجعة البيانات الموثقة أو استبدالها.",
    ),
    "\\Delta_rH^\\circ=\\sum_i\\nu_i\\Delta_fH_i^\\circ",
    [reactionSelect, ...thermalFields],
    b("Reference thermochemistry", "كيمياء حرارية مرجعية"),
    [
      thermoNote,
      b(
        "No temperature correction is applied by this calculator.",
        "لا تطبّق هذه الحاسبة تصحيحًا حراريًا لدرجة حرارة مختلفة.",
      ),
    ],
  ),
  c(
    14,
    "D",
    b("Chlorination heat duty", "حرارة تفاعلات الكلورة"),
    b("Reference heat effect", "الأثر الحراري المرجعي"),
    b(
      "Sum extent-weighted reaction enthalpies at the reference state. Ideal isothermal removal excludes sensible and latent heats, losses and equipment.",
      "اجمع إنثالبي التفاعلات مضروبًا في امتداداتها عند الحالة المرجعية. الاستبعاد يشمل الحرارة المحسوسة والكامنة والفقد والمعدات.",
    ),
    "Q_{reaction}=\\sum_j\\xi_j\\Delta_rH_j^\\circ",
    [...network, ...thermalFields],
    b("Reference energy balance", "موازنة طاقة مرجعية"),
    [
      thermoNote,
      b(
        "Q < 0 denotes heat release. Required ideal isothermal removal = max(−Q, 0); this is not an actual cooling-system duty.",
        "تشير Q السالبة إلى انطلاق الحرارة. الإزالة النظرية متساوية الحرارة = max(−Q,0)، ولا تمثل حمل نظام تبريد فعلي.",
      ),
    ],
  ),
  c(
    15,
    "D",
    b("Adiabatic temperature change", "التغيّر الأدياباتي في الحرارة"),
    b("Enthalpy root solver", "حل عددي للإنثالبي"),
    b(
      "Solve Hout(T) = Hin(Tin) for fixed user-supplied extents using temperature-dependent NIST heat capacities or justified custom constants.",
      "حل المعادلة Hout(T) = Hin(Tin) لامتدادات مدخلة، باستخدام سعات حرارية متغيرة مع الحرارة أو ثوابت مخصصة مبررة.",
    ),
    "\\sum_i n_{i,out}h_i(T_{ad})=\\sum_i n_{i,in}h_i(T_{in})",
    [...network, inert, tUnit, tin, ...cpFields, ...thermalFields],
    b("Frozen ideal-gas thermal model", "نموذج غازي مثالي بتركيب ثابت"),
    [
      thermoNote,
      b(
        "All species are treated as ideal gases. Fixed composition, no dissociation, no phase change, no heat transfer or shaft work. Root restricted to 298.15–1000 K; a missing root is reported, never extrapolated.",
        "تُعامل المكونات كغازات مثالية بتركيب ثابت، دون تفكك أو تغير طور أو انتقال حرارة أو شغل محور. مجال الحل 298.15–1000 K، ويُبلّغ عن غياب الحل دون استقراء.",
      ),
      b(
        "Custom constant Cp is an explicitly user-justified approximation over the whole temperature interval.",
        "Cp الثابتة المخصصة تقريب يبرّره المستخدم على كامل المجال الحراري.",
      ),
    ],
  ),
  c(
    16,
    "D",
    b("Gas mixture and dilution", "مزيج الغازات والتخفيف"),
    b("Composition and flow", "التركيب والتدفق"),
    b(
      "Calculate CH₄ / Cl₂ / N₂ composition, mean molecular weight, and ideal-gas volume at entered absolute pressure and temperature.",
      "احسب تركيب CH₄ وCl₂ وN₂ ومتوسط الكتلة المولية وحجم الغاز المثالي عند الضغط المطلق والحرارة المدخلين.",
    ),
    "V=\\frac{nRT}{P},\\quad \\overline M=\\sum_i y_iM_i",
    [
      methane,
      chlorine,
      inert,
      tUnit,
      temperature,
      f("pressure", "Absolute pressure", "الضغط المطلق", "pressure"),
      select(
        "pressureUnit",
        b("Pressure unit", "وحدة الضغط"),
        ["Pa", "kPa", "bar", "atm"].map((u) => [u, b(u, u)]),
      ),
    ],
    b("Ideal gas law", "قانون الغاز المثالي"),
    [
      b(
        "Assumes a single gas phase and ideal gas behavior. Composition and dilution do not establish safe operating conditions.",
        "يفترض طورًا غازيًا واحدًا وسلوك الغاز المثالي. لا يثبت التركيب أو التخفيف ظروف تشغيل آمنة.",
      ),
      amountNote,
    ],
  ),
  c(
    17,
    "E",
    b("Chloromethane mixture properties", "خواص تركيب مزيج الكلوروميثان"),
    b("Mixture accounting", "حساب المزيج"),
    b(
      "Calculate component masses, mole fractions, mass fractions and average molecular weight for four entered chloromethane amounts.",
      "احسب كتل المكونات وكسورها المولية والكتلية ومتوسط الكتلة المولية لكميات الكلوروميثانات الأربعة المدخلة.",
    ),
    "\\overline M=\\frac{\\sum_i n_iM_i}{\\sum_i n_i}",
    products,
    b("Composition accounting", "حساب التركيب"),
    [compositionNote, amountNote],
  ),
  c(
    18,
    "E",
    b("Product recovery mass balance", "موازنة استرجاع المنتجات"),
    b("Two outlet streams", "تيارا خروج"),
    b(
      "Apply an independent entered recovery fraction to each product. Recovered-stream composition follows from all four recoveries.",
      "طبّق كسر استرجاع مستقلًا لكل منتج. ينتج تركيب التيار المسترجع من كسور الاسترجاع الأربعة.",
    ),
    "n_{i,recovered}=r_in_{i,feed},\\quad n_{i,loss}=(1-r_i)n_{i,feed}",
    [...products, ...recoveries, productSelect],
    b("Specified component split", "فصل مكونات بمعاملات محددة"),
    [
      b(
        "Recoveries are inputs, not separation predictions. No distillation, vapor–liquid equilibrium, equipment, or purity model is used.",
        "الاسترجاعات مدخلات وليست تنبؤات فصل. لا يُستخدم نموذج تقطير أو اتزان بخار وسائل أو معدات أو نقاوة.",
      ),
      amountNote,
    ],
  ),
  c(
    19,
    "E",
    b(
      "Multi-stage chlorination stream balance",
      "موازنة تدفقات الكلورة متعددة المراحل",
    ),
    b("Stage-by-stage", "مرحلة بمرحلة"),
    b(
      "Carry the full outlet of each stage into the next. Enter four extents and an optional added chlorine feed per stage.",
      "مرّر تيار خروج كل مرحلة كاملًا إلى التالية، مع إدخال أربعة امتدادات وتغذية كلور إضافية اختيارية لكل مرحلة.",
    ),
    "\\mathbf n_{s,out}=\\mathbf n_{s,in}+\\mathbf N\\boldsymbol\\xi_s",
    [
      methane,
      chlorine,
      inert,
      {
        key: "stages",
        label: b("Number of stages (1–5)", "عدد المراحل (1–5)"),
        min: 1,
        max: 5,
      },
    ],
    b("Serial stream accounting", "حساب تيارات متسلسلة"),
    [
      note,
      b(
        "1–5 material-balance stages. No recycle convergence, interstage separation, kinetics, or reactor control is modeled.",
        "من 1 إلى 5 مراحل لموازنة المادة. لا يُنمذج تقارب التدوير أو الفصل بين المراحل أو الحركية أو التحكم في المفاعل.",
      ),
      amountNote,
    ],
  ),
  c(
    20,
    "E",
    b("Integrated halogenation laboratory", "مختبر الهلجنة المتكامل"),
    b("Complete analysis", "تحليل متكامل"),
    b(
      "Join the reaction network, material balance, carbon-based conversion/selectivity/yield, reference reaction heat and product recovery in one auditable calculation.",
      "اجمع شبكة التفاعلات وموازنة المادة والتحويل والانتقائية والمردود على أساس الكربون وحرارة التفاعل المرجعية واسترجاع المنتجات في حساب قابل للمراجعة.",
    ),
    "\\mathbf n_{out}=\\mathbf n_{in}+\\mathbf N\\boldsymbol\\xi,\\quad Y_p=X S_p",
    [...network, inert, productSelect, ...recoveries, ...thermalFields],
    b("Integrated educational model", "نموذج تعليمي متكامل"),
    [
      note,
      thermoNote,
      b(
        "Carbon yield = product moles / methane feed; selectivity = product moles / methane reacted. Reaction heat is at 298.15 K. Recovery affects only the four chloromethanes; remaining gases are shown separately.",
        "المردود الكربوني = مولات المنتج / تغذية الميثان؛ الانتقائية = مولات المنتج / الميثان المتفاعل. الحرارة عند 298.15 K. يُطبّق الاسترجاع على الكلوروميثانات الأربعة، وتُعرض الغازات الأخرى منفصلة.",
      ),
    ],
  ),
];
export const groups = [
  {
    id: "A",
    name: b("Fundamental chemistry", "الكيمياء الأساسية"),
    range: "01–04",
  },
  {
    id: "B",
    name: b("Product distribution", "توزيع المنتجات"),
    range: "05–08",
  },
  { id: "C", name: b("Material balances", "موازنات المادة"), range: "09–12" },
  {
    id: "D",
    name: b("Thermal and gas analysis", "التحليل الحراري والغازي"),
    range: "13–16",
  },
  {
    id: "E",
    name: b("Separation and process", "الفصل والعمليات"),
    range: "17–20",
  },
];
export function defaults(id: number): Inputs {
  const p: Inputs = {
    unit: "kmol/h",
    methane: 1,
    chlorine: 2,
    inert: 0.5,
    x1: 0.8,
    x2: 0.35,
    x3: 0.1,
    x4: 0.02,
    mode: "extent",
    extent: 0.6,
    conversion: 0.8,
    selectivity: 0.6,
    reaction: "1",
    substrate: 1,
    species: "CH4",
    feed: 1,
    remaining: 0.2,
    compositionMode: "manual",
    pCH3Cl: 0.45,
    pCH2Cl2: 0.25,
    pCHCl3: 0.08,
    pCCl4: 0.02,
    selected: "CH3Cl",
    selectivityBasis: "fraction",
    actual: 0.5,
    target: 0.4,
    thermoMode: "reference",
    thermoSource: "",
    cpModel: "shomate",
    cpSource: "",
    temperatureUnit: "K",
    temperature: 298.15,
    tin: 298.15,
    pressure: 1,
    pressureUnit: "bar",
    stages: 3,
  };
  for (const s of ORDER) {
    p[`hf${s}`] = HF[s];
    p[`cp${s}`] = Number(cp(s, 298.15).toFixed(4));
  }
  for (const s of PRODUCTS) p[`r${s}`] = 0.9;
  for (let j = 1; j <= 5; j++) {
    p[`s${j}cl2`] = 0;
    for (let i = 1; i <= 4; i++)
      p[`s${j}x${i}`] =
        j === 1
          ? [0.5, 0.2, 0.05, 0.01][i - 1]
          : j === 2
            ? [0.2, 0.15, 0.05, 0.01][i - 1]
            : j === 3
              ? [0.1, 0.05, 0.02, 0.01][i - 1]
              : 0;
  }
  if (id === 15)
    Object.assign(p, { x1: 0.02, x2: 0.005, x3: 0.001, x4: 0, inert: 5 });
  return p;
}
export function fieldsFor(c: Calculator, p: Inputs): Field[] {
  let fs = c.fields.filter(
    (f) =>
      !(
        c.id === 1 &&
        ((f.key === "extent" && p.mode !== "extent") ||
          (f.key === "conversion" && p.mode !== "conversion"))
      ),
  );
  if (c.id === 6)
    fs = fs.filter((f) =>
      p.compositionMode === "network"
        ? !f.key.startsWith("pCH") && f.key !== "pCCl4"
        : !network.some((n) => n.key === f.key),
    );
  fs = fs
    .filter(
      (f) =>
        !(
          (f.key === "thermoSource" || f.key.startsWith("hf")) &&
          p.thermoMode !== "custom"
        ),
    )
    .filter(
      (f) =>
        !(
          (f.key === "cpSource" ||
            (f.key.startsWith("cp") && f.key !== "cpModel")) &&
          p.cpModel !== "constant"
        ),
    );
  if (c.id === 19) {
    const stages = Math.max(1, Math.min(5, Number(p.stages) || 1));
    for (let j = 1; j <= stages; j++) {
      fs.push(
        f(`s${j}cl2`, `Stage ${j} · added Cl₂`, `المرحلة ${j} · كلور إضافي`),
      );
      for (let i = 1; i <= 4; i++)
        fs.push(
          f(
            `s${j}x${i}`,
            `Stage ${j} · ξ${i}`,
            `المرحلة ${j} · ξ${i}`,
            "extent",
          ),
        );
    }
  }
  return fs;
}
