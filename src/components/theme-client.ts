"use client";

import { THEME_COLOR, THEME_COOKIE, type Theme } from "@/domain/theme";

/** Applies the choice at once (no reload) and remembers it for a year on this device. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`;
  } else {
    root.setAttribute("data-theme", theme);
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
  }
  const dark = isDarkNow();
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", dark ? THEME_COLOR.dark : THEME_COLOR.light));
  window.dispatchEvent(new Event("mv-theme-change"));
}

export function currentTheme(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "light" || t === "dark" ? t : "system";
}

export function isDarkNow(): boolean {
  const t = currentTheme();
  return t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}
