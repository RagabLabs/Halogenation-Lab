import { build } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { mkdtemp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";

// One classic IIFE script and embedded fonts/styles work directly with file://.
// The ordinary GitHub Pages build keeps its existing deployment contract.
const temp = await mkdtemp(join(tmpdir(), "halogenation-portable-"));
const destination = resolve("Open-Halogenation-Lab.html");
try {
  await build({
    configFile: false,
    root: process.cwd(),
    base: "./",
    publicDir: false,
    plugins: [react(), tailwindcss()],
    build: {
      outDir: temp,
      emptyOutDir: true,
      cssCodeSplit: false,
      assetsInlineLimit: 10_000_000,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        input: resolve("src/main.tsx"),
        output: {
          format: "iife",
          inlineDynamicImports: true,
          entryFileNames: "application.js",
          assetFileNames: "[name][extname]",
        },
      },
    },
  });
  const files = await readdir(temp);
  const extraFiles = files.filter((name) => name !== "application.js" && !name.endsWith(".css"));
  if (extraFiles.length) throw new Error(`Portable build has external assets: ${extraFiles.join(", ")}`);
  const script = (await readFile(join(temp, "application.js"), "utf8")).replace(/<\/script/gi, "<\\/script");
  const css = (await Promise.all(files.filter((name) => name.endsWith(".css")).map((name) => readFile(join(temp, name), "utf8")))).join("\n").replace(/<\/style/gi, "<\\/style");
  if (/url\((?!["']?data:)/i.test(css)) throw new Error("Portable CSS contains a non-embedded asset URL");
  const icon = Buffer.from(await readFile(resolve("public/favicon.svg"))).toString("base64");
  const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#13283d"><title>Halogenation Lab · RagabLabs</title><link rel="icon" href="data:image/svg+xml;base64,${icon}"><style>${css}</style></head><body><div id="root"></div><noscript><p>Please enable JavaScript. يرجى تفعيل JavaScript لتشغيل المختبر.</p></noscript><script>${script}</script></body></html>`;
  await writeFile(destination, html);
  console.log(`Portable browser build: ${destination} (${Buffer.byteLength(html)} bytes)`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
