"use server";

import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPrisma } from "@/data/db/client";
import { createReport } from "@/server/reports";
import { createInquiry } from "@/server/inquiries";
import { sendInquiryEmail } from "@/server/mail";
import { formatSessionStart } from "@/domain/format";
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

export async function inquiryAction(formData: FormData) {
  const l = String(formData.get("locale") ?? "");
  const locale = hasLocale(routing.locales, l) ? l : routing.defaultLocale;
  const slug = String(formData.get("slug") ?? "").replace(/[^a-z0-9-]/g, "");
  const back = `/${locale}/aktivitaet/${slug}`;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/anmelden`);

  const res = await createInquiry(getPrisma(), {
    activityId: String(formData.get("activityId") ?? ""),
    parentId: user.id,
    message: formData.get("message"),
    sessionAt: formData.get("sessionAt"),
    childAge: formData.get("childAge"),
    consent: formData.get("consent"),
  });
  if (!res.ok) redirect(`${back}?anfrage=${res.reason}#anfrage`);

  try {
    const age = formData.get("childAge");
    await sendInquiryEmail({
      to: res.to.email,
      providerLocale: res.to.locale,
      parentEmail: user.email,
      title: res.title,
      sessionLabel: res.sessionAt ? formatSessionStart(res.sessionAt.toISOString(), res.to.locale) : null,
      childAge: age ? Number(age) : null,
      message: String(formData.get("message") ?? "").trim(),
    });
  } catch (error) {
    console.error("Sending booking request failed", error);
    redirect(`${back}?anfrage=mail#anfrage`);
  }
  redirect(`${back}?anfrage=gesendet#anfrage`);
}
