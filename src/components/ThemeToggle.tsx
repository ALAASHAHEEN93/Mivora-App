"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";
import { applyTheme, isDarkNow } from "./theme-client";

/** Moon button in the top bar: switches between light and dark right away. */
export function ThemeToggle() {
  const t = useTranslations("common");
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setDark(isDarkNow());
    sync();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    window.addEventListener("mv-theme-change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("mv-theme-change", sync);
    };
  }, []);

  return (
    <button
      type="button"
      aria-pressed={dark ?? false}
      aria-label={t("themeDarkToggle")}
      onClick={() => applyTheme(isDarkNow() ? "light" : "dark")}
      className="mv-press grid size-10 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-[0_4px_14px_-8px_rgba(42,47,58,0.45)]"
    >
      <Icon name="moon" filled={dark === true} className="size-5" />
    </button>
  );
}
