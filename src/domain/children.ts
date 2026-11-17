/** Colour per child, in profile order. Ink text (#1f2340) passes WCAG AA on all of them. */
export const CHILD_COLORS = ["#ffd666", "#ffb4a6", "#bfe3f5", "#c8ecd9", "#e3d9f7", "#f3e3c3"] as const;

export function childColor(index: number): string {
  return CHILD_COLORS[index % CHILD_COLORS.length]!;
}
