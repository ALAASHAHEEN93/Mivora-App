import { describe, expect, it } from "vitest";
import { parseSubmission, slugify } from "./submission";
import { validSubmissionForm } from "@/test/submission-form";

const now = new Date("2026-11-17T12:00:00Z");

describe("provider submission form", () => {
  it("accepts a complete form and builds weekly dates in Berlin time", () => {
    const r = parseSubmission(validSubmissionForm(), now);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.sessions).toHaveLength(4);
    expect(r.value.sessions[0]).toEqual({ startsAt: "2026-12-02T16:00:00+01:00", endsAt: "2026-12-02T17:00:00+01:00" });
    expect(r.value.price).toEqual({ kind: "paid", amountCents: 750, unit: "perChild" });
    expect(r.value.venue.district).toBe("Kalk");
    expect(r.value.en).toBeNull();
  });

  it("reports every problem at once", () => {
    const r = parseSubmission(
      validSubmissionForm({ title: "", ageMin: "9", ageMax: "4", postalCode: "10115", endTime: "15:00", confirmRights: null, categories: [] }),
      now,
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors).toMatchObject({ title: "required", ageMax: "order", postalCode: "invalid", endTime: "order", confirmRights: "confirm", categories: "required" });
  });

  it("rejects past dates, plain-http links and junk prices", () => {
    const r = parseSubmission(validSubmissionForm({ firstDate: "2026-11-01", bookingUrl: "http://example.org", priceEuro: "abc" }), now);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors).toMatchObject({ firstDate: "past", bookingUrl: "invalid", priceEuro: "invalid" });
  });

  it("rejects javascript: links and unknown districts or categories", () => {
    const r = parseSubmission(validSubmissionForm({ bookingUrl: "javascript:alert(1)", district: "Atlantis", categories: ["bogus"] }), now);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors).toMatchObject({ bookingUrl: "invalid", district: "required", categories: "required" });
  });

  it("needs all three English texts or none", () => {
    const r = parseSubmission(validSubmissionForm({ titleEn: "Kids gym" }), now);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors).toMatchObject({ summaryEn: "required", descriptionEn: "required" });
  });

  it("makes readable slugs", () => {
    expect(slugify("Töpfern für Kids & Große!", "abc123")).toBe("toepfern-fuer-kids-grosse-abc123");
  });
});
