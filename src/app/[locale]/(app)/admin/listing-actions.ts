"use server";

import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPrisma } from "@/data/db/client";
import { parseSubmission } from "@/domain/submission";
import { createSubmission, isAdmin, updateSubmission } from "@/server/listings";
import { confirmListing } from "@/server/jobs";
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
  if (!isAdmin(user.email)) redirect(`/${locale}`);

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
  const wantsPublish = formData.get("publishNow") === "yes";
  const editId = String(formData.get("editId") ?? "");
  if (editId) {
    const me = { id: user.id, email: user.email };
    const upd = await updateSubmission(getPrisma(), user.id, editId, parsed.value, new Date(), photoId, wantsPublish ? me : null, me);
    if (!upd) {
      if (photoId) await deletePhoto(photoId);
      redirect(`/${locale}/admin`);
    }
    redirect(upd.published ? `/${locale}/aktivitaet/${upd.slug}?neu=1` : `/${locale}/admin?ergebnis=gespeichert`);
  }
  const res = await createSubmission(getPrisma(), user.id, parsed.value, new Date(), photoId, wantsPublish ? { id: user.id, email: user.email } : null);
  if (!res.ok) {
    if (photoId) await deletePhoto(photoId);
    return { errors: {}, values: valuesOf(formData), limit: true, hadPhoto: Boolean(photo) };
  }
  redirect(res.published ? `/${locale}/aktivitaet/${res.slug}?neu=1` : `/${locale}/admin?ergebnis=gespeichert`);
}

export async function confirmCurrentAction(formData: FormData) {
  const l = String(formData.get("locale") ?? "");
  const locale = hasLocale(routing.locales, l) ? l : routing.defaultLocale;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/anmelden`);
  if (!isAdmin(user.email)) redirect(`/${locale}`);
  await confirmListing(getPrisma(), user.id, String(formData.get("id") ?? ""));
  redirect(`/${locale}/admin?ergebnis=bestaetigt&tab=alle`);
}
