import { Meadow } from "./Meadow";

/**
 * Home hero backdrop: sky, drifting clouds, twinkling stars, a bobbing hot-air balloon
 * and soft hills that melt into the page. Purely decorative; all motion stops with
 * prefers-reduced-motion.
 */
export function HeroSky() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,var(--kw-sky)_0%,var(--kw-sky-low)_100%)]">
      {/* clouds */}
      <span className="mv-drift absolute left-[34%] top-[3%] h-5 w-16 rounded-full bg-[var(--kw-cloud)] after:absolute after:-top-2.5 after:left-3 after:size-7 after:rounded-full after:bg-[var(--kw-cloud)]" />
      <span className="mv-drift-slow absolute -right-4 top-[40%] h-6 w-20 rounded-full bg-[var(--kw-cloud)] after:absolute after:-top-3 after:left-4 after:size-9 after:rounded-full after:bg-[var(--kw-cloud)]" />
      <span className="mv-drift absolute left-[2%] top-[62%] h-4 w-12 rounded-full bg-[var(--kw-cloud)] opacity-80" />

      {/* stars */}
      <span className="absolute right-[24%] top-[15%] text-lg text-[#f3d077]">
        <span className="mv-twinkle" style={{ "--i": 0 } as React.CSSProperties}>★</span>
      </span>
      <span className="absolute left-[3%] top-[2%] text-sm text-[#f2a68a]">
        <span className="mv-twinkle" style={{ "--i": 1 } as React.CSSProperties}>★</span>
      </span>
      <span className="absolute right-[6%] top-[33%] text-xs text-[#f3d077]">
        <span className="mv-twinkle" style={{ "--i": 2 } as React.CSSProperties}>★</span>
      </span>

      {/* shooting star */}
      <span className="mv-shoot absolute left-[-15%] top-[10%] h-0.5 w-16 rounded-full bg-[linear-gradient(90deg,transparent,#fff_70%,#f3d077)] opacity-0" />

      {/* hot-air balloon */}
      <svg viewBox="0 0 60 84" className="mv-float absolute right-3 top-3 w-12 md:right-10 md:top-6 md:w-16">
        <path d="M30 4C14 4 6 16 6 28c0 14 14 24 20 32h8c6-8 20-18 20-32C54 16 46 4 30 4Z" fill="#f2a68a" stroke="#263847" strokeWidth="3" strokeLinejoin="round" />
        <path d="M30 4c-9 12-8 42-3 56h6c5-14 6-44-3-56Z" fill="#f3d077" stroke="#263847" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M17 16q4-6 10-7" fill="none" stroke="#fff6ee" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <path d="M26 60l-2 10M34 60l2 10" stroke="#263847" strokeWidth="2" strokeLinecap="round" />
        <rect x="22" y="69" width="16" height="11" rx="3" fill="#fff3ea" stroke="#263847" strokeWidth="2.5" />
      </svg>

      <Meadow className="h-40 md:h-56" />
    </div>
  );
}
