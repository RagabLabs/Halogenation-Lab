import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  FlaskConical,
  Sun,
  Moon,
  Languages,
  Menu,
  X,
  Search,
  Calculator as CalcIcon,
  Download,
  Printer,
  FileJson,
  RotateCcw,
  Play,
  Upload,
  Check,
  ChevronRight,
  BookOpen,
  Network,
  GitBranch,
  Info,
  ExternalLink,
} from "lucide-react";
import {
  calculators,
  groups,
  defaults,
  fieldsFor,
  type Calculator,
  type Field,
} from "./data/calculators";
import { ui, errors } from "./data/ui";
import {
  ORDER,
  PRODUCTS,
  MW,
  HF,
  names,
  formula,
  nist,
  reactions,
  SHOMATE,
} from "./data/species";
import {
  b,
  tr,
  ScientificError,
  type B,
  type Inputs,
  type Lang,
  type CalcResult,
} from "./engine/types";
import { calculate } from "./engine/calculate";
import { UNITS } from "./engine/units";
import { convertInputs } from "./engine/convert-inputs";
import { Blueprint, ProcessDiagram } from "./components/Blueprint";
import { Equation } from "./components/Equation";
import { Molecule } from "./components/Molecule";
import { ResultChart } from "./components/ResultChart";
import {
  format,
  download,
  csvReport,
  caseReport,
  htmlReport,
  parseCase,
  fieldUnit,
  displayInput,
} from "./reports/exports";
const safeGet = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const safeSet = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* Device storage is optional. */
  }
};
const initialPath = () => location.hash.slice(1) || "/";
function TitleMark() {
  return (
    <span className="brand-symbol" aria-hidden="true">
      <svg viewBox="0 0 44 44">
        <path d="M22 3V11 M22 33V41 M3 22H11 M33 22H41" />
        <circle cx="22" cy="22" r="13" />
        <path d="M17 28V16H22 M22 16V28H28" />
      </svg>
    </span>
  );
}
function Header({
  lang,
  setLang,
  dark,
  setDark,
  path,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  path: string;
}) {
  const [open, setOpen] = useState(false),
    t = (x: B) => tr(x, lang);
  useEffect(() => setOpen(false), [path]);
  const links = [
    ["/", ui.home],
    ["/tools", ui.tools],
    ["/network", ui.network],
    ["/process", ui.process],
    ["/science", ui.science],
  ] as [string, B][];
  return (
    <header className="app-header">
      <div className="header-inner">
        <a href="#/" className="brand" aria-label="Halogenation Lab home">
          <TitleMark />
          <span>
            Halogenation
            <span className="brand-lab">
              Lab <small>RAGABLABS</small>
            </span>
          </span>
        </a>
        <nav
          className={open ? "main-nav is-open" : "main-nav"}
          aria-label={t(ui.menu)}
        >
          {links.map(([url, label]) => (
            <a
              key={url}
              href={`#${url}`}
              className={
                path === url ||
                (url === "/tools" && path.startsWith("/calculator"))
                  ? "active"
                  : ""
              }
            >
              {t(label)}
            </a>
          ))}
        </nav>
        <div className="header-controls">
          <button
            type="button"
            className="lang-button"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
          >
            <Languages size={19} />
            {lang === "en" ? "العربية" : "English"}
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={t(ui.dark)}
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={21} /> : <Moon size={21} />}
          </button>
          <button
            type="button"
            className="icon-button mobile-menu"
            aria-label={open ? t(ui.close) : t(ui.menu)}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
    </header>
  );
}
function ToolCard({ c, lang }: { c: Calculator; lang: Lang }) {
  return (
    <a className="tool-card" href={`#/calculator/${c.id}`}>
      <div className="card-meta">
        <span className="tool-number">{String(c.id).padStart(2, "0")}</span>
        <span>{tr(c.short, lang)}</span>
        <ArrowUpRight size={22} />
      </div>
      <h3>{tr(c.title, lang)}</h3>
      <span className="card-model">{tr(c.model, lang)}</span>
    </a>
  );
}
function Home({ lang }: { lang: Lang }) {
  const t = (x: B) => tr(x, lang);
  return (
    <main id="main">
      <section className="hero container">
        <div className="hero-kicker">
          <span className="kicker-line" />
          RagabLabs <span>/</span> {t(ui.tagline)}
          <span className="issue-mark">01 / HALOGENATION</span>
        </div>
        <div className="hero-heading">
          <div>
            <h1>
              Halogenation{" "}
              <span>
                Lab
                <span className="title-square" />
              </span>
            </h1>
            <p className="hero-subtitle">{t(ui.heroSubtitle)}</p>
          </div>
          <div className="hero-copy">
            <p>{t(ui.heroText)}</p>
            <a className="button primary" href="#/calculator/20">
              {t(ui.openLab)} <ArrowUpRight size={23} />
            </a>
            <a className="text-link" href="#/tools">
              {t(ui.explore)} <ArrowRight size={20} />
            </a>
          </div>
        </div>
        <Blueprint lang={lang} />
        <div className="hero-ledger">
          <span>
            <strong>20</strong>
            {t(ui.tools)}
          </span>
          <span>
            <strong>04</strong>
            {t(ui.network)}
          </span>
          <span>
            <strong>AR / EN</strong>
            {t(
              b(
                "Two languages. One scientific basis.",
                "لغتان وأساس علمي واحد.",
              ),
            )}
          </span>
          <span className="ledger-note">
            <Check size={20} />
            {t(ui.educational)}
          </span>
        </div>
      </section>
      <section className="container home-tools">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / {t(ui.toolkit)}</span>
            <h2>{t(ui.toolkit)}</h2>
            <p>{t(ui.toolkitText)}</p>
          </div>
          <a href="#/tools" className="button secondary">
            {t(ui.all)} <ArrowUpRight size={20} />
          </a>
        </div>
        <div className="home-groups">
          {groups.map((g) => (
            <a
              key={g.id}
              href={`#/tools?group=${g.id}`}
              className="group-entry"
            >
              <span>{g.id}</span>
              <h3>{tr(g.name, lang)}</h3>
              <small>{g.range}</small>
              <ArrowUpRight size={24} />
            </a>
          ))}
        </div>
        <div className="featured-lab">
          <div>
            <span className="eyebrow">20 / {t(ui.featured)}</span>
            <h2>{t(ui.featuredText)}</h2>
            <p>{t(ui.featuredBody)}</p>
            <a className="button light" href="#/calculator/20">
              {t(ui.openLab)} <ArrowUpRight size={22} />
            </a>
          </div>
          <div className="featured-equations" dir="ltr">
            <span>CH₄ + kCl₂ → CH₍₄₋ₖ₎Clₖ + kHCl</span>
            <Equation
              tex={
                "\\mathbf{n}_{out}=\\mathbf{n}_{in}+\\mathbf{N}\\boldsymbol{\\xi}"
              }
            />
            <div className="small-formulas">
              <span>Y = X × S</span>
              <span>
                ∑ m<sub>in</sub> = ∑ m<sub>out</sub>
              </span>
            </div>
          </div>
        </div>
        <div className="scope-note">
          <Info size={23} />
          <p>{t(ui.scope)}</p>
        </div>
      </section>
    </main>
  );
}
function Tools({ lang, path }: { lang: Lang; path: string }) {
  const [query, setQuery] = useState(""),
    [group, setGroup] = useState(
      new URLSearchParams(path.split("?")[1] || "").get("group") || "all",
    );
  const t = (x: B) => tr(x, lang);
  useEffect(
    () =>
      setGroup(
        new URLSearchParams(path.split("?")[1] || "").get("group") || "all",
      ),
    [path],
  );
  const matches = calculators.filter(
    (c) =>
      (group === "all" || c.group === group) &&
      `${c.title.en} ${c.title.ar} ${c.id}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <main id="main" className="container page">
      <span className="eyebrow">RAGABLABS / 20 {t(ui.tools)}</span>
      <h1 className="page-title">{t(ui.toolkit)}</h1>
      <p className="page-intro">{t(ui.toolkitText)}</p>
      <div className="tool-filters">
        <label className="search-field">
          <Search size={22} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(ui.search)}
            aria-label={t(ui.search)}
          />
        </label>
        <div className="filter-pills">
          {[{ id: "all", name: ui.all }, ...groups].map((g) => (
            <button
              type="button"
              key={g.id}
              onClick={() => setGroup(g.id)}
              aria-pressed={group === g.id}
            >
              {g.id === "all" ? t(g.name) : `${g.id} / ${t(g.name)}`}
            </button>
          ))}
        </div>
      </div>
      <div className="tools-grid">
        {matches.map((c) => (
          <ToolCard key={c.id} c={c} lang={lang} />
        ))}
      </div>
      {!matches.length && <p className="empty-state">{t(ui.noResults)}</p>}
    </main>
  );
}
function ReferenceLinks({ lang }: { lang: Lang }) {
  return (
    <ul className="reference-links">
      <li>
        <a
          href="https://goldbook.iupac.org/terms/view/E02283"
          target="_blank"
          rel="noreferrer"
        >
          IUPAC Gold Book ·{" "}
          {tr(b("Extent of reaction", "امتداد التفاعل"), lang)}{" "}
          <ExternalLink size={16} />
        </a>
      </li>
      <li>
        <a
          href="https://www.ciaaw.org/abridged-atomic-weights.htm"
          target="_blank"
          rel="noreferrer"
        >
          CIAAW ·{" "}
          {tr(b("Abridged atomic weights", "الأوزان الذرية التقريبية"), lang)}{" "}
          <ExternalLink size={16} />
        </a>
      </li>
      <li>
        NIST Chemistry WebBook SRD 69 · Chase (1998):{" "}
        <span className="inline-source-links">
          {ORDER.map((s) => (
            <a
              key={s}
              href={nist(s)}
              target="_blank"
              rel="noreferrer"
              dir="ltr"
            >
              {formula[s]}
            </a>
          ))}
        </span>
      </li>
    </ul>
  );
}
const corrections: [B, B, B][] = [
  [
    b("Slides 4, 7 · formulas", "الشرائح 4 و7 · الصيغ"),
    b(
      "The methane line in slide 4 is not balanced. Slide 7 writes methylene chloride as CH₃Cl₂.",
      "سطر الميثان بالشريحة 4 غير موزون، وصيغة ثنائي كلورو الميثان بالشريحة 7 مكتوبة CH₃Cl₂.",
    ),
    b(
      "Use four separately balanced reactions and the correct CH₂Cl₂ formula.",
      "استخدام أربعة تفاعلات موزونة منفصلة والصيغة الصحيحة CH₂Cl₂.",
    ),
  ],
  [
    b("Slide 6 · names", "الشريحة 6 · الأسماء"),
    b(
      "SO₂Cl₂ is called “sulfonyl chloride”.",
      "تسمية SO₂Cl₂ باسم sulfonyl chloride.",
    ),
    b(
      "The specific compound is sulfuryl chloride. “Sulfonyl chloride” normally denotes the R–SO₂Cl functional class.",
      "المركب المحدد هو sulfuryl chloride (كلوريد السلفوريل)، بينما يشير sulfonyl chloride عادةً إلى الفئة R–SO₂Cl.",
    ),
  ],
  [
    b("Slide 7 · percentages", "الشريحة 7 · النسب"),
    b(
      "20%, 53% and 27% are shown without a reproducible feed/kinetic basis.",
      "تعرض نسب 20% و53% و27% دون أساس تغذية وحركية قابل لإعادة الحساب.",
    ),
    b(
      "No fixed product percentages are built in. Enter product amounts or feasible extents.",
      "عدم اعتماد نسب إنتاج ثابتة. تُدخل كميات المنتجات أو امتدادات تفاعل ممكنة.",
    ),
  ],
  [
    b("Slides 10–12 · safety", "الشرائح 10–12 · السلامة"),
    b(
      "Feed-ratio diagrams suggest safety regions; the reaction-rate statement has no kinetic law.",
      "توحي رسوم نسب التغذية بمناطق سلامة، ولا يصاحب وصف معدل التفاعل قانون حركي.",
    ),
    b(
      "No safe ratio or kinetic prediction is inferred. Heat balance alone is not a hazard assessment.",
      "لا تُستنتج نسبة آمنة أو تنبؤ حركي. لا تمثل موازنة الحرارة وحدها تقييمًا للمخاطر.",
    ),
  ],
  [
    b("Slide 29 · phase data", "الشريحة 29 · بيانات الأطوار"),
    b(
      "The negative temperatures listed as chloromethane boiling points are inconsistent with phase data.",
      "درجات الحرارة السالبة المذكورة كدرجات غليان للكلوروميثانات لا تتفق مع بيانات الأطوار.",
    ),
    b(
      "NIST summaries give approximately 247 K (CH₃Cl), 313 K (CH₂Cl₂), 334.3 K (CHCl₃), 349.8 K (CCl₄). Values are contextual only, not a separation model.",
      "تعطي ملخصات NIST تقريبًا 247 K لـCH₃Cl، و313 K لـCH₂Cl₂، و334.3 K لـCHCl₃، و349.8 K لـCCl₄. هذه قيم سياقية وليست نموذج فصل.",
    ),
  ],
  [
    b("Slide 31 · separation", "الشريحة 31 · الفصل"),
    b(
      "CH₃Cl and CH₂Cl₂ are described as having very close boiling points.",
      "وُصفت درجات غليان CH₃Cl وCH₂Cl₂ بأنها متقاربة جدًا.",
    ),
    b(
      "Their normal boiling-point summaries are separated by about 66 K. No tray counts or pressure advice is implemented.",
      "تختلف قيم الغليان العادي الملخّصة بنحو 66 K. لا يُقدّم التطبيق عدد صوانٍ أو توصيات ضغط.",
    ),
  ],
  [
    b("Slides 8, 9, 13–28, 32", "الشرائح 8 و9 و13–28 و32"),
    b(
      "Construction materials, activation and historical equipment/recycle arrangements are described.",
      "تعرض مواد الإنشاء والتنشيط وترتيبات تاريخية للمعدات وإعادة التدوير.",
    ),
    b(
      "Context only. The app does not select materials, catalysts, temperatures, recycle settings, or equipment for operation.",
      "سياق تعليمي فقط. لا يختار التطبيق مواد الإنشاء أو المحفزات أو درجات التشغيل أو إعدادات التدوير أو المعدات.",
    ),
  ],
];
function Science({ lang }: { lang: Lang }) {
  const t = (x: B) => tr(x, lang);
  return (
    <main id="main" className="container page science-page">
      <span className="eyebrow">RAGABLABS / {t(ui.science)}</span>
      <h1 className="page-title">{t(ui.methodsTitle)}</h1>
      <p className="page-intro">{t(ui.methodsDesc)}</p>
      <div className="model-register">
        {[
          b("Stoichiometry: entered extents", "الستوكيومترية: امتدادات مدخلة"),
          b(
            "Thermal: gas reference and Shomate Cp",
            "الحرارة: مرجع غازي وCp بمعادلة شوميت",
          ),
          b(
            "Recovery: entered component splits",
            "الاسترجاع: معاملات فصل مدخلة",
          ),
        ].map((s, i) => (
          <div key={i}>
            <span>0{i + 1}</span>
            <h3>{t(s)}</h3>
          </div>
        ))}
      </div>
      <section className="science-section">
        <h2>{t(ui.dataTitle)}</h2>
        <p>{t(ui.dataDesc)}</p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t(b("Species", "المكوّن"))}</th>
                <th>M (g/mol)</th>
                <th>
                  ΔfH°<sub>gas</sub> (kJ/mol)
                </th>
                <th>{t(ui.source)}</th>
              </tr>
            </thead>
            <tbody>
              {ORDER.map((s) => (
                <tr key={s}>
                  <td>
                    <strong dir="ltr">{formula[s]}</strong>
                    <br />
                    {t(names[s])}
                  </td>
                  <td dir="ltr">{format(MW[s])}</td>
                  <td dir="ltr">{format(HF[s])}</td>
                  <td>
                    <a href={nist(s)} target="_blank" rel="noreferrer">
                      NIST / Chase 1998 <ExternalLink size={16} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="subtle">
          {t(
            b(
              "CCl₄: the selected −95.98096 kJ/mol value is the H entry in the Chase Shomate table, not the separate WebBook average −100 ± 20 kJ/mol. Older NIST molecular weights use different atomic-weight rounding.",
              "قيمة CCl₄ المختارة −95.98096 kJ/mol هي H في جدول شوميت من Chase، وليست متوسط WebBook المنفصل −100 ± 20 kJ/mol. تستخدم الكتل المولية القديمة في NIST تقريبًا مختلفًا للأوزان الذرية.",
            ),
          )}
        </p>
      </section>
      <section className="science-section">
        <h2>
          {t(
            b(
              "Thermal integration and validity",
              "التكامل الحراري وصلاحية النموذج",
            ),
          )}
        </h2>
        <Equation tex={"C_p(T)=A+Bt+Ct^2+Dt^3+E/t^2,\\quad t=T/1000"} />
        <p>
          {t(
            b(
              "The adiabatic model integrates Cp analytically from 298.15 K and solves the enthalpy residual by bisection. N₂ uses separate coefficient sets below and above 500 K with a continuous definite integral. The application uses only the common 298.15–1000 K range.",
              "يكامل النموذج الأدياباتي Cp تحليليًا من 298.15 K ويحل باقي الإنثالبي بالتنصيف العددي. يستخدم N₂ مجموعتين من المعاملات أسفل وفوق 500 K مع تكامل محدد مستمر. يقتصر التطبيق على المجال المشترك 298.15–1000 K.",
            ),
          )}
        </p>
        <p>
          {t(
            b(
              "This frozen-composition ideal-gas model omits phase change, dissociation, nonideality and transport. It is a mathematical enthalpy estimate even where the assumed gas state is not a stable real mixture.",
              "يهمل النموذج الغازي المثالي ذو التركيب الثابت تغير الطور والتفكك وعدم المثالية والنقل. إنه تقدير رياضي للإنثالبي حتى عندما لا تكون الحالة الغازية المفترضة مزيجًا حقيقيًا مستقرًا.",
            ),
          )}
        </p>
        <details>
          <summary>
            {t(b("Show bundled A–E coefficients", "عرض معاملات A–E المرفقة"))}
          </summary>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t(b("Species", "المكوّن"))}</th>
                  {["A", "B", "C", "D", "E"].map((s) => (
                    <th key={s}>{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDER.map((s) => (
                  <tr key={s}>
                    <td dir="ltr">{formula[s]}</td>
                    {SHOMATE[s].map((x, i) => (
                      <td dir="ltr" key={i}>
                        {x}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td>N₂ ≥ 500 K</td>
                  {[19.50583, 19.88705, -8.598535, 1.369784, 0.527601].map(
                    (x, i) => (
                      <td key={i}>{x}</td>
                    ),
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </section>
      <section className="science-section">
        <h2>{t(ui.lecture)}</h2>
        <p>{t(ui.lectureIntro)}</p>
        <div className="table-scroll">
          <table className="audit-table">
            <thead>
              <tr>
                <th>{t(b("Location", "الموضع"))}</th>
                <th>{t(b("Lecture statement", "ما ورد بالمحاضرة"))}</th>
                <th>{t(b("Application decision", "القرار في التطبيق"))}</th>
              </tr>
            </thead>
            <tbody>
              {corrections.map((row, i) => (
                <tr key={i}>
                  {row.map((s, j) => (
                    <td key={j}>{t(s)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="inline-source-links">
          {PRODUCTS.map((s) => (
            <a
              href={nist(s).replace("Mask=1", "Mask=4")}
              key={s}
              target="_blank"
              rel="noreferrer"
            >
              {formula[s]} · {t(b("phase data", "بيانات الأطوار"))}
            </a>
          ))}
        </div>
      </section>
      <section className="science-section">
        <h2>{t(ui.molecules)}</h2>
        <p>{t(ui.moleculeNote)}</p>
        <div className="molecule-grid">
          {ORDER.filter((s) => s !== "N2").map((s) => (
            <div key={s}>
              <Molecule species={s} />
              <strong dir="ltr">{formula[s]}</strong>
              <p>{t(names[s])}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="science-section">
        <h2>{t(ui.references)}</h2>
        <ReferenceLinks lang={lang} />
        <p className="subtle">
          {t(
            b(
              "Sources checked 16 October 2026 (UTC). Full equations, the slide audit and worked examples are included in the project documentation.",
              "تمت مراجعة المصادر يوم 16 أكتوبر 2026 بتوقيت UTC. تتوفر المعادلات الكاملة ومراجعة الشرائح والأمثلة المحلولة في توثيق المشروع.",
            ),
          )}
        </p>
      </section>
      <div className="scope-note">
        <Info size={23} />
        <p>{t(ui.scope)}</p>
      </div>
    </main>
  );
}
function Workbench({ c, lang }: { c: Calculator; lang: Lang }) {
  const t = (x: B) => tr(x, lang),
    file = useRef<HTMLInputElement>(null);
  const getInitial = () => {
    const base = defaults(c.id);
    try {
      const saved = safeGet(`hl-case-${c.id}`);
      return saved ? { ...base, ...JSON.parse(saved) } : base;
    } catch {
      return base;
    }
  };
  const [inputs, setInputs] = useState<Inputs>(getInitial),
    [snapshot, setSnapshot] = useState<Inputs>(getInitial),
    [result, setResult] = useState<CalcResult | null>(() => {
      try {
        return calculate(c.id, getInitial());
      } catch {
        return null;
      }
    }),
    [dirty, setDirty] = useState(false),
    [error, setError] = useState<ScientificError | null>(null),
    [example, setExample] = useState(!safeGet(`hl-case-${c.id}`)),
    [notice, setNotice] = useState("");
  const fields = fieldsFor(c, inputs);
  const update = (key: string, value: string | number) => {
    setInputs((p) => ({ ...p, [key]: value }));
    setDirty(true);
    setError(null);
    setNotice("");
  };
  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      const r = calculate(c.id, inputs);
      setResult(r);
      setSnapshot({ ...inputs });
      setDirty(false);
      setError(null);
      setExample(false);
      safeSet(`hl-case-${c.id}`, JSON.stringify(inputs));
    } catch (e) {
      setError(
        e instanceof ScientificError ? e : new ScientificError("unknown"),
      );
      setResult(null);
      setDirty(false);
    }
  }
  function loadExample() {
    const p = defaults(c.id);
    setInputs(p);
    setSnapshot(p);
    setResult(calculate(c.id, p));
    setDirty(false);
    setError(null);
    setExample(true);
    setNotice("");
  }
  function clear() {
    const p = { ...inputs };
    fields
      .filter((f) => !f.kind && f.key !== "stages")
      .forEach((f) => (p[f.key] = ""));
    setInputs(p);
    setResult(null);
    setDirty(false);
    setError(null);
    setNotice("");
  }
  async function importFile(f: File | undefined) {
    if (!f) return;
    try {
      if (f.size > 1000000) throw new Error("size");
      const data = parseCase(await f.text());
      const p = { ...defaults(data.id), ...data.inputs };
      safeSet(`hl-case-${data.id}`, JSON.stringify(p));
      if (data.id !== c.id) {
        location.hash = `/calculator/${data.id}`;
      } else {
        setInputs(p);
        setResult(null);
        setDirty(true);
        setError(null);
      }
      setNotice(t(ui.imported));
    } catch {
      setNotice(t(ui.invalidImport));
    }
    if (file.current) file.current.value = "";
  }
  const valid = result && !dirty && !error;
  const errorField = error?.field
    ? fields.find((f) => f.key === error.field)?.label
    : null;
  const renderField = (f: Field) => (
    <label
      className={`input-field ${f.kind === "text" ? "full-field" : ""}`}
      key={f.key}
      htmlFor={`input-${f.key}`}
    >
      <span>
        {t(f.label)}
        {fieldUnit(f.unit, inputs) && (
          <small dir="ltr">{fieldUnit(f.unit, inputs)}</small>
        )}
      </span>
      {f.kind === "select" ? (
        <select
          id={`input-${f.key}`}
          data-testid={`field-${f.key}`}
          value={inputs[f.key]}
          onChange={(e) => update(f.key, e.target.value)}
        >
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.label)}
            </option>
          ))}
        </select>
      ) : f.kind === "text" ? (
        <input
          id={`input-${f.key}`}
          data-testid={`field-${f.key}`}
          type="text"
          maxLength={1000}
          value={inputs[f.key] ?? ""}
          onChange={(e) => update(f.key, e.target.value)}
        />
      ) : (
        <input
          id={`input-${f.key}`}
          data-testid={`field-${f.key}`}
          type="number"
          step="any"
          inputMode="decimal"
          min={
            f.min ??
            (f.unit === "hf" ? -100000 : f.unit === "temp" ? -273.15 : 0)
          }
          max={f.max ?? (f.unit === "fraction" ? 1 : undefined)}
          value={
            typeof inputs[f.key] === "number"
              ? Number(Number(inputs[f.key]).toPrecision(12))
              : (inputs[f.key] ?? "")
          }
          onChange={(e) => update(f.key, e.target.value)}
          aria-invalid={error?.field === f.key}
        />
      )}
    </label>
  );
  const thermalFields = fields.filter(
      (f) =>
        f.key === "thermoMode" ||
        f.key === "thermoSource" ||
        f.key.startsWith("hf"),
    ),
    mainFields = fields.filter((f) => !thermalFields.includes(f));
  const exports = (kind: "csv" | "json" | "html" | "print") => {
    if (!valid) return;
    const stem = `Halogenation-Lab-${String(c.id).padStart(2, "0")}-${lang}`;
    if (kind === "print") {
      window.print();
      return;
    }
    download(
      kind === "csv"
        ? csvReport(c, snapshot, result, lang)
        : kind === "json"
          ? caseReport(c, snapshot, result, lang)
          : htmlReport(c, snapshot, result, lang),
      kind === "csv"
        ? "text/csv;charset=utf-8"
        : kind === "json"
          ? "application/json"
          : "text/html;charset=utf-8",
      `${stem}.${kind}`,
    );
  };
  return (
    <main id="main" className="workbench-layout">
      <aside className="calculator-sidebar">
        <a href="#/tools" className="sidebar-back">
          <ArrowLeft size={19} />
          {t(ui.all)}
        </a>
        {groups.map((g) => (
          <div className="sidebar-group" key={g.id}>
            <div>
              {g.id} / {t(g.name)}
            </div>
            {calculators
              .filter((cc) => cc.group === g.id)
              .map((cc) => (
                <a
                  key={cc.id}
                  href={`#/calculator/${cc.id}`}
                  aria-current={cc.id === c.id ? "page" : undefined}
                >
                  <span>{String(cc.id).padStart(2, "0")}</span>
                  {t(cc.title)}
                </a>
              ))}
          </div>
        ))}
      </aside>
      <div className="workbench-main">
        <div className="workbench-heading">
          <div className="eyebrow">
            {t(ui.workbench)}{" "}
            <span>
              {" "}
              / {c.group}—{String(c.id).padStart(2, "0")}
            </span>
          </div>
          <h1>{t(c.title)}</h1>
          <p>{t(c.overview)}</p>
          <div className="workbench-meta">
            <span className="model-chip">{t(c.model)}</span>
            <button
              className="text-button"
              type="button"
              onClick={() => file.current?.click()}
            >
              <Upload size={17} />
              {t(ui.import)}
            </button>
            <input
              ref={file}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => void importFile(e.target.files?.[0])}
            />
            <a className="text-link" href="#/science">
              <BookOpen size={17} />
              {t(ui.science)}
            </a>
          </div>
          {notice && (
            <div className="notice" role="status">
              {notice}
            </div>
          )}
        </div>
        <div className="calculation-grid">
          <section className="input-panel">
            <div className="panel-title">
              <span>01</span>
              <h2>{t(ui.inputs)}</h2>
            </div>
            <form onSubmit={submit} noValidate>
              <label className="input-field unit-selector" htmlFor="input-unit">
                <span>{t(ui.unit)}</span>
                <select
                  id="input-unit"
                  data-testid="field-unit"
                  value={inputs.unit}
                  onChange={(e) => {
                    setInputs((p) => convertInputs(p, e.target.value));
                    setDirty(true);
                    setError(null);
                  }}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </label>
              <p className="field-note">{t(ui.unitNote)}</p>
              <div className="parameter-grid">
                {mainFields.map(renderField)}
              </div>
              {fields.some((f) => f.unit === "fraction") && (
                <p className="field-note">{t(ui.fractionNote)}</p>
              )}
              {thermalFields.length > 0 && (
                <div className="thermal-inputs">
                  <h3>{t(ui.thermalData)}</h3>
                  <p className="field-note">{t(ui.standardData)}</p>
                  <div className="parameter-grid">
                    {thermalFields.map(renderField)}
                  </div>
                </div>
              )}
              <div className="form-actions">
                <button
                  className="button primary calculate-button"
                  type="submit"
                  data-testid="calculate"
                >
                  <CalcIcon size={21} />
                  {t(ui.calculate)}
                </button>
                <div>
                  <button
                    type="button"
                    className="text-button"
                    data-testid="load-example"
                    onClick={loadExample}
                  >
                    <Play size={17} />
                    {t(ui.example)}
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    data-testid="clear"
                    onClick={clear}
                  >
                    <RotateCcw size={17} />
                    {t(ui.clear)}
                  </button>
                </div>
              </div>
            </form>
          </section>
          <section
            className="result-workspace"
            aria-live="polite"
            aria-busy={false}
          >
            <div className="equation-panel">
              <span className="small-label">02 / {t(ui.equation)}</span>
              <Equation tex={c.equation} />
            </div>
            {error && (
              <div className="alert" role="alert">
                <strong>{t(ui.errorTitle)}</strong>
                <p>{t(errors[error.code])}</p>
                {errorField && <p>{t(errorField)}</p>}
                {error.code === "stage" && (
                  <p>
                    {t(b("Stage", "المرحلة"))}: {error.field}
                  </p>
                )}
              </div>
            )}
            {dirty ? (
              <div className="pending-result" role="status">
                <CalcIcon size={35} />
                <p>{t(ui.dirty)}</p>
              </div>
            ) : valid ? (
              <div id="report-zone" className="report-zone">
                <div className="print-only">
                  <h1>RagabLabs · Halogenation Lab</h1>
                  <h2>{t(c.title)}</h2>
                  <p>{t(c.overview)}</p>
                  <Equation tex={c.equation} />
                </div>
                <div className="results-header">
                  <h2>{t(ui.results)}</h2>
                  <span>
                    <Check size={16} />
                    {t(example ? ui.exampleBadge : ui.calculatedBadge)}
                  </span>
                </div>
                <div className="metrics-grid">
                  {result.metrics.map((metric, i) => (
                    <div
                      className={`metric ${i === 0 ? "main-metric" : ""}`}
                      key={i}
                    >
                      <span>{t(metric.label)}</span>
                      <strong dir="ltr" data-testid={`metric-${i}`}>
                        {format(metric.value)}
                      </strong>
                      <small dir="ltr">{metric.unit || " "}</small>
                    </div>
                  ))}
                </div>
                <div className="export-toolbar">
                  <span>{t(ui.exports)}</span>
                  <button
                    type="button"
                    onClick={() => exports("csv")}
                    data-testid="export-csv"
                  >
                    <Download size={17} />
                    {t(ui.csv)}
                  </button>
                  <button
                    type="button"
                    onClick={() => exports("json")}
                    data-testid="export-json"
                  >
                    <FileJson size={17} />
                    {t(ui.json)}
                  </button>
                  <button
                    type="button"
                    onClick={() => exports("html")}
                    data-testid="export-html"
                  >
                    <Download size={17} />
                    {t(ui.html)}
                  </button>
                  <button
                    type="button"
                    onClick={() => exports("print")}
                    data-testid="export-pdf"
                  >
                    <Printer size={17} />
                    {t(ui.print)}
                  </button>
                </div>
                <ResultChart
                  data={result.chart}
                  title={result.chartTitle}
                  unit={result.chartUnit}
                  lang={lang}
                  line={result.chartType === "line"}
                />
                {result.extraCharts?.map((q, i) => (
                  <ResultChart
                    key={i}
                    data={q.data}
                    title={q.title}
                    unit={q.unit}
                    lang={lang}
                  />
                ))}
                <p className="chart-note">{t(ui.plotNote)}</p>
                <div className="print-only">
                  <h2>{t(ui.submitted)}</h2>
                  <table>
                    <tbody>
                      <tr>
                        <th>{t(ui.unit)}</th>
                        <td>{snapshot.unit}</td>
                      </tr>
                      {fieldsFor(c, snapshot).map((f) => (
                        <tr key={f.key}>
                          <th>{t(f.label)}</th>
                          <td dir="auto">
                            {displayInput(f, snapshot, lang)}{" "}
                            {fieldUnit(f.unit, snapshot)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.tables.map((table, i) => (
                  <section key={i} className="result-table">
                    <h3>{t(table.title)}</h3>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            {table.headers.map((h, j) => (
                              <th key={j}>
                                {typeof h === "string" ? h : t(h)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, j) => (
                            <tr key={j}>
                              {row.map((v, k) => (
                                <td dir="auto" key={k}>
                                  {format(v)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))}
                <section className="solution-section">
                  <div className="panel-title">
                    <span>03</span>
                    <h2>{t(ui.steps)}</h2>
                  </div>
                  <ol className="solution-steps">
                    {result.steps.map((s, i) => (
                      <li key={i}>
                        <p>{t(s.text)}</p>
                        {s.formula && <Equation tex={s.formula} />}
                      </li>
                    ))}
                  </ol>
                </section>
                <section className="assumption-section">
                  <h3>{t(ui.interpretation)}</h3>
                  <p>{t(c.overview)}</p>
                  {result.notes.map((n, i) => (
                    <p key={i} className="scientific-note">
                      <Info size={19} />
                      <span>{t(n)}</span>
                    </p>
                  ))}
                  <h3>{t(ui.assumptions)}</h3>
                  <ul>
                    {c.assumptions.map((a, i) => (
                      <li key={i}>{t(a)}</li>
                    ))}
                  </ul>
                  <h3>{t(ui.references)}</h3>
                  <ReferenceLinks lang={lang} />
                </section>
              </div>
            ) : (
              !error && (
                <div className="pending-result">
                  <FlaskConical size={34} />
                  <p>{t(ui.emptyResult)}</p>
                </div>
              )
            )}
          </section>
        </div>
        <p className="workspace-scope">
          <Info size={18} />
          {t(ui.scope)}
        </p>
      </div>
    </main>
  );
}
export default function App() {
  const [lang, setLang] = useState<Lang>(
      safeGet("hl-lang") === "ar" ? "ar" : "en",
    ),
    [dark, setDark] = useState(safeGet("hl-theme") === "dark"),
    [path, setPath] = useState(initialPath);
  useEffect(() => {
    const onHash = () => {
      setPath(initialPath());
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    safeSet("hl-lang", lang);
  }, [lang]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    safeSet("hl-theme", dark ? "dark" : "light");
  }, [dark]);
  const calculatorId = Number(path.match(/^\/calculator\/(\d+)$/)?.[1]),
    c = calculators.find((c) => c.id === calculatorId),
    t = (x: B) => tr(x, lang);
  return (
    <>
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
          document.getElementById("main")?.scrollIntoView();
        }}
      >
        {t(b("Skip to content", "تخطَّ إلى المحتوى"))}
      </a>
      <Header {...{ lang, setLang, dark, setDark, path }} />
      {c ? (
        <Workbench key={c.id} c={c} lang={lang} />
      ) : path.startsWith("/tools") ? (
        <Tools lang={lang} path={path} />
      ) : path === "/science" ? (
        <Science lang={lang} />
      ) : path === "/network" ? (
        <main id="main" className="container page">
          <span className="eyebrow">RL / CHL / 001</span>
          <h1 className="page-title">{t(ui.reactionTitle)}</h1>
          <p className="page-intro">{t(ui.reactionDesc)}</p>
          <Blueprint lang={lang} />
          <h2 className="section-spaced">{t(ui.molecules)}</h2>
          <p>{t(ui.moleculeNote)}</p>
          <div className="molecule-grid">
            {ORDER.filter((s) => s !== "N2").map((s) => (
              <div key={s}>
                <Molecule species={s} />
                <strong dir="ltr">{formula[s]}</strong>
                <p>{t(names[s])}</p>
              </div>
            ))}
          </div>
        </main>
      ) : path === "/process" ? (
        <main id="main" className="container page">
          <span className="eyebrow">RL / PFD / 002</span>
          <h1 className="page-title">{t(ui.processTitle)}</h1>
          <p className="page-intro">{t(ui.processDesc)}</p>
          <ProcessDiagram lang={lang} />
          <div className="scope-note">
            <Info size={23} />
            <p>{t(ui.scope)}</p>
          </div>
        </main>
      ) : (
        <Home lang={lang} />
      )}
      <footer className="app-footer">
        <div className="container">
          <a href="#/" className="footer-brand">
            <TitleMark />
            RagabLabs <span>/ Halogenation Lab</span>
          </a>
          <p>{t(ui.privacy)}</p>
          <div>
            <span>{t(ui.version)}</span>
            <a href="#/science">{t(ui.science)}</a>
            <span>MIT · {t(b("Code", "الكود"))}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
