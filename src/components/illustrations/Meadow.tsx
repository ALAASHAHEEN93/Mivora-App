/**
 * Mivora's own meadow landscape (drawn in code, brand colours): rolling hills, a winding
 * stream, the Cologne cathedral on the horizon, blossom trees, flowers, butterflies, ducks,
 * a frog that hops, a duck in sunglasses, a snail in a party hat, a peeking worm,
 * a swing set, a child flying a kite, birds, two rainbow
 * arcs and floating soap bubbles. Decorative only. All motion stops with prefers-reduced-motion.
 * `data-layer` names the parts; the Illustrator export (design/) turns them into layers.
 */

const FLOWERS: [number, number, string, number][] = [
  [28, 168, "#f2a68a", 1], [62, 182, "#f3d077", 0.8], [96, 160, "#af9fd5", 0.9], [130, 186, "#f2a68a", 0.7],
  [250, 178, "#af9fd5", 0.8], [284, 160, "#f3d077", 1], [318, 184, "#f2a68a", 0.9], [352, 166, "#af9fd5", 0.8], [384, 186, "#f3d077", 0.7],
  [176, 150, "#f3d077", 0.6], [222, 148, "#f2a68a", 0.6],
  [150, 174, "#af9fd5", 0.8], [112, 172, "#f3d077", 0.7], [340, 176, "#f3d077", 0.7], [236, 168, "#f2a68a", 0.7],
];

const INK = "#263847";

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
        <g data-layer="cathedral" opacity="0.6">
          <path d="M180 118V97L184 93V85L187 74L190 85V93L194 97V101H198V97L202 93V85L205 74L208 85V93L212 97V118Z" fill="#af9fd5" />
          <path d="M187 88v4M205 88v4M196 104v4" stroke="#fff3ea" strokeWidth="1.2" strokeLinecap="round" />
        </g>
        <path data-layer="hills-far" d="M0 120C60 92 120 96 200 116s140 6 200-20v104H0Z" fill="var(--kw-meadow-far)" />
        <g data-layer="birds" className="mv-drift">
          {[
            [110, 76],
            [126, 70],
            [142, 79],
          ].map(([x, y], i) => (
            <g key={x} transform={`translate(${x} ${y})`}>
              <path className="mv-bird" style={{ "--i": i } as React.CSSProperties} d="M-5 0Q-2.5-3 0 0Q2.5-3 5 0" fill="none" stroke="var(--kw-line-art)" strokeWidth="1.4" strokeLinecap="round" />
            </g>
          ))}
        </g>
        <g data-layer="trees-far">
          <Tree x={70} y={112} color="#af9fd5" s={0.8} />
          <Tree x={330} y={104} color="#f3d077" s={0.9} />
          <Tree x={260} y={118} color="#f2a68a" s={0.6} />
        </g>
        <g data-layer="kite">
          <path d="M304 130Q338 124 366 94" fill="none" stroke="var(--kw-line-art)" strokeWidth="0.8" opacity="0.7" />
          <g className="mv-kite">
            <path d="M366 68L376 80L366 94Z" fill="#f2a68a" />
            <path d="M366 68L356 80L366 94Z" fill="#f3d077" />
            <path d="M366 68L376 80L366 94L356 80Z M356 80H376 M366 68V94" fill="none" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M366 94q-4 6 0 11t0 11" fill="none" stroke={INK} strokeWidth="0.9" />
            <path d="M362 102l4 2l4-2l-4 2Z M362 112l4 2l4-2l-4 2Z" fill="#af9fd5" stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
          </g>
        </g>
        <path data-layer="hills-near" d="M0 150c70-30 140-26 210-6s130 14 190-6v62H0Z" fill="var(--kw-meadow-near)" />
        <path data-layer="stream" d="M176 200c6-18 30-26 22-38s-26-14-6-24 30-8 34-14" fill="none" stroke="var(--kw-stream)" strokeWidth="12" strokeLinecap="round" />
        <g data-layer="ducks">
          {[
            [188, 177, 0],
            [199, 150, 1],
          ].map(([x, y, i]) => (
            <g key={x} transform={`translate(${x} ${y})`}>
              <g className="mv-duck" style={{ "--i": i } as React.CSSProperties}>
                <ellipse cx="0" cy="0" rx="4.4" ry="2.6" fill="#f3d077" stroke="#263847" strokeWidth="0.8" />
                <circle cx="3.2" cy="-2.8" r="1.9" fill="#f3d077" stroke="#263847" strokeWidth="0.8" />
                <path d="M4.9 -2.9l1.8 0.5l-1.8 0.6Z" fill="#f2a68a" />
                <circle cx="3.6" cy="-3.2" r="0.35" fill="#263847" />
                {i === 1 && (
                  <g>
                    <rect x="2.2" y="-4" width="3.4" height="1.6" rx="0.7" fill="#263847" />
                    <path d="M2.2 -3.4l-1.4 -0.4" stroke="#263847" strokeWidth="0.5" strokeLinecap="round" />
                    <path d="M3 -3.6l0.8 0" stroke="#fff3ea" strokeWidth="0.4" strokeLinecap="round" />
                  </g>
                )}
              </g>
            </g>
          ))}
        </g>
        <g data-layer="frog" transform="translate(205 164)">
          <ellipse cx="0" cy="2.4" rx="6.4" ry="2.2" fill="#5d9c8f" />
          <path d="M0 2.4l5.6-1.6" stroke="var(--kw-stream)" strokeWidth="0.9" />
          <g className="mv-frog">
            <ellipse cx="0" cy="0" rx="4" ry="2.8" fill="#82c3b8" stroke="#263847" strokeWidth="0.8" />
            <circle cx="-2" cy="-2.6" r="1.5" fill="#fff3ea" stroke="#263847" strokeWidth="0.7" />
            <circle cx="2" cy="-2.6" r="1.5" fill="#fff3ea" stroke="#263847" strokeWidth="0.7" />
            <circle cx="-1.8" cy="-2.5" r="0.6" fill="#263847" />
            <circle cx="2.2" cy="-2.5" r="0.6" fill="#263847" />
            <path d="M-1.8 0.6q1.8 1.4 3.6 0" fill="none" stroke="#263847" strokeWidth="0.6" strokeLinecap="round" />
          </g>
        </g>
        <g data-layer="swing">
          <path d="M112 138L120 112L128 138M138 138L146 112L154 138" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M117 112H149" stroke="#f2a68a" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M117 112H149" stroke={INK} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
          <g className="mv-swing">
            <path d="M130 113V127M136 113V127" stroke={INK} strokeWidth="1" />
            <rect x="127.5" y="126" width="11" height="3.2" rx="1.6" fill="#f3d077" stroke={INK} strokeWidth="1" />
          </g>
        </g>
        <g data-layer="child-with-kite">
          <path d="M295 152V146M301 152V146" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M292.5 147c0-6 1.5-10 5.5-10s5.5 4 5.5 10Z" fill="#af9fd5" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M302 140L305 131" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="298" cy="132.5" r="4.2" fill="#e8b08f" stroke={INK} strokeWidth="1.2" />
          <path d="M293.8 131.5c0.6-3.6 3-5 4.6-5s3.6 1.2 4 4c-2-1.4-5.6-1.6-8.6 1Z" fill="#5a3b2e" />
        </g>
        <g data-layer="trees-near">
          <Tree x={36} y={150} color="#f2a68a" />
          <Tree x={372} y={146} color="#af9fd5" s={0.9} />
        </g>
        <g data-layer="flowers">
          {FLOWERS.map(([x, y, c, s]) => (
            <Flower key={`${x}-${y}`} x={x} y={y} color={c} s={s} />
          ))}
        </g>
        <g data-layer="butterflies">
          {[
            [88, 146, "#f2a68a", 0],
            [266, 150, "#af9fd5", 1],
          ].map(([x, y, c, i]) => (
            <g key={String(x)} transform={`translate(${x} ${y})`}>
              <g className="mv-hover" style={{ "--i": i } as React.CSSProperties}>
                <g className="mv-flutter">
                  <ellipse cx="-2.6" cy="-1.2" rx="2.6" ry="2.2" fill={String(c)} />
                  <ellipse cx="2.6" cy="-1.2" rx="2.6" ry="2.2" fill={String(c)} />
                  <ellipse cx="-1.8" cy="1.6" rx="1.7" ry="1.4" fill="#f3d077" />
                  <ellipse cx="1.8" cy="1.6" rx="1.7" ry="1.4" fill="#f3d077" />
                </g>
                <path d="M0 -2.4V2.8" stroke="#263847" strokeWidth="0.9" strokeLinecap="round" />
              </g>
            </g>
          ))}
        </g>
        <path data-layer="ground" d="M0 186c80-14 150-10 230 0s120 6 170-4v18H0Z" fill="var(--kw-bg)" />
        <g data-layer="party-snail" transform="translate(104 180)">
          <g className="mv-snail">
            <path d="M-7 3h12c1.6 0 2.6-1 2.6-2.6V-2" fill="#fbefc9" stroke="#263847" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.6-2l1-3.4M8.2-1.6l2.2-2.8" stroke="#263847" strokeWidth="0.7" strokeLinecap="round" />
            <circle cx="7.6" cy="-5.6" r="0.7" fill="#263847" />
            <circle cx="10.6" cy="-4.6" r="0.7" fill="#263847" />
            <circle cx="-1" cy="-1.4" r="4.4" fill="#f2a68a" stroke="#263847" strokeWidth="0.8" />
            <path d="M-1-1.4m-2 0a2 2 0 1 1 2 2a1 1 0 1 1-1-1" fill="none" stroke="#263847" strokeWidth="0.6" />
            <path d="M-3.2-5.2l1.8-5.4l2.6 4.6Z" fill="#af9fd5" stroke="#263847" strokeWidth="0.7" strokeLinejoin="round" />
            <circle cx="-1.4" cy="-10.8" r="1" fill="#f3d077" />
          </g>
        </g>
        <g data-layer="worm" transform="translate(336 184)">
          <ellipse cx="0" cy="1.2" rx="4" ry="1.3" fill="#8a6a55" opacity="0.55" />
          <g className="mv-worm">
            <path d="M-1.6 1V-4.6a1.6 1.6 0 0 1 3.2 0V1" fill="#f2a68a" stroke="#263847" strokeWidth="0.7" />
            <circle cx="-0.6" cy="-4.4" r="0.45" fill="#263847" />
            <circle cx="0.8" cy="-4.4" r="0.45" fill="#263847" />
            <path d="M-0.6-3q0.7 0.6 1.4 0" fill="none" stroke="#263847" strokeWidth="0.4" strokeLinecap="round" />
          </g>
          <ellipse cx="0" cy="1.4" rx="2.6" ry="0.8" fill="#5a3b2e" />
        </g>
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
