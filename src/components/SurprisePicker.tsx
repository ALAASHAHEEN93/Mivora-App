"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "./Icon";
import { Mascot } from "./illustrations/Mascot";

export type PickerItem = { slug: string; title: string; lang: string; when: string; district: string; price: string };
type Texts = { title: string; hint: string; button: string; again: string; open: string; spinning: string; result: string; empty: string };

/**
 * "Was machen wir heute?": kids tap, the card shuffles through today's activities for a moment,
 * then lands on one. Without motion preference it picks straight away.
 */
export function SurprisePicker({ items, texts }: { items: PickerItem[]; texts: Texts }) {
  const [shown, setShown] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => void (timer.current && window.clearInterval(timer.current)), []);

  function spin() {
    if (items.length === 0 || spinning) return;
    const last = shown;
    let pick = Math.floor(Math.random() * items.length);
    if (items.length > 1 && pick === last) pick = (pick + 1) % items.length;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(pick);
      return;
    }
    setSpinning(true);
    let ticks = 0;
    timer.current = window.setInterval(() => {
      ticks += 1;
      setShown((n) => ((n ?? 0) + 1) % items.length);
      if (ticks >= 10) {
        window.clearInterval(timer.current!);
        timer.current = null;
        setShown(pick);
        setSpinning(false);
      }
    }, 110);
  }

  const item = shown == null ? null : items[shown];

  return (
    <section aria-labelledby="picker-h" className="relative overflow-hidden rounded-[2rem] border-2 border-[#263847] bg-[#ebe5f6] p-5 text-[#263847] shadow-[0_4px_0_#263847]">
      <span aria-hidden="true" className="absolute -end-6 -top-6 size-24 rounded-full bg-white/50" />
      <span aria-hidden="true" className="absolute -bottom-8 start-10 size-16 rounded-full bg-[#fde3d8]/80" />
      <div className="relative flex items-center gap-3">
        <span aria-hidden="true" className={`grid size-12 shrink-0 place-items-center rounded-full bg-white shadow-sm ${spinning ? "mv-spin" : ""}`}>
          <Mascot className="size-9" />
        </span>
        <div>
          <h2 id="picker-h" className="font-display text-xl font-bold leading-tight">
            {texts.title}
          </h2>
          <p className="text-sm text-[#3e5260]">{texts.hint}</p>
        </div>
      </div>

      <div aria-live="polite" className="relative mt-4">
        {items.length === 0 ? (
          <p className="rounded-2xl bg-white/80 p-4 text-sm font-semibold">{texts.empty}</p>
        ) : item ? (
          <div className={`rounded-2xl bg-white p-4 shadow-sm ${spinning ? "" : "mv-pop-in"}`}>
            {spinning ? (
              <>
                <span className="sr-only">{texts.spinning}</span>
                <p aria-hidden="true" lang={item.lang} className="truncate font-display text-lg font-bold opacity-70">
                  {item.title}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-[#3e5260]">{texts.result}</p>
                <p lang={item.lang} className="font-display text-xl font-bold leading-tight">
                  {item.title}
                </p>
                <p className="mt-1 flex flex-wrap gap-x-3 text-sm font-semibold text-[#3e5260]">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="clock" className="size-4" />
                    {item.when}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="pin" className="size-4" />
                    {item.district}
                  </span>
                  <span>{item.price}</span>
                </p>
                <Link href={`/aktivitaet/${item.slug}`} className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-full bg-[#263847] px-5 font-bold text-white">
                  {texts.open}
                  <Icon name="forward" className="size-4 rtl:rotate-180" />
                </Link>
              </>
            )}
          </div>
        ) : null}
      </div>

      {items.length > 0 && (
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className="mv-btn-3d relative mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-lg font-bold text-on-primary disabled:opacity-80"
        >
          <Icon name="shuffle" className="size-5" />
          {item ? texts.again : texts.button}
        </button>
      )}
    </section>
  );
}
