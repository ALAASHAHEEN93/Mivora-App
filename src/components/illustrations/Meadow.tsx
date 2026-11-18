/**
 * Mivora's own meadow landscape (drawn in code, brand colours): rolling hills, a winding
 * stream, blossom trees, flowers, two rainbow arcs and floating soap bubbles.
 * Decorative only. All motion stops with prefers-reduced-motion.
 */

const FLOWERS: [number, number, string, number][] = [
  [28, 168, "#f2a68a", 1], [62, 182, "#f3d077", 0.8], [96, 160, "#af9fd5", 0.9], [130, 186, "#f2a68a", 0.7],
  [250, 178, "#af9fd5", 0.8], [284, 160, "#f3d077", 1], [318, 184, "#f2a68a", 0.9], [352, 166, "#af9fd5", 0.8], [384, 186, "#f3d077", 0.7],
  [176, 150, "#f3d077", 0.6], [222, 148, "#f2a68a", 0.6],
];

function Flower({ x, y, color, s }: { x: number; y: number; color: string; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0v10" stroke="#5d9c8f" strokeWidth="1.6" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="0" cy="-4" rx="2.6" ry="4" fill={color} transform={`rotate(${r})`} />
      ))}
      <circle r="2.2" fill="#fff3ea" />
    </g>
  );
}

function Tree({ x, y, color, s = 1 }: { x: number; y: number; color: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0v-16" stroke="#8a6a55" strokeWidth="3" strokeLinecap="round" />
      <circle cx="0" cy="-24" r="12" fill={color} />
      <circle cx="-8" cy="-18" r="8" fill={color} />
      <circle cx="8" cy="-18" r="8" fill={color} />
      <circle cx="-3" cy="-28" r="4" fill="#fff" opacity="0.35" />
    </g>
  );
}

function Rainbow({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 120 70" aria-hidden="true" className={className}>
      {[
        ["#f2a68a", 54],
        ["#f3d077", 46],
        ["#82c3b8", 38],
        ["#af9fd5", 30],
      ].map(([c, r]) => (
        <path key={c} d={`M${60 - Number(r)} 66a${r} ${r} 0 0 1 ${2 * Number(r)} 0`} fill="none" stroke={String(c)} strokeWidth="7" strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function Meadow({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 ${className}`}>
      <Rainbow className="absolute -left-10 bottom-[38%] w-32 opacity-80 md:w-44" />
      <Rainbow className="absolute -right-12 bottom-[44%] w-28 -scale-x-100 opacity-70 md:w-40" />
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" className="relative block h-full w-full">
        <path d="M0 120C60 92 120 96 200 116s140 6 200-20v104H0Z" fill="var(--kw-meadow-far)" />
        <Tree x={70} y={112} color="#af9fd5" s={0.8} />
        <Tree x={330} y={104} color="#f3d077" s={0.9} />
        <Tree x={260} y={118} color="#f2a68a" s={0.6} />
        <path d="M0 150c70-30 140-26 210-6s130 14 190-6v62H0Z" fill="var(--kw-meadow-near)" />
        <path d="M176 200c6-18 30-26 22-38s-26-14-6-24 30-8 34-14" fill="none" stroke="var(--kw-stream)" strokeWidth="12" strokeLinecap="round" />
        <Tree x={36} y={150} color="#f2a68a" />
        <Tree x={372} y={146} color="#af9fd5" s={0.9} />
        {FLOWERS.map(([x, y, c, s]) => (
          <Flower key={`${x}-${y}`} x={x} y={y} color={c} s={s} />
        ))}
        <path d="M0 186c80-14 150-10 230 0s120 6 170-4v18H0Z" fill="var(--kw-bg)" />
      </svg>
      {/* soap bubbles drifting up */}
      {[
        ["left-[12%]", "bottom-[30%]", "size-4", 0],
        ["left-[48%]", "bottom-[46%]", "size-3", 1],
        ["right-[22%]", "bottom-[36%]", "size-5", 2],
        ["right-[8%]", "bottom-[60%]", "size-3", 3],
      ].map(([l, b, s, i]) => (
        <span
          key={String(i)}
          className={`mv-bubble absolute ${l} ${b} ${s} rounded-full border border-white/80 bg-white/25 shadow-[inset_-2px_-2px_4px_rgba(175,159,213,0.45)]`}
          style={{ "--i": i } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
