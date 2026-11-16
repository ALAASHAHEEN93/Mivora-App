import type { Activity, LanguageCode, LocalizedText } from "./types";

/**
 * Pick the listing text for the UI locale. Falls back to the original language
 * and reports it, so the UI can say the text isn't translated yet.
 */
export function pickContent(activity: Activity, locale: string): { text: LocalizedText; lang: LanguageCode; isFallback: boolean } {
  const exact = activity.content[locale as LanguageCode];
  if (exact) return { text: exact, lang: locale as LanguageCode, isFallback: false };
  const original = activity.content[activity.originalLocale];
  if (!original) throw new Error(`Activity ${activity.id} has no text in its original locale`);
  return { text: original, lang: activity.originalLocale, isFallback: true };
}

export function languageName(code: string, uiLocale: string): string {
  try {
    return new Intl.DisplayNames([uiLocale], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}
