"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPrisma } from "@/data/db/client";
import { addChild, deleteAccount, parseChildInput, removeChild, updateChild } from "@/server/family";
import { getCurrentUser, signOutCurrent } from "@/server/auth/session";

function localeOf(formData: FormData) {
  const l = String(formData.get("locale") ?? "");
  return hasLocale(routing.locales, l) ? l : routing.defaultLocale;
}

/** Every action re-reads the signed-in user from the session cookie; ids from the form are never trusted alone. */
async function requireUser(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect(`/${localeOf(formData)}/anmelden`);
  return user;
}

function childInput(formData: FormData) {
  return parseChildInput({
    nickname: formData.get("nickname"),
    birthYear: formData.get("birthYear"),
    interests: formData.getAll("interests"),
  });
}

export async function addChildAction(formData: FormData) {
  const user = await requireUser(formData);
  const input = childInput(formData);
  if (!input) redirect(`/${localeOf(formData)}/profil?fehler=kind`);
  await addChild(getPrisma(), user.id, input);
  revalidatePath(`/${localeOf(formData)}/profil`);
}

export async function updateChildAction(formData: FormData) {
  const user = await requireUser(formData);
  const input = childInput(formData);
  if (!input) redirect(`/${localeOf(formData)}/profil?fehler=kind`);
  await updateChild(getPrisma(), user.id, String(formData.get("childId")), input);
  revalidatePath(`/${localeOf(formData)}/profil`);
}

export async function removeChildAction(formData: FormData) {
  const user = await requireUser(formData);
  await removeChild(getPrisma(), user.id, String(formData.get("childId")));
  revalidatePath(`/${localeOf(formData)}/profil`);
}

export async function signOutAction(formData: FormData) {
  await signOutCurrent();
  redirect(`/${localeOf(formData)}/profil`);
}

export async function deleteAccountAction(formData: FormData) {
  const user = await requireUser(formData);
  if (formData.get("confirm") !== "yes") redirect(`/${localeOf(formData)}/profil?fehler=bestaetigen`);
  await deleteAccount(getPrisma(), user.id);
  await signOutCurrent();
  redirect(`/${localeOf(formData)}/profil?geloescht=1`);
}
