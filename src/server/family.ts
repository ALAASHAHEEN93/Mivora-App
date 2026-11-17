import type { PrismaClient } from "@/generated/prisma/client";
import { CATEGORY_SLUGS, type CategorySlug } from "@/domain/types";

export interface ChildInput {
  nickname: string | null;
  birthYear: number;
  interests: CategorySlug[];
}

/** Validates form input for a child profile. Returns null if invalid. */
export function parseChildInput(form: { nickname?: unknown; birthYear?: unknown; interests?: unknown[] }, now = new Date()): ChildInput | null {
  const nickname = typeof form.nickname === "string" ? form.nickname.trim().slice(0, 30) : "";
  const year = Number(form.birthYear);
  const thisYear = now.getUTCFullYear();
  if (!Number.isInteger(year) || year < thisYear - 17 || year > thisYear) return null;
  const interests = (form.interests ?? []).filter((v): v is CategorySlug => CATEGORY_SLUGS.includes(v as CategorySlug));
  return { nickname: nickname || null, birthYear: year, interests: [...new Set(interests)] };
}

// Every query below is scoped by userId, so one family can never read or change another's children.

export function listChildren(db: PrismaClient, userId: string) {
  return db.child.findMany({ where: { userId }, orderBy: { birthYear: "asc" } });
}

export async function addChild(db: PrismaClient, userId: string, input: ChildInput) {
  const count = await db.child.count({ where: { userId } });
  if (count >= 10) return null;
  return db.child.create({ data: { userId, ...input } });
}

/** Returns false when the child does not exist or belongs to someone else. */
export async function updateChild(db: PrismaClient, userId: string, childId: string, input: ChildInput) {
  const res = await db.child.updateMany({ where: { id: childId, userId }, data: input });
  return res.count === 1;
}

export async function removeChild(db: PrismaClient, userId: string, childId: string) {
  const res = await db.child.deleteMany({ where: { id: childId, userId } });
  return res.count === 1;
}

/** Everything we store about a parent (GDPR Art. 15/20 style export). */
export async function exportAccount(db: PrismaClient, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      children: true,
      sessions: { select: { createdAt: true, lastSeenAt: true, expiresAt: true } },
      saved: { select: { activityId: true, createdAt: true } },
      planned: { select: { activityId: true, startsAt: true, endsAt: true, createdAt: true } },
    },
  });
  if (!user) return null;
  return {
    exportedAt: new Date().toISOString(),
    account: { email: user.email, locale: user.locale, createdAt: user.createdAt },
    children: user.children.map((c) => ({ nickname: c.nickname, birthYear: c.birthYear, interests: c.interests, createdAt: c.createdAt })),
    savedActivities: user.saved,
    calendar: user.planned,
    signedInDevices: user.sessions,
  };
}

/** Deletes the account; children, sessions, saved and calendar go with it (ON DELETE CASCADE). Codes for the email too. */
export async function deleteAccount(db: PrismaClient, userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return false;
  await db.$transaction([db.loginCode.deleteMany({ where: { email: user.email } }), db.user.delete({ where: { id: userId } })]);
  return true;
}
