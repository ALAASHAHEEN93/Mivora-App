"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { ActivityResult } from "@/domain/filters";
import { sortByDistance } from "@/domain/geo";
import { ActivityCard } from "./ActivityCard";
import { Icon } from "./Icon";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), { ssr: false });

/**
 * Results as list or map, with "near me". The position comes from the browser and is used
 * only on this device to sort and show distances; it is never sent to the server.
 */
export function ExploreResults({ results }: { results: ActivityResult[] }) {
  const t = useTranslations("explore");
  const locale = useLocale();
  const [view, setView] = useState<"list" | "map">("list");
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);

  const sorted = useMemo(
    () => (me ? sortByDistance(results, me, (r) => r.activity.venue) : results.map((item) => ({ item, km: null as number | null }))),
    [results, me],
  );
  const km = new Intl.NumberFormat(locale, { style: "unit", unit: "kilometer", maximumFractionDigits: 1 });

  function nearMe() {
    if (!("geolocation" in navigator)) return setLocError(true);
    setLocating(true);
    setLocError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocError(true);
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  const tab = (v: "list" | "map", label: string) => (
    <button
      type="button"
      aria-pressed={view === v}
      onClick={() => setView(v)}
      className={`min-h-11 flex-1 rounded-full font-bold transition ${view === v ? "bg-primary text-on-primary shadow-md" : "text-muted hover:text-ink"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label={t("viewLabel")} className="flex min-w-48 flex-1 rounded-full bg-surface p-1.5 shadow-[0_4px_14px_-8px_rgba(42,47,58,0.35)]">
          {tab("list", t("list"))}
          {tab("map", t("map"))}
        </div>
        <button
          type="button"
          onClick={nearMe}
          aria-pressed={Boolean(me)}
          disabled={locating}
          className={`inline-flex min-h-12 items-center gap-2 rounded-full px-4 font-bold shadow-[0_4px_14px_-8px_rgba(42,47,58,0.35)] ${me ? "bg-coral-500 text-[#263847]" : "bg-surface"}`}
        >
          <Icon name="pin" className="size-5" />
          {locating ? t("locating") : t("nearMe")}
        </button>
      </div>
      <p className="text-xs text-muted" role="status">
        {locError ? t("locationError") : me ? t("nearMeActive") : t("locationPrivacy")}
      </p>

      {view === "map" ? (
        <MapView results={sorted.map((s) => s.item)} me={me} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(({ item: { activity, sessions }, km: d }) => (
            <li key={activity.id}>
              <ActivityCard activity={activity} nextSession={sessions[0]!} distance={d === null ? undefined : km.format(d)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
