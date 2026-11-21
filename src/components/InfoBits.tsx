import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/** Sticker-style info card used on the About and For-providers pages. */
export function InfoCard({ icon, tint, title, children }: { icon: IconName; tint: string; title: string; children: ReactNode }) {
  return (
    <section className="mv-reveal flex gap-4 rounded-[1.75rem] border-2 border-[#263847] bg-surface p-5 shadow-[0_4px_0_#263847]">
      <span aria-hidden="true" className={`grid size-12 shrink-0 -rotate-6 place-items-center rounded-2xl border-2 border-[#263847] text-[#263847] ${tint}`}>
        <Icon name={icon} className="size-6" />
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h2 className="font-display text-xl font-bold leading-tight">{title}</h2>
        <div className="text-muted [&_li]:mb-1.5 [&_ul]:list-disc [&_ul]:ps-5">{children}</div>
      </div>
    </section>
  );
}

/** Contact button: mails CONTACT_EMAIL when set, otherwise opens the public case study. */
export function contactHref(subject: string): { href: string; external: boolean } {
  const email = process.env.CONTACT_EMAIL?.trim();
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { href: `mailto:${email}?subject=${encodeURIComponent(subject)}`, external: false };
  }
  return { href: "https://alaa-designer.vercel.app/project.html?p=mivora", external: true };
}
