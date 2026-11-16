import type { CategorySlug } from "@/domain/types";
import { C, Cloud, HAIR, Indoor, Kid, Note, Outdoor, SKIN, Sparkle, Sun } from "./Kid";

/** Each scene draws into a 320×180 viewBox. `bg` is the soft background tint. */
type Scene = (props: { bg: string }) => React.ReactElement;

const Sports: Scene = ({ bg }) => (
  <>
    <Outdoor bg={bg} />
    <Sun x={40} y={36} />
    <Cloud x={120} y={40} />
    <Cloud x={250} y={28} s={0.8} />
    <path d="M222 156 V96 H302 V156" stroke={C.white} strokeWidth={5} fill="none" strokeLinejoin="round" />
    <path d="M232 96 V156 M247 96 V156 M262 96 V156 M277 96 V156 M292 96 V156 M222 111 H302 M222 126 H302 M222 141 H302" stroke={C.white} strokeWidth={1.2} opacity={0.7} />
    <Kid x={262} y={156} s={1.15} pose="up" skin={SKIN[3]} hair={HAIR[3]} shirt={C.sun} pants={C.tealDark} hairStyle="puffs" />
    <Kid x={115} y={160} s={1.3} pose="reach" skin={SKIN[1]} hair={HAIR[1]} shirt={C.coral} />
    <circle cx={168} cy={150} r={10} fill={C.white} stroke={C.ink} strokeWidth={1.5} />
    <path d="M168 145 l4 3 -1.5 4.5 h-5 l-1.5 -4.5z" fill={C.ink} />
    <path d="M150 140 h-10 M152 148 h-14" stroke={C.ink} strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
  </>
);

const Music: Scene = ({ bg }) => (
  <>
    <Indoor bg={bg} />
    <rect x={30} y={30} width={50} height={36} rx={4} fill={C.white} stroke={C.lav} strokeWidth={4} />
    <path d="M38 58 l10 -12 8 8 6 -6 10 10" stroke={C.teal} strokeWidth={3} fill="none" />
    <Kid x={115} y={156} s={1.25} pose="up" skin={SKIN[2]} hair={HAIR[0]} shirt={C.teal} />
    <path d="M93 80 l14 -16 M137 80 l-14 -16" stroke={C.wood} strokeWidth={3} strokeLinecap="round" />
    <rect x={90} y={118} width={50} height={34} rx={5} fill={C.coral} />
    <path d="M90 126 l12 18 12 -18 12 18 14 -18" stroke={C.cream} strokeWidth={3} fill="none" />
    <ellipse cx={115} cy={118} rx={25} ry={7} fill={C.cream} stroke={C.coralDark} strokeWidth={2} />
    <Kid x={230} y={158} s={1.2} pose="wave" skin={SKIN[0]} hair={HAIR[2]} shirt={C.lav} hairStyle="long" flip />
    <Note x={170} y={62} fill={C.coral} />
    <Note x={196} y={40} fill={C.lavDark} />
    <Note x={270} y={64} fill={C.tealDark} />
    <Sparkle x={160} y={30} s={0.8} />
  </>
);

const Dance: Scene = ({ bg }) => (
  <>
    <rect width={320} height={180} fill={bg} />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <rect key={i} x={i * 40} y={146} width={40} height={34} fill={[C.lav, C.sun, C.teal, C.pink][i % 4]} opacity={0.75} />
    ))}
    <path d="M60 0 L20 146 H100Z M260 0 L220 146 H300Z" fill={C.white} opacity={0.35} />
    <circle cx={160} cy={22} r={14} fill={C.lav} stroke={C.white} strokeWidth={2} />
    <path d="M150 16 h20 M148 24 h24 M153 31 h14" stroke={C.white} strokeWidth={1.5} />
    <Kid x={115} y={156} s={1.3} pose="up" skin={SKIN[4]} hair={HAIR[3]} shirt={C.coral} pants={C.lavDark} hairStyle="bun" />
    <Kid x={205} y={156} s={1.3} pose="wave" skin={SKIN[1]} hair={HAIR[4]} shirt={C.sun} flip />
    <Sparkle x={70} y={60} />
    <Sparkle x={260} y={50} fill={C.coral} />
    <Sparkle x={160} y={70} s={0.6} fill={C.white} />
    <Note x={280} y={100} fill={C.lavDark} />
  </>
);

const Arts: Scene = ({ bg }) => (
  <>
    <Indoor bg={bg} />
    <path d="M195 150 L210 60 M245 150 L230 60 M220 150 V110" stroke={C.wood} strokeWidth={5} strokeLinecap="round" />
    <rect x={182} y={52} width={76} height={60} rx={3} fill={C.white} stroke={C.wood} strokeWidth={3} />
    <path d="M196 102 a24 24 0 0 1 48 0" stroke={C.coral} strokeWidth={6} fill="none" />
    <path d="M203 102 a17 17 0 0 1 34 0" stroke={C.sun} strokeWidth={6} fill="none" />
    <path d="M210 102 a10 10 0 0 1 20 0" stroke={C.teal} strokeWidth={6} fill="none" />
    <circle cx={245} cy={66} r={6} fill={C.sun} />
    <Kid x={120} y={158} s={1.3} pose="reach" skin={SKIN[0]} hair={HAIR[4]} shirt={C.lav} hairStyle="puffs" />
    <path d="M149 103 L166 86" stroke={C.wood} strokeWidth={3} strokeLinecap="round" />
    <circle cx={167} cy={85} r={3} fill={C.coral} />
    <ellipse cx={60} cy={150} rx={26} ry={8} fill={C.cream} stroke={C.floorDark} strokeWidth={2} />
    <circle cx={48} cy={148} r={4} fill={C.coral} />
    <circle cx={60} cy={146} r={4} fill={C.teal} />
    <circle cx={72} cy={149} r={4} fill={C.sun} />
    <circle cx={285} cy={165} r={6} fill={C.coral} opacity={0.7} />
    <circle cx={150} cy={170} r={4} fill={C.teal} opacity={0.7} />
    <Sparkle x={60} y={50} fill={C.coral} />
  </>
);

const Stem: Scene = ({ bg }) => (
  <>
    <Indoor bg={bg} />
    <circle cx={50} cy={46} r={16} fill="none" stroke={C.lav} strokeWidth={7} strokeDasharray="5 4" />
    <circle cx={50} cy={46} r={6} fill={C.lav} />
    <circle cx={80} cy={70} r={10} fill="none" stroke={C.teal} strokeWidth={5} strokeDasharray="4 3" />
    <Kid x={120} y={158} s={1.3} pose="wave" skin={SKIN[3]} hair={HAIR[0]} shirt={C.sun} pants={C.tealDark} />
    <path d="M143 42 a10 10 0 1 1 10 0 v6 h-10z" fill={C.sun} />
    <rect x={143} y={50} width={10} height={4} rx={1} fill={C.ink} />
    <path d="M138 32 l-5 -3 M158 32 l5 -3 M148 20 v-6" stroke={C.sun} strokeWidth={2.5} strokeLinecap="round" />
    <line x1={225} y1={80} x2={225} y2={66} stroke={C.ink} strokeWidth={2.5} />
    <circle cx={225} cy={63} r={5} fill={C.coral} />
    <rect x={205} y={80} width={40} height={28} rx={7} fill={C.lav} />
    <circle cx={217} cy={93} r={5} fill={C.white} />
    <circle cx={233} cy={93} r={5} fill={C.white} />
    <circle cx={218} cy={93} r={2.2} fill={C.ink} />
    <circle cx={234} cy={93} r={2.2} fill={C.ink} />
    <rect x={198} y={110} width={54} height={36} rx={8} fill={C.teal} />
    <rect x={212} y={118} width={26} height={14} rx={3} fill={C.cream} />
    <circle cx={218} cy={125} r={2.5} fill={C.coral} />
    <circle cx={226} cy={125} r={2.5} fill={C.sun} />
    <circle cx={234} cy={125} r={2.5} fill={C.tealDark} />
    <path d="M198 120 l-14 8 M252 120 l14 -10" stroke={C.tealDark} strokeWidth={5} strokeLinecap="round" />
    <circle cx={210} cy={150} r={7} fill={C.ink} />
    <circle cx={240} cy={150} r={7} fill={C.ink} />
  </>
);

const Theatre: Scene = ({ bg }) => (
  <>
    <rect width={320} height={180} fill={bg} />
    <rect y={140} width={320} height={40} fill={C.wood} />
    <rect y={140} width={320} height={6} fill="#9b6238" />
    <path d="M160 0 L100 140 H220Z" fill={C.sun} opacity={0.35} />
    <Kid x={160} y={146} s={1.3} pose="up" skin={SKIN[2]} hair={HAIR[1]} shirt={C.teal} hairStyle="long" />
    <path d="M148 69 l3 -10 5 6 4 -9 4 9 5 -6 3 10z" fill={C.sun} stroke={C.coralDark} strokeWidth={1} />
    <path d="M0 0 H70 Q60 60 78 140 H0Z" fill={C.coral} />
    <path d="M320 0 H250 Q260 60 242 140 H320Z" fill={C.coral} />
    <path d="M20 0 Q14 70 30 140 M45 0 Q38 70 54 140 M300 0 Q306 70 290 140 M275 0 Q282 70 266 140" stroke={C.coralDark} strokeWidth={3} fill="none" />
    <path d="M0 0 H320 V16 Q240 28 160 16 Q80 28 0 16Z" fill={C.coralDark} />
    <Sparkle x={110} y={60} />
    <Sparkle x={212} y={52} fill={C.white} />
  </>
);

const Museum: Scene = ({ bg }) => (
  <>
    <Indoor bg={bg} />
    <rect x={28} y={34} width={44} height={34} rx={2} fill={C.cream} stroke={C.sun} strokeWidth={4} />
    <circle cx={42} cy={48} r={6} fill={C.coral} />
    <path d="M32 64 l14 -10 10 6 12 -8" stroke={C.teal} strokeWidth={3} fill="none" />
    <rect x={160} y={138} width={130} height={10} rx={3} fill={C.lavDark} />
    <path
      d="M178 138 Q172 108 200 104 Q228 100 240 112 Q246 86 250 60 Q253 48 263 50 Q272 53 266 61 Q259 68 258 92 L260 138 L248 138 L246 126 Q224 130 206 126 L204 138 L192 138 L190 126 Q160 128 140 116 Q162 118 178 120Z"
      fill={C.teal}
    />
    <circle cx={262} cy={56} r={1.8} fill={C.ink} />
    <path d="M200 112 q8 -4 16 0 M212 108 q8 -4 16 0" stroke={C.tealDark} strokeWidth={2.5} fill="none" />
    <Kid x={95} y={158} s={1.3} pose="reach" skin={SKIN[1]} hair={HAIR[3]} shirt={C.coral} hairStyle="puffs" />
    <Sparkle x={130} y={40} />
  </>
);

const Outdoors: Scene = ({ bg }) => (
  <>
    <Outdoor bg={bg} />
    <Sun x={160} y={34} />
    <Cloud x={200} y={36} s={0.8} />
    <rect x={52} y={92} width={10} height={50} rx={3} fill={C.wood} />
    <circle cx={57} cy={80} r={26} fill={C.grassDark} />
    <circle cx={40} cy={95} r={18} fill={C.grassDark} />
    <circle cx={74} cy={96} r={18} fill="#5fae50" />
    <rect x={265} y={96} width={9} height={46} rx={3} fill={C.wood} />
    <path d="M269 50 L294 102 H244Z" fill="#5fae50" />
    <path d="M269 68 L298 120 H240Z" fill={C.grassDark} />
    <Kid x={160} y={160} s={1.3} pose="reach" skin={SKIN[4]} hair={HAIR[0]} shirt={C.sun} pants={C.lavDark} />
    <circle cx={194} cy={96} r={9} fill={C.sky} opacity={0.6} stroke={C.ink} strokeWidth={3} />
    <path d="M187 104 l-6 8" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
    <g transform="translate(222 70)">
      <ellipse cx={-6} cy={-3} rx={7} ry={9} fill={C.coral} transform="rotate(-25 -6 -3)" />
      <ellipse cx={6} cy={-3} rx={7} ry={9} fill={C.pink} transform="rotate(25 6 -3)" />
      <rect x={-1.2} y={-10} width={2.4} height={16} rx={1} fill={C.ink} />
    </g>
    {[[100, 150, C.coral], [116, 156, C.sun], [230, 150, C.lav], [300, 158, C.pink]].map(([x, y, f]) => (
      <circle key={`${x}`} cx={x as number} cy={y as number} r={4} fill={f as string} />
    ))}
  </>
);

const Baby: Scene = ({ bg }) => (
  <>
    <Indoor bg={bg} />
    <Cloud x={40} y={40} s={0.9} />
    <Sparkle x={270} y={36} fill={C.lav} />
    <ellipse cx={160} cy={158} rx={110} ry={14} fill={C.lav} opacity={0.6} />
    <ellipse cx={160} cy={130} rx={22} ry={24} fill={C.sun} />
    <path d="M140 150 q-14 0 -12 -10 M180 150 q14 0 12 -10" stroke={SKIN[1]} strokeWidth={8} strokeLinecap="round" fill="none" />
    <path d="M141 118 q-14 6 -10 18 M179 118 q14 6 10 18" stroke={C.sun} strokeWidth={8} strokeLinecap="round" fill="none" />
    <circle cx={160} cy={90} r={18} fill={SKIN[1]} />
    <path d="M158 72 q6 -8 10 0" stroke={HAIR[1]} strokeWidth={3} fill="none" strokeLinecap="round" />
    <circle cx={154} cy={90} r={2} fill={C.ink} />
    <circle cx={166} cy={90} r={2} fill={C.ink} />
    <circle cx={149} cy={97} r={3} fill={C.pink} opacity={0.7} />
    <circle cx={171} cy={97} r={3} fill={C.pink} opacity={0.7} />
    <ellipse cx={160} cy={99} rx={4} ry={3} fill={C.coralDark} />
    <rect x={64} y={126} width={24} height={24} rx={4} fill={C.coral} />
    <rect x={88} y={130} width={20} height={20} rx={4} fill={C.teal} />
    <rect x={74} y={106} width={20} height={20} rx={4} fill={C.sun} />
    <path d="M70 132 h12 M93 136 h10 M79 112 h10" stroke={C.white} strokeWidth={3} strokeLinecap="round" />
    <rect x={244} y={92} width={4} height={58} rx={2} fill={C.wood} />
    {[[246, 146, 20, C.coral], [246, 136, 16, C.sun], [246, 127, 12, C.teal], [246, 119, 9, C.lav]].map(([cx, cy, rx, f]) => (
      <ellipse key={`${cy}`} cx={cx as number} cy={cy as number} rx={rx as number} ry={5} fill={f as string} />
    ))}
    <circle cx={246} cy={90} r={5} fill={C.pink} />
  </>
);

const HolidayCamp: Scene = ({ bg }) => (
  <>
    <Outdoor bg={bg} />
    <Sun x={280} y={34} />
    <Cloud x={30} y={34} />
    <path d="M196 148 L238 74 L280 148Z" fill={C.coral} />
    <path d="M238 74 L226 148 H250Z" fill={C.coralDark} />
    <line x1={238} y1={74} x2={238} y2={50} stroke={C.ink} strokeWidth={2.5} />
    <path d="M238 50 l16 5 -16 5z" fill={C.sun} />
    <path d="M128 150 l26 -8 M128 142 l26 8" stroke={C.wood} strokeWidth={6} strokeLinecap="round" />
    <path d="M141 140 q-12 -14 0 -32 q2 12 8 14 q6 -10 2 -20 q16 14 4 38z" fill={C.sun} />
    <path d="M142 140 q-5 -8 0 -16 q4 8 6 6 q2 5 -1 10z" fill={C.coral} />
    <Kid x={86} y={158} s={1.25} pose="wave" skin={SKIN[2]} hair={HAIR[2]} shirt={C.teal} hairStyle="bun" />
    <Kid x={180} y={162} s={1.15} pose="up" skin={SKIN[0]} hair={HAIR[1]} shirt={C.lav} flip />
  </>
);

export const SCENES: Record<CategorySlug, Scene> = {
  sports: Sports,
  music: Music,
  dance: Dance,
  arts: Arts,
  stem: Stem,
  theatre: Theatre,
  museum: Museum,
  outdoors: Outdoors,
  baby: Baby,
  holidayCamp: HolidayCamp,
};
