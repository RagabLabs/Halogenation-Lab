// Exact static hosting contract used by browser tests; no history fallback hides asset errors.
import http from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";
const root = resolve("dist"),
  base = "/Halogenation-Lab/";
const mime = {
  ".html": "text/html;charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".json": "application/json",
};
http
  .createServer((req, res) => {
    const url = decodeURIComponent((req.url || "/").split("?")[0]);
    if (url === "/") {
      res.writeHead(302, { Location: base });
      res.end();
      return;
    }
    const path = resolve(
      root,
      url.startsWith(base) ? url.slice(base.length) || "index.html" : "__404",
    );
    if (
      !path.startsWith(root + "/") ||
      !existsSync(path) ||
      !statSync(path).isFile()
    ) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.setHeader(
      "Content-Type",
      mime[extname(path)] || "application/octet-stream",
    );
    res.end(readFileSync(path));
  })
  .listen(4173, "127.0.0.1", () =>
    console.log("QA static host: http://127.0.0.1:4173/Halogenation-Lab/"),
  );
