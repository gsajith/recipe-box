"use client";

import { Recipe } from "@/lib/types";
import { RecipeItemContent } from "./RecipeItemContent";
import styles from "./RecipeList.module.css";

interface RecipeCardViewProps {
  recipes: Recipe[];
  onRecipeSelect: (recipe: Recipe) => void;
  onDelete: (recipeId: string) => Promise<void>;
  deletingId: string | null;
  tagCounts?: Record<string, number>;
}

export function RecipeCardView({
  recipes,
  onRecipeSelect,
  onDelete,
  deletingId,
  tagCounts,
}: RecipeCardViewProps) {
  return (
    <div className={styles.container}>
      <div className={styles.recipeGrid}>
        {recipes.map((recipe) => (
          <article key={recipe.id} className={styles.recipeCard}>
            <RecipeItemContent
              recipe={recipe}
              onSelect={() => onRecipeSelect(recipe)}
              onDelete={onDelete}
              deletingId={deletingId}
              tagCounts={tagCounts}
              viewMode="grid"
            />
          </article>
        ))}
      </div>
    </div>
  );
}
