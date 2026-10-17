import {
  b,
  ScientificError,
  type Inputs,
  type CalcResult,
  type Metric,
  type Step,
  type Stream,
  type Species,
  type Table,
} from "./types";
import {
  ORDER,
  PRODUCTS,
  CARBON,
  MW,
  formula,
  reactions,
} from "../data/species";
import {
  amountToMol,
  extentScale,
  moleUnit,
  massUnit,
  heatUnit,
  unitInfo,
  toKelvin,
  toPa,
} from "./units";
import {
  num,
  positive,
  fraction,
  integer,
  ratio,
  pct,
  near,
} from "./validation";
import { fresh, emptyStream, react, checkBalance, mass } from "./network";
import { formation, reactionEnthalpies, adiabatic } from "./thermo";
const F = (x: number) => Number(x.toPrecision(8)).toString();
const m = (
  en: string,
  ar: string,
  value: Metric["value"],
  unit = "",
): Metric => ({ label: b(en, ar), value, unit });
const step = (en: string, ar: string, formula?: string): Step => ({
  text: b(en, ar),
  formula,
});
function chosen(p: Inputs): Species {
  const s = String(p.selected) as Species;
  if (!PRODUCTS.includes(s)) throw new ScientificError("reaction", "selected");
  return s;
}
const sum = (x: number[]) => x.reduce((a, z) => a + z, 0);
export function calculate(id: number, p: Inputs): CalcResult {
  if (!Number.isInteger(id) || id < 1 || id > 20)
    throw new ScientificError("unknown");
  const u = String(p.unit ?? "mol"),
    info = unitInfo(u),
    scale = extentScale(u),
    nu = moleUnit(u),
    mu = massUnit(u),
    hu = heatUnit(u);
  const n = (key: string, s: Species) => amountToMol(num(p, key), u, s);
  const x = (key: string) => num(p, key) * scale;
  const d = (v: number) => v / scale;
  const energy = (v: number) => v;
  const r: CalcResult = {
    values: {},
    metrics: [],
    tables: [],
    steps: [],
    notes: [],
    chart: [],
    chartTitle: b("Calculated amounts", "الكميات المحسوبة"),
    chartUnit: nu,
  };
  if (id !== 13)
    r.steps.push(
      step(
        `Normalize the ${info.rate ? "hourly-flow" : "amount"} basis. Feed masses use component molecular weights; extents use ${nu}.`,
        `توحيد أساس ${info.rate ? "التدفق بالساعة" : "الكمية"}. تُحوّل كتل التغذية بكتل المكونات المولية، وتستخدم الامتدادات ${nu}.`,
        "n_i=m_i/M_i",
      ),
    );
  const network = () => {
    const feed = fresh(
        n("methane", "CH4"),
        n("chlorine", "Cl2"),
        [12, 15, 20].includes(id) ? n("inert", "N2") : 0,
      ),
      xi = [1, 2, 3, 4].map((j) => x(`x${j}`)),
      out = react(feed, xi);
    return { feed, xi, out };
  };
  function addBalance(feed: Stream, out: Stream) {
    const z = checkBalance(feed, out);
    r.balance = z;
    r.stream = out;
    Object.assign(r.values, {
      inMass: z.inMass,
      outMass: z.outMass,
      massResidual: z.residual,
      closure: z.closure,
      ...out,
    });
    r.tables.push({
      title: b("Component balance", "موازنة المكونات"),
      headers: [
        b("Species", "المكوّن"),
        b(`n in (${nu})`, `مولات الدخول (${nu})`),
        b(`n out (${nu})`, `مولات الخروج (${nu})`),
        b(`m in (${mu})`, `كتلة الدخول (${mu})`),
        b(`m out (${mu})`, `كتلة الخروج (${mu})`),
      ],
      rows: ORDER.map((s) => [
        formula[s],
        d(feed[s]),
        d(out[s]),
        (feed[s] * MW[s]) / 1000,
        (out[s] * MW[s]) / 1000,
      ]),
    });
    r.tables.push({
      title: b("Elemental audit", "مراجعة العناصر"),
      headers: [
        b("Element", "العنصر"),
        b(`in (${nu} atoms)`, `دخول (${nu} ذرات)`),
        b(`out (${nu} atoms)`, `خروج (${nu} ذرات)`),
        b("Residual", "الباقي"),
      ],
      rows: Object.entries(z.elements).map(([e, q]) => [
        e,
        d(q.in),
        d(q.out),
        d(q.residual),
      ]),
    });
    r.steps.push(
      step(
        `Total inlet mass = ${F(z.inMass)} ${mu}; outlet = ${F(z.outMass)} ${mu}; residual = ${F(z.residual)} ${mu}.`,
        `الكتلة الداخلة = ${F(z.inMass)} ${mu}؛ الخارجة = ${F(z.outMass)} ${mu}؛ الباقي = ${F(z.residual)} ${mu}.`,
        "\\varepsilon_m=m_{out}-m_{in}",
      ),
    );
  }
  function addNetworkSteps(feed: Stream, xi: number[], out: Stream) {
    r.steps.push(
      step(
        `Entered extents (${nu}): ${xi.map(d).map(F).join(", ")}. Each calculated outlet must be nonnegative.`,
        `الامتدادات المدخلة (${nu}): ${xi.map(d).map(F).join(", ")}. يجب أن تكون كل كميات الخروج غير سالبة.`,
      ),
    );
    const expressions = [
      `${F(d(feed.CH4))} - ${F(d(xi[0]))}`,
      `${F(d(feed.CH3Cl))} + ${F(d(xi[0]))} - ${F(d(xi[1]))}`,
      `${F(d(feed.CH2Cl2))} + ${F(d(xi[1]))} - ${F(d(xi[2]))}`,
      `${F(d(feed.CHCl3))} + ${F(d(xi[2]))} - ${F(d(xi[3]))}`,
      `${F(d(feed.CCl4))} + ${F(d(xi[3]))}`,
      `${F(d(feed.Cl2))} - ${F(d(sum(xi)))}`,
      `${F(d(feed.HCl))} + ${F(d(sum(xi)))}`,
    ];
    ORDER.slice(0, 7).forEach((s, i) =>
      r.steps.push(
        step(
          `${formula[s]}: ${expressions[i]} = ${F(d(out[s]))} ${nu}.`,
          `${formula[s]}: ${expressions[i]} = ${F(d(out[s]))} ${nu}.`,
        ),
      ),
    );
  }
  function productAmounts() {
    const amounts = emptyStream();
    for (const s of PRODUCTS) amounts[s] = n(`p${s}`, s);
    return amounts;
  }
  function distribution(amounts: Stream) {
    const total = sum(PRODUCTS.map((s) => amounts[s])),
      totalMass = sum(PRODUCTS.map((s) => (amounts[s] * MW[s]) / 1000));
    if (total === 0) throw new ScientificError("empty");
    const mean = (totalMass * 1000) / total;
    Object.assign(r.values, {
      productTotal: total,
      productMass: totalMass,
      meanMW: mean,
    });
    for (const s of PRODUCTS) {
      r.values[`y${s}`] = amounts[s] / total;
      r.values[`w${s}`] = (amounts[s] * MW[s]) / (1000 * totalMass);
    }
    r.tables.push({
      title: b(
        "Product composition · chloromethanes only",
        "تركيب المنتجات · الكلوروميثانات فقط",
      ),
      headers: [
        b("Product", "المنتج"),
        `n (${nu})`,
        `m (${mu})`,
        b("Mole %", "مولية %"),
        b("Mass %", "كتلية %"),
      ],
      rows: PRODUCTS.map((s) => [
        formula[s],
        d(amounts[s]),
        (amounts[s] * MW[s]) / 1000,
        (100 * amounts[s]) / total,
        (100 * amounts[s] * MW[s]) / (1000 * totalMass),
      ]),
    });
    r.chart = PRODUCTS.map((s) => ({
      name: formula[s],
      value: (100 * amounts[s]) / total,
    }));
    r.chartUnit = "%";
    r.chartTitle = b("Product mole distribution", "التوزيع المولي للمنتجات");
    r.steps.push(
      step(
        `Product total = ${F(d(total))} ${nu}; mass = ${F(totalMass)} ${mu}.`,
        `مجموع المنتجات = ${F(d(total))} ${nu}؛ الكتلة = ${F(totalMass)} ${mu}.`,
        "y_i=n_i/\\sum n_j,\\quad w_i=n_iM_i/\\sum n_jM_j",
      ),
    );
    r.steps.push(
      step(
        `Mean molecular weight = ${F(mean)} g/mol.`,
        `متوسط الكتلة المولية = ${F(mean)} g/mol.`,
        "\\overline M=\\sum_i y_iM_i",
      ),
    );
    return { total, totalMass, mean };
  }
  function heat(xi: number[]) {
    const hf = formation(p),
      dh = reactionEnthalpies(hf),
      q = sum(xi.map((v, j) => v * dh[j]));
    Object.assign(r.values, { heat: q, removal: Math.max(-q, 0) });
    r.tables.push({
      title: b(
        "Reaction heat at 298.15 K · gas reference",
        "حرارة التفاعل عند 298.15 K · مرجع غازي",
      ),
      headers: [
        b("Reaction", "التفاعل"),
        `ξ (${nu})`,
        "ΔrH° (kJ/mol)",
        `Q (${hu})`,
      ],
      rows: dh.map((h, j) => [`R${j + 1}`, d(xi[j]), h, xi[j] * h]),
    });
    r.steps.push(
      step(
        `Q = ${xi.map((v, j) => `(${F(v)} × ${F(dh[j])})`).join(" + ")} = ${F(q)} ${hu}.`,
        `Q = ${xi.map((v, j) => `(${F(v)} × ${F(dh[j])})`).join(" + ")} = ${F(q)} ${hu}.`,
        "Q=\\sum_j\\xi_j\\Delta_rH_j^\\circ",
      ),
    );
    r.notes.push(
      b(
        "Heat is the reaction contribution at the gas reference state, not the actual duty of a cooling system.",
        "الحرارة تمثل مساهمة التفاعل عند المرجع الغازي، وليست حمل تبريد فعليًا.",
      ),
    );
    return { dh, q };
  }
  function recovery(amounts: Stream) {
    const recovered = emptyStream(),
      loss = emptyStream();
    for (const s of PRODUCTS) {
      const q = fraction(p, `r${s}`);
      recovered[s] = amounts[s] * q;
      loss[s] = amounts[s] - recovered[s];
      r.values[`recovered${s}`] = recovered[s];
      r.values[`loss${s}`] = loss[s];
    }
    const total = sum(PRODUCTS.map((s) => recovered[s]));
    r.values.recoveredTotal = total;
    r.tables.push({
      title: b(
        "Recovery split · entered component fractions",
        "فصل الاسترجاع · كسور المكونات المدخلة",
      ),
      headers: [
        b("Product", "المنتج"),
        b(`feed (${nu})`, `تغذية (${nu})`),
        b(`recovered (${nu})`, `مسترجع (${nu})`),
        b(`loss (${nu})`, `فاقد (${nu})`),
        b("Recovered mole %", "مولية المسترجع %"),
      ],
      rows: PRODUCTS.map((s) => [
        formula[s],
        d(amounts[s]),
        d(recovered[s]),
        d(loss[s]),
        pct(recovered[s], total),
      ]),
    });
    r.steps.push(
      step(
        `Recovered total = ${F(d(total))} ${nu}. Each component satisfies feed = recovered + loss.`,
        `إجمالي المسترجع = ${F(d(total))} ${nu}. يحقق كل مكوّن: التغذية = المسترجع + الفاقد.`,
        "n_{i,R}=r_i n_i,\\quad n_{i,L}=(1-r_i)n_i",
      ),
    );
    if (total === 0)
      r.notes.push(
        b(
          "No product is recovered; recovered-stream composition is undefined.",
          "لا يوجد منتج مسترجع؛ تركيب التيار المسترجع غير معرّف.",
        ),
      );
    return { recovered, loss, total };
  }
  switch (id) {
    case 1: {
      const a = n("methane", "CH4"),
        cl = n("chlorine", "Cl2");
      if (!["extent", "conversion"].includes(String(p.mode)))
        throw new ScientificError("range", "mode");
      const xi =
        p.mode === "conversion" ? a * fraction(p, "conversion") : x("extent");
      const feed = fresh(a, cl),
        out = react(feed, [xi, 0, 0, 0]);
      const max = Math.min(a, cl);
      Object.assign(r.values, {
        extent: xi,
        maximum: max,
        consumed: xi,
        product: xi,
        hcl: xi,
        conversion: ratio(xi, a),
      });
      r.metrics = [
        m("CH₃Cl produced", "إنتاج CH₃Cl", d(xi), nu),
        m("HCl produced", "إنتاج HCl", d(xi), nu),
        m("Methane conversion", "تحويل الميثان", pct(xi, a), "%"),
        m(
          "Limiting reactant",
          "المتفاعل المحدد",
          near(a, cl) ? "CH₄ + Cl₂" : a < cl ? "CH₄" : "Cl₂",
        ),
      ];
      r.steps.push(
        step(
          `Maximum extent = min(${F(d(a))}, ${F(d(cl))}) = ${F(d(max))} ${nu}. Selected extent = ${F(d(xi))} ${nu}.`,
          `الامتداد الأقصى = min(${F(d(a))}, ${F(d(cl))}) = ${F(d(max))} ${nu}. الامتداد المختار = ${F(d(xi))} ${nu}.`,
          "\\xi=X_{CH_4}n_{CH_4,in}",
        ),
      );
      addNetworkSteps(feed, [xi, 0, 0, 0], out);
      addBalance(feed, out);
      r.chart = [
        { name: "CH₄", value: d(out.CH4) },
        { name: "Cl₂", value: d(out.Cl2) },
        { name: "CH₃Cl", value: d(xi) },
        { name: "HCl", value: d(xi) },
      ];
      break;
    }
    case 2: {
      const a = n("methane", "CH4"),
        cl = n("chlorine", "Cl2"),
        extent = x("extent");
      if (a + cl === 0) throw new ScientificError("empty");
      if (extent > a && !near(extent, a))
        throw new ScientificError("overdraw", "CH4");
      Object.assign(r.values, {
        ratio: ratio(cl, a),
        inverse: ratio(a, cl),
        methaneFraction: a / (a + cl),
        chlorineFraction: cl / (a + cl),
        required: extent,
        deficit: Math.max(extent - cl, 0),
      });
      r.metrics = [
        m("Cl₂ / CH₄", "Cl₂ / CH₄", r.values.ratio, "mol/mol"),
        m("CH₄ / Cl₂", "CH₄ / Cl₂", r.values.inverse, "mol/mol"),
        m(
          "Theoretical Cl₂ requirement",
          "الاحتياج النظري لـCl₂",
          d(extent),
          nu,
        ),
        m(
          "Cl₂ shortfall for selected extent",
          "عجز Cl₂ للامتداد المختار",
          d(Math.max(extent - cl, 0)),
          nu,
        ),
      ];
      r.steps.push(
        step(
          `Cl₂/CH₄ = ${F(d(cl))}/${F(d(a))}; feed total = ${F(d(a + cl))} ${nu}.`,
          `Cl₂/CH₄ = ${F(d(cl))}/${F(d(a))}؛ مجموع التغذية = ${F(d(a + cl))} ${nu}.`,
          "y_i=n_i/(n_{CH_4}+n_{Cl_2})",
        ),
      );
      r.steps.push(
        step(
          `For first substitution, theoretical Cl₂ = ξ = ${F(d(extent))} ${nu}.`,
          `في الاستبدال الأول: كمية Cl₂ النظرية = ξ = ${F(d(extent))} ${nu}.`,
        ),
      );
      r.chart = [
        { name: "CH₄", value: (100 * a) / (a + cl) },
        { name: "Cl₂", value: (100 * cl) / (a + cl) },
      ];
      r.chartUnit = "%";
      r.chartTitle = b("Feed mole composition", "التركيب المولي للتغذية");
      r.notes.push(
        b(
          "Feed ratio alone predicts neither product distribution nor safe operating conditions.",
          "نسبة التغذية وحدها لا تتنبأ بتوزيع المنتجات أو بظروف تشغيل آمنة.",
        ),
      );
      break;
    }
    case 3: {
      const j = integer(p, "reaction", 1, 4) - 1,
        s = CARBON[j],
        product = CARBON[j + 1],
        a = n("substrate", s),
        cl = n("chlorine", "Cl2"),
        xi = Math.min(a, cl);
      const feed = emptyStream();
      feed[s] = a;
      feed.Cl2 = cl;
      const xis = [0, 0, 0, 0];
      xis[j] = xi;
      const out = react(feed, xis);
      Object.assign(r.values, {
        maximum: xi,
        product: xi,
        hcl: xi,
        substrateRemaining: a - xi,
        chlorineRemaining: cl - xi,
      });
      r.metrics = [
        m("Maximum theoretical product", "أقصى منتج نظري", d(xi), nu),
        m(
          "Limiting reactant",
          "المتفاعل المحدد",
          near(a, cl) ? `${formula[s]} + Cl₂` : a < cl ? formula[s] : "Cl₂",
        ),
        m(
          "Excess reactant",
          "المتفاعل الفائض",
          near(a, cl) ? "—" : a < cl ? "Cl₂" : formula[s],
        ),
        m(
          `${formula[product]} mass`,
          `كتلة ${formula[product]}`,
          (xi * MW[product]) / 1000,
          mu,
        ),
      ];
      r.steps.push(
        step(reactions[j], reactions[j]),
        step(
          `ξmax = min(${F(d(a))}, ${F(d(cl))}) = ${F(d(xi))} ${nu}.`,
          `ξmax = min(${F(d(a))}, ${F(d(cl))}) = ${F(d(xi))} ${nu}.`,
        ),
      );
      addBalance(feed, out);
      r.chart = [
        { name: formula[s], value: d(a - xi) },
        { name: "Cl₂", value: d(cl - xi) },
        { name: formula[product], value: d(xi) },
        { name: "HCl", value: d(xi) },
      ];
      break;
    }
    case 4: {
      const s = String(p.species) as Species;
      if (!["CH4", "Cl2"].includes(s))
        throw new ScientificError("reaction", "species");
      const feed = n("feed", s),
        remaining = n("remaining", s);
      if (feed === 0) throw new ScientificError("empty", "feed");
      if (remaining > feed && !near(feed, remaining))
        throw new ScientificError("conversion");
      const consumed = Math.max(feed - remaining, 0),
        conversion = consumed / feed;
      Object.assign(r.values, { feed, remaining, consumed, conversion });
      r.metrics = [
        m("Reactant conversion", "تحويل المتفاعل", conversion * 100, "%"),
        m("Consumed reactant", "المتفاعل المستهلك", d(consumed), nu),
        m("Unreacted feed", "التغذية غير المتفاعلة", d(remaining), nu),
        m(
          "Species balance residual",
          "باقي موازنة المكوّن",
          d(feed - consumed - remaining),
          nu,
        ),
      ];
      r.steps.push(
        step(
          `Consumed = ${F(d(feed))} − ${F(d(remaining))} = ${F(d(consumed))} ${nu}.`,
          `المستهلك = ${F(d(feed))} − ${F(d(remaining))} = ${F(d(consumed))} ${nu}.`,
        ),
        step(
          `X = ${F(d(consumed))}/${F(d(feed))} = ${F(conversion)}.`,
          `X = ${F(d(consumed))}/${F(d(feed))} = ${F(conversion)}.`,
          "X=(n_{in}-n_{out})/n_{in}",
        ),
      );
      r.chart = [
        { name: "X", value: 100 * conversion },
        { name: "1−X", value: 100 * (1 - conversion) },
      ];
      r.chartUnit = "%";
      r.chartTitle = b(
        "Consumed and unreacted fractions",
        "كسرا المستهلك وغير المتفاعل",
      );
      r.tables = [
        {
          title: b("Reactant account", "موازنة المتفاعل"),
          headers: [
            b("Species", "المكوّن"),
            b(`in (${nu})`, `دخول (${nu})`),
            b(`consumed (${nu})`, `مستهلك (${nu})`),
            b(`out (${nu})`, `خروج (${nu})`),
          ],
          rows: [[formula[s], d(feed), d(consumed), d(remaining)]],
        },
      ];
      break;
    }
    case 5:
    case 9:
    case 10:
    case 12:
    case 14:
    case 15:
    case 20: {
      const { feed, xi, out } = network();
      const used = sum(xi),
        conversion = ratio(xi[0], feed.CH4);
      Object.assign(r.values, { consumed: used, hcl: used, conversion });
      addNetworkSteps(feed, xi, out);
      addBalance(feed, out);
      r.chart = ORDER.filter((s) => s !== "N2" || out.N2 > 0).map((s) => ({
        name: formula[s],
        value: d(out[s]),
      }));
      r.chartTitle = b("Outlet component amounts", "كميات المكونات عند الخروج");
      r.metrics = [
        m("Methane conversion", "تحويل الميثان", pct(xi[0], feed.CH4), "%"),
        m("Cl₂ consumed", "استهلاك Cl₂", d(used), nu),
        m("HCl formed", "تكوّن HCl", d(used), nu),
        m("Mass closure", "إغلاق موازنة الكتلة", r.balance!.closure, "%"),
      ];
      if (id === 9 || id === 10) {
        r.tables.unshift({
          title: b("Contribution by reaction", "المساهمة حسب التفاعل"),
          headers: [
            b("Reaction", "التفاعل"),
            `${id === 9 ? "Cl₂" : "HCl"} (${nu})`,
            `${id === 9 ? "Cl₂" : "HCl"} (${mu})`,
          ],
          rows: xi.map((v, i) => [
            `R${i + 1}`,
            d(v),
            (v * MW[id === 9 ? "Cl2" : "HCl"]) / 1000,
          ]),
        });
        r.chart = xi.map((v, i) => ({ name: `R${i + 1}`, value: d(v) }));
        r.chartTitle =
          id === 9
            ? b(
                "Chlorine consumption by reaction",
                "استهلاك الكلور حسب التفاعل",
              )
            : b("HCl formation by reaction", "تكوّن HCl حسب التفاعل");
        r.metrics =
          id === 9
            ? [
                m("Cl₂ consumed", "استهلاك Cl₂", d(used), nu),
                m("Cl₂ remaining", "Cl₂ المتبقي", d(out.Cl2), nu),
                m(
                  "Chlorine utilization",
                  "استغلال الكلور",
                  pct(used, feed.Cl2),
                  "%",
                ),
                m(
                  "Cl₂ mass consumed",
                  "كتلة Cl₂ المستهلكة",
                  (used * MW.Cl2) / 1000,
                  mu,
                ),
              ]
            : [
                m("HCl formation", "تكوّن HCl", d(used), nu),
                m("HCl mass", "كتلة HCl", (used * MW.HCl) / 1000, mu),
                m(
                  info.rate ? "HCl production rate" : "HCl amount",
                  info.rate ? "معدل إنتاج HCl" : "كمية HCl",
                  d(used),
                  nu,
                ),
                m("Reaction contributions", "مساهمات التفاعلات", 4),
              ];
      }
      if (id === 12)
        r.metrics = [
          m("Mass closure", "إغلاق موازنة الكتلة", r.balance!.closure, "%"),
          m("Inlet mass", "الكتلة الداخلة", r.balance!.inMass, mu),
          m("Outlet mass", "الكتلة الخارجة", r.balance!.outMass, mu),
          m("Mass residual", "باقي موازنة الكتلة", r.balance!.residual, mu),
        ];
      if (id === 14) {
        const { dh, q } = heat(xi);
        r.metrics = [
          m("Reference reaction heat", "حرارة التفاعل المرجعية", energy(q), hu),
          m(
            "Ideal isothermal heat removal",
            "إزالة الحرارة النظرية متساوية الحرارة",
            Math.max(-q, 0),
            hu,
          ),
          ...(info.rate
            ? [m("Reaction heat rate", "معدل حرارة التفاعل", q / 3600, "kW")]
            : []),
          m("Reference temperature", "الحرارة المرجعية", 298.15, "K"),
        ];
        r.chart = dh.map((h, j) => ({ name: `R${j + 1}`, value: xi[j] * h }));
        r.chartUnit = hu;
        r.chartTitle = b(
          "Reaction heat contributions",
          "مساهمات حرارة التفاعل",
        );
      }
      if (id === 15) {
        const tin = toKelvin(
            num(p, "tin", -273.15, 10000),
            String(p.temperatureUnit),
          ),
          a = adiabatic(feed, out, tin, p);
        Object.assign(r.values, {
          temperature: a.T,
          temperatureChange: a.delta,
          energyResidual: a.residual,
          Hin: a.Hin,
          Hout: a.Hout,
        });
        r.metrics = [
          m(
            "Estimated adiabatic outlet",
            "درجة الخروج الأدياباتية المقدّرة",
            a.T,
            "K",
          ),
          m("Temperature change", "التغيّر الحراري", a.delta, "K"),
          m("Energy residual", "باقي موازنة الطاقة", a.residual, hu),
          m("Outlet temperature", "درجة حرارة الخروج", a.T - 273.15, "°C"),
        ];
        r.steps.push(
          step(
            `Hin = ${F(a.Hin)} ${hu}. Bisection on 298.15–1000 K gives T = ${F(a.T)} K and Hout = ${F(a.Hout)} ${hu}.`,
            `Hin = ${F(a.Hin)} ${hu}. يعطي التنصيف العددي في 298.15–1000 K درجة T = ${F(a.T)} K وHout = ${F(a.Hout)} ${hu}.`,
            "h_i(T)=\\Delta_fH_i^\\circ+\\int_{298.15}^{T}C_{p,i}(T)\\,dT",
          ),
        );
        r.chart = a.curve;
        r.chartType = "line";
        r.chartUnit = hu;
        r.chartTitle = b(
          "Enthalpy residual vs temperature (K)",
          "باقي الإنثالبي مقابل درجة الحرارة (K)",
        );
      }
      if (id === 20) {
        const s = chosen(p),
          selectivity = ratio(out[s], xi[0]),
          yield_ = ratio(out[s], feed.CH4);
        Object.assign(r.values, { selectivity, yield: yield_ });
        if (sum(PRODUCTS.map((s) => out[s])) > 0) distribution(out);
        else
          r.notes.push(
            b(
              "No chloromethane products; product distribution and selectivity are undefined.",
              "لا توجد منتجات كلوروميثان؛ توزيع المنتجات والانتقائية غير معرّفين.",
            ),
          );
        const { dh, q } = heat(xi);
        const rec = recovery(out);
        r.metrics = [
          m(
            "Methane conversion X",
            "تحويل الميثان X",
            conversion === null ? null : 100 * conversion,
            "%",
          ),
          m(
            `${formula[s]} selectivity S`,
            `انتقائية ${formula[s]} S`,
            selectivity === null ? null : 100 * selectivity,
            "%",
          ),
          m(
            `${formula[s]} carbon yield Y`,
            `المردود الكربوني لـ${formula[s]} Y`,
            yield_ === null ? null : 100 * yield_,
            "%",
          ),
          m("Reference reaction heat", "حرارة التفاعل المرجعية", q, hu),
          m("HCl formed", "تكوّن HCl", d(used), nu),
          m("Recovered products", "المنتجات المسترجعة", d(rec.total), nu),
          m("Chlorine utilization", "استغلال الكلور", pct(used, feed.Cl2), "%"),
          m("Mass closure", "إغلاق موازنة الكتلة", r.balance!.closure, "%"),
        ];
        r.extraCharts = [
          {
            data: dh.map((h, j) => ({ name: `R${j + 1}`, value: xi[j] * h })),
            title: b("Reference reaction heat", "حرارة التفاعل المرجعية"),
            unit: hu,
          },
          {
            data: [
              { name: "X", value: 100 * (conversion ?? 0) },
              { name: "S", value: 100 * (selectivity ?? 0) },
              { name: "Y", value: 100 * (yield_ ?? 0) },
            ],
            title: b(
              "Carbon accounting (undefined metrics omitted)",
              "حساب الكربون (تُستبعد القيم غير المعرّفة)",
            ),
            unit: "%",
          },
        ];
        r.extraCharts[1].data = r.extraCharts[1].data.filter(
          (v, i) => [conversion, selectivity, yield_][i] !== null,
        );
        r.steps.push(
          step(
            `S = n(${formula[s]}) / ξ₁; Y = n(${formula[s]}) / n(CH₄,in). The identity Y = X × S holds when ξ₁ > 0.`,
            `S = n(${formula[s]}) / ξ₁؛ Y = n(${formula[s]}) / n(CH₄,in). تتحقق العلاقة Y = X × S عندما ξ₁ > 0.`,
          ),
        );
      }
      break;
    }
    case 6:
    case 7:
    case 17: {
      let amounts: Stream;
      if (id === 6 && p.compositionMode === "network") {
        const a = network();
        amounts = a.out;
        addNetworkSteps(a.feed, a.xi, a.out);
      } else {
        if (id === 6 && p.compositionMode !== "manual")
          throw new ScientificError("range");
        amounts = productAmounts();
      }
      const q = distribution(amounts);
      r.metrics = [
        m("Mean molecular weight", "متوسط الكتلة المولية", q.mean, "g/mol"),
        m("Total product amount", "إجمالي كمية المنتجات", d(q.total), nu),
        m("Total product mass", "إجمالي كتلة المنتجات", q.totalMass, mu),
        m(
          "Mole-fraction sum",
          "مجموع الكسور المولية",
          sum(PRODUCTS.map((s) => amounts[s] / q.total)),
        ),
      ];
      if (id === 7) {
        const s = chosen(p),
          frac = amounts[s] / q.total,
          others = q.total - amounts[s],
          rat = ratio(amounts[s], others);
        if (!["fraction", "ratio"].includes(String(p.selectivityBasis)))
          throw new ScientificError("range");
        Object.assign(r.values, {
          selectivity: frac,
          selectivityRatio: rat,
          selected: amounts[s],
        });
        r.metrics = [
          m(
            "Selected selectivity",
            "الانتقائية المختارة",
            p.selectivityBasis === "ratio" ? rat : frac * 100,
            p.selectivityBasis === "ratio" ? "mol/mol" : "%",
          ),
          m("Product fraction", "كسر المنتج", 100 * frac, "%"),
          m(
            "Desired / other products",
            "المرغوب / المنتجات الأخرى",
            rat,
            "mol/mol",
          ),
          m("Selected product", "المنتج المختار", d(amounts[s]), nu),
        ];
        r.steps.push(
          step(
            `Selected product = ${F(d(amounts[s]))} ${nu}; other products = ${F(d(others))} ${nu}.`,
            `المنتج المختار = ${F(d(amounts[s]))} ${nu}؛ المنتجات الأخرى = ${F(d(others))} ${nu}.`,
            "S_f=n_p/n_{total},\\quad S_r=n_p/n_{other}",
          ),
        );
        if (others === 0)
          r.notes.push(
            b(
              "Desired/other ratio is undefined because no other product is present.",
              "نسبة المرغوب إلى غيره غير معرّفة لعدم وجود منتجات أخرى.",
            ),
          );
      }
      break;
    }
    case 8: {
      const a = n("methane", "CH4"),
        cl = n("chlorine", "Cl2"),
        s = chosen(p),
        k = PRODUCTS.indexOf(s) + 1,
        actual = n("actual", s),
        theoretical = Math.min(a, cl / k);
      if (theoretical === 0) throw new ScientificError("empty");
      if (actual > theoretical && !near(actual, theoretical))
        throw new ScientificError("yield");
      const y = actual / theoretical;
      Object.assign(r.values, {
        actual,
        theoretical,
        yield: y,
        productMass: (actual * MW[s]) / 1000,
        feedYield: ratio(actual, a),
      });
      r.metrics = [
        m("Percentage yield", "المردود المئوي", 100 * y, "%"),
        m("Theoretical product", "كمية المنتج النظرية", d(theoretical), nu),
        m("Actual product", "كمية المنتج الفعلية", d(actual), nu),
        m(
          "Actual product mass",
          "كتلة المنتج الفعلية",
          (actual * MW[s]) / 1000,
          mu,
        ),
      ];
      r.steps.push(
        step(
          `CH₄ + ${k} Cl₂ → ${formula[s]} + ${k} HCl.`,
          `CH₄ + ${k} Cl₂ → ${formula[s]} + ${k} HCl.`,
        ),
        step(
          `Theoretical = min(${F(d(a))}, ${F(d(cl))}/${k}) = ${F(d(theoretical))} ${nu}.`,
          `النظري = min(${F(d(a))}, ${F(d(cl))}/${k}) = ${F(d(theoretical))} ${nu}.`,
        ),
        step(
          `Yield = ${F(d(actual))}/${F(d(theoretical))} = ${F(100 * y)}%.`,
          `المردود = ${F(d(actual))}/${F(d(theoretical))} = ${F(100 * y)}%.`,
        ),
      );
      r.chart = [
        { name: formula[s], value: d(actual) },
        { name: "max", value: d(theoretical) },
      ];
      r.chartTitle = b(
        "Actual and theoretical product",
        "الإنتاج الفعلي والنظري",
      );
      r.notes.push(
        b(
          "This yield uses the pure-selected-product theoretical maximum. Conversion and selectivity cannot be inferred from actual product amount alone.",
          "يستخدم هذا المردود أقصى إنتاج نظري للمنتج المختار وحده. لا يمكن استنتاج التحويل والانتقائية من كميته الفعلية وحدها.",
        ),
      );
      break;
    }
    case 11: {
      const s = chosen(p),
        target = n("target", s),
        X = fraction(p, "conversion"),
        S = fraction(p, "selectivity");
      if (X === 0 || S === 0)
        throw new ScientificError("empty", "conversion/selectivity");
      const feed = target / (X * S),
        reacted = feed * X,
        unreacted = feed - reacted;
      Object.assign(r.values, {
        target,
        feed,
        reacted,
        unreacted,
        conversion: X,
        selectivity: S,
      });
      r.metrics = [
        m("Required methane feed", "تغذية الميثان المطلوبة", d(feed), nu),
        m("Methane reacted", "الميثان المتفاعل", d(reacted), nu),
        m("Unreacted methane", "الميثان غير المتفاعل", d(unreacted), nu),
        m(
          "Methane feed mass",
          "كتلة تغذية الميثان",
          (feed * MW.CH4) / 1000,
          mu,
        ),
      ];
      r.steps.push(
        step(
          `Target ${formula[s]} = ${F(d(target))} ${nu}, X = ${F(X)}, S = ${F(S)}.`,
          `هدف ${formula[s]} = ${F(d(target))} ${nu}، X = ${F(X)}، S = ${F(S)}.`,
        ),
        step(
          `Methane feed = ${F(d(target))}/(${F(X)} × ${F(S)}) = ${F(d(feed))} ${nu}.`,
          `تغذية الميثان = ${F(d(target))}/(${F(X)} × ${F(S)}) = ${F(d(feed))} ${nu}.`,
          "n_{CH_4,in}=n_{p,target}/(XS)",
        ),
        step(
          `Reacted = feed × X = ${F(d(reacted))}; remaining = feed × (1−X) = ${F(d(unreacted))} ${nu}.`,
          `المتفاعل = التغذية × X = ${F(d(reacted))}؛ المتبقي = التغذية × (1−X) = ${F(d(unreacted))} ${nu}.`,
        ),
      );
      r.chart = [
        { name: "CH₄ in", value: d(feed) },
        { name: "CH₄ reacted", value: d(reacted) },
        { name: "CH₄ out", value: d(unreacted) },
        { name: formula[s], value: d(target) },
      ];
      r.chartTitle = b("Methane feed account", "موازنة تغذية الميثان");
      break;
    }
    case 13: {
      const hf = formation(p),
        dh = reactionEnthalpies(hf),
        j = integer(p, "reaction", 1, 4) - 1;
      dh.forEach((h, i) => (r.values[`dh${i + 1}`] = h));
      r.values.enthalpy = dh[j];
      r.metrics = [
        m(
          "Selected reaction enthalpy",
          "إنثالبي التفاعل المختار",
          dh[j],
          "kJ/mol",
        ),
        m("Reference temperature", "درجة الحرارة المرجعية", 298.15, "K"),
        m("Reference phase", "الطور المرجعي", "g"),
        m("Reactions evaluated", "التفاعلات المحسوبة", 4),
      ];
      r.tables = [
        {
          title: b(
            "Gas formation enthalpies · 298.15 K",
            "إنثالبيات التكوين الغازية · 298.15 K",
          ),
          headers: [b("Species", "المكوّن"), "ΔfH° (kJ/mol)"],
          rows: ORDER.map((s) => [formula[s], hf[s]]),
        },
        {
          title: b("Reaction enthalpies", "إنثالبيات التفاعل"),
          headers: [b("Reaction", "التفاعل"), "ΔrH° (kJ/mol)"],
          rows: dh.map((h, i) => [`R${i + 1} · ${reactions[i]}`, h]),
        },
      ];
      dh.forEach((h, i) =>
        r.steps.push(
          step(
            `R${i + 1}: ${F(hf[CARBON[i + 1]])} + (${F(hf.HCl)}) − (${F(hf[CARBON[i]])}) − (${F(hf.Cl2)}) = ${F(h)} kJ/mol.`,
            `R${i + 1}: ${F(hf[CARBON[i + 1]])} + (${F(hf.HCl)}) − (${F(hf[CARBON[i]])}) − (${F(hf.Cl2)}) = ${F(h)} kJ/mol.`,
          ),
        ),
      );
      r.chart = dh.map((h, i) => ({ name: `R${i + 1}`, value: h }));
      r.chartUnit = "kJ/mol";
      r.chartTitle = b(
        "Standard reaction enthalpies",
        "إنثالبيات التفاعل القياسية",
      );
      break;
    }
    case 16: {
      const feed = fresh(
          n("methane", "CH4"),
          n("chlorine", "Cl2"),
          n("inert", "N2"),
        ),
        total = sum(Object.values(feed));
      if (total === 0) throw new ScientificError("empty");
      const T = toKelvin(
        num(p, "temperature", -273.15, 10000),
        String(p.temperatureUnit),
      );
      if (T <= 0) throw new ScientificError("range", "temperature");
      const P = toPa(positive(p, "pressure"), String(p.pressureUnit));
      const mw = (mass(feed) * 1000) / total,
        volume = (total * 8.31446261815324 * T) / P;
      Object.assign(r.values, {
        total,
        meanMW: mw,
        volume,
        temperature: T,
        pressure: P,
        methaneFraction: feed.CH4 / total,
        chlorineFraction: feed.Cl2 / total,
        inertFraction: feed.N2 / total,
      });
      r.metrics = [
        m(
          "Ideal gas volume",
          "حجم الغاز المثالي",
          volume,
          info.rate ? "m³/h" : "m³",
        ),
        m("Total gas amount", "إجمالي كمية الغاز", d(total), nu),
        m("Mean molecular weight", "متوسط الكتلة المولية", mw, "g/mol"),
        m("Nitrogen mole fraction", "الكسر المولي للنيتروجين", feed.N2 / total),
      ];
      r.tables = [
        {
          title: b("Feed gas composition", "تركيب غاز التغذية"),
          headers: [
            b("Species", "المكوّن"),
            `n (${nu})`,
            b("Mole fraction", "الكسر المولي"),
            `m (${mu})`,
          ],
          rows: (["CH4", "Cl2", "N2"] as Species[]).map((s) => [
            formula[s],
            d(feed[s]),
            feed[s] / total,
            (feed[s] * MW[s]) / 1000,
          ]),
        },
      ];
      r.steps.push(
        step(
          `Total = ${F(total)} ${info.rate ? "mol/h" : "mol"}, T = ${F(T)} K, P = ${F(P)} Pa.`,
          `المجموع = ${F(total)} ${info.rate ? "mol/h" : "mol"}، T = ${F(T)} K، P = ${F(P)} Pa.`,
        ),
        step(
          `V = ${F(total)} × 8.314462618 × ${F(T)} / ${F(P)} = ${F(volume)} ${info.rate ? "m³/h" : "m³"}.`,
          `V = ${F(total)} × 8.314462618 × ${F(T)} / ${F(P)} = ${F(volume)} ${info.rate ? "m³/h" : "m³"}.`,
          "V=nRT/P",
        ),
      );
      r.chart = (["CH4", "Cl2", "N2"] as Species[]).map((s) => ({
        name: formula[s],
        value: (100 * feed[s]) / total,
      }));
      r.chartUnit = "%";
      r.chartTitle = b("Gas mole composition", "التركيب المولي للغاز");
      break;
    }
    case 18: {
      const amounts = productAmounts(),
        total = sum(PRODUCTS.map((s) => amounts[s]));
      if (total === 0) throw new ScientificError("empty");
      const rec = recovery(amounts),
        s = chosen(p);
      Object.assign(r.values, {
        feed: amounts[s],
        recovered: rec.recovered[s],
        loss: rec.loss[s],
        recovery: fraction(p, `r${s}`),
        recoveryMassResidual:
          mass(amounts) - mass(rec.recovered) - mass(rec.loss),
      });
      r.metrics = [
        m(
          `${formula[s]} recovered`,
          `${formula[s]} المسترجع`,
          d(rec.recovered[s]),
          nu,
        ),
        m(`${formula[s]} loss`, `${formula[s]} الفاقد`, d(rec.loss[s]), nu),
        m(
          "Selected recovery efficiency",
          "كفاءة الاسترجاع المختارة",
          100 * fraction(p, `r${s}`),
          "%",
        ),
        m(
          "Recovery mass residual",
          "باقي موازنة كتلة الاسترجاع",
          r.values.recoveryMassResidual,
          mu,
        ),
      ];
      r.chart = PRODUCTS.map((s) => ({
        name: formula[s],
        value: d(rec.recovered[s]),
      }));
      r.chartTitle = b("Recovered product amounts", "كميات المنتجات المسترجعة");
      break;
    }
    case 19: {
      const stages = integer(p, "stages", 1, 5),
        feed = fresh(
          n("methane", "CH4"),
          n("chlorine", "Cl2"),
          n("inert", "N2"),
        );
      let current = { ...feed },
        added = 0;
      const rows: Table["rows"] = [];
      rows.push(["0", 0, ...ORDER.map((s) => d(current[s]))]);
      for (let j = 1; j <= stages; j++) {
        const add = n(`s${j}cl2`, "Cl2");
        added += add;
        const input = { ...current, Cl2: current.Cl2 + add };
        const xis = [1, 2, 3, 4].map((i) => x(`s${j}x${i}`));
        try {
          current = react(input, xis);
        } catch (e) {
          if (e instanceof ScientificError)
            throw new ScientificError("stage", `${j}: ${e.field}`);
          throw e;
        }
        rows.push([String(j), d(add), ...ORDER.map((s) => d(current[s]))]);
        r.steps.push(
          step(
            `Stage ${j}: add ${F(d(add))} ${nu} of Cl₂; extents (${nu}) = ${xis.map(d).map(F).join(", ")}.`,
            `المرحلة ${j}: إضافة ${F(d(add))} ${nu} من Cl₂؛ الامتدادات (${nu}) = ${xis.map(d).map(F).join(", ")}.`,
          ),
        );
      }
      const external = { ...feed, Cl2: feed.Cl2 + added };
      addBalance(external, current);
      Object.assign(r.values, {
        stages,
        addedChlorine: added,
        conversion: ratio(feed.CH4 - current.CH4, feed.CH4),
      });
      r.tables.unshift({
        title: b(
          "Stage outlets · stage 0 is initial feed",
          "مخارج المراحل · المرحلة 0 هي التغذية الأولية",
        ),
        headers: [
          b("Stage", "المرحلة"),
          `Cl₂ added (${nu})`,
          ...ORDER.map((s) => `${formula[s]} (${nu})`),
        ],
        rows,
      });
      r.metrics = [
        m(
          "Overall methane conversion",
          "تحويل الميثان الكلي",
          pct(feed.CH4 - current.CH4, feed.CH4),
          "%",
        ),
        m("Reaction stages", "مراحل التفاعل", stages),
        m("Additional chlorine feed", "تغذية الكلور الإضافية", d(added), nu),
        m(
          "Overall mass closure",
          "إغلاق موازنة الكتلة الكلية",
          r.balance!.closure,
          "%",
        ),
      ];
      r.chart = rows.map((row) => ({
        name: `S${row[0]}`,
        value: Number(row[2]),
      }));
      r.chartTitle = b(
        "Methane remaining by stage",
        "الميثان المتبقي حسب المرحلة",
      );
      r.extraCharts = [
        {
          data: PRODUCTS.map((s) => ({
            name: formula[s],
            value: d(current[s]),
          })),
          title: b("Final stage products", "منتجات المرحلة الأخيرة"),
          unit: nu,
        },
      ];
      break;
    }
  }
  if (!r.tables.length && r.chart.length)
    r.tables.push({
      title: r.chartTitle,
      headers: [b("Component", "المكوّن"), r.chartUnit],
      rows: r.chart.map((p) => [p.name, p.value]),
    });
  if (p.thermoMode === "custom" && [13, 14, 15, 20].includes(id))
    r.notes.push(
      b(
        `User-supplied gas data: ${String(p.thermoSource)}`,
        `بيانات غازية يحددها المستخدم: ${String(p.thermoSource)}`,
      ),
    );
  if (p.cpModel === "constant" && id === 15)
    r.notes.push(
      b(
        `Custom constant Cp approximation: ${String(p.cpSource)}`,
        `تقريب Cp ثابتة مخصصة: ${String(p.cpSource)}`,
      ),
    );
  if (
    r.metrics.some(
      (v) => typeof v.value === "number" && !Number.isFinite(v.value),
    )
  )
    throw new ScientificError("number");
  if (r.metrics.some((v) => v.value === null))
    r.notes.push(
      b(
        "An em dash (—) denotes an undefined ratio or composition, usually because its denominator is zero.",
        "تشير الشرطة (—) إلى نسبة أو تركيب غير معرّف، غالبًا بسبب مقام يساوي صفرًا.",
      ),
    );
  return r;
}
