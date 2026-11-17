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
  const [saved, planned] = await Promise.all([
    db.savedActivity.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, select: { activityId: true } }),
    db.plannedItem.findMany({ where: { userId }, orderBy: { startsAt: "asc" }, select: { key: true } }),
  ]);
  return { saved: saved.map((s) => s.activityId), planned: planned.map((p) => p.key) };
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
