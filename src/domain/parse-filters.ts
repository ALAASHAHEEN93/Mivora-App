import type { ActivityFilters } from "./filters";
import { ACCESSIBILITY_TAGS, CATEGORY_SLUGS, type LanguageCode } from "./types";

const DATE_KEYS = ["today", "tomorrow", "weekend", "week", "all"] as const;
const LANGS: LanguageCode[] = ["de", "en", "ar", "tr", "uk", "fr", "es", "it", "pl"];

type Raw = Record<string, string | string[] | undefined>;

function one(raw: Raw, key: string): string | undefined {
  const v = raw[key];
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.length <= 100 ? s : undefined;
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

/** Validate untrusted URL query params into typed filters. Unknown/invalid values are dropped. */
export function parseFilters(raw: Raw): ActivityFilters {
  const ageStr = one(raw, "alter");
  const age = ageStr !== undefined && /^\d{1,2}$/.test(ageStr) ? Number(ageStr) : undefined;
  const priceStr = one(raw, "preis");
  const maxPriceCents = priceStr !== undefined && /^\d{1,5}$/.test(priceStr) ? Number(priceStr) * 100 : undefined;

  const datum = one(raw, "datum");
  const day = datum && /^\d{4}-\d{2}-\d{2}$/.test(datum) && !Number.isNaN(Date.parse(datum)) ? datum : undefined;

  return {
    day,
    q: one(raw, "q")?.trim() || undefined,
    date: oneOf(one(raw, "datum"), DATE_KEYS),
    age: age !== undefined && age <= 17 ? age : undefined,
    district: one(raw, "bezirk") || undefined,
    category: oneOf(one(raw, "kategorie"), CATEGORY_SLUGS),
    maxPriceCents,
    language: oneOf(one(raw, "sprache"), LANGS),
    setting: oneOf(one(raw, "ort"), ["indoor", "outdoor"] as const),
    accessibility: oneOf(one(raw, "barrierefrei"), ACCESSIBILITY_TAGS),
  };
}

export function countActiveFilters(f: ActivityFilters): number {
  return Object.entries(f).filter(([k, v]) => k !== "q" && v !== undefined && v !== "all").length;
}
