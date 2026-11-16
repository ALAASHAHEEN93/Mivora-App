import { C } from "./Kid";

/** Mivora's sunny mascot. Decorative only. */
export function Mascot({ className = "size-10", mood = "happy" }: { className?: string; mood?: "happy" | "wow" }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x={30}
          y={1}
          width={4}
          height={10}
          rx={2}
          fill="#f6d04d"
          transform={`rotate(${i * 45} 32 32)`}
        />
      ))}
      <circle cx={32} cy={32} r={19} fill="#f7a86b" />
      <circle cx={32} cy={32} r={19} fill="url(#mv-shine)" />
      <defs>
        <radialGradient id="mv-shine" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fcd3ad" />
          <stop offset="1" stopColor="#f7a86b" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g className="mv-blink">
        <circle cx={25.5} cy={30} r={2.6} fill={C.ink} />
        <circle cx={38.5} cy={30} r={2.6} fill={C.ink} />
        <circle cx={26.3} cy={29.2} r={0.9} fill={C.white} />
        <circle cx={39.3} cy={29.2} r={0.9} fill={C.white} />
      </g>
      <circle cx={21} cy={36} r={3} fill={C.pink} opacity={0.8} />
      <circle cx={43} cy={36} r={3} fill={C.pink} opacity={0.8} />
      {mood === "happy" ? (
        <path d="M26 37 Q32 43 38 37" stroke={C.ink} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      ) : (
        <ellipse cx={32} cy={39} rx={3} ry={3.6} fill={C.ink} />
      )}
    </svg>
  );
}
