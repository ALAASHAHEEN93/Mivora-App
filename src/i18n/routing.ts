import { defineRouting } from "next-intl/routing";

export const locales = ["de", "en", "ar", "tr", "uk", "pl", "fr", "es", "it"] as const;
export type Locale = (typeof locales)[number];

export const rtlLocales: readonly Locale[] = ["ar"];

/** Native names, shown in the language switcher regardless of current UI language. */
export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  ar: "العربية",
  tr: "Türkçe",
  uk: "Українська",
  pl: "Polski",
  fr: "Français",
  es: "Español",
  it: "Italiano",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "de",
  localePrefix: "always",
});
