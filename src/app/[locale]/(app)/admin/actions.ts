"use server";

import { notFound, redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPrisma } from "@/data/db/client";
import { approveSubmission, isAdmin, rejectSubmission } from "@/server/listings";
import { getCurrentUser } from "@/server/auth/session";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email)) notFound();
  return user;
}

function localeOf(formData: FormData) {
  const l = String(formData.get("locale") ?? "");
  return hasLocale(routing.locales, l) ? l : routing.defaultLocale;
}

export async function approveAction(formData: FormData) {
  const user = await requireAdmin();
  const ok = await approveSubmission(getPrisma(), user, String(formData.get("id")));
  redirect(`/${localeOf(formData)}/admin?ergebnis=${ok ? "freigegeben" : "fehler"}`);
}

export async function rejectAction(formData: FormData) {
  const user = await requireAdmin();
  const ok = await rejectSubmission(getPrisma(), user, String(formData.get("id")), String(formData.get("reason") ?? ""));
  redirect(`/${localeOf(formData)}/admin?ergebnis=${ok ? "abgelehnt" : "fehler"}`);
}
