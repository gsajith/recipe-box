/**
 * Recipes carry a flat `tags` array, but two slices of it are a known, closed
 * vocabulary that the UI promotes to first-class filters. Everything else is
 * free-form (cuisine, ingredients, …) and stays in the general tag box.
 */
export const MEAL_TYPE_TAGS = [
  "breakfast",
  "lunch",
  "dinner",
  "dessert",
  "snack",
  "ingredient",
] as const;

export const DIFFICULTY_TAGS = ["easy", "medium", "hard"] as const;

const PROMOTED = new Set<string>([...MEAL_TYPE_TAGS, ...DIFFICULTY_TAGS]);

/** True for tags that already have their own filter and shouldn't be duplicated. */
export function isPromotedTag(tag: string): boolean {
  return PROMOTED.has(tag);
}
