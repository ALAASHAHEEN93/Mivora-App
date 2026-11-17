import { readFileSync } from "node:fs";
import path from "node:path";
import { createTranslator } from "next-intl";
import type { PrismaClient } from "@/generated/prisma/client";
import { mergeMessages } from "@/i18n/merge";
import { routing } from "@/i18n/routing";
import { decodePlanned } from "@/domain/calendar";
import { addDays, berlinDate } from "@/domain/time";
import { formatTime } from "@/domain/format";

export type OutgoingMail = { to: string; subject: string; text: string };
export type Send = (mail: OutgoingMail) => Promise<void>;

export const RECHECK_AFTER_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

/** Translator for emails sent outside a web request (German fallback, like the app). */
function translator(locale: string, namespace: string) {
  const safe = (routing.locales as readonly string[]).includes(locale) ? locale : "de";
  const load = (l: string) => JSON.parse(readFileSync(path.join(process.cwd(), "messages", `${l}.json`), "utf8"));
  const messages = safe === "de" ? load("de") : mergeMessages(load("de"), load(safe));
  return createTranslator({ locale: safe, messages, namespace: namespace as never }) as unknown as (key: string, values?: Record<string, string | number>) => string;
}

/**
 * Evening-before reminders: one email per parent listing tomorrow's planned activities
 * (Berlin date), with which child goes. Each planned item is reminded once.
 */
export async function sendTomorrowReminders(db: PrismaClient, send: Send, appUrl: string, now = new Date()) {
  const tomorrow = addDays(berlinDate(now), 1);
  const items = await db.plannedItem.findMany({
    where: {
      reminderSentAt: null,
      startsAt: { gte: new Date(now.getTime()), lte: new Date(now.getTime() + 2 * DAY) },
      user: { remindersEnabled: true },
    },
    include: { user: { select: { id: true, email: true, locale: true, children: { select: { id: true, nickname: true } } } } },
    orderBy: { startsAt: "asc" },
  });
  const due = items.filter((i) => berlinDate(i.startsAt) === tomorrow);
  const byUser = new Map<string, typeof due>();
  for (const i of due) byUser.set(i.userId, [...(byUser.get(i.userId) ?? []), i]);

  let sent = 0;
  for (const list of byUser.values()) {
    const user = list[0]!.user;
    const t = translator(user.locale, "reminderEmail");
    const titles = await db.activityTranslation.findMany({
      where: { activityId: { in: list.map((i) => i.activityId) }, locale: { in: [user.locale, "de"] } },
    });
    const lines = list.map((i) => {
      const title = titles.find((x) => x.activityId === i.activityId && x.locale === user.locale)?.title ?? titles.find((x) => x.activityId === i.activityId)?.title ?? "";
      const plan = decodePlanned(i.key);
      const kids = i.childIds.map((id) => user.children.find((c) => c.id === id)?.nickname).filter(Boolean).join(", ");
      const time = plan ? `${formatTime(plan.startsAt, user.locale)}–${formatTime(plan.endsAt, user.locale)}` : "";
      return `• ${time} ${title}${kids ? ` (${kids})` : ""}`;
    });
    await send({
      to: user.email,
      subject: t("subject", { count: list.length }),
      text: [t("intro"), "", ...lines, "", t("link", { url: `${appUrl}/${user.locale}/meine-woche` }), "", t("optOut"), "– Mivora"].join("\n"),
    });
    await db.plannedItem.updateMany({ where: { id: { in: list.map((i) => i.id) } }, data: { reminderSentAt: now } });
    sent++;
  }
  return sent;
}

/**
 * "Is your listing still current?": published provider listings not confirmed for 30 days
 * get one email (again at most weekly). Confirming happens in "Meine Angebote".
 */
export async function sendRecheckRequests(db: PrismaClient, send: Send, appUrl: string, now = new Date()) {
  const stale = await db.activity.findMany({
    where: {
      status: "published",
      sourceType: "provider",
      expiresAt: { gt: now },
      lastVerifiedAt: { lt: new Date(now.getTime() - RECHECK_AFTER_DAYS * DAY) },
      OR: [{ recheckSentAt: null }, { recheckSentAt: { lt: new Date(now.getTime() - 7 * DAY) } }],
      submittedBy: { isNot: null },
    },
    include: { submittedBy: { select: { email: true, locale: true } }, translations: { where: { locale: "de" }, select: { title: true } } },
  });
  for (const a of stale) {
    const t = translator(a.submittedBy!.locale, "recheckEmail");
    const title = a.translations[0]?.title ?? "";
    await send({
      to: a.submittedBy!.email,
      subject: t("subject", { title }),
      text: [t("intro", { title }), "", t("action", { url: `${appUrl}/${a.submittedBy!.locale}/anbieten` }), "", t("why"), "– Mivora"].join("\n"),
    });
    await db.activity.update({ where: { id: a.id }, data: { recheckSentAt: now } });
  }
  return stale.length;
}

/** Provider confirms their listing is still current (own listings only). */
export async function confirmListing(db: PrismaClient, userId: string, activityId: string, now = new Date()) {
  const res = await db.activity.updateMany({ where: { id: activityId, submittedById: userId, status: "published" }, data: { lastVerifiedAt: now, recheckSentAt: null } });
  if (res.count === 1) await db.auditLog.create({ data: { activityId, actorId: userId, action: "confirmed_current" } });
  return res.count === 1;
}

export function isStale(lastVerifiedAt: Date, now = new Date()) {
  return now.getTime() - lastVerifiedAt.getTime() > RECHECK_AFTER_DAYS * DAY;
}
