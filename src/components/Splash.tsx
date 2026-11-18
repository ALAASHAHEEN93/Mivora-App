import { Logo } from "./Logo";
import { SkyBackdrop } from "./SkyBackdrop";

/**
 * Launch splash: sticker logo on a pale sky, shown on a cold start (full page load),
 * then fades away by itself. Pure CSS, so it never blocks the app.
 */
export function Splash({ tagline }: { tagline: string }) {
  return (
    <div aria-hidden="true" className="mv-splash fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5">
      <SkyBackdrop />
      <span className="mv-splash-logo relative">
        <Logo className="text-7xl" />
      </span>
      <p className="mv-splash-logo mv-sticker relative text-2xl text-[#fff3ea]">{tagline}</p>
    </div>
  );
}
