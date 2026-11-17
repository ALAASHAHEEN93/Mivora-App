"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon, type IconName } from "./Icon";

const ITEMS: { href: string; key: "home" | "explore" | "week" | "saved" | "profile"; icon: IconName }[] = [
  { href: "/", key: "home", icon: "home" },
  { href: "/entdecken", key: "explore", icon: "search" },
  { href: "/meine-woche", key: "week", icon: "calendar" },
  { href: "/gemerkt", key: "saved", icon: "heart" },
  { href: "/profil", key: "profile", icon: "user" },
];

/** Floating tab bar on mobile (active tab = raised orange bubble), inline header nav on desktop. */
export function MainNav({ variant }: { variant: "bottom" | "top" }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  if (variant === "top") {
    return (
      <nav aria-label={t("mainNav")} className="hidden md:block">
        <ul className="flex gap-1">
          {ITEMS.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="rounded-full px-4 py-2 font-bold text-muted hover:bg-surface hover:text-ink aria-[current=page]:bg-primary aria-[current=page]:text-on-primary"
              >
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label={t("mainNav")}
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 rounded-full bg-surface/95 shadow-[0_12px_32px_-10px_rgba(42,47,58,0.45)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-bold ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <span
                  className={`grid place-items-center rounded-full transition ${
                    active ? "-mt-7 size-13 bg-primary text-on-primary shadow-[0_8px_18px_-6px_rgba(57,47,90,0.7)] ring-4 ring-bg" : "size-7"
                  }`}
                >
                  <Icon name={item.icon} filled={active && item.icon === "heart"} className="mv-tab-icon size-6" />
                </span>
                <span className="max-w-full truncate px-1">{t(item.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
