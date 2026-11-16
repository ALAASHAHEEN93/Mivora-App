import type { Activity } from "@/domain/types";
import { searchActivities, upcomingSessions, type ActivityFilters, type ActivityResult } from "@/domain/filters";
import { buildDemoActivities } from "./demo-activities";

/**
 * Data access boundary. Pages only talk to this interface, so the demo
 * implementation can be swapped for PostgreSQL (implementation step 4)
 * without touching UI code.
 */
export interface ActivityRepository {
  search(filters: ActivityFilters, now?: Date): Promise<ActivityResult[]>;
  /** Returns the activity only if it is publicly visible (published, not expired, has upcoming sessions). */
  findVisibleBySlug(slug: string, now?: Date): Promise<ActivityResult | null>;
  districts(): Promise<string[]>;
  /** Published, non-expired listings with all their sessions (calendar lookups + day ideas). */
  allPublished(now?: Date): Promise<Activity[]>;
}

class DemoActivityRepository implements ActivityRepository {
  private data(now: Date): Activity[] {
    return buildDemoActivities(now);
  }

  async search(filters: ActivityFilters, now = new Date()) {
    return searchActivities(this.data(now), filters, now);
  }

  async findVisibleBySlug(slug: string, now = new Date()) {
    const activity = this.data(now).find((a) => a.slug === slug);
    if (!activity) return null;
    const sessions = upcomingSessions(activity, now);
    return sessions.length ? { activity, sessions } : null;
  }

  async allPublished(now = new Date()) {
    return this.data(now).filter((a) => a.status === "published" && new Date(a.expiresAt) > now);
  }

  async districts() {
    const all = this.data(new Date()).map((a) => a.venue.district);
    return [...new Set(all)].sort((a, b) => a.localeCompare(b, "de"));
  }
}

function createRepository(): ActivityRepository {
  if (process.env.DATABASE_URL) {
    // Loaded lazily so builds without a database never touch Prisma.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaActivityRepository } = require("./db/prisma-repository") as typeof import("./db/prisma-repository");
    return new PrismaActivityRepository();
  }
  return new DemoActivityRepository();
}

/** PostgreSQL when DATABASE_URL is set (local Docker), otherwise built-in demo data. */
export const activityRepository: ActivityRepository = createRepository();
