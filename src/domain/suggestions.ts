import type { ActivityResult } from "./filters";
import type { CategorySlug } from "./types";

/**
 * We only know a child's birth year, so in a given year the child is one of two ages.
 * Today in 2026, a child born 2020 is 5 (before the birthday) or 6 (after).
 */
export function possibleAges(birthYear: number, now: Date): [number, number] {
  const y = now.getUTCFullYear() - birthYear;
  return [Math.max(0, y - 1), y];
}

/**
 * Activities that fit a child: the age range overlaps the child's possible ages.
 * Activities matching the child's interests come first, then the soonest date.
 */
export function suggestForChild(
  results: ActivityResult[],
  child: { birthYear: number; interests: readonly string[] },
  now: Date,
  limit = 6,
): ActivityResult[] {
  const [low, high] = possibleAges(child.birthYear, now);
  const likes = new Set(child.interests);
  const matchesInterest = (r: ActivityResult) => r.activity.categories.some((c: CategorySlug) => likes.has(c));
  return results
    .filter((r) => r.sessions.length > 0 && r.activity.ageMin <= high && r.activity.ageMax >= low)
    .sort((a, b) => Number(matchesInterest(b)) - Number(matchesInterest(a)) || a.sessions[0]!.startsAt.localeCompare(b.sessions[0]!.startsAt))
    .slice(0, limit);
}
