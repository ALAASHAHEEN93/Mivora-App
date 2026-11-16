"use client";

import { useTranslations } from "next-intl";
import { encodePlanned, type PlannedItem } from "@/domain/calendar";
import { usePlanned } from "./saved-store";
import { Icon } from "./Icon";

/** Toggle a specific session in/out of the family calendar. */
export function PlanButton({ item, label, compact = false }: { item: PlannedItem; label: string; compact?: boolean }) {
  const t = useTranslations("calendar");
  const { ids, toggle } = usePlanned();
  const key = encodePlanned(item);
  const planned = ids.includes(key);

  return (
    <button
      type="button"
      aria-pressed={planned}
      aria-label={`${planned ? t("unplan") : t("plan")}: ${label}`}
      onClick={() => toggle(key)}
      className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full text-sm font-bold transition ${compact ? "size-11" : "px-3.5"} ${
        planned ? "bg-primary text-on-primary shadow-md" : "bg-coral-100 text-ink hover:-translate-y-0.5"
      }`}
    >
      <Icon name={planned ? "check" : "calendar"} className="size-4" />
      {!compact && (planned ? t("plannedShort") : t("plan"))}
    </button>
  );
}
