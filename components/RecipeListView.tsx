"use client";

import { Recipe } from "@/lib/types";
import { RecipeItemContent } from "./RecipeItemContent";
import styles from "./RecipeList.module.css";

interface RecipeListViewProps {
  recipes: Recipe[];
  onRecipeSelect: (recipe: Recipe) => void;
  onDelete: (recipeId: string) => Promise<void>;
  deletingId: string | null;
  tagCounts?: Record<string, number>;
}

export function RecipeListView({
  recipes,
  onRecipeSelect,
  onDelete,
  deletingId,
  tagCounts,
}: RecipeListViewProps) {
  return (
    <div className={styles.container}>
      <div className={`${styles.recipeGrid} ${styles.recipeList}`}>
        {recipes.map((recipe) => (
          <article
            key={recipe.id}
            className={`${styles.recipeCard} ${styles.recipeCardList}`}>
            <RecipeItemContent
              recipe={recipe}
              onSelect={() => onRecipeSelect(recipe)}
              onDelete={onDelete}
              deletingId={deletingId}
              tagCounts={tagCounts}
              viewMode="list"
            />
          </article>
        ))}
      </div>
    </div>
  );
}
