"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { THEMES, type Theme } from "@/domain/theme";
import { applyTheme } from "./theme-client";

/** Appearance setting in Profil: automatic (like the device), light or dark. */
export function ThemeChoice({ initial }: { initial: Theme }) {
  const t = useTranslations("common");
  const [value, setValue] = useState<Theme>(initial);
  const label: Record<Theme, string> = { system: t("themeSystem"), light: t("themeLight"), dark: t("themeDark") };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-bold">{t("themeTitle")}</legend>
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map((th) => (
          <label
            key={th}
            className="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border-2 border-line bg-bg px-2 text-center text-sm font-bold has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-bg has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2"
          >
            <input
              type="radio"
              name="theme"
              value={th}
              checked={value === th}
              onChange={() => {
                setValue(th);
                applyTheme(th);
              }}
              className="sr-only"
            />
            {label[th]}
          </label>
        ))}
      </div>
      <p className="text-sm text-muted">{t("themeHint")}</p>
    </fieldset>
  );
}
