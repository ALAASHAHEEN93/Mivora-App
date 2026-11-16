import { C, Cloud, HAIR, Kid, SKIN, Sparkle } from "./Kid";
import { Mascot } from "./Mascot";

/** Opening-screen illustration: the sun mascot rising over waving kids. Decorative. */
export function WelcomeScene({ className = "w-full" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg viewBox="0 0 320 220" className="block w-full" focusable="false">
        <Cloud x={52} y={52} s={1.4} />
        <Cloud x={262} y={40} s={1.1} />
        <Sparkle x={92} y={96} s={1.2} />
        <Sparkle x={236} y={92} s={0.9} fill={C.pink} />
        <Sparkle x={282} y={124} s={0.8} fill={C.teal} />
        <path d="M0 176 Q80 140 160 160 T320 150 L320 220 L0 220Z" fill={C.grass} />
        <path d="M0 196 Q90 176 170 190 T320 186 L320 220 L0 220Z" fill={C.grassDark} />
        <g className="mv-hop" style={{ "--i": 0 } as React.CSSProperties}><Kid x={70} y={200} s={1.25} pose="wave" skin={SKIN[2]} hair={HAIR[0]} shirt={C.teal} hairStyle="puffs" /></g>
        <g className="mv-hop" style={{ "--i": 1 } as React.CSSProperties}><Kid x={132} y={206} s={1.05} pose="up" skin={SKIN[0]} hair={HAIR[2]} shirt={C.sun} pants={C.lavDark} hairStyle="long" /></g>
        <g className="mv-hop" style={{ "--i": 2 } as React.CSSProperties}><Kid x={192} y={204} s={1.15} pose="up" skin={SKIN[4]} hair={HAIR[3]} shirt={C.coral} hairStyle="short" /></g>
        <g className="mv-hop" style={{ "--i": 3 } as React.CSSProperties}><Kid x={254} y={200} s={1.3} pose="wave" skin={SKIN[1]} hair={HAIR[1]} shirt={C.lav} pants={C.tealDark} hairStyle="bun" flip /></g>
      </svg>
      <Mascot className="absolute start-1/2 top-[2%] size-[26%] -translate-x-1/2 rtl:translate-x-1/2 motion-safe:animate-[mv-bob_3s_ease-in-out_infinite]" />
    </div>
  );
}
