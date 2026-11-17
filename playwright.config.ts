import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests: a real (headless) browser clicks through Mivora on a phone-sized screen.
 * Needs the local database + test mailbox running (pnpm db:up). Run with: pnpm test:e2e
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3100",
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
    trace: "retain-on-failure",
  },
  projects: [{ name: "phone", use: { ...devices["Pixel 7"] } }],
  webServer: {
    command: "NEXT_DIST_DIR=.next-e2e pnpm exec next dev --turbopack -p 3100",
    url: "http://localhost:3100/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
