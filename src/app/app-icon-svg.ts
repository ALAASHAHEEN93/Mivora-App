/**
 * App icon, matching the "Star i" logo: the i's stem with its gold star dot and the aqua
 * swoosh, on navy. Artwork sits inside the central 80% so it survives "maskable" cropping.
 */
export function appIconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" fill="#1f2340"/>
<rect x="42" y="40" width="16" height="34" rx="8" fill="#fffbf2"/>
<path transform="translate(50 26) scale(1.25)" d="M0 -10 L2.9 -3.2 L10 -3.1 L4.4 1.5 L6.4 9 L0 4.6 L-6.4 9 L-4.4 1.5 L-10 -3.1 L-2.9 -3.2 Z" fill="#ffc93c"/>
<path d="M24 78 Q50 90 76 74" fill="none" stroke="#ff6b57" stroke-width="6" stroke-linecap="round"/>
</svg>`;
}
