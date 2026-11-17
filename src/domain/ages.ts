/** Children's ages picked on the welcome screen (no account). Kept on the device in a cookie. */
export const AGES_COOKIE = "mv_ages";
export const MAX_AGES = 6;

/** "3,7" → [3, 7]: whole years 0–17, unique, sorted, at most 6. Anything else is dropped. */
export function parseAges(value: unknown): number[] {
  const parts = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  const ages = parts
    .map((p) => (typeof p === "string" ? p.trim() : p))
    .filter((p): p is string => typeof p === "string" && /^\d{1,2}$/.test(p))
    .map(Number)
    .filter((n) => n >= 0 && n <= 17);
  return [...new Set(ages)].sort((a, b) => a - b).slice(0, MAX_AGES);
}
