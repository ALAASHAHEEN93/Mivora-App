/** The sun mascot as a standalone SVG string (for app icons and the favicon). */
export function mascotSvg(background: string | null = "#a8dadc"): string {
  const rays = Array.from({ length: 8 }, (_, i) => `<rect x="30" y="5" width="4" height="9" rx="2" fill="#f6d04d" transform="rotate(${i * 45} 32 32)"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${
    background ? `<rect width="64" height="64" fill="${background}"/>` : ""
  }${rays}<circle cx="32" cy="32" r="16" fill="#f7a86b"/><circle cx="26.5" cy="30" r="2.2" fill="#2a2f3a"/><circle cx="37.5" cy="30" r="2.2" fill="#2a2f3a"/><circle cx="22.5" cy="35" r="2.2" fill="#ff9ec4" opacity="0.8"/><circle cx="41.5" cy="35" r="2.2" fill="#ff9ec4" opacity="0.8"/><path d="M26 36.5 Q32 42 38 36.5" stroke="#2a2f3a" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;
}
