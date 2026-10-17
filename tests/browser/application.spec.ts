import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
async function ready(page: Page, path: string, lang = "en") {
  await page.goto(path);
  if (lang === "ar")
    await page.getByRole("button", { name: "العربية", exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow(page: Page) {
  const v = await page.evaluate(() => ({
    viewport: innerWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(v.content, JSON.stringify(v)).toBeLessThanOrEqual(v.viewport + 2);
}
for (const lang of ["en", "ar"])
  for (let id = 1; id <= 20; id++) {
    test(`calculator ${id} · ${lang} · calculate, chart and all exports`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("response", (r) => {
        if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
      });
      await ready(page, `#/calculator/${id}`, lang);
      await page.getByTestId("load-example").click();
      await page.getByTestId("calculate").click();
      await expect(page.getByTestId("metric-0")).toBeVisible();
      await expect(page.locator(".recharts-wrapper").first()).toBeVisible();
      await expect(page.getByRole("alert")).toHaveCount(0);
      await noOverflow(page);
      for (const ext of ["csv", "json", "html"]) {
        const wait = page.waitForEvent("download");
        await page.getByTestId(`export-${ext}`).click();
        const file = await wait;
        expect(file.suggestedFilename()).toBe(
          `Halogenation-Lab-${String(id).padStart(2, "0")}-${lang}.${ext}`,
        );
        const content = await readFile((await file.path())!, "utf8");
        if (ext === "json") {
          const parsed = JSON.parse(content);
          expect(parsed.calculatorId).toBe(id);
          expect(parsed.results.metrics.length).toBeGreaterThan(0);
        } else expect(content.length).toBeGreaterThan(500);
      }
      await page.evaluate(() => {
        (window as unknown as { __printed: boolean }).__printed = false;
        window.print = () => {
          (window as unknown as { __printed: boolean }).__printed = true;
        };
      });
      await page.getByTestId("export-pdf").click();
      expect(
        await page.evaluate(
          () => (window as unknown as { __printed: boolean }).__printed,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    });
  }
for (const width of [360, 390, 768, 1024, 1440])
  for (const lang of ["en", "ar"]) {
    test(`responsive surfaces ${width}px · ${lang}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((l) => localStorage.setItem("hl-lang", l), lang);
      for (const path of [
        "#/",
        "#/tools",
        "#/network",
        "#/process",
        "#/science",
        "#/calculator/1",
        "#/calculator/15",
        "#/calculator/19",
        "#/calculator/20",
      ]) {
        await page.goto(path);
        await expect(page.locator("main")).toBeVisible();
        await noOverflow(page);
        const tiny = await page
          .locator("main input, main label")
          .evaluateAll(
            (xs) =>
              xs.filter((x) => parseFloat(getComputedStyle(x).fontSize) < 16)
                .length,
          );
        expect(tiny).toBe(0);
      }
    });
  }
test("language, direction and theme persist across reload", async ({
  page,
}) => {
  await ready(page, "#/");
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.getByRole("button", { name: "تبديل المظهر", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).backgroundColor,
    ),
  ).toBe("rgb(13, 29, 43)");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});
test("search, filters and all navigation routes", async ({ page }) => {
  await ready(page, "#/tools");
  await expect(page.locator(".tool-card")).toHaveCount(20);
  await page.getByPlaceholder("Find a calculator…").fill("adiabatic");
  await expect(page.locator(".tool-card")).toHaveCount(1);
  await page.locator(".tool-card").click();
  await expect(page).toHaveURL(/calculator\/15$/);
  await page.goto("#/tools?group=C");
  await expect(page.locator(".tool-card")).toHaveCount(4);
  await page.getByRole("button", { name: "All tools", exact: true }).click();
  await expect(page.locator(".tool-card")).toHaveCount(20);
  await page.getByPlaceholder("Find a calculator…").fill("not a calculator");
  await expect(page.locator(".tool-card")).toHaveCount(0);
});
test("reaction diagram responds to mouse and keyboard", async ({ page }) => {
  await ready(page, "#/network");
  const links = page.locator(".network-wide .reaction-link");
  for (let i = 0; i < 4; i++) {
    await links.nth(i).click();
    await expect(page.locator(".reaction-inspector strong")).toContainText(
      ["CH₄ + Cl₂", "CH₃Cl + Cl₂", "CH₂Cl₂ + Cl₂", "CHCl₃ + Cl₂"][i],
    );
  }
  await links.nth(0).focus();
  await page.keyboard.press("Enter");
  await expect(links.nth(0)).toHaveClass(/selected/);
});
test("all process blocks expose working calculator links", async ({ page }) => {
  await ready(page, "#/process");
  const blocks = page.locator(".process-block");
  for (let i = 0; i < 5; i++) {
    await blocks.nth(i).click();
    await expect(blocks.nth(i)).toHaveAttribute("aria-pressed", "true");
    expect(await page.locator(".pill-links a").count()).toBeGreaterThan(0);
  }
  await page.locator(".pill-links a").first().click();
  await expect(page).toHaveURL(/calculator\/18$/);
});
test("stale results are hidden, invalid input is explained, examples and clear work", async ({
  page,
}) => {
  await ready(page, "#/calculator/5");
  await page.getByTestId("field-x2").fill("2");
  await expect(page.getByTestId("metric-0")).toHaveCount(0);
  await expect(page.getByTestId("export-json")).toHaveCount(0);
  await page.getByTestId("calculate").click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByTestId("load-example").click();
  await expect(page.getByTestId("metric-0")).toBeVisible();
  await page.getByTestId("clear").click();
  await expect(page.getByTestId("field-methane")).toHaveValue("");
  await expect(page.getByTestId("metric-0")).toHaveCount(0);
});
test("unit switches preserve physical results and saved case reloads", async ({
  page,
}) => {
  await ready(page, "#/calculator/20");
  await expect(page.getByTestId("metric-0")).toHaveText("80");
  await page.getByTestId("field-unit").selectOption("kg/h");
  await expect(page.getByTestId("field-methane")).toHaveValue("16.043");
  await page.getByTestId("calculate").click();
  await expect(page.getByTestId("metric-0")).toHaveText("80");
  await page.reload();
  await expect(page.getByTestId("field-unit")).toHaveValue("kg/h");
  await expect(page.getByTestId("metric-0")).toHaveText("80");
});
test("extent and conversion input modes agree", async ({ page }) => {
  await ready(page, "#/calculator/1");
  await page.getByTestId("field-mode").selectOption("conversion");
  await page.getByTestId("field-conversion").fill("0.6");
  await page.getByTestId("calculate").click();
  await expect(page.getByTestId("metric-0")).toHaveText("0.6");
});
test("network product distribution and all reaction/product selectors work", async ({
  page,
}) => {
  await ready(page, "#/calculator/6");
  await page.getByTestId("field-compositionMode").selectOption("network");
  await expect(page.getByTestId("field-x1")).toBeVisible();
  await page.getByTestId("calculate").click();
  await expect(page.locator(".result-table").first()).toContainText("56.25");
  await page.goto("#/calculator/3");
  for (const reaction of ["1", "2", "3", "4"]) {
    await page.getByTestId("field-reaction").selectOption(reaction);
    await page.getByTestId("calculate").click();
    await expect(page.getByRole("alert")).toHaveCount(0);
  }
  await page.goto("#/calculator/20");
  for (const s of ["CH3Cl", "CH2Cl2", "CHCl3", "CCl4"]) {
    await page.getByTestId("field-selected").selectOption(s);
    await page.getByTestId("calculate").click();
    await expect(page.getByRole("alert")).toHaveCount(0);
  }
});
test("custom thermochemical sources and Cp model are validated", async ({
  page,
}) => {
  await ready(page, "#/calculator/15");
  await page.getByTestId("field-cpModel").selectOption("constant");
  await page.getByTestId("calculate").click();
  await expect(page.getByRole("alert")).toContainText("source");
  await page
    .getByTestId("field-cpSource")
    .fill("Educational near-reference Cp approximation, values at 298.15 K");
  await page.getByTestId("calculate").click();
  await expect(page.getByTestId("metric-0")).toBeVisible();
  await page.getByTestId("field-thermoMode").selectOption("custom");
  await page
    .getByTestId("field-thermoSource")
    .fill("Chase 1998, gas, 298.15 K");
  await page.getByTestId("calculate").click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByTestId("metric-0")).toBeVisible();
});
test("JSON export can be imported as a fresh case", async ({ page }) => {
  await ready(page, "#/calculator/20");
  const wait = page.waitForEvent("download");
  await page.getByTestId("export-json").click();
  const file = await wait,
    path = (await file.path())!;
  await page.getByTestId("clear").click();
  await page.locator("input[type=file]").setInputFiles(path);
  await expect(page.getByTestId("field-methane")).toHaveValue("1");
  await page.getByTestId("calculate").click();
  await expect(page.getByTestId("metric-0")).toHaveText("80");
});
test("mobile menu, language toggle and tool link", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await ready(page, "#/");
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page
    .locator(".main-nav")
    .getByRole("link", { name: "Calculators", exact: true })
    .click();
  await expect(page).toHaveURL(/tools$/);
  await expect(page.locator(".main-nav")).not.toBeVisible();
  await page.locator(".tool-card").first().click();
  await expect(page.getByTestId("calculate")).toBeVisible();
});
for (const lang of ["en", "ar"])
  test(`200% CSS zoom · ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await ready(page, "#/calculator/20", lang);
    await page.evaluate(() => {
      document.documentElement.style.zoom = "2";
    });
    await noOverflow(page);
    await expect(page.getByTestId("calculate")).toBeVisible();
    await page.getByTestId("calculate").click();
    await expect(page.getByTestId("metric-0")).toHaveText("80");
  });
for (const lang of ["en", "ar"])
  test(`print layout uses exact static plots · ${lang}`, async ({ page }) => {
    await ready(page, "#/calculator/20", lang);
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".print-chart").first()).toBeVisible();
    await expect(page.locator(".chart-wrap").first()).not.toBeVisible();
    await expect(page.locator(".print-chart").first()).toContainText("56.25");
    const invalid = await page
      .locator(".print-chart rect")
      .evaluateAll((xs) =>
        xs.some(
          (x) =>
            !Number.isFinite(Number(x.getAttribute("height"))) ||
            Number(x.getAttribute("height")) < 0,
        ),
      );
    expect(invalid).toBe(false);
    expect(await page.locator(".print-chart svg").count()).toBe(3);
  });
