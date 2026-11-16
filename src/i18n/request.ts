import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { mergeMessages } from "./merge";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // German is the source of truth; any key missing in a translation falls back to German.
  const de = (await import("../../messages/de.json")).default;
  const messages =
    locale === "de" ? de : mergeMessages(de, (await import(`../../messages/${locale}.json`)).default);

  return { locale, messages, timeZone: "Europe/Berlin" };
});
