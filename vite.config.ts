import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  base: "/Halogenation-Lab/",
  plugins: [react(), tailwindcss()],
  test: { include: ["tests/**/*.test.ts"] },
  build: {
    rollupOptions: {
      output: { manualChunks: { charts: ["recharts"], math: ["katex"] } },
    },
  },
});
