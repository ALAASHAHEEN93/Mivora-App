import type { Price } from "./types";
import { TIME_ZONE } from "./time";

/** Number/date formatting locale per UI locale. German-style formats for de. */
const INTL_LOCALE: Record<string, string> = {
  de: "de-DE",
  en: "en-GB",
  ar: "ar-u-nu-latn", // Latin digits: easier to match against German signage & receipts
  tr: "tr-TR",
  uk: "uk-UA",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pl: "pl-PL",
};

export function intlLocale(locale: string): string {
  return INTL_LOCALE[locale] ?? "de-DE";
}

export function formatEuro(cents: number, locale: string): string {
  return new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency: "EUR" }).format(cents / 100);
}

/** e.g. de: "Sa., 21.11., 10:00" */
export function formatSessionStart(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function priceAmount(price: Price, locale: string): string | null {
  return price.kind === "paid" && price.amountCents !== undefined ? formatEuro(price.amountCents, locale) : null;
}
