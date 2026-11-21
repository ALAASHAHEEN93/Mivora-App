import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { StarFace } from "./illustrations/Mascot";
import { GetTheApp } from "./GetTheApp";

/**
 * Desktop footer: a little hill where the star mascot naps (snoring z's) and the party snail
 * crawls by, then Mivora's links, the honest status and the contact address.
 * Decorative parts are aria-hidden; all motion stops with prefers-reduced-motion.
 */
export async function SiteFooter() {
  const t = await getTranslations();
  const email = process.env.CONTACT_EMAIL?.trim();
  const year = new Date().getFullYear();
  const link = "inline-flex min-h-10 items-center font-semibold text-[#fff3ea] underline-offset-4 hover:underline";

  return (
    // Desktop only: on phones the bottom tab bar and Profil carry these links.
    <footer className="relative mt-6 hidden text-[#fff3ea] md:block">
      {/* the napping hill */}
      <svg aria-hidden="true" viewBox="0 0 400 60" preserveAspectRatio="none" className="-mb-px block h-14 w-full md:h-20">
        <path d="M0 60V38C60 20 120 14 190 26S320 52 400 30V60Z" fill="var(--kw-footer)" />
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-14 max-w-6xl md:h-20">
        <svg viewBox="0 0 64 64" className="absolute start-[18%] top-[2px] w-10 md:w-12">
          <g transform="rotate(-14 32 32)">
            <StarFace />
          </g>
        </svg>
        <span className="absolute start-[calc(18%+40px)] -top-3 font-display text-sm font-bold text-[var(--kw-line-art)]">
          <span className="mv-zzz inline-block" style={{ "--i": 0 } as React.CSSProperties}>z</span>
          <span className="mv-zzz inline-block text-base" style={{ "--i": 1 } as React.CSSProperties}>z</span>
        </span>
        <svg viewBox="-12 -14 26 20" className="mv-snail absolute end-[16%] top-[30%] w-8 md:w-10">
          <path d="M-7 3h12c1.6 0 2.6-1 2.6-2.6V-2" fill="#fbefc9" stroke="#263847" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.6-2l1-3.4M8.2-1.6l2.2-2.8" stroke="#263847" strokeWidth="0.7" strokeLinecap="round" />
          <circle cx="-1" cy="-1.4" r="4.4" fill="#f2a68a" stroke="#263847" strokeWidth="0.8" />
          <path d="M-3.2-5.2l1.8-5.4l2.6 4.6Z" fill="#af9fd5" stroke="#263847" strokeWidth="0.7" strokeLinejoin="round" />
          <circle cx="-1.4" cy="-10.8" r="1" fill="#f3d077" />
        </svg>
      </div>

      <div className="bg-[var(--kw-footer)] pb-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-4 pt-2 md:grid-cols-[1.3fr_1fr_1fr_1.4fr] md:gap-10">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <Link href="/" className="w-fit rounded-xl">
              <Logo className="text-[2.4rem]" animate={false} />
            </Link>
            <p className="font-display text-lg font-semibold text-[#f3d077]">{t("welcome.tagline")}</p>
            <p className="max-w-sm text-sm text-[#d9e3e8]">{t("footer.note")}</p>
          </div>

          <nav aria-labelledby="footer-mivora" className="flex flex-col">
            <h2 id="footer-mivora" className="mb-1 font-display text-lg font-bold text-[#f3d077]">
              Mivora
            </h2>
            <Link href="/ueber" className={link}>
              {t("home.aboutShort")}
            </Link>
            <Link href="/fuer-anbieter" className={link}>
              {t("home.providersShort")}
            </Link>
            <Link href="/entdecken" className={link}>
              {t("nav.explore")}
            </Link>
            {email && (
              <a href={`mailto:${email}`} className={link}>
                {t("footer.contact")}
              </a>
            )}
          </nav>

          <nav aria-labelledby="footer-legal" className="flex flex-col">
            <h2 id="footer-legal" className="mb-1 font-display text-lg font-bold text-[#f3d077]">
              {t("footer.legalTitle")}
            </h2>
            <Link href="/rechtliches/impressum" className={link}>
              {t("footer.imprint")}
            </Link>
            <Link href="/rechtliches/datenschutz" className={link}>
              {t("footer.privacy")}
            </Link>
            <Link href="/rechtliches/agb" className={link}>
              {t("footer.terms")}
            </Link>
          </nav>
          <GetTheApp variant="footer" />
        </div>

        <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-1 border-t border-white/15 px-4 pt-4 text-sm text-[#d9e3e8] md:flex-row md:justify-between">
          <p>© {year} Mivora</p>
          <p>{t("footer.madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
