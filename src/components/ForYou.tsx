import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { activityRepository } from "@/data/repository";
import { getPrisma } from "@/data/db/client";
import { childColor } from "@/domain/children";
import { possibleAges, suggestForChild } from "@/domain/suggestions";
import { listChildren } from "@/server/family";
import { accountsAvailable, getCurrentUser } from "@/server/auth/session";
import { cookies } from "next/headers";
import { AGES_COOKIE, parseAges } from "@/domain/ages";
import { ActivityCard } from "./ActivityCard";
import { ScrollRow } from "./ScrollRow";
import { Mascot } from "./illustrations/Mascot";

/**
 * "Für Maus": activities that fit each child's age (interests first).
 * Computed on the server from the birth year only; nothing extra is stored.
 * Without child profiles it shows a short invitation instead.
 */
export async function ForYou({ now }: { now: Date }) {
  const t = await getTranslations();
  const user = accountsAvailable() ? await getCurrentUser() : null;
  const accountChildren = user ? await listChildren(getPrisma(), user.id) : [];
  // Without child profiles, use the ages picked on the welcome screen (device only).
  const deviceAges = accountChildren.length ? [] : parseAges((await cookies()).get(AGES_COOKIE)?.value);
  const year = now.getUTCFullYear();
  const children = accountChildren.length
    ? accountChildren.map((c, i) => ({ ...c, name: c.nickname ?? t("family.childFallback", { n: i + 1 }) }))
    : deviceAges.map((age) => ({ id: `age-${age}`, nickname: null, birthYear: year - age, interests: [] as string[], name: String(age), byAge: true }));

  if (children.length === 0) {
    if (!accountsAvailable()) return null;
    return (
      <section className="mv-reveal relative flex items-center gap-4 overflow-hidden rounded-[2rem] border-2 border-[#263847] bg-[#fde3d8] p-5 text-[#263847] shadow-[0_4px_0_#263847]">
        <span aria-hidden="true" className="absolute -end-8 -top-8 size-28 rounded-full bg-white/45" />
        <span aria-hidden="true" className="absolute -bottom-10 end-16 size-20 rounded-full bg-[#fbefc9]/80" />
        <span aria-hidden="true" className="mv-float relative grid size-20 shrink-0 place-items-center rounded-full bg-white shadow-md">
          <Mascot className="size-14" mood="wow" />
        </span>
        <div className="relative flex flex-col gap-2">
          <h2 className="font-display text-xl font-bold">{t("home.forYouTitle")}</h2>
          <p className="text-sm text-[#3e5260]">{t("home.forYouPitch")}</p>
          <Link
            href={user ? "/profil" : "/anmelden"}
            className="mv-btn-3d inline-flex min-h-11 w-fit items-center rounded-full bg-primary px-5 font-bold text-on-primary"
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
        const name = c.name;
        const heading = "byAge" in c ? t("home.forAgeChild", { age: name }) : t("home.forChild", { name });
        const [, age] = possibleAges(c.birthYear, now);
        const picks = suggestForChild(all, c, now);
        const interests = c.interests.map((x) => t(`categories.${x}`)).join(", ");
        return (
          <section key={c.id} aria-labelledby={`for-${c.id}`}>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-full text-lg font-bold text-[#263847] shadow-[0_6px_16px_-10px_rgba(36,48,77,0.5)]"
                  style={{ background: childColor(i) }}
                >
                  {name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h2 id={`for-${c.id}`} className="truncate pb-2.5 pt-1 font-display text-2xl font-bold leading-tight md:text-3xl">
                    <ChildHeading text={heading} name={name} color={childColor(i)} />
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

/** "Für Maus": calm ink letters; the child's name gets a hand-drawn squiggle in their own colour. */
function ChildHeading({ text, name, color }: { text: string; name: string; color: string }) {
  const i = text.indexOf(name);
  if (i < 0) return <>{text}</>;
  // Screen readers get the plain sentence: the inline-block name would otherwise be read
  // with extra gaps ("Für dein Kind ( 5 )").
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, i)}
        <span className="relative inline-block">
          {name}
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" className="absolute -bottom-2 start-0 h-2.5 w-full overflow-visible">
            <path className="mv-draw" pathLength={100} d="M2 6 Q 18 1 34 6 T 66 6 T 98 5" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </span>
        {text.slice(i + name.length)}
      </span>
    </>
  );
}
