import type { ChartPoint } from "../engine/types";
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const fmt = (x: number) =>
  x === 0
    ? "0"
    : Math.abs(x) >= 10000 || Math.abs(x) < 0.001
      ? x.toExponential(2)
      : Number(x.toPrecision(6)).toString();
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
// Static, exact geometry for print/export: independent of screen resize observers or animation.
export function staticPlot(
  data: ChartPoint[],
  unit: string,
  line = false,
): string {
  if (!data.length) return "";
  let min = Math.min(0, ...data.map((p) => p.value)),
    max = Math.max(0, ...data.map((p) => p.value));
  if (max === min) max = min + 1;
  const gap = (max - min) * 0.1;
  if (max > 0) max += gap;
  if (min < 0) min -= gap;
  const left = 95,
    top = 32,
    width = 590,
    height = 200,
    baseY = top + height * (max / (max - min));
  const y = (v: number) => top + (height * (max - v)) / (max - min),
    slot = width / data.length;
  const ticks = Array.from({ length: 5 }, (_, i) => {
    const v = min + ((max - min) * i) / 4,
      yy = y(v);
    return `<line x1="${left}" x2="${left + width}" y1="${yy}" y2="${yy}" stroke="#c9d9e1" stroke-dasharray="3 4"/><text x="${left - 12}" y="${yy + 5}" text-anchor="end" font-size="15">${fmt(v)}</text>`;
  }).join("");
  const geometry = line
    ? `<polyline fill="none" stroke="#00787d" stroke-width="3" points="${data.map((p, i) => `${left + (width * i) / Math.max(data.length - 1, 1)},${y(p.value)}`).join(" ")}"/>`
    : data
        .map((p, i) => {
          const xx = left + slot * (i + 0.18),
            yy = y(p.value),
            bh = Math.abs(yy - baseY);
          return `<g><title>${esc(p.name)}: ${fmt(p.value)} ${esc(unit)}</title><rect x="${xx}" y="${Math.min(yy, baseY)}" width="${slot * 0.64}" height="${bh}" fill="${colors[i % colors.length]}"/><text x="${xx + slot * 0.32}" y="${p.value >= 0 ? yy - 8 : yy + 18}" text-anchor="middle" font-size="15">${fmt(p.value)}</text></g>`;
        })
        .join("");
  const labels = data
    .map((p, i) => {
      if (
        line &&
        i !== data.length - 1 &&
        i % Math.ceil((data.length - 1) / 5) !== 0
      )
        return "";
      const x = line
        ? left + (width * i) / Math.max(data.length - 1, 1)
        : left + slot * (i + 0.5);
      return `<text x="${x}" y="265" text-anchor="middle" font-size="16">${esc(p.name)}</text>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 305" role="img" style="width:100%;height:auto;direction:ltr;font-family:Arial,sans-serif;color:#13283d" fill="currentColor"><text x="${left}" y="18" font-size="15">${esc(unit)}</text>${ticks}<line x1="${left}" x2="${left}" y1="${top}" y2="${top + height}" stroke="#667a89"/><line x1="${left}" x2="${left + width}" y1="${baseY}" y2="${baseY}" stroke="#667a89"/>${geometry}${labels}${line ? '<text x="390" y="292" text-anchor="middle" font-size="16">T (K)</text>' : ""}</svg>`;
}
