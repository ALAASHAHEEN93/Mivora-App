import { ACCESSIBILITY_TAGS, CATEGORY_SLUGS, type AccessibilityTag, type CategorySlug, type LanguageCode, type Setting } from "./types";
import { addDays, berlinDate, berlinDateTime } from "./time";

/** Köln's nine city districts (Stadtbezirke) with approximate centre points. */
export const KOELN_DISTRICTS = [
  { name: "Innenstadt", lat: 50.9375, lng: 6.9603 },
  { name: "Rodenkirchen", lat: 50.889, lng: 6.99 },
  { name: "Lindenthal", lat: 50.933, lng: 6.9 },
  { name: "Ehrenfeld", lat: 50.95, lng: 6.91 },
  { name: "Nippes", lat: 50.966, lng: 6.953 },
  { name: "Chorweiler", lat: 51.025, lng: 6.896 },
  { name: "Porz", lat: 50.88, lng: 7.06 },
  { name: "Kalk", lat: 50.938, lng: 7.01 },
  { name: "Mülheim", lat: 50.967, lng: 7.009 },
] as const;

const LANGS: LanguageCode[] = ["de", "en", "ar", "tr", "uk", "pl", "fr", "es", "it"];
const SETTINGS: Setting[] = ["indoor", "outdoor", "both"];
const UNITS = ["perChild", "perFamily", "perSession"] as const;
export const MAX_REPEAT_WEEKS = 12;

export interface SubmissionInput {
  orgName: string;
  de: { title: string; summary: string; description: string };
  en: { title: string; summary: string; description: string } | null;
  categories: CategorySlug[];
  ageMin: number;
  ageMax: number;
  price: { kind: "free" } | { kind: "paid"; amountCents: number; unit: (typeof UNITS)[number] };
  languages: LanguageCode[];
  setting: Setting;
  accessibility: AccessibilityTag[];
  venue: { name: string; street: string; postalCode: string; district: string; lat: number; lng: number };
  sessions: { startsAt: string; endsAt: string }[];
  bookingUrl: string | null;
  cancellation: string;
}

export type FieldError = "required" | "tooShort" | "tooLong" | "invalid" | "range" | "past" | "order" | "confirm";
export type ParseResult = { ok: true; value: SubmissionInput } | { ok: false; errors: Record<string, FieldError> };

type Form = { get(name: string): unknown; getAll(name: string): unknown[] };

/** Strips control characters and trims; listing text is shown as plain text only (never HTML). */
function clean(v: unknown): string {
  return typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim() : "";
}

/** Validates the provider form. Returns every problem at once so the form can show them all. */
export function parseSubmission(form: Form, now = new Date()): ParseResult {
  const errors: Record<string, FieldError> = {};
  const text = (name: string, min: number, max: number, optional = false) => {
    const v = clean(form.get(name));
    if (!v) {
      if (!optional) errors[name] = "required";
    } else if (v.length < min) errors[name] = "tooShort";
    else if (v.length > max) errors[name] = "tooLong";
    return v;
  };
  const int = (name: string, min: number, max: number) => {
    const raw = clean(form.get(name));
    const n = Number(raw);
    if (!raw) errors[name] = "required";
    else if (!Number.isInteger(n) || n < min || n > max) errors[name] = "range";
    return n;
  };

  const orgName = text("orgName", 2, 80);
  const de = { title: text("title", 3, 80), summary: text("summary", 10, 160), description: text("description", 20, 2000) };
  const enRaw = { title: text("titleEn", 3, 80, true), summary: text("summaryEn", 10, 160, true), description: text("descriptionEn", 20, 2000, true) };
  const anyEn = enRaw.title || enRaw.summary || enRaw.description;
  if (anyEn) for (const [k, v] of Object.entries({ titleEn: enRaw.title, summaryEn: enRaw.summary, descriptionEn: enRaw.description })) if (!v) errors[k] = "required";

  const categories = [...new Set(form.getAll("categories").map(clean))].filter((c): c is CategorySlug => CATEGORY_SLUGS.includes(c as CategorySlug));
  if (categories.length === 0) errors.categories = "required";
  else if (categories.length > 3) errors.categories = "tooLong";

  const ageMin = int("ageMin", 0, 17);
  const ageMax = int("ageMax", 0, 17);
  if (!errors.ageMin && !errors.ageMax && ageMin > ageMax) errors.ageMax = "order";

  let price: SubmissionInput["price"] = { kind: "free" };
  if (clean(form.get("priceKind")) === "paid") {
    const raw = clean(form.get("priceEuro")).replace(",", ".");
    const euros = Number(raw);
    const unit = clean(form.get("priceUnit")) as (typeof UNITS)[number];
    if (!raw) errors.priceEuro = "required";
    else if (!/^\d{1,3}(\.\d{1,2})?$/.test(raw) || euros <= 0) errors.priceEuro = "invalid";
    if (!UNITS.includes(unit)) errors.priceUnit = "required";
    price = { kind: "paid", amountCents: Math.round(euros * 100), unit };
  }

  const languages = [...new Set(form.getAll("languages").map(clean))].filter((l): l is LanguageCode => LANGS.includes(l as LanguageCode));
  if (languages.length === 0) errors.languages = "required";
  const setting = clean(form.get("setting")) as Setting;
  if (!SETTINGS.includes(setting)) errors.setting = "required";
  const accessibility = [...new Set(form.getAll("accessibility").map(clean))].filter((a): a is AccessibilityTag =>
    ACCESSIBILITY_TAGS.includes(a as AccessibilityTag),
  );

  const district = KOELN_DISTRICTS.find((d) => d.name === clean(form.get("district")));
  if (!district) errors.district = "required";
  const venueName = text("venueName", 2, 80);
  const street = text("street", 3, 100);
  const postalCode = clean(form.get("postalCode"));
  if (!postalCode) errors.postalCode = "required";
  else if (!/^5[01]\d{3}$/.test(postalCode)) errors.postalCode = "invalid";

  const firstDate = clean(form.get("firstDate"));
  const startTime = clean(form.get("startTime"));
  const endTime = clean(form.get("endTime"));
  const today = berlinDate(now);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(firstDate) || Number.isNaN(Date.parse(firstDate))) errors.firstDate = firstDate ? "invalid" : "required";
  else if (firstDate < today) errors.firstDate = "past";
  else if (firstDate > addDays(today, 365)) errors.firstDate = "range";
  const timeOk = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  if (!timeOk(startTime)) errors.startTime = startTime ? "invalid" : "required";
  if (!timeOk(endTime)) errors.endTime = endTime ? "invalid" : "required";
  if (timeOk(startTime) && timeOk(endTime) && endTime <= startTime) errors.endTime = "order";
  const repeatWeeks = int("repeatWeeks", 1, MAX_REPEAT_WEEKS);

  const urlRaw = clean(form.get("bookingUrl"));
  let bookingUrl: string | null = null;
  if (urlRaw) {
    try {
      const u = new URL(urlRaw);
      if (u.protocol !== "https:" || urlRaw.length > 300) errors.bookingUrl = "invalid";
      else bookingUrl = u.toString();
    } catch {
      errors.bookingUrl = "invalid";
    }
  }
  const cancellation = text("cancellation", 5, 500);

  if (form.get("confirmRights") !== "yes") errors.confirmRights = "confirm";
  if (form.get("confirmReview") !== "yes") errors.confirmReview = "confirm";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const sessions = Array.from({ length: repeatWeeks }, (_, i) => {
    const d = addDays(firstDate, i * 7);
    return { startsAt: berlinDateTime(d, startTime), endsAt: berlinDateTime(d, endTime) };
  });
  return {
    ok: true,
    value: {
      orgName,
      de,
      en: anyEn ? enRaw : null,
      categories,
      ageMin,
      ageMax,
      price,
      languages,
      setting,
      accessibility,
      venue: { name: venueName, street, postalCode, district: district!.name, lat: district!.lat, lng: district!.lng },
      sessions,
      bookingUrl,
      cancellation,
    },
  };
}

/** URL slug from a title: "Töpfern für Kids" → "toepfern-fuer-kids-k3x9q2". */
export function slugify(title: string, suffix: string): string {
  const base = title
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return `${base || "angebot"}-${suffix}`;
}
