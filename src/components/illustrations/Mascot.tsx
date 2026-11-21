/**
 * Mivora's little badge: the logo's star in sticker style (sunshine fill, dark outline),
 * now with a face: blinking eyes, a smile and rosy cheeks. "wow" adds a coral sparkle.
 * Decorative only; the blink and twinkle stop with prefers-reduced-motion.
 */
export function StarFace() {
  return (
    <g className="mv-star-twinkle">
      <path
        d="M32 6 L39.4 22.3 L57 23.4 L43.4 34.6 L47.8 52 L32 42.4 L16.2 52 L20.6 34.6 L7 23.4 L24.6 22.3 Z"
        fill="#f3d077"
        stroke="#263847"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M20.5 26.5 Q22.5 23.8 25.8 23.4" fill="none" stroke="#fff3ea" strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />
      <ellipse cx="24.6" cy="36.4" rx="2.6" ry="1.7" fill="#f2a68a" opacity="0.75" />
      <ellipse cx="39.4" cy="36.4" rx="2.6" ry="1.7" fill="#f2a68a" opacity="0.75" />
      <g className="mv-blink">
        <circle cx="27.6" cy="31" r="2.3" fill="#263847" />
        <circle cx="36.4" cy="31" r="2.3" fill="#263847" />
        <circle cx="28.3" cy="30.2" r="0.7" fill="#fff3ea" />
        <circle cx="37.1" cy="30.2" r="0.7" fill="#fff3ea" />
      </g>
      <path d="M28.4 36.2 Q32 39.8 35.6 36.2" fill="none" stroke="#263847" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

export function Mascot({ className = "size-10", mood = "happy" }: { className?: string; mood?: "happy" | "wow" }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      <StarFace />
      {mood === "wow" && (
        <path
          d="M54 8 L55.6 12.4 L60 14 L55.6 15.6 L54 20 L52.4 15.6 L48 14 L52.4 12.4 Z"
          fill="#f2a68a"
          stroke="#263847"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
