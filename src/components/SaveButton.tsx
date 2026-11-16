"use client";

import { useTranslations } from "next-intl";
import { useSavedIds } from "./saved-store";
import { Icon } from "./Icon";

export function SaveButton({ id, title, size = "sm" }: { id: string; title: string; size?: "sm" | "lg" }) {
  const t = useTranslations("common");
  const { ids, toggle } = useSavedIds();
  const saved = ids.includes(id);

  if (size === "lg") {
    return (
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => toggle(id)}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink px-5 font-bold hover:bg-sun-100"
      >
        <Icon name="heart" filled={saved} className="size-5 text-accent" />
        {saved ? t("saved") : t("save")}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`${saved ? t("saved") : t("save")}: ${title}`}
      onClick={() => toggle(id)}
      className="grid size-11 place-items-center rounded-full bg-surface/90 text-accent shadow-sm hover:scale-105"
    >
      <Icon name="heart" filled={saved} className="size-5" />
    </button>
  );
}
