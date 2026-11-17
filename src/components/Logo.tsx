/**
 * Mivora wordmark in sticker style: Fredoka Bold in pink and apricot with a dark outline,
 * the i's dot is a star, and a pink swoosh draws itself underneath.
 * Animations live in globals.css (.mv-logo-*), off for people who prefer reduced motion.
 * The visible letters are decorative; the accessible name is "Mivora".
 */
const PINK = "#f09c9c";
const APRICOT = "#fcb46c";

export function Logo({ className = "text-3xl", animate = true }: { className?: string; animate?: boolean }) {
  return (
    <span role="img" aria-label="Mivora" className={`mv-logo relative inline-flex flex-col items-start leading-none ${animate ? "mv-logo-animate" : ""} ${className}`} dir="ltr">
      <span aria-hidden="true" className="mv-sticker">
        <span style={{ color: PINK }}>M</span>
        <span className="relative mx-[0.03em] inline-block" style={{ color: APRICOT }}>
          {"ı"}
          <svg viewBox="-12 -12 24 24" className="mv-logo-star absolute left-1/2 top-[0.02em] h-[0.42em] w-[0.42em] -translate-x-1/2 overflow-visible">
            <path d="M0 -10 L2.9 -3.2 L10 -3.1 L4.4 1.5 L6.4 9 L0 4.6 L-6.4 9 L-4.4 1.5 L-10 -3.1 L-2.9 -3.2 Z" fill={APRICOT} stroke="#3b2f3a" strokeWidth="2.6" strokeLinejoin="round" />
          </svg>
        </span>
        <span style={{ color: APRICOT }}>v</span>
        <span style={{ color: PINK }}>ora</span>
      </span>
      <svg aria-hidden="true" viewBox="0 0 100 12" preserveAspectRatio="none" className="mt-[0.02em] h-[0.24em] w-full overflow-visible">
        <path className="mv-logo-swoosh" d="M4 6 Q50 13 96 3" fill="none" stroke={PINK} strokeWidth="3.2" strokeLinecap="round" pathLength={100} vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}
