import { searchActivities, type ActivityResult } from "./filters";
import type { Activity, CategorySlug } from "./types";

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

/**
 * Orders a list for the whole family: activities that fit more of the children (by age) come
 * first, then those matching more interests, then the soonest date. Nothing is dropped, so
 * a family still sees every idea (e.g. on a rainy day), just the best fits first.
 */
export function rankForFamily(
  results: ActivityResult[],
  children: readonly { birthYear: number; interests: readonly string[] }[],
  now: Date,
): ActivityResult[] {
  if (children.length === 0) return results;
  const kids = children.map((c) => ({ ages: possibleAges(c.birthYear, now), likes: new Set(c.interests) }));
  const score = (r: ActivityResult) => {
    let fits = 0;
    let likes = 0;
    for (const k of kids) {
      if (r.activity.ageMin > k.ages[1] || r.activity.ageMax < k.ages[0]) continue;
      fits++;
      if (r.activity.categories.some((c: CategorySlug) => k.likes.has(c))) likes++;
    }
    return fits * 100 + likes;
  };
  const scored = results.map((r) => ({ r, s: score(r), at: r.sessions[0]?.startsAt ?? "" }));
  return scored.sort((a, b) => b.s - a.s || a.at.localeCompare(b.at)).map((x) => x.r);
}

/**
 * Ideas for a holiday email: activities in the occasion's window. With children on file,
 * only those that fit at least one child's age; best family fit first.
 */
export function occasionSuggestions(
  activities: Activity[],
  window: { from: string; to: string },
  children: readonly { birthYear: number; interests: readonly string[] }[],
  now: Date,
  limit = 5,
): ActivityResult[] {
  const inWindow = searchActivities(activities, { between: window }, now);
  const fitting = children.length
    ? inWindow.filter((r) =>
        children.some((c) => {
          const [low, high] = possibleAges(c.birthYear, now);
          return r.activity.ageMin <= high && r.activity.ageMax >= low;
        }),
      )
    : inWindow;
  return rankForFamily(fitting, children, now).slice(0, limit);
}
