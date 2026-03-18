export const GROUP_COLORS = [
  "#e67e22", "#e74c3c", "#9b59b6", "#3498db",
  "#1abc9c", "#2ecc71", "#f1c40f", "#e91e63",
  "#00bcd4", "#ff5722", "#795548", "#607d8b",
];

export function getNextColor(existingCount: number): string {
  return GROUP_COLORS[existingCount % GROUP_COLORS.length];
}
