export type SortKey = "key-asc" | "key-desc" | "newest" | "oldest";

export const SORT_LABELS: Record<SortKey, string> = {
  "key-asc": "Name (A–Z)",
  "key-desc": "Name (Z–A)",
  newest: "Newest first",
  oldest: "Oldest first",
};
