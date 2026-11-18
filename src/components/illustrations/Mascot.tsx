/**
 * Mivora's little badge: the logo's star in sticker style (apricot fill, dark outline).
 * "wow" adds a pink sparkle. Replaces the earlier sun mascot. Decorative only.
 */
export function Mascot({ className = "size-10", mood = "happy" }: { className?: string; mood?: "happy" | "wow" }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      <path
        className="mv-star-twinkle"
        d="M32 6 L39.4 22.3 L57 23.4 L43.4 34.6 L47.8 52 L32 42.4 L16.2 52 L20.6 34.6 L7 23.4 L24.6 22.3 Z"
        fill="#f3d077"
        stroke="#263847"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M24 26 Q28 22 33 24" fill="none" stroke="#fff3ea" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
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
