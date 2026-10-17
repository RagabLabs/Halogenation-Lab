import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import type { ChartPoint, B, Lang } from "../engine/types";
import { tr } from "../engine/types";
import { ui } from "../data/ui";
import { staticPlot } from "../reports/static-plot";
const colors = [
  "#00787d",
  "#234d72",
  "#718b26",
  "#8a6019",
  "#6b5098",
  "#aa5237",
  "#365d62",
  "#62728b",
];
export function ResultChart({
  data,
  title,
  unit,
  lang,
  line = false,
}: {
  data: ChartPoint[];
  title: B;
  unit: string;
  lang: Lang;
  line?: boolean;
}) {
  if (!data.length) return null;
  return (
    <figure className="chart-panel">
      <figcaption>
        <h3>{tr(title, lang)}</h3>
        <span dir="ltr">{unit}</span>
      </figcaption>
      <div
        className="chart-wrap"
        dir="ltr"
        role="img"
        aria-label={`${tr(title, lang)} (${unit})`}
      >
        <ResponsiveContainer width="100%" height="100%">
          {line ? (
            <LineChart
              data={data}
              margin={{ left: 12, right: 24, top: 15, bottom: 18 }}
            >
              <CartesianGrid stroke="var(--line)" strokeDasharray="4 4" />
              <XAxis
                dataKey="name"
                minTickGap={40}
                tick={{ fontSize: 15, fill: "var(--muted)" }}
                label={{
                  value: "T (K)",
                  position: "insideBottom",
                  offset: -15,
                  fill: "var(--muted)",
                }}
              />
              <YAxis
                width={68}
                tick={{ fontSize: 15, fill: "var(--muted)" }}
                tickFormatter={(n) =>
                  Number(n).toLocaleString("en", { notation: "compact" })
                }
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontSize: 16,
                }}
                formatter={(v) => [
                  `${Number(v).toPrecision(7)} ${unit}`,
                  tr(ui.value, lang),
                ]}
              />
              <ReferenceLine y={0} stroke="var(--text)" />
              <Line
                isAnimationActive={false}
                name={tr(ui.value, lang)}
                type="monotone"
                dataKey="value"
                stroke="#008C91"
                strokeWidth={3}
                dot={false}
              />
              <Legend wrapperStyle={{ fontSize: 15, paddingTop: 10 }} />
            </LineChart>
          ) : (
            <BarChart
              data={data}
              margin={{ left: 6, right: 18, top: 14, bottom: 8 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--line)"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="name"
                interval={0}
                tick={{ fontSize: 16, fill: "var(--muted)" }}
              />
              <YAxis
                width={66}
                tick={{ fontSize: 15, fill: "var(--muted)" }}
                tickFormatter={(n) =>
                  Number(n).toLocaleString("en", { notation: "compact" })
                }
              />
              <Tooltip
                cursor={{ fill: "var(--soft)" }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontSize: 16,
                }}
                formatter={(v) => [
                  `${Number(v).toPrecision(7)} ${unit}`,
                  tr(ui.value, lang),
                ]}
              />
              <ReferenceLine y={0} stroke="var(--muted)" />
              <Bar
                isAnimationActive={false}
                dataKey="value"
                name={tr(ui.value, lang)}
                radius={[4, 4, 0, 0]}
                maxBarSize={64}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Bar>
              <Legend wrapperStyle={{ fontSize: 15, paddingTop: 10 }} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <div
        className="print-chart"
        dir="ltr"
        dangerouslySetInnerHTML={{ __html: staticPlot(data, unit, line) }}
      />
    </figure>
  );
}
