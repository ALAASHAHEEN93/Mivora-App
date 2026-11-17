import { Logo } from "./Logo";

/**
 * Launch splash: shown on a cold start (full page load), then fades away by itself.
 * Pure CSS (no JS), so it never blocks the app and never causes hydration differences.
 */
export function Splash({ tagline }: { tagline: string }) {
  return (
    <div aria-hidden="true" className="mv-splash fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[var(--kw-hero)]">
      <span className="mv-splash-logo">
        <Logo className="text-7xl" />
      </span>
      <p className="mv-splash-logo text-lg font-semibold text-muted">{tagline}</p>
    </div>
  );
}
