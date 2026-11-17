"use server";

import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPrisma } from "@/data/db/client";
import { createReport } from "@/server/reports";
import { accountsAvailable, getCurrentUser } from "@/server/auth/session";

export async function reportAction(formData: FormData) {
  const l = String(formData.get("locale") ?? "");
  const locale = hasLocale(routing.locales, l) ? l : routing.defaultLocale;
  const slug = String(formData.get("slug") ?? "").replace(/[^a-z0-9-]/g, "");
  const back = `/${locale}/aktivitaet/${slug}`;
  if (!accountsAvailable()) redirect(`${back}?meldung=aus#melden`);
  const user = await getCurrentUser();
  const res = await createReport(getPrisma(), {
    activityId: String(formData.get("activityId") ?? ""),
    reason: formData.get("reason"),
    message: formData.get("message"),
    reporterId: user?.id ?? null,
  });
  redirect(`${back}?meldung=${res.ok ? "danke" : res.reason === "limit" ? "limit" : "fehler"}#melden`);
}
