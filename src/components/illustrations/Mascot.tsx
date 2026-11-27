/**
 * Mivora's little badge: the logo's star in sticker style (sunshine fill, dark outline),
 * now with a face: blinking eyes, a smile and rosy cheeks. "wow" adds a coral sparkle.
 * Decorative only; the blink and twinkle stop with prefers-reduced-motion.
 *
 * `eyes` and `mouth` let scenes give the star a feeling (sleepy, curious, oops) without
 * a second drawing. The defaults are the classic happy face.
 */
export type StarEyes = "open" | "closed" | "side";
export type StarMouth = "smile" | "o" | "wobble";

export function StarFace({ eyes = "open", mouth = "smile" }: { eyes?: StarEyes; mouth?: StarMouth }) {
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
      {eyes === "closed" ? (
        <path d="M25.2 30.6 Q27.6 33 30 30.6 M34 30.6 Q36.4 33 38.8 30.6" fill="none" stroke="#263847" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <g className="mv-blink">
          <circle cx="27.6" cy="31" r="2.3" fill="#263847" />
          <circle cx="36.4" cy="31" r="2.3" fill="#263847" />
          {eyes === "side" ? (
            <>
              <circle cx="28.7" cy="30.4" r="0.7" fill="#fff3ea" />
              <circle cx="37.5" cy="30.4" r="0.7" fill="#fff3ea" />
            </>
          ) : (
            <>
              <circle cx="28.3" cy="30.2" r="0.7" fill="#fff3ea" />
              <circle cx="37.1" cy="30.2" r="0.7" fill="#fff3ea" />
            </>
          )}
        </g>
      )}
      {mouth === "o" && <ellipse cx="32" cy="37.6" rx="1.9" ry="2.2" fill="#263847" />}
      {mouth === "wobble" && (
        <path d="M28 37.6 Q30 35.8 32 37.6 T36 37.6" fill="none" stroke="#263847" strokeWidth="2" strokeLinecap="round" />
      )}
      {mouth === "smile" && (
        <path d="M28.4 36.2 Q32 39.8 35.6 36.2" fill="none" stroke="#263847" strokeWidth="2" strokeLinecap="round" />
      )}
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
