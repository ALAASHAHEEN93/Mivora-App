/** Light/dark choice. "system" follows the device; the others override it. Stored in a cookie on the device only. */
export const THEME_COOKIE = "mv_theme";
export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export function parseTheme(value: string | undefined | null): Theme {
  return value === "light" || value === "dark" ? value : "system";
}

/** Browser bar colour for each look (matches --kw-hero / --kw-bg). */
export const THEME_COLOR = { light: "#fff3ea", dark: "#17232c" } as const;
