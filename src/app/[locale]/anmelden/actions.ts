"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPrisma } from "@/data/db/client";
import { authSecret, CODE_TTL_MS, normalizeEmail } from "@/server/auth/crypto";
import { createLoginCode, verifyLoginCode } from "@/server/auth/service";
import { accountsAvailable, setSessionCookie } from "@/server/auth/session";
import { sendLoginCodeEmail } from "@/server/mail";
import { PENDING_COOKIE } from "@/server/auth/pending";


function localeOf(formData: FormData) {
  const l = String(formData.get("locale") ?? "");
  return hasLocale(routing.locales, l) ? l : routing.defaultLocale;
}

export async function requestCode(formData: FormData) {
  const locale = localeOf(formData);
  const base = `/${locale}/anmelden`;
  if (!accountsAvailable()) redirect(`${base}?fehler=keine-db`);
  const email = normalizeEmail(formData.get("email"));
  if (!email) redirect(`${base}?fehler=email`);

  const result = await createLoginCode(getPrisma(), email, authSecret());
  if (!result.ok) redirect(`${base}?fehler=zu-viele`);
  try {
    await sendLoginCodeEmail(email, result.code, locale);
  } catch (error) {
    console.error("Sending sign-in code failed", error);
    redirect(`${base}?fehler=mail`);
  }

  (await cookies()).set(PENDING_COOKIE, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CODE_TTL_MS / 1000,
  });
  redirect(`${base}?schritt=code`);
}

export async function confirmCode(formData: FormData) {
  const locale = localeOf(formData);
  const base = `/${locale}/anmelden`;
  if (!accountsAvailable()) redirect(`${base}?fehler=keine-db`);
  const store = await cookies();
  const email = normalizeEmail(store.get(PENDING_COOKIE)?.value);
  if (!email) redirect(base);

  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  const result = await verifyLoginCode(getPrisma(), email, code, authSecret(), locale);
  if (!result.ok) redirect(`${base}?schritt=code&fehler=code`);

  store.delete(PENDING_COOKIE);
  await setSessionCookie(result.token);
  redirect(`/${locale}/profil`);
}

export async function restartSignIn(formData: FormData) {
  (await cookies()).delete(PENDING_COOKIE);
  redirect(`/${localeOf(formData)}/anmelden`);
}
