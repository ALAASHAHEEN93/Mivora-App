import { C, Sparkle } from "./Kid";
import { StarFace, type StarEyes, type StarMouth } from "./Mascot";

/**
 * Small scenes for "nothing here (yet)" moments: the star mascot with one prop that tells
 * the story. Each sits fully inside its own pastel disc (outlines would vanish on a dark
 * surface), so it reads the same on light and dark surfaces. No text, and the signpost points
 * both ways, so nothing needs mirroring for right-to-left languages.
 * Decorative only (aria-hidden); the page text carries the meaning.
 * Editable copy: design/mivora-empty-states.svg (pnpm art:export).
 */
export type EmptyArtKind = "saved" | "search" | "week" | "lost" | "oops" | "offline";

export const EMPTY_ART_KINDS: readonly EmptyArtKind[] = ["saved", "search", "week", "lost", "oops", "offline"];

const DISC: Record<EmptyArtKind, { disc: string; ground: string }> = {
  saved: { disc: "#fbe1d6", ground: C.coral },
  search: { disc: "#e6e0f3", ground: C.lav },
  week: { disc: C.floor, ground: C.sun },
  lost: { disc: C.sky, ground: C.teal },
  oops: { disc: "#fbe1d6", ground: C.coral },
  offline: { disc: C.sky, ground: C.grass },
};

const FACE: Record<EmptyArtKind, { eyes: StarEyes; mouth: StarMouth; x: number; tilt: number }> = {
  saved: { eyes: "side", mouth: "smile", x: 28, tilt: 0 },
  search: { eyes: "side", mouth: "o", x: 26, tilt: -6 },
  week: { eyes: "closed", mouth: "smile", x: 26, tilt: -10 },
  lost: { eyes: "open", mouth: "o", x: 22, tilt: 0 },
  oops: { eyes: "open", mouth: "wobble", x: 58, tilt: -14 },
  offline: { eyes: "closed", mouth: "smile", x: 26, tilt: 8 },
};

/** The mascot, ~83 units tall, standing on the ground line at y = 118. */
function Star({ kind }: { kind: EmptyArtKind }) {
  const f = FACE[kind];
  return (
    <g id="star" className="mv-hop">
      <g transform={`translate(${f.x} 40) rotate(${f.tilt} 41 41) scale(1.3)`}>
        <StarFace eyes={f.eyes} mouth={f.mouth} />
        {kind === "oops" && (
          // A plaster on the star's arm; inside the star group so it hops along.
          <g id="plaster" transform="rotate(-18 47 26.5)">
            <rect x="38" y="22" width="18" height="9" rx="4.5" fill={C.cream} stroke={C.ink} strokeWidth="1.8" />
            <path d="M45 26.5 h0.1 M49 26.5 h0.1" stroke={C.ink} strokeWidth="1.4" strokeLinecap="round" />
          </g>
        )}
      </g>
    </g>
  );
}

function Prop({ kind }: { kind: EmptyArtKind }) {
  const ink = { stroke: C.ink, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (kind) {
    case "saved":
      // An empty heart, drawn dashed: "your list is waiting to be filled".
      return (
        <g id="heart">
          <path
            d="M146 106 C112 86 112 52 132 50 C140 49 145 55 146 61 C147 55 152 49 160 50 C180 52 180 86 146 106 Z"
            fill={C.cream}
            strokeWidth="3.5"
            strokeDasharray="7 6"
            {...ink}
          />
          <Sparkle x={178} y={42} s={0.8} fill={C.coral} />
        </g>
      );
    case "search":
      // A magnifying glass held up, with a tiny sparkle inside the lens.
      return (
        <g id="magnifier">
          <path d="M156 82 L176 104" strokeWidth="8" {...ink} />
          <circle cx="142" cy="66" r="21" fill={C.cream} strokeWidth="4" {...ink} />
          <path d="M131 58 Q134 52 141 51" fill="none" stroke={C.white} strokeWidth="3" strokeLinecap="round" />
          <Sparkle x={146} y={70} s={0.55} fill={C.lav} />
        </g>
      );
    case "week":
      // A blank calendar page while the star naps.
      return (
        <g id="calendar">
          <rect x="114" y="44" width="62" height="62" rx="10" fill={C.cream} strokeWidth="3.5" {...ink} />
          <path d="M114 54 Q114 44 124 44 H166 Q176 44 176 54 V60 H114 Z" fill={C.coral} strokeWidth="3.5" {...ink} />
          <path d="M130 38 V50 M160 38 V50" strokeWidth="4" {...ink} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <circle key={`${r}-${c}`} cx={127 + c * 12} cy={72 + r * 11} r="2.4" fill={C.grassDark} opacity="0.7" />
            )),
          )}
          <g id="zz" fill="none" strokeWidth="2.6" {...ink}>
            <path d="M84 24 H94 L84 34 H94" />
            <path d="M100 12 H107 L100 19 H107" />
          </g>
        </g>
      );
    case "lost":
      // A signpost with one board each way: "this path does not lead anywhere".
      return (
        <g id="signpost">
          <rect x="143" y="44" width="8" height="74" rx="3" fill={C.wood} strokeWidth="3" {...ink} />
          <path d="M126 50 H170 L178 58 L170 66 H126 Z" fill={C.sun} strokeWidth="3.2" {...ink} />
          <path d="M168 74 H124 L116 82 L124 90 H168 Z" fill={C.lav} strokeWidth="3.2" {...ink} />
          <circle cx="147" cy="40" r="4" fill={C.coral} strokeWidth="2.4" {...ink} />
        </g>
      );
    case "oops":
      // Little dizzy sparkles around the star (its plaster is drawn with the star).
      return (
        <g id="sparkles">
          <Sparkle x={52} y={44} s={0.75} fill={C.sun} />
          <Sparkle x={156} y={36} s={0.9} fill={C.coral} />
          <Sparkle x={166} y={88} s={0.6} fill={C.lav} />
        </g>
      );
    case "offline":
      // A cloud with a dotted, broken line under it: no connection right now.
      return (
        <g id="cloud">
          <path
            d="M122 76 A12 12 0 0 1 124 52 A16 16 0 0 1 154 46 A14 14 0 0 1 166 76 Z"
            fill={C.white}
            strokeWidth="3.5"
            {...ink}
          />
          <path d="M144 86 V108" stroke={C.ink} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="0.1 7" />
          <g id="zz" fill="none" strokeWidth="2.6" {...ink}>
            <path d="M80 26 H90 L80 36 H90" />
            <path d="M96 14 H103 L96 21 H103" />
          </g>
        </g>
      );
  }
}

/** The scene as plain SVG children (shared by the component and the design export). */
export function EmptyArtScene({ kind }: { kind: EmptyArtKind }) {
  const d = DISC[kind];
  return (
    <>
      <ellipse id="disc" cx="100" cy="70" rx="94" ry="64" fill={d.disc} />
      <ellipse id="ground" cx="100" cy="120" rx="70" ry="8" fill={d.ground} opacity="0.55" />
      <Star kind={kind} />
      <Prop kind={kind} />
    </>
  );
}

export function EmptyArt({ kind, className = "w-44" }: { kind: EmptyArtKind; className?: string }) {
  return (
    <svg viewBox="0 0 200 136" aria-hidden="true" focusable="false" className={className} data-art={kind}>
      <EmptyArtScene kind={kind} />
    </svg>
  );
}
