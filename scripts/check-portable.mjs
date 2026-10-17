import { readFile } from "node:fs/promises";
import { Script } from "node:vm";

const html = await readFile("Open-Halogenation-Lab.html", "utf8");
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if (scripts.length !== 1) throw new Error("Expected one complete embedded script");
new Script(scripts[0][1]);
if (/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\brel=["']stylesheet|<script\b[^>]*\btype=["']module/i.test(html)) {
  throw new Error("The portable file depends on external scripts or styles");
}
const css = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((s) => s[1]).join("\n");
if (!css || /url\((?!["']?data:)/i.test(css)) throw new Error("Styles or fonts are not fully embedded");
const fontURLs = (css.match(/url\(["']?data:/g) || []).length;
if (fontURLs < 1) throw new Error("No embedded fonts found");
console.log(JSON.stringify({ portableSyntax: "passed", embeddedScripts: scripts.length, embeddedFontURLs: fontURLs, sizeBytes: Buffer.byteLength(html) }));
