export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateUniqueSlug(base: string, existing: string[]): string {
  let slug = generateSlug(base);
  if (!slug) slug = "project";

  let candidate = slug;
  let counter = 1;
  while (existing.includes(candidate)) {
    candidate = `${slug}-${counter}`;
    counter++;
  }
  return candidate;
}
