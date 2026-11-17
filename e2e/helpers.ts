import type { Page } from "@playwright/test";

/** Skip the welcome screen: pretend the city was already chosen. */
export async function chooseKoeln(page: Page) {
  await page.context().addCookies([{ name: "mv_city", value: "koeln", url: "http://localhost:3100" }]);
}
