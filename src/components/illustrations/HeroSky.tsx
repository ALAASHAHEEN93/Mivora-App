import { Meadow } from "./Meadow";
import { StarFace } from "./Mascot";

/**
 * Home hero backdrop: sky, drifting clouds (one fast asleep), twinkling stars, a bobbing
 * hot-air balloon with the star mascot riding in the basket
 * and soft hills that melt into the page. Purely decorative; all motion stops with
 * prefers-reduced-motion.
 */
export function HeroSky() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,var(--kw-sky)_0%,var(--kw-sky-low)_100%)]">
      {/* clouds */}
      {/* a sleepy cloud, snoring */}
      <svg viewBox="0 0 84 46" className="mv-drift-slow absolute -end-1 top-[29%] w-[76px] overflow-visible">
        <rect x="4" y="18" width="70" height="24" rx="12" fill="var(--kw-cloud)" />
        <circle cx="30" cy="20" r="15" fill="var(--kw-cloud)" />
        <circle cx="51" cy="23" r="11" fill="var(--kw-cloud)" />
        <path d="M24 28q3 2.6 6 0M40 28q3 2.6 6 0" fill="none" stroke="var(--kw-line-art)" strokeWidth="1.7" strokeLinecap="round" />
        <ellipse cx="35" cy="34.5" rx="2.4" ry="1.8" fill="var(--kw-line-art)" opacity="0.8" />
        <ellipse cx="21" cy="32.5" rx="2.6" ry="1.5" fill="#f2a68a" opacity="0.6" />
        <ellipse cx="49" cy="32.5" rx="2.6" ry="1.5" fill="#f2a68a" opacity="0.6" />
        {[
          [64, 14, 9, 0],
          [71, 6, 11, 1],
          [79, -3, 13, 2],
        ].map(([x, y, size, i]) => (
          <text key={i} x={x} y={y} fontSize={size} fontWeight="700" fill="var(--kw-line-art)" className="mv-zzz" style={{ "--i": i } as React.CSSProperties} fontFamily="var(--font-display), sans-serif">
            z
          </text>
        ))}
      </svg>
      <span className="mv-drift absolute left-[34%] top-[3%] h-5 w-16 rounded-full bg-[var(--kw-cloud)] after:absolute after:-top-2.5 after:left-3 after:size-7 after:rounded-full after:bg-[var(--kw-cloud)]" />
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
      <svg viewBox="0 0 60 84" className="mv-float absolute end-3 top-3 w-12 md:end-10 md:top-6 md:w-16">
        <path d="M30 4C14 4 6 16 6 28c0 14 14 24 20 32h8c6-8 20-18 20-32C54 16 46 4 30 4Z" fill="#f2a68a" stroke="#263847" strokeWidth="3" strokeLinejoin="round" />
        <path d="M30 4c-9 12-8 42-3 56h6c5-14 6-44-3-56Z" fill="#f3d077" stroke="#263847" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M17 16q4-6 10-7" fill="none" stroke="#fff6ee" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <path d="M26 60l-2 10M34 60l2 10" stroke="#263847" strokeWidth="2" strokeLinecap="round" />
        {/* the star mascot is along for the ride */}
        <g transform="translate(20.4 52.6) scale(0.3)">
          <g className="mv-passenger">
            <StarFace />
          </g>
        </g>
        <rect x="22" y="69" width="16" height="11" rx="3" fill="#fff3ea" stroke="#263847" strokeWidth="2.5" />
      </svg>

      <Meadow className="h-40 md:h-56" />
    </div>
  );
}
