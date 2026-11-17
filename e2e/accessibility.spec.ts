import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { chooseKoeln } from "./helpers";

const PAGES = [
  ["welcome", "/de/willkommen"],
  ["home", "/de"],
  ["explore", "/de/entdecken"],
  ["activity", "/de/aktivitaet/familien-yoga-ehrenfeld"],
  ["calendar", "/de/meine-woche"],
  ["sign in", "/de/anmelden"],
  ["list an activity", "/de/anbieten"],
  ["arabic home", "/ar"],
] as const;

for (const [name, path] of PAGES) {
  test(`no serious accessibility problems: ${name}`, async ({ page }) => {
    await chooseKoeln(page);
    await page.goto(path);
    await page.waitForTimeout(1800); // let the launch splash fade out
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length}× e.g. ${v.nodes[0]?.target.join(" ")})`)).toEqual([]);
  });
}
