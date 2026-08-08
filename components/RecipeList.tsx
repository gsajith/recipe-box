"use client";

import { useState } from "react";
import { Recipe } from "@/lib/types";
import { RecipeCardView } from "./RecipeCardView";
import { RecipeListView } from "./RecipeListView";
import styles from "./RecipeList.module.css";

interface RecipeListProps {
  recipes: Recipe[];
  onRecipeSelect: (recipe: Recipe) => void;
  onRecipeDelete: (recipeId: string) => Promise<void>;
  viewMode?: "grid" | "list";
  /** True when a search or filter is narrowing the list — changes the empty state. */
  isFiltered?: boolean;
  onClearFilters?: () => void;
  /** How many recipes carry each tag, for ranking card chips. */
  tagCounts?: Record<string, number>;
}

export function RecipeList({
  recipes,
  onRecipeSelect,
  onRecipeDelete,
  viewMode = "grid",
  isFiltered = false,
  onClearFilters,
  tagCounts,
}: RecipeListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (recipeId: string) => {
    setDeletingId(recipeId);
    try {
      await onRecipeDelete(recipeId);
    } finally {
      setDeletingId(null);
    }
  };

  if (recipes.length === 0) {
    // "Nothing saved" and "nothing matches" are different problems, and telling
    // someone with 84 recipes that they have none is just wrong.
    return (
      <div className={styles.empty}>
        {isFiltered ? (
          <>
            <p>No recipes match these filters.</p>
            {onClearFilters && (
              <button
                type="button"
                className={styles.emptyAction}
                onClick={onClearFilters}>
                Clear filters
              </button>
            )}
          </>
        ) : (
          <p>No recipes saved yet. Add your first recipe!</p>
        )}
      </div>
    );
  }

  return viewMode === "list" ? (
    <RecipeListView
      recipes={recipes}
      onRecipeSelect={onRecipeSelect}
      onDelete={handleDelete}
      deletingId={deletingId}
      tagCounts={tagCounts}
    />
  ) : (
    <RecipeCardView
      recipes={recipes}
      onRecipeSelect={onRecipeSelect}
      onDelete={handleDelete}
      deletingId={deletingId}
      tagCounts={tagCounts}
    />
  );
}
