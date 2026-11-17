/**
 * Mivora wordmark: "Mivora" in Baloo 2 ExtraBold, the i's dot is a gold star,
 * and a steel-blue swoosh draws itself underneath. Animations live in globals.css
 * (.mv-logo-*) and are switched off for people who prefer reduced motion.
 * The visible letters are decorative; the accessible name is "Mivora".
 */
export function Logo({ className = "text-3xl", animate = true }: { className?: string; animate?: boolean }) {
  return (
    <span role="img" aria-label="Mivora" className={`mv-logo relative inline-flex flex-col items-start leading-none ${animate ? "mv-logo-animate" : ""} ${className}`} dir="ltr">
      <span aria-hidden="true" className="font-logo font-extrabold tracking-tight text-ink">
        M
        <span className="relative mx-[0.04em] inline-block">
          {"ı"}
          <svg viewBox="-12 -12 24 24" className="mv-logo-star absolute left-1/2 top-[0.08em] h-[0.38em] w-[0.38em] -translate-x-1/2 overflow-visible">
            <path d="M0 -10 L2.9 -3.2 L10 -3.1 L4.4 1.5 L6.4 9 L0 4.6 L-6.4 9 L-4.4 1.5 L-10 -3.1 L-2.9 -3.2 Z" fill="#d9bf77" stroke="#b89a4e" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </span>
        vora
      </span>
      <svg aria-hidden="true" viewBox="0 0 100 12" preserveAspectRatio="none" className="-mt-[0.12em] h-[0.26em] w-full overflow-visible">
        <path className="mv-logo-swoosh" d="M4 6 Q50 13 96 3" fill="none" stroke="#457b9d" strokeWidth="3.2" strokeLinecap="round" pathLength={100} vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}
