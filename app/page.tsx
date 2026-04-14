"use client";

import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { RecipeForm } from "@/components/RecipeForm";
import { RecipeList } from "@/components/RecipeList";
import { RecipeDetail } from "@/components/RecipeDetail";
import { SearchBar } from "@/components/SearchBar";
import { RecipeWithTags } from "@/lib/types";
import styles from "./page.module.css";

export default function Home() {
  const { user, isLoaded } = useUser();
  const [recipes, setRecipes] = useState<RecipeWithTags[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeWithTags[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithTags | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [allTagsShown, setAllTagsShown] = useState(false);

  // Fetch recipes when user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      fetchRecipes();
    }
  }, [isLoaded, user]);

  // Re-filter when selected tags change
  useEffect(() => {
    filterRecipes(recipes, searchQuery);
  }, [selectedTags]);

  const fetchRecipes = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/recipes");
      if (!response.ok) throw new Error("Failed to fetch recipes");
      const data = await response.json();
      setRecipes(data);
      filterRecipes(data, searchQuery);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const filterRecipes = (recipesList: RecipeWithTags[], query: string) => {
    let filtered = recipesList;

    // Apply search filter
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter((recipe) => {
        const matchesTitle = recipe.title.toLowerCase().includes(lowerQuery);
        const matchesTags = recipe.tags?.some((tag) =>
          tag.toLowerCase().includes(lowerQuery),
        );
        return matchesTitle || matchesTags;
      });
    }

    // Apply tag filters (AND logic - recipe must have all selected tags)
    if (selectedTags.length > 0) {
      filtered = filtered.filter((recipe) =>
        selectedTags.every((tag) => recipe.tags?.includes(tag)),
      );
    }

    setFilteredRecipes(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterRecipes(recipes, query);
  };

  const getAvailableTags = (): Array<[string, number]> => {
    // Get all tags from recipes after search filter but before tag filter
    let tagsMap: { [key: string]: number } = {};

    let searchFiltered = recipes;
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      searchFiltered = recipes.filter((recipe) => {
        const matchesTitle = recipe.title.toLowerCase().includes(lowerQuery);
        const matchesTags = recipe.tags?.some((tag) =>
          tag.toLowerCase().includes(lowerQuery),
        );
        return matchesTitle || matchesTags;
      });
    }

    // Apply current tag filters and count available tags
    let tagFiltered = searchFiltered;
    if (selectedTags.length > 0) {
      tagFiltered = searchFiltered.filter((recipe) =>
        selectedTags.every((tag) => recipe.tags?.includes(tag)),
      );
    }

    // Count tags that would still have recipes if selected
    tagFiltered.forEach((recipe) => {
      recipe.tags?.forEach((tag) => {
        tagsMap[tag] = (tagsMap[tag] || 0) + 1;
      });
    });

    // Sort by count descending
    return Object.entries(tagsMap).sort((a, b) => b[1] - a[1]);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleAddRecipe = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add recipe");
      }

      const newRecipe = await response.json();
      const updatedRecipes = [newRecipe, ...recipes];
      setRecipes(updatedRecipes);
      filterRecipes(updatedRecipes, searchQuery);
      setSelectedRecipe(newRecipe);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTags = async (recipeId: string, tags: string[]) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });

      if (!response.ok) throw new Error("Failed to update tags");

      // Update the selected recipe
      setSelectedRecipe((prev) => (prev ? { ...prev, tags } : null));

      // Update recipes list and filtered list
      setRecipes((prev) => {
        const updated = prev.map((r) =>
          r.id === recipeId ? { ...r, tags } : r,
        );
        filterRecipes(updated, searchQuery);
        return updated;
      });
    } catch (error) {
      console.error("Error updating tags:", error);
      throw error;
    }
  };

  const handleUpdateMetadata = async (
    recipeId: string,
    title: string,
    thumbnailUrl: string | null,
  ) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, thumbnail_url: thumbnailUrl }),
      });

      if (!response.ok) throw new Error("Failed to update recipe");

      const updatedRecipe = await response.json();

      // Update the selected recipe
      setSelectedRecipe(updatedRecipe);

      // Update recipes list
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipeId ? updatedRecipe : r)),
      );
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete recipe");

      const updatedRecipes = recipes.filter((r) => r.id !== recipeId);
      setRecipes(updatedRecipes);
      filterRecipes(updatedRecipes, searchQuery);
      setSelectedRecipe(null);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  };

  if (!isLoaded) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <h1>Recipe Saver</h1>
          <p>Save and organize your favorite recipes from across the web</p>
          <p>Sign in with your Google account to get started</p>
          <a href="/sign-in" className={styles.signInButton}>
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.userHeader}>
          <UserButton />
        </div>

        {recipes.length > 0 && (
          <div className={styles.searchBarContainer}>
            <SearchBar onSearch={handleSearch} />
            <div className={styles.viewToggle}>
              <button
                onClick={() => setViewMode("grid")}
                className={`${styles.viewToggleBtn} ${
                  viewMode === "grid" ? styles.viewToggleBtnActive : ""
                }`}
                title="Grid view">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`${styles.viewToggleBtn} ${
                  viewMode === "list" ? styles.viewToggleBtnActive : ""
                }`}
                title="List view">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
            <RecipeForm onSubmit={handleAddRecipe} isLoading={isLoading} />
          </div>
        )}

        {getAvailableTags().length > 0 && (
          <div className={styles.tagsFilter}>
            <div className={styles.tagsFilterContent}>
              {getAvailableTags()
                .filter((tag, index) => allTagsShown || index < 8)
                .map(([tag]) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`${styles.tagFilterBtn} ${
                      selectedTags.includes(tag)
                        ? styles.tagFilterBtnActive
                        : ""
                    }`}>
                    {tag}
                  </button>
                ))}
              {!allTagsShown && (
                <button
                  key="showAll"
                  className={`${styles.tagFilterBtn} ${styles.showAllBtn}`}
                  onClick={() => setAllTagsShown((prev) => !prev)}>
                  ... show all tags
                </button>
              )}
            </div>
          </div>
        )}

        {isFetching ? (
          <div className={styles.loading}>Loading recipes...</div>
        ) : (
          <RecipeList
            recipes={filteredRecipes}
            onRecipeSelect={setSelectedRecipe}
            onRecipeDelete={handleDeleteRecipe}
            viewMode={viewMode}
          />
        )}
      </div>

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onTagsUpdate={handleUpdateTags}
          onMetadataUpdate={handleUpdateMetadata}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
