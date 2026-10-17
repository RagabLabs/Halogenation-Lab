import { test, expect, type Page } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";

const portable = pathToFileURL(resolve("Open-Halogenation-Lab.html")).href;
async function openPortable(page: Page, lang = "en") {
  await page.context().setOffline(true);
  await page.goto(`${portable}#/calculator/1`);
  await page.evaluate(() => document.fonts.ready);
  if (lang === "ar") await page.getByRole("button", { name: "العربية", exact: true }).click();
}

for (const lang of ["en", "ar"]) {
  test(`portable file works offline for all 20 calculators · ${lang}`, async ({ page }) => {
    const errors: string[] = [], requests: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
    await openPortable(page, lang);
    for (let id = 1; id <= 20; id++) {
      await page.goto(`${portable}#/calculator/${id}`);
      await page.getByTestId("load-example").click();
      await page.getByTestId("calculate").click();
      await expect(page.getByTestId("metric-0")).toBeVisible();
      await expect(page.getByRole("alert")).toHaveCount(0);
      await expect(page.locator(".recharts-wrapper").first()).toBeVisible();
    }
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
  });

  test(`portable file exports and reimports cases offline · ${lang}`, async ({ page }) => {
    await openPortable(page, lang);
    await page.goto(`${portable}#/calculator/20`);
    let jsonPath = "";
    for (const kind of ["csv", "json", "html"]) {
      const pending = page.waitForEvent("download");
      await page.getByTestId(`export-${kind}`).click();
      const file = await pending;
      const path = (await file.path())!;
      const text = await readFile(path, "utf8");
      expect(text.length).toBeGreaterThan(500);
      if (kind === "json") { jsonPath = path; expect(JSON.parse(text).results.values.conversion).toBe(0.8); }
    }
    await page.getByTestId("clear").click();
    await page.locator('input[type="file"]').setInputFiles(jsonPath);
    await page.getByTestId("calculate").click();
    await expect(page.getByTestId("metric-0")).toHaveText("80");
    await page.evaluate(() => { window.print = () => { document.documentElement.dataset.printed = "yes"; }; });
    await page.getByTestId("export-pdf").click();
    await expect(page.locator("html")).toHaveAttribute("data-printed", "yes");
  });

  test(`portable file preserves layout and theme offline · ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openPortable(page, lang);
    await page.getByRole("button", { name: lang === "ar" ? "تبديل المظهر" : "Switch theme", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const layout = await page.evaluate(() => ({ w: innerWidth, scroll: document.documentElement.scrollWidth }));
    expect(layout.scroll).toBeLessThanOrEqual(layout.w + 2);
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".print-chart").first()).toBeVisible();
  });
}
