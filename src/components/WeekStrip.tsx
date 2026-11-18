import { Link } from "@/i18n/navigation";
import { addDays, berlinDate } from "@/domain/time";
import { intlLocale } from "@/domain/format";

/** Next 7 days as tappable pills (today highlighted), like a mini calendar. */
export function WeekStrip({ locale, now, selected, label }: { locale: string; now: Date; selected?: string; label: string }) {
  const today = berlinDate(now);
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const fmtDay = new Intl.DateTimeFormat(intlLocale(locale), { weekday: "short", timeZone: "UTC" });
  const fmtNum = new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", timeZone: "UTC" });
  const active = selected ?? today;

  return (
    <nav aria-label={label}>
      <ul className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((d) => {
          const date = new Date(`${d}T12:00:00Z`);
          const isActive = d === active;
          const weekend = [0, 6].includes(date.getUTCDay());
          return (
            <li key={d}>
              <Link
                href={{ pathname: "/entdecken", query: { datum: d } }}
                aria-current={isActive ? "date" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center rounded-full py-2 transition ${
                  isActive
                    ? "bg-surface text-ink shadow-[0_8px_20px_-8px_rgba(31,35,64,0.45)] ring-2 ring-[#f2a68a]"
                    : weekend
                      ? "bg-coral-100 text-ink hover:bg-surface/70"
                      : "text-muted hover:bg-surface/70"
                }`}
              >
                <span className="text-xs font-semibold">{fmtDay.format(date)}</span>
                <span className={`font-display text-xl ${isActive ? "font-bold" : ""}`}>{fmtNum.format(date)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
