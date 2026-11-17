import type { PrismaClient } from "@/generated/prisma/client";
import { decodePlanned } from "@/domain/calendar";

export const MAX_LIST_ITEMS = 500;
export type ListName = "saved" | "planned";

const ACTIVITY_ID = /^[\w-]{1,64}$/;

/** Returns a clean value for the list, or null if it isn't valid. */
export function validateListValue(list: ListName, value: unknown): string | null {
  if (typeof value !== "string" || value.length > 200) return null;
  if (list === "saved") return ACTIVITY_ID.test(value) ? value : null;
  const item = decodePlanned(value);
  return item && ACTIVITY_ID.test(item.activityId) ? value : null;
}

// All functions are scoped by userId: a family only ever touches its own lists.

export async function getLists(db: PrismaClient, userId: string) {
  const [saved, planned, children] = await Promise.all([
    db.savedActivity.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, select: { activityId: true } }),
    db.plannedItem.findMany({ where: { userId }, orderBy: { startsAt: "asc" }, select: { key: true, childIds: true } }),
    db.child.findMany({ where: { userId }, orderBy: { birthYear: "asc" }, select: { id: true, nickname: true, birthYear: true } }),
  ]);
  const known = new Set(children.map((c) => c.id));
  const assignments: Record<string, string[]> = {};
  for (const p of planned) {
    const ids = p.childIds.filter((id) => known.has(id)); // drop children that were removed
    if (ids.length) assignments[p.key] = ids;
  }
  return { saved: saved.map((s) => s.activityId), planned: planned.map((p) => p.key), children, assignments };
}

/** Sets which of the family's own children go to a planned date. Ids of other families are ignored. */
export async function assignChildren(db: PrismaClient, userId: string, key: string, childIds: unknown) {
  const wanted = Array.isArray(childIds) ? childIds.filter((v): v is string => typeof v === "string").slice(0, 20) : [];
  const own = await db.child.findMany({ where: { userId, id: { in: wanted } }, select: { id: true } });
  const res = await db.plannedItem.updateMany({ where: { userId, key }, data: { childIds: own.map((c) => c.id) } });
  return res.count === 1;
}

export async function addToList(db: PrismaClient, userId: string, list: ListName, value: string) {
  if (list === "saved") {
    if ((await db.savedActivity.count({ where: { userId } })) >= MAX_LIST_ITEMS) return false;
    await db.savedActivity.upsert({ where: { userId_activityId: { userId, activityId: value } }, update: {}, create: { userId, activityId: value } });
    return true;
  }
  const item = decodePlanned(value);
  if (!item) return false;
  if ((await db.plannedItem.count({ where: { userId } })) >= MAX_LIST_ITEMS) return false;
  await db.plannedItem.upsert({
    where: { userId_key: { userId, key: value } },
    update: {},
    create: { userId, key: value, activityId: item.activityId, startsAt: new Date(item.startsAt), endsAt: new Date(item.endsAt) },
  });
  return true;
}

export async function removeFromList(db: PrismaClient, userId: string, list: ListName, value: string) {
  if (list === "saved") await db.savedActivity.deleteMany({ where: { userId, activityId: value } });
  else await db.plannedItem.deleteMany({ where: { userId, key: value } });
}

/** Adds device items to the account (first sign-in on a device); returns the merged lists. */
export async function mergeLists(db: PrismaClient, userId: string, device: { saved: unknown[]; planned: unknown[] }) {
  for (const list of ["saved", "planned"] as const) {
    const values = device[list].map((v) => validateListValue(list, v)).filter((v): v is string => v !== null).slice(0, MAX_LIST_ITEMS);
    for (const v of values) await addToList(db, userId, list, v);
  }
  return getLists(db, userId);
}
