"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSavedIds } from "./saved-store";
import { Icon } from "./Icon";

export function SaveButton({ id, title, size = "sm" }: { id: string; title: string; size?: "sm" | "lg" }) {
  const t = useTranslations("common");
  const { ids, toggle } = useSavedIds();
  const saved = ids.includes(id);
  // Bumped on each tap that saves, so the sparkle plays then (not on page load).
  const [burst, setBurst] = useState(0);
  const onTap = () => {
    if (!saved) setBurst((b) => b + 1);
    toggle(id);
  };

  if (size === "lg") {
    return (
      <button
        type="button"
        aria-pressed={saved}
        onClick={onTap}
        className="relative inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full border-2 border-ink px-3 font-bold hover:bg-sun-100 md:px-5"
      >
        {saved && burst > 0 && <span key={burst} aria-hidden="true" className="mv-burst" />}
        <Icon name="heart" filled={saved} className="mv-heart size-5 text-accent" />
        {/* Icon-only in the phone action bar; the name stays for screen readers. */}
        <span className="max-md:sr-only">{saved ? t("saved") : t("save")}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`${saved ? t("saved") : t("save")}: ${title}`}
      onClick={onTap}
      className="relative grid size-11 place-items-center rounded-full bg-surface/90 text-accent shadow-sm hover:scale-105"
    >
      {saved && burst > 0 && <span key={burst} aria-hidden="true" className="mv-burst" />}
      <Icon name="heart" filled={saved} className="mv-heart size-5" />
    </button>
  );
}
