"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * Horizontal swipe row for phones. Shows an end-edge fade and a "more" arrow while
 * there is more to scroll; both disappear at the end. Works in RTL (scrollLeft is negative there).
 */
export function ScrollRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [more, setMore] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setMore(Math.abs(el.scrollLeft) + el.clientWidth < el.scrollWidth - 8);
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const nudge = () => {
    const el = ref.current;
    if (!el) return;
    const dir = getComputedStyle(el).direction === "rtl" ? -1 : 1;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <div className="relative -mx-4 md:mx-0">
      <ul ref={ref} className={className}>
        {children}
      </ul>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 end-0 w-16 bg-gradient-to-l from-bg to-transparent transition-opacity rtl:bg-gradient-to-r md:hidden ${more ? "opacity-100" : "opacity-0"}`}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={nudge}
        className={`absolute end-1 top-[1.15rem] grid size-8 place-items-center rounded-full bg-surface text-accent shadow-md transition md:hidden motion-safe:animate-[mv-nudge_1.6s_ease-in-out_2] ${more ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <Icon name="forward" className="size-4" />
      </button>
    </div>
  );
}
