"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Activity } from "@/domain/types";
import {
  decodePlanned,
  encodePlanned,
  findConflicts,
  monthGrid,
  shiftMonth,
  toIcs,
  weekDays,
  type PlannedItem,
} from "@/domain/calendar";
import { searchActivities, upcomingSessions } from "@/domain/filters";
import { addDays, berlinDate } from "@/domain/time";
import { formatTime, intlLocale } from "@/domain/format";
import { pickContent } from "@/domain/localize";
import { usePlanned } from "@/components/saved-store";
import { ActivityCard } from "@/components/ActivityCard";
import { ListingPicture } from "@/components/ListingPicture";
import { PlanButton } from "@/components/PlanButton";
import { Icon } from "@/components/Icon";
import { Link } from "@/i18n/navigation";

type View = "week" | "month";

const dayOf = (iso: string) => berlinDate(new Date(iso));
/** Noon UTC keeps Intl formatting on the right calendar day in any timezone. */
const asDate = (isoDay: string) => new Date(`${isoDay}T12:00:00Z`);

export function Calendar({ activities, today, nowIso }: { activities: Activity[]; today: string; nowIso: string }) {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const now = useMemo(() => new Date(nowIso), [nowIso]);
  const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intlLocale(locale), { ...opts, timeZone: "UTC" });

  const [view, setView] = useState<View>("month");
  const [selected, setSelected] = useState(today);
  const [shown, setShown] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }));

  const byId = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities]);
  const { ids } = usePlanned();

  const planned = useMemo(
    () =>
      ids
        .map(decodePlanned)
        .filter((p): p is PlannedItem => p !== null && byId.has(p.activityId))
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [ids, byId],
  );

  const plannedByDay = useMemo(() => {
    const m = new Map<string, PlannedItem[]>();
    for (const p of planned) m.set(dayOf(p.startsAt), [...(m.get(dayOf(p.startsAt)) ?? []), p]);
    return m;
  }, [planned]);

  const offerDays = useMemo(() => {
    const s = new Set<string>();
    for (const a of activities) for (const sess of upcomingSessions(a, now)) s.add(dayOf(sess.startsAt));
    return s;
  }, [activities, now]);

  const dayPlanned = plannedByDay.get(selected) ?? [];
  const conflicts = findConflicts(dayPlanned);
  const plannedKeys = new Set(planned.map(encodePlanned));
  const ideas = searchActivities(activities, { day: selected }, now)
    .map((r) => ({ ...r, sessions: r.sessions.filter((s) => !plannedKeys.has(encodePlanned({ activityId: r.activity.id, startsAt: s.startsAt, endsAt: s.endsAt }))) }))
    .filter((r) => r.sessions.length > 0);

  function select(day: string) {
    setSelected(day);
    setShown({ year: Number(day.slice(0, 4)), month: Number(day.slice(5, 7)) });
  }

  function exportIcs() {
    const events = planned.map((p) => {
      const a = byId.get(p.activityId)!;
      return {
        uid: encodePlanned(p).replace(/[^a-zA-Z0-9]/g, ""),
        title: pickContent(a, locale).text.title,
        location: `${a.venue.name}, ${a.venue.city}-${a.venue.district}`,
        startsAt: p.startsAt,
        endsAt: p.endsAt,
      };
    });
    const url = URL.createObjectURL(new Blob([toIcs(events)], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "mivora-kalender.ics";
    link.click();
    URL.revokeObjectURL(url);
  }

  const weekdayNames = weekDays("2024-01-01").map((d) => fmt({ weekday: "short" }).format(asDate(d)));

  function dots(day: string, active: boolean) {
    const count = Math.min(plannedByDay.get(day)?.length ?? 0, 3);
    return (
      <span className="flex h-1.5 items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={`size-1.5 rounded-full ${active ? "bg-on-primary" : "bg-primary"}`} />
        ))}
        {count === 0 && offerDays.has(day) && <span className={`size-1.5 rounded-full ${active ? "bg-on-primary/70" : "bg-teal-700/60"}`} />}
      </span>
    );
  }

  function dayButton(day: string, compact = false) {
    const active = day === selected;
    const isToday = day === today;
    const past = day < today;
    const n = plannedByDay.get(day)?.length ?? 0;
    return (
      <button
        key={day}
        type="button"
        onClick={() => select(day)}
        aria-pressed={active}
        aria-current={isToday ? "date" : undefined}
        aria-label={`${fmt({ weekday: "long", day: "numeric", month: "long" }).format(asDate(day))}, ${t("dayPlanned", { count: n })}`}
        className={`flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-full text-base font-bold transition ${
          active
            ? "bg-primary text-on-primary shadow-[0_8px_18px_-6px_rgba(229,82,63,0.9)]"
            : `bg-surface shadow-[0_3px_10px_-6px_rgba(42,47,58,0.35)] hover:-translate-y-0.5 ${past ? "text-muted" : ""}`
        } ${isToday && !active ? "ring-2 ring-accent" : ""}`}
      >
        {compact && <span className="text-[0.65rem] font-semibold opacity-80">{fmt({ weekday: "short" }).format(asDate(day))}</span>}
        <span>{Number(day.slice(8, 10))}</span>
        {dots(day, active)}
      </button>
    );
  }

  const navButton = (dir: "prev" | "next", onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={t(dir)}
      className="grid size-11 place-items-center rounded-full bg-surface shadow-[0_3px_10px_-6px_rgba(42,47,58,0.35)] hover:-translate-y-0.5"
    >
      <Icon name={dir === "prev" ? "back" : "forward"} />
    </button>
  );

  const week = weekDays(selected);
  const weekLabel = `${fmt({ day: "numeric", month: "short" }).format(asDate(week[0]!))} – ${fmt({ day: "numeric", month: "short", year: "numeric" }).format(asDate(week[6]!))}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold md:text-4xl">{t("title")}</h1>
        <button
          type="button"
          onClick={() => select(today)}
          className="rounded-full bg-surface px-4 py-2 font-bold shadow-[0_3px_10px_-6px_rgba(42,47,58,0.35)] hover:-translate-y-0.5"
        >
          {t("today")}
        </button>
      </div>

      <div role="group" aria-label={t("views")} className="grid grid-cols-2 rounded-full bg-surface p-1.5 shadow-[0_4px_14px_-8px_rgba(42,47,58,0.35)]">
        {(["week", "month"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className={`min-h-11 rounded-full font-bold transition ${view === v ? "bg-primary text-on-primary shadow-md" : "text-muted hover:text-ink"}`}
          >
            {t(v)}
          </button>
        ))}
      </div>

      <section className="md:grid md:grid-cols-[minmax(0,26rem)_1fr] md:items-start md:gap-8">
        <div className="flex flex-col gap-4">
          {view === "month" ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-2xl font-bold" aria-live="polite">
                  {fmt({ month: "long", year: "numeric" }).format(asDate(`${shown.year}-${String(shown.month).padStart(2, "0")}-15`))}
                </h2>
                <div className="flex gap-2">
                  {navButton("prev", () => setShown((s) => shiftMonth(s.year, s.month, -1)))}
                  {navButton("next", () => setShown((s) => shiftMonth(s.year, s.month, 1)))}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-muted sm:gap-2" aria-hidden="true">
                {weekdayNames.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
              <div className="flex flex-col gap-1.5 sm:gap-2">
                {monthGrid(shown.year, shown.month).map((row, i) => (
                  <div key={i} className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {row.map((day, j) =>
                      day ? (
                        dayButton(day)
                      ) : (
                        <span
                          key={`e${j}`}
                          aria-hidden="true"
                          className="aspect-square rounded-full bg-[repeating-linear-gradient(135deg,var(--kw-line)_0_2px,transparent_2px_7px)] opacity-70"
                        />
                      ),
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl font-bold" aria-live="polite">
                  {weekLabel}
                </h2>
                <div className="flex gap-2">
                  {navButton("prev", () => select(addDays(selected, -7)))}
                  {navButton("next", () => select(addDays(selected, 7)))}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {week.map((d) => (
                  dayButton(d, true)
                ))}
              </div>
            </>
          )}
          <p className="flex flex-wrap gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" /> {t("legendPlanned")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-teal-700/60" /> {t("legendOffers")}
            </span>
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:mt-0">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            {fmt({ weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(asDate(selected))}
          </h2>

          {conflicts.size > 0 && (
            <p role="status" className="flex items-center gap-2 rounded-2xl bg-sun-100 px-4 py-3 font-bold">
              <Icon name="alert" className="size-5 shrink-0" /> {t("conflict")}
            </p>
          )}

          {dayPlanned.length === 0 ? (
            <p className="rounded-2xl bg-surface px-4 py-3 text-muted shadow-[0_3px_10px_-6px_rgba(42,47,58,0.25)]">{t("nothingPlanned")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {dayPlanned.map((p) => {
                const a = byId.get(p.activityId)!;
                const { text, lang } = pickContent(a, locale);
                const clash = conflicts.has(encodePlanned(p));
                return (
                  <li
                    key={encodePlanned(p)}
                    className={`flex items-stretch overflow-hidden rounded-3xl bg-surface shadow-[0_8px_24px_-14px_rgba(42,47,58,0.45)] ${clash ? "ring-2 ring-[#e5523f]" : ""}`}
                  >
                    <ListingPicture activity={a} sizes="112px" className="aspect-square w-24 shrink-0 sm:w-28" />
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3">
                      <p className="text-sm font-bold text-accent">
                        {formatTime(p.startsAt, locale)} – {formatTime(p.endsAt, locale)}
                      </p>
                      <Link href={`/aktivitaet/${a.slug}`} lang={lang} className="font-display text-lg font-bold leading-tight hover:underline">
                        {text.title}
                      </Link>
                      <p className="flex items-center gap-1 text-sm text-muted">
                        <Icon name="pin" className="size-4" /> {a.venue.district}
                      </p>
                    </div>
                    <div className="flex items-center pe-3">
                      <PlanButton item={p} label={text.title} compact />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <h3 className="mt-4 font-display text-xl font-bold">{t("ideas")}</h3>
          {selected < today || ideas.length === 0 ? (
            <p className="text-muted">{t("noIdeas")}</p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2">
              {ideas.map(({ activity, sessions }) => {
                const s = sessions[0]!;
                return (
                  <li key={activity.id} className="flex flex-col gap-2">
                    <ActivityCard activity={activity} nextSession={s} />
                    <div className="flex justify-end">
                      <PlanButton
                        item={{ activityId: activity.id, startsAt: s.startsAt, endsAt: s.endsAt }}
                        label={pickContent(activity, locale).text.title}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={exportIcs}
              disabled={planned.length === 0}
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-surface px-4 font-bold shadow-[0_3px_10px_-6px_rgba(42,47,58,0.35)] ring-2 ring-line disabled:opacity-50"
            >
              <Icon name="download" className="size-5" /> {t("export")}
            </button>
            <p className="text-sm text-muted">{t("deviceNote")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
