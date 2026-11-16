import type { Activity, CategorySlug } from "@/domain/types";
import { SCENES } from "./illustrations/scenes";

/** Soft scene backgrounds per listing accent. */
const BG: Record<Activity["accent"], string> = {
  coral: "#ffe1d6",
  sunshine: "#fff0c2",
  teal: "#cdeee9",
  lavender: "#e6e0ff",
};

/**
 * Illustrated picture for a listing, drawn in SVG (original artwork, no licensing issues).
 * Used until providers upload their own photos with confirmed image rights.
 */
export function Artwork({
  accent,
  category,
  className = "aspect-[16/9] w-full",
}: {
  accent: Activity["accent"];
  category: CategorySlug;
  className?: string;
}) {
  const Scene = SCENES[category];
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" className={`block ${className}`}>
      <Scene bg={BG[accent]} />
    </svg>
  );
}
