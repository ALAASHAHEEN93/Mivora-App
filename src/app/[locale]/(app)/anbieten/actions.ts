"use server";

import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPrisma } from "@/data/db/client";
import { parseSubmission } from "@/domain/submission";
import { createSubmission } from "@/server/listings";
import { deletePhoto, processPhoto, savePhoto } from "@/server/photos";
import { getCurrentUser } from "@/server/auth/session";

export type SubmitState = { errors: Record<string, string>; values: Record<string, string | string[]>; limit?: boolean; hadPhoto?: boolean } | null;

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

  const file = formData.get("photo");
  const photo = file instanceof File && file.size > 0 ? file : null;
  const parsed = parseSubmission(formData);
  const errors: Record<string, string> = parsed.ok ? {} : { ...parsed.errors };
  if (photo && formData.get("confirmPhoto") !== "yes") errors.confirmPhoto = "confirm";

  // Check the photo even when other fields have errors, so all problems show at once.
  const processed = photo ? await processPhoto(photo) : null;
  if (processed && !processed.ok) errors.photo = processed.error;
  if (!parsed.ok || Object.keys(errors).length > 0) return { errors, values: valuesOf(formData), hadPhoto: Boolean(photo) };

  const photoId = processed?.ok ? await savePhoto(processed.data) : null;
  const res = await createSubmission(getPrisma(), user.id, parsed.value, new Date(), photoId);
  if (!res.ok) {
    if (photoId) await deletePhoto(photoId);
    return { errors: {}, values: valuesOf(formData), limit: true, hadPhoto: Boolean(photo) };
  }
  redirect(`/${locale}/anbieten?eingereicht=1`);
}
