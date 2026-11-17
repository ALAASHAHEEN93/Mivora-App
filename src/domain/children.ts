/** Colour per child, in profile order. Indigo text (#392f5a) passes WCAG AA on all of them. */
export const CHILD_COLORS = ["#ffb3ba", "#f8b400", "#d4a5a5", "#e2d9f3", "#ffd9c2", "#fbe3a6"] as const;

export function childColor(index: number): string {
  return CHILD_COLORS[index % CHILD_COLORS.length]!;
}
