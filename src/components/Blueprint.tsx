import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { formula, names, CARBON, reactions } from "../data/species";
import { b, tr, type Lang } from "../engine/types";
import { ui } from "../data/ui";
const related = [
  [1, 2, 3],
  [3, 5, 6],
  [5, 7, 9],
  [5, 10, 20],
];
export function Blueprint({
  lang,
  compact = false,
}: {
  lang: Lang;
  compact?: boolean;
}) {
  const [selected, setSelected] = useState(0);
  function Diagram({ vertical }: { vertical: boolean }) {
    const x = (i: number) => (vertical ? 105 : 80 + i * 210),
      y = (i: number) => (vertical ? 45 + i * 134 : 135);
    return (
      <svg
        viewBox={vertical ? "0 0 350 695" : "0 0 1000 290"}
        className={vertical ? "network-mobile" : "network-wide"}
        role="group"
        aria-label={tr(ui.network, lang)}
        style={{ direction: "ltr" }}
      >
        <defs>
          <marker
            id={vertical ? "arrow-v" : "arrow-h"}
            markerWidth="7"
            markerHeight="7"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6" fill="#42BDD0" />
          </marker>
        </defs>
        {CARBON.slice(0, 4).map((s, i) => {
          const xx = x(i),
            yy = y(i);
          return (
            <g
              key={s}
              role="button"
              tabIndex={0}
              aria-label={`${tr(ui.calculator, lang)} R${i + 1}`}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(i);
                }
              }}
              className={`reaction-link ${selected === i ? "selected" : ""}`}
            >
              <rect
                className="reaction-hit"
                x={vertical ? 30 : xx + 64}
                y={vertical ? yy + 42 : 50}
                width={vertical ? 285 : 80}
                height={vertical ? 80 : 190}
                rx="8"
              />
              <path
                d={
                  vertical
                    ? `M${xx},${yy + 40} L${xx},${yy + 90}`
                    : `M${xx + 63},${yy} L${xx + 144},${yy}`
                }
                className="pipe"
                markerEnd={`url(#${vertical ? "arrow-v" : "arrow-h"})`}
              />
              <text
                x={vertical ? 200 : xx + 105}
                y={vertical ? yy + 72 : 85}
                className="reaction-r"
              >
                R{i + 1}
              </text>
              <text
                x={vertical ? 250 : xx + 105}
                y={vertical ? yy + 103 : 113}
                className="chlorine-label"
              >
                + Cl₂
              </text>
              <text
                x={vertical ? 165 : xx + 105}
                y={vertical ? yy + 103 : 177}
                className="hcl-label"
              >
                − HCl
              </text>
            </g>
          );
        })}
        {CARBON.map((s, i) => (
          <g key={s} transform={`translate(${x(i)},${y(i)})`}>
            <rect
              x="-60"
              y="-38"
              width="120"
              height="76"
              rx="6"
              className="network-node"
            />
            <text y="9" className="node-formula">
              {formula[s]}
            </text>
            {!vertical && (
              <text y="74" className="node-caption">
                {["FEED", "MONO", "DI", "TRI", "TETRA"][i]}
              </text>
            )}
            {vertical && (
              <text x="153" y="8" className="node-caption">
                {tr(names[s], lang)}
              </text>
            )}
          </g>
        ))}
        {!vertical && (
          <>
            <line x1="22" x2="978" y1="254" y2="254" className="dimension" />
            <text x="500" y="280" className="drawing-note">
              C / H / Cl ·{" "}
              {lang === "ar"
                ? "حفظ الذرات في كل خطوة"
                : "ATOM CONSERVATION AT EVERY STEP"}
            </text>
          </>
        )}
      </svg>
    );
  }
  return (
    <div className={`blueprint ${compact ? "compact" : ""}`}>
      <div className="plate-top">
        <span>{tr(ui.reactionPlate, lang)}</span>
        <span>RL / CHL / 001</span>
      </div>
      <Diagram vertical={false} />
      <Diagram vertical />
      <div className="reaction-inspector">
        <div>
          <span className="small-label">
            R{selected + 1} ·{" "}
            {tr(b("BALANCED SUBSTITUTION", "استبدال موزون"), lang)}
          </span>
          <strong dir="ltr">{reactions[selected]}</strong>
          <p>
            {tr(names[CARBON[selected]], lang)} →{" "}
            {tr(names[CARBON[selected + 1]], lang)}.{" "}
            {tr(
              b(
                "One hydrogen is replaced by chlorine.",
                "تستبدل ذرة هيدروجين واحدة بذرة كلور.",
              ),
              lang,
            )}
          </p>
        </div>
        <div className="reaction-tools">
          {related[selected].map((id) => (
            <a href={`#/calculator/${id}`} key={id}>
              {String(id).padStart(2, "0")} <ArrowUpRight size={17} />
            </a>
          ))}
        </div>
      </div>
      <div className="plate-bottom">
        <span>{tr(ui.plateHint, lang)}</span>
        <span>4 × (Cl₂ → HCl)</span>
      </div>
    </div>
  );
}
export function ProcessDiagram({ lang }: { lang: Lang }) {
  const [selected, setSelected] = useState(0);
  const blocks = [
    {
      label: ui.inputStage,
      tools: [2, 11, 16],
      desc: b(
        "CH₄ and Cl₂ feeds, plus optional N₂. All material amounts use a common time basis.",
        "تغذية CH₄ وCl₂ مع N₂ اختياري. تستخدم الكميات أساسًا زمنيًا موحدًا.",
      ),
    },
    {
      label: ui.reactionStage,
      tools: [5, 15, 19],
      desc: b(
        "Fixed extents update each species using its stoichiometric coefficient. Multiple stages carry their full outlet forward.",
        "تحدّث الامتدادات المحددة رصيد كل مكوّن بمعامله الستوكيومتري. تمرّر المراحل المتعددة تيار خروجها كاملًا.",
      ),
    },
    {
      label: ui.mixtureStage,
      tools: [6, 12, 17],
      desc: b(
        "Account for methane, four chloromethanes, chlorine, HCl and nitrogen. No phase equilibrium is assumed.",
        "تُراجع كميات الميثان والكلوروميثانات الأربعة والكلور وHCl والنيتروجين، دون افتراض اتزان أطوار.",
      ),
    },
    {
      label: ui.recoveryStage,
      tools: [18, 20],
      desc: b(
        "Entered component recoveries divide the four chloromethanes into recovered and loss streams. Other gases bypass this product-only account.",
        "تقسم الاسترجاعات المدخلة الكلوروميثانات الأربعة إلى مسترجع وفاقد. تمر الغازات الأخرى خارج موازنة استرجاع المنتجات.",
      ),
    },
    {
      label: ui.productStage,
      tools: [18, 20],
      desc: b(
        "Summarize recovered products and losses. Export the calculated composition; no purity or equipment design is inferred.",
        "تُلخّص المنتجات المسترجعة والفاقد ويُصدَّر التركيب المحسوب، دون استنتاج نقاوة أو تصميم معدات.",
      ),
    },
  ];
  return (
    <>
      <div className="process-drawing blueprint">
        <div className="plate-top">
          <span>RL / PFD / 002</span>
          <span>
            {tr(b("EDUCATIONAL STREAM ACCOUNT", "موازنة تيار تعليمية"), lang)}
          </span>
        </div>
        <div className="process-blocks">
          {blocks.map((block, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              aria-pressed={selected === i}
              className={`process-block ${selected === i ? "active" : ""}`}
            >
              <svg viewBox="0 0 120 100" aria-hidden="true">
                {i === 1 ? (
                  <>
                    <path d="M32 22 Q60 6 88 22 V78 Q60 94 32 78 Z M32 28 Q60 44 88 28 M60 5V14 M60 86V98 M15 54H32 M88 54H108" />
                    <path d="M60 35V74 M45 55H75" />
                  </>
                ) : i === 3 ? (
                  <>
                    <path d="M42 10H78V90H42Z M42 30H78 M42 50H78 M42 70H78 M10 50H42 M78 20H110 M78 80H110" />
                  </>
                ) : i === 0 ? (
                  <>
                    <path d="M10 32H103L91 22 M103 32L91 42 M10 70H103L91 60 M103 70L91 80" />
                  </>
                ) : i === 2 ? (
                  <>
                    <path d="M22 20 Q60 2 98 20 V80 Q60 98 22 80Z M22 20 Q60 38 98 20 M5 50H22 M98 50H115" />
                    <path d="M38 48H82 M38 63H82" />
                  </>
                ) : (
                  <>
                    <path d="M10 50H47V25H108 M47 50V80H108" />
                    <circle cx="47" cy="50" r="5" />
                  </>
                )}
              </svg>
              <span className="small-label">0{i + 1}</span>
              <strong>{tr(block.label, lang)}</strong>
            </button>
          ))}
        </div>
        <div className="process-bypass">
          {tr(ui.otherGases, lang)} · CH₄ / Cl₂ / HCl / N₂ <span>↗</span>{" "}
          {tr(b("Separate gas account", "موازنة غازات منفصلة"), lang)}
        </div>
      </div>
      <div className="process-inspector">
        <h3>{tr(blocks[selected].label, lang)}</h3>
        <p>{tr(blocks[selected].desc, lang)}</p>
        <div className="pill-links">
          {blocks[selected].tools.map((id) => (
            <a key={id} href={`#/calculator/${id}`}>
              {tr(ui.calculator, lang)} {String(id).padStart(2, "0")}{" "}
              <ArrowUpRight size={18} />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
