/** Per-category accent colors used for blog badges and article theming. */
export const CATEGORY_COLORS: Record<string, string> = {
  "Digital Policy": "#7C3AED",
  Cybersecurity: "#3B82F6",
  Infrastructure: "#10B981",
  "Startup Ecosystem": "#F59E0B",
  "Fintech & Payments": "#F43F5E",
  "Trade & AfCFTA": "#6366F1",
  "AI & Data": "#14B8A6",
  "Gender & Inclusion": "#EC4899",
}

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#7C3AED"
}
