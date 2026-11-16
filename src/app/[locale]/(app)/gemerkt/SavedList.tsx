"use client";

import { useTranslations } from "next-intl";
import type { ActivityResult } from "@/domain/filters";
import { useSavedIds } from "@/components/saved-store";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState, buttonPrimary } from "@/components/ui";
import { Link } from "@/i18n/navigation";

export function SavedList({ all }: { all: ActivityResult[] }) {
  const t = useTranslations("saved");
  const { ids } = useSavedIds();
  const saved = all.filter((r) => ids.includes(r.activity.id));

  if (saved.length === 0) {
    return (
      <EmptyState
        title={t("emptyTitle")}
        text={t("emptyText")}
        action={
          <Link href="/entdecken" className={buttonPrimary}>
            {t("browse")}
          </Link>
        }
      />
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {saved.map(({ activity, sessions }) => (
        <li key={activity.id}>
          <ActivityCard activity={activity} nextSession={sessions[0]!} />
        </li>
      ))}
    </ul>
  );
}
