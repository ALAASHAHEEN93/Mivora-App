import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { Mascot } from "@/components/illustrations/Mascot";
import { SkyBackdrop } from "@/components/SkyBackdrop";

/** Branded "page not found" with ways back into the app. */
export default function NotFound() {
  const t = useTranslations();
  return (
    <main id="main" className="relative flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <SkyBackdrop />
      <div className="relative flex flex-col items-center gap-4">
        <Logo className="text-5xl" animate={false} />
        <Mascot className="size-20" mood="wow" />
        <h1 className="font-display text-3xl font-bold">{t("system.notFoundTitle")}</h1>
        <p className="max-w-sm text-muted">{t("system.notFoundText")}</p>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row">
          <Link href="/" className="mv-btn-3d inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-bold text-on-primary">
            {t("system.toHome")}
          </Link>
          <Link href="/entdecken" className="inline-flex min-h-12 items-center justify-center rounded-full bg-surface px-6 font-bold shadow-sm">
            {t("system.toExplore")}
          </Link>
        </div>
      </div>
    </main>
  );
}
