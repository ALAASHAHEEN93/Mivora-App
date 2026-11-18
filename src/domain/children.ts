/** Colour per child, in profile order. Ink text (#263847) passes WCAG AA on all of them. */
export const CHILD_COLORS = ["#f3d077", "#f2a68a", "#82c3b8", "#af9fd5", "#fde3d8", "#d6ecf0"] as const;

export function childColor(index: number): string {
  return CHILD_COLORS[index % CHILD_COLORS.length]!;
}
