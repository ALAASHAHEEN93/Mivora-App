"use server";

import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPrisma } from "@/data/db/client";
import { parseSubmission, type FieldError } from "@/domain/submission";
import { createSubmission } from "@/server/listings";
import { getCurrentUser } from "@/server/auth/session";

export type SubmitState = { errors: Record<string, FieldError>; values: Record<string, string | string[]>; limit?: boolean } | null;

const MULTI = new Set(["categories", "languages", "accessibility"]);

/** Keeps what the provider typed, so a mistake never wipes the form. */
function valuesOf(formData: FormData) {
  const out: Record<string, string | string[]> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v !== "string" || k.startsWith("$")) continue;
    if (MULTI.has(k)) out[k] = [...((out[k] as string[]) ?? []), v];
    else out[k] = v;
  }
  return out;
}

export async function submitListing(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const l = String(formData.get("locale") ?? "");
  const locale = hasLocale(routing.locales, l) ? l : routing.defaultLocale;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/anmelden`);

  const parsed = parseSubmission(formData);
  if (!parsed.ok) return { errors: parsed.errors, values: valuesOf(formData) };

  const res = await createSubmission(getPrisma(), user.id, parsed.value);
  if (!res.ok) return { errors: {}, values: valuesOf(formData), limit: true };
  redirect(`/${locale}/anbieten?eingereicht=1`);
}
