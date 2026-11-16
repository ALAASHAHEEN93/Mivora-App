import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import type { LanguageCode } from "@/domain/types";
import { buildDemoActivities } from "./demo-activities";

describe("demo listings", () => {
  const visible = buildDemoActivities(new Date("2026-11-16T12:00:00Z")).filter(
    (a) => a.status === "published" && !a.slug.startsWith("abgelaufen"),
  );

  it("have title, summary, description and cancellation text in every app language", () => {
    for (const a of visible) {
      for (const locale of routing.locales) {
        const c = a.content[locale as LanguageCode];
        expect(c, `${a.id} ${locale}`).toBeDefined();
        expect(c!.title && c!.summary && c!.description && c!.cancellation, `${a.id} ${locale}`).toBeTruthy();
      }
    }
  });
});
