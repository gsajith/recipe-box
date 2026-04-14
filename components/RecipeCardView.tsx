"use client";

import { RecipeWithTags } from "@/lib/types";
import { RecipeItemContent } from "./RecipeItemContent";
import styles from "./RecipeList.module.css";

interface RecipeCardViewProps {
  recipes: RecipeWithTags[];
  onRecipeSelect: (recipe: RecipeWithTags) => void;
  onDelete: (recipeId: string) => Promise<void>;
  deletingId: string | null;
}

export function RecipeCardView({
  recipes,
  onRecipeSelect,
  onDelete,
  deletingId,
}: RecipeCardViewProps) {
  return (
    <div className={styles.container}>
      <div className={styles.recipeGrid}>
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className={styles.recipeCard}
            onClick={() => onRecipeSelect(recipe)}>
            <RecipeItemContent
              recipe={recipe}
              onDelete={onDelete}
              deletingId={deletingId}
              viewMode="grid"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
