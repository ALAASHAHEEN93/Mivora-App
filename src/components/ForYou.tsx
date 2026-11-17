import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { activityRepository } from "@/data/repository";
import { getPrisma } from "@/data/db/client";
import { childColor } from "@/domain/children";
import { possibleAges, suggestForChild } from "@/domain/suggestions";
import { listChildren } from "@/server/family";
import { accountsAvailable, getCurrentUser } from "@/server/auth/session";
import { ActivityCard } from "./ActivityCard";
import { ScrollRow } from "./ScrollRow";
import { Mascot } from "./illustrations/Mascot";

/**
 * "Für Maus": activities that fit each child's age (interests first).
 * Computed on the server from the birth year only; nothing extra is stored.
 * Without child profiles it shows a short invitation instead.
 */
export async function ForYou({ now }: { now: Date }) {
  if (!accountsAvailable()) return null;
  const t = await getTranslations();
  const user = await getCurrentUser();
  const children = user ? await listChildren(getPrisma(), user.id) : [];

  if (children.length === 0) {
    return (
      <section className="flex items-center gap-4 rounded-3xl bg-surface p-5 shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)]">
        <Mascot className="size-16 shrink-0" mood="wow" />
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-bold">{t("home.forYouTitle")}</h2>
          <p className="text-sm text-muted">{t("home.forYouPitch")}</p>
          <Link
            href={user ? "/profil" : "/anmelden"}
            className="inline-flex min-h-11 w-fit items-center rounded-full bg-primary px-5 font-bold text-on-primary transition active:scale-[0.98]"
          >
            {user ? t("family.addChild") : t("family.signIn")}
          </Link>
        </div>
      </section>
    );
  }

  const all = await activityRepository.search({}, now);
  return (
    <>
      {children.slice(0, 4).map((c, i) => {
        const name = c.nickname ?? t("family.childFallback", { n: i + 1 });
        const [, age] = possibleAges(c.birthYear, now);
        const picks = suggestForChild(all, c, now);
        const interests = c.interests.map((x) => t(`categories.${x}`)).join(", ");
        return (
          <section key={c.id} aria-labelledby={`for-${c.id}`}>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-full text-lg font-bold text-[#392f5a] shadow-[0_6px_16px_-10px_rgba(36,48,77,0.5)]"
                  style={{ background: childColor(i) }}
                >
                  {name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h2 id={`for-${c.id}`} className="truncate font-display text-2xl font-bold md:text-3xl">
                    {t("home.forChild", { name })}
                  </h2>
                  <p className="truncate text-sm text-muted">
                    {t("family.age", { age })}
                    {interests && ` · ${interests}`}
                  </p>
                </div>
              </div>
              <Link
                href={{ pathname: "/entdecken", query: { alter: String(age) } }}
                className="shrink-0 font-bold underline decoration-2 underline-offset-4 hover:text-accent"
              >
                {t("home.seeAll")}
              </Link>
            </div>
            {picks.length === 0 ? (
              <p className="rounded-2xl bg-surface px-4 py-3 text-muted">{t("home.forChildEmpty", { name })}</p>
            ) : (
              <ScrollRow className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
                {picks.map(({ activity, sessions }) => (
                  <li key={activity.id} className="w-[17rem] shrink-0 snap-start md:w-auto">
                    <ActivityCard activity={activity} nextSession={sessions[0]!} />
                  </li>
                ))}
              </ScrollRow>
            )}
          </section>
        );
      })}
    </>
  );
}
