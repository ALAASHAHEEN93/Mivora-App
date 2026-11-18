import { Meadow } from "./illustrations/Meadow";

/** Brand sky with clouds, two little stars and the meadow, for the splash, welcome and not-found screens. Decorative. */
export function SkyBackdrop({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`mv-daylight pointer-events-none absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,var(--kw-sky)_0%,var(--kw-sky-low)_100%)] ${className}`}>
      <span className="absolute left-[12%] top-[14%] h-7 w-20 rounded-full bg-[var(--kw-cloud)]" />
      <span className="absolute right-[10%] top-[24%] h-6 w-16 rounded-full bg-[var(--kw-cloud)]" />
      <span className="absolute left-[8%] top-[30%] text-2xl text-[#f3d077]">★</span>
      <span className="absolute right-[18%] top-[9%] text-lg text-[#f2a68a]">★</span>
      <Meadow className="h-[32%]" />
    </div>
  );
}
