const PATHS = {
  home: "M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4m8-4v4",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  pin: "M12 21s-6-5.5-6-11a6 6 0 1 1 12 0c0 5.5-6 11-6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2",
  check: "m5 12 4.5 4.5L19 7",
  external: "M14 4h6v6m0-6-9 9M18 14v6H4V6h6",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.7 3.5 5.7 3.5 9s-1 6.3-3.5 9c-2.5-2.7-3.5-5.7-3.5-9s1-6.3 3.5-9Z",
  filter: "M4 6h16M7 12h10m-7 6h4",
  back: "m15 18-6-6 6-6",
  forward: "m9 18 6-6-6-6",
  download: "M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 20h14",
  alert: "M12 4 2.5 20h19L12 4Zm0 6v4.5m0 3v.5",
  share: "M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M5 13v7h14v-7",
  umbrella: "M3 12a9 9 0 0 1 18 0H3Zm9 0v6a2 2 0 0 1-4 0M12 3v0",
  shuffle: "M4 7h3l10 10h3M4 17h3l3-3m4-4 3-3h3m-2-2 2 2-2 2m0 8 2 2-2 2",
  moon: "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "size-5", filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={`${className} ${name === "back" || name === "forward" ? "rtl:-scale-x-100" : ""}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
