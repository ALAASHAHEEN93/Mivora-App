import { expect, test } from "@playwright/test";
import { chooseKoeln } from "./helpers";

test("first launch: welcome screen, city and ages, then suggestions on home", async ({ page }) => {
  await page.goto("/de");
  await expect(page).toHaveURL(/\/de\/willkommen$/);
  await expect(page.getByRole("heading", { name: "Willkommen bei Mivora" })).toBeVisible();
  await page.getByLabel("In welcher Stadt wohnst du?").selectOption("koeln");
  await page.locator("label", { hasText: /^5$/ }).click();
  await page.getByRole("button", { name: /Los geht/ }).click();
  await expect(page).toHaveURL(/\/de$/);
  await expect(page.getByRole("heading", { name: "Für dein Kind (5)" })).toBeVisible();
});

test("search and open an activity", async ({ page }) => {
  await chooseKoeln(page);
  await page.goto("/de");
  await page.getByRole("searchbox").fill("Yoga");
  await page.getByRole("button", { name: "Suchen" }).click();
  await expect(page).toHaveURL(/entdecken\?q=Yoga/);
  await page.getByRole("link", { name: /Familien-Yoga am Samstag/ }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: /Familien-Yoga am Samstag/ })).toBeVisible();
  await expect(page.getByText("Nächste Termine")).toBeVisible();
});

test("unknown address shows the friendly not-found page", async ({ page }) => {
  await chooseKoeln(page);
  const res = await page.goto("/de/anbiete");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /diese Seite gibt es nicht/ })).toBeVisible();
  await page.getByRole("link", { name: "Angebote entdecken" }).click();
  await expect(page).toHaveURL(/\/de\/entdecken$/);
});

test("sign in with the emailed code (shown on screen in development)", async ({ page }) => {
  await chooseKoeln(page);
  await page.goto("/de/anmelden");
  await page.getByPlaceholder("name@beispiel.de").fill("e2e.eltern@example.invalid");
  await page.getByRole("button", { name: /Code senden/ }).click();
  await expect(page.getByRole("heading", { name: "Code eingeben" })).toBeVisible();
  const code = (await page.getByRole("status").locator('[dir="ltr"]').textContent())?.trim() ?? "";
  expect(code).toMatch(/^\d{6}$/);
  await page.getByLabel("6-stelliger Code").fill(code);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page).toHaveURL(/\/de\/profil$/);
  await expect(page.getByRole("heading", { name: "Familienkonto" })).toBeVisible();
});
