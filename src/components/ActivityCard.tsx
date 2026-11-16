import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Activity, Session } from "@/domain/types";
import { formatSessionStart, priceAmount } from "@/domain/format";
import { pickContent } from "@/domain/localize";
import { Icon } from "./Icon";
import { SaveButton } from "./SaveButton";
import { ListingPicture } from "./ListingPicture";

/** Picture card: illustration fills the card, title and date sit on a dark gradient for contrast. */
export function ActivityCard({
  activity,
  nextSession,
  size = "md",
}: {
  activity: Activity;
  nextSession: Session;
  size?: "md" | "lg";
}) {
  const locale = useLocale();
  const t = useTranslations();
  const { text, lang } = pickContent(activity, locale);
  const amount = priceAmount(activity.price, locale);

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] bg-surface shadow-[0_10px_30px_-12px_rgba(42,47,58,0.35)] transition hover:-translate-y-1">
      <ListingPicture
        activity={activity}
        sizes={size === "lg" ? "(min-width: 768px) 50vw, 90vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"}
        className={`w-full transition duration-500 group-hover:scale-105 ${size === "lg" ? "aspect-[16/10]" : "aspect-[4/3]"}`}
      />

      <div className="absolute start-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 py-1 pe-3 ps-1 text-sm font-bold text-[#1f2430] shadow-sm">
        <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-[#ff7a1a] text-xs text-[#2a1608]">
          {activity.provider.name.charAt(0)}
        </span>
        {t("common.ageShort", { min: activity.ageMin, max: activity.ageMax })}
      </div>
      <div className="absolute end-3 top-3 z-10">
        <SaveButton id={activity.id} title={text.title} />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 from-35% via-black/40 via-65% to-transparent px-4 pb-4 pt-16 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
        <h3 lang={lang} className={`font-display font-bold leading-tight ${size === "lg" ? "text-2xl" : "text-xl"}`}>
          <Link href={`/aktivitaet/${activity.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {text.title}
          </Link>
        </h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" className="size-4" />
            <time dateTime={nextSession.startsAt}>{formatSessionStart(nextSession.startsAt, locale)}</time>
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="pin" className="size-4" />
            {activity.venue.district}
          </span>
          <span className="ms-auto rounded-full bg-[#ff7a1a] px-2.5 py-0.5 font-bold text-[#1f2430] [text-shadow:none]">
            {amount ?? t("common.free")}
          </span>
        </p>
      </div>
    </article>
  );
}
