/** Colour per child, in profile order. Navy text (#1d3557) passes WCAG AA on all of them. */
export const CHILD_COLORS = ["#a8dadc", "#d9bf77", "#c9dce8", "#f4c7c3", "#cfe8d5", "#e6d3f2"] as const;

export function childColor(index: number): string {
  return CHILD_COLORS[index % CHILD_COLORS.length]!;
}
