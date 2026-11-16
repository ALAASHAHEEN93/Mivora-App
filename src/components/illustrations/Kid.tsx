/**
 * Original, hand-built SVG illustrations (no third-party assets, no licensing issues).
 * Colours are fixed on purpose so illustrations look the same in light and dark mode.
 */
export const C = {
  ink: "#2a2f3a",
  coral: "#ff6f5b",
  coralDark: "#e5523f",
  sun: "#ffc93c",
  teal: "#2bb3a3",
  tealDark: "#1d8f82",
  lav: "#9d8cf0",
  lavDark: "#7a68d6",
  pink: "#ff9ec4",
  sky: "#bfe6ff",
  grass: "#8fd47e",
  grassDark: "#6fbf5f",
  floor: "#f6d7a7",
  floorDark: "#e9bf85",
  wood: "#b87a4b",
  white: "#ffffff",
  cream: "#fff7e8",
} as const;

export const SKIN = ["#f9d5bb", "#e8b48f", "#c68b5e", "#8d5a3b", "#5c3a24"] as const;
export const HAIR = ["#2b1b12", "#6b3e1f", "#e3b04b", "#1a1a1a", "#a0522d"] as const;

export type Pose = "down" | "up" | "wave" | "reach";
export type HairStyle = "short" | "puffs" | "bun" | "long";

const ARMS: Record<Pose, [[number, number], [number, number]]> = {
  down: [[-16, -26], [16, -26]],
  up: [[-18, -62], [18, -62]],
  wave: [[-16, -26], [18, -62]],
  reach: [[-16, -26], [22, -42]],
};

/** A child figure. Local origin = between the feet; ~70 units tall at scale 1. */
export function Kid({
  x,
  y,
  s = 1,
  skin = SKIN[0],
  hair = HAIR[0],
  shirt = C.coral,
  pants = C.ink,
  pose = "down",
  hairStyle = "short",
  flip = false,
}: {
  x: number;
  y: number;
  s?: number;
  skin?: string;
  hair?: string;
  shirt?: string;
  pants?: string;
  pose?: Pose;
  hairStyle?: HairStyle;
  flip?: boolean;
}) {
  const [l, r] = ARMS[pose];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {hairStyle === "long" && <path d="M-12.5 -57 Q-14 -38 -8 -36 L8 -36 Q14 -38 12.5 -57Z" fill={hair} />}
      <rect x={-7} y={-22} width={6} height={20} rx={3} fill={pants} />
      <rect x={1} y={-22} width={6} height={20} rx={3} fill={pants} />
      <ellipse cx={-5} cy={-1.5} rx={5} ry={3} fill={C.ink} />
      <ellipse cx={5} cy={-1.5} rx={5} ry={3} fill={C.ink} />
      <path d={`M-8 -41 L${l[0]} ${l[1]} M8 -41 L${r[0]} ${r[1]}`} stroke={shirt} strokeWidth={6} strokeLinecap="round" />
      <circle cx={l[0]} cy={l[1]} r={3.2} fill={skin} />
      <circle cx={r[0]} cy={r[1]} r={3.2} fill={skin} />
      <rect x={-11} y={-46} width={22} height={27} rx={9} fill={shirt} />
      <circle cx={0} cy={-57} r={11} fill={skin} />
      <path d="M-11.3 -58 A11.3 11.3 0 0 1 11.3 -58 Q5 -64 -1 -61.5 Q-7 -61 -11.3 -58Z" fill={hair} />
      {hairStyle === "puffs" && (
        <>
          <circle cx={-11} cy={-64} r={5} fill={hair} />
          <circle cx={11} cy={-64} r={5} fill={hair} />
        </>
      )}
      {hairStyle === "bun" && <circle cx={0} cy={-70} r={5} fill={hair} />}
      <circle cx={-4} cy={-56.5} r={1.5} fill={C.ink} />
      <circle cx={4} cy={-56.5} r={1.5} fill={C.ink} />
      <circle cx={-7.2} cy={-52.5} r={2} fill={C.pink} opacity={0.7} />
      <circle cx={7.2} cy={-52.5} r={2} fill={C.pink} opacity={0.7} />
      <path d="M-4 -52 Q0 -48.5 4 -52" stroke={C.ink} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={C.white}>
      <circle cx={0} cy={0} r={10} />
      <circle cx={12} cy={-5} r={13} />
      <circle cx={26} cy={0} r={10} />
      <rect x={0} y={0} width={26} height={10} />
    </g>
  );
}

export function Sun({ x, y, r = 16 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r + 6} fill={C.sun} opacity={0.35} />
      <circle cx={x} cy={y} r={r} fill={C.sun} />
    </g>
  );
}

export function Sparkle({ x, y, s = 1, fill = C.sun }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -8 Q1.5 -1.5 8 0 Q1.5 1.5 0 8 Q-1.5 1.5 -8 0 Q-1.5 -1.5 0 -8Z"
      fill={fill}
    />
  );
}

export function Note({ x, y, fill = C.ink }: { x: number; y: number; fill?: string }) {
  return (
    <g fill={fill}>
      <ellipse cx={x} cy={y} rx={5} ry={4} transform={`rotate(-20 ${x} ${y})`} />
      <rect x={x + 3.5} y={y - 20} width={2.5} height={20} />
      <path d={`M${x + 6} ${y - 20} q8 3 6 10 q-2 -5 -6 -5z`} />
    </g>
  );
}

export function Outdoor({ bg, hill = C.grass, front = C.grassDark }: { bg: string; hill?: string; front?: string }) {
  return (
    <>
      <rect width={320} height={180} fill={bg} />
      <path d="M0 138 Q90 116 170 134 T320 128 V180 H0Z" fill={hill} />
      <path d="M0 160 Q110 146 200 158 T320 154 V180 H0Z" fill={front} />
    </>
  );
}

export function Indoor({ bg }: { bg: string }) {
  return (
    <>
      <rect width={320} height={180} fill={bg} />
      <rect y={146} width={320} height={34} fill={C.floor} />
      <rect y={146} width={320} height={4} fill={C.floorDark} />
    </>
  );
}
