"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { CITY_COOKIE, findCity } from "@/domain/cities";

/** Saves the chosen city on this device (functional cookie, no tracking) and opens the app. */
export async function chooseCity(formData: FormData) {
  const locale = String(formData.get("locale") ?? "");
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const city = findCity(String(formData.get("city") ?? ""));
  if (!city) redirect(`/${safeLocale}/willkommen?fehler=stadt`);

  (await cookies()).set(CITY_COOKIE, city.slug, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });
  redirect(`/${safeLocale}`);
}
