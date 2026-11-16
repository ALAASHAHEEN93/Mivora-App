import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Mascot } from "./illustrations/Mascot";

type Href = Parameters<typeof Link>[0]["href"];

export function ChipLink({ href, active, children }: { href: Href; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 font-bold transition ${
        active ? "bg-primary text-on-primary shadow-md" : "bg-surface shadow-[0_4px_14px_-8px_rgba(42,47,58,0.4)] hover:-translate-y-0.5"
      }`}
    >
      {children}
    </Link>
  );
}

export function SectionHeader({ title, href, linkLabel }: { title: string; href?: Href; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="shrink-0 font-bold underline decoration-2 underline-offset-4 hover:text-primary">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[2rem] bg-surface px-6 py-12 text-center shadow-[0_10px_30px_-16px_rgba(42,47,58,0.35)]">
      <Mascot className="size-20" mood="wow" />
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="max-w-sm text-muted">{text}</p>
      {action}
    </div>
  );
}

export const buttonPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-extrabold text-on-primary shadow-[0_8px_20px_-8px_rgba(229,82,63,0.8)] transition hover:-translate-y-0.5";
export const buttonSecondary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-surface px-5 font-bold shadow-[0_4px_14px_-8px_rgba(42,47,58,0.5)] ring-2 ring-line transition hover:-translate-y-0.5";
