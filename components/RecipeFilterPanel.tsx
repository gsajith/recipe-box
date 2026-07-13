"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { RecipeList } from "@/components/RecipeList";
import { ALL, FilterDropdown } from "@/components/FilterDropdown";
import { isInstagramUrl, isYouTubeUrl } from "@/lib/recipeExtractor";
import { DIFFICULTY_TAGS, MEAL_TYPE_TAGS, isPromotedTag } from "@/lib/tags";
import type { Recipe } from "@/lib/types";
import styles from "./RecipeFilterPanel.module.css";

const SOURCE_ORDER = ["YouTube", "Instagram", "Blog"] as const;
type SourceType = (typeof SOURCE_ORDER)[number];

function getSourceType(url: string): SourceType {
  try {
    const u = new URL(url);
    if (isYouTubeUrl(u)) return "YouTube";
    if (isInstagramUrl(u)) return "Instagram";
  } catch {}
  return "Blog";
}

interface RecipeFilterPanelProps {
  recipes: Recipe[];
  onRecipeSelect: (recipe: Recipe) => void;
  onRecipeDelete?: (recipeId: string) => Promise<void>;
  theme?: "light" | "inverted";
  /** Extra content rendered at the end of the controls row (e.g. RecipeForm) */
  extraControls?: React.ReactNode;
  loading?: boolean;
  /** Hide the per-card delete button (for read-only views) */
  hideDeleteButton?: boolean;
  /** Extra className merged onto the controls row (e.g. for slide-in animation) */
  controlsClassName?: string;
  /** Extra className merged onto the tags filter row (e.g. for slide-in animation) */
  tagsFilterClassName?: string;
}

export function RecipeFilterPanel({
  recipes,
  onRecipeSelect,
  onRecipeDelete,
  theme = "light",
  extraControls,
  loading,
  hideDeleteButton,
  controlsClassName,
  tagsFilterClassName,
}: RecipeFilterPanelProps) {
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<SourceType | "All">(ALL);
  const [selectedMeal, setSelectedMeal] = useState<string>(ALL);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(ALL);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [allTagsShown, setAllTagsShown] = useState(false);

  // Only offer a filter when the library actually spans more than one value —
  // a lone option filters nothing and just eats space on a phone.
  const presentSources = useMemo(
    () =>
      SOURCE_ORDER.filter((s) => recipes.some((r) => getSourceType(r.url) === s)),
    [recipes],
  );
  const presentMeals = useMemo(
    () => MEAL_TYPE_TAGS.filter((t) => recipes.some((r) => r.tags?.includes(t))),
    [recipes],
  );
  const presentDifficulties = useMemo(
    () => DIFFICULTY_TAGS.filter((t) => recipes.some((r) => r.tags?.includes(t))),
    [recipes],
  );

  // Re-filter whenever recipes or any filter selection change
  useEffect(() => {
    filterRecipes(recipes, searchQuery);
  }, [recipes, selectedTags, selectedSource, selectedMeal, selectedDifficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  function filterRecipes(recipesList: Recipe[], query: string) {
    let filtered = recipesList;
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerQuery) ||
          r.tags?.some((t) => t.toLowerCase().includes(lowerQuery)),
      );
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter((r) =>
        selectedTags.every((t) => r.tags?.includes(t)),
      );
    }
    if (selectedSource !== ALL) {
      filtered = filtered.filter((r) => getSourceType(r.url) === selectedSource);
    }
    if (selectedMeal !== ALL) {
      filtered = filtered.filter((r) => r.tags?.includes(selectedMeal));
    }
    if (selectedDifficulty !== ALL) {
      filtered = filtered.filter((r) => r.tags?.includes(selectedDifficulty));
    }
    setFilteredRecipes(filtered);
  }

  function handleSearch(query: string) {
    setSearchQuery(query);
    filterRecipes(recipes, query);
  }

  function handleTagToggle(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function clearAllFilters() {
    setSelectedSource(ALL);
    setSelectedMeal(ALL);
    setSelectedDifficulty(ALL);
    setSelectedTags([]);
  }

  /** Free-form tags only — meal type and difficulty have their own dropdowns. */
  function getOtherTags(): Array<[string, number]> {
    const map: Record<string, number> = {};
    filteredRecipes.forEach((r) =>
      r.tags?.forEach((t) => {
        if (isPromotedTag(t)) return;
        map[t] = (map[t] || 0) + 1;
      }),
    );
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }

  const otherTags = getOtherTags();
  const isInverted = theme === "inverted";
  const hasActiveFilters =
    selectedSource !== ALL ||
    selectedMeal !== ALL ||
    selectedDifficulty !== ALL ||
    selectedTags.length > 0;
  // The leftover-tag box renders on its own, so the row is only worth showing
  // when it holds a dropdown — or a Clear for filters already applied.
  const hasAnyDropdown =
    presentSources.length > 1 ||
    presentMeals.length > 1 ||
    presentDifficulties.length > 1;
  const showFilterRow = hasAnyDropdown || hasActiveFilters;

  return (
    <div className={isInverted ? styles.invertedTheme : undefined}>
      <div className={`${styles.controls} ${controlsClassName ?? ""}`}>
        <SearchBar onSearch={handleSearch} />
        <div className={styles.viewToggle}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewMode("grid");
            }}
            className={`${styles.viewToggleBtn} ${viewMode === "grid" ? styles.viewToggleBtnActive : ""}`}
            title="Grid view">
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewMode("list");
            }}
            className={`${styles.viewToggleBtn} ${viewMode === "list" ? styles.viewToggleBtnActive : ""}`}
            title="List view">
            <List size={16} />
          </button>
        </div>
        {extraControls}
      </div>

      {showFilterRow && (
        <div className={styles.filterRow}>
          {presentSources.length > 1 && (
            <FilterDropdown
              label="Platform"
              value={selectedSource}
              options={presentSources}
              onChange={(v) => setSelectedSource(v as SourceType | "All")}
              inverted={isInverted}
            />
          )}
          {presentMeals.length > 1 && (
            <FilterDropdown
              label="Meal"
              value={selectedMeal}
              options={presentMeals}
              onChange={setSelectedMeal}
              inverted={isInverted}
            />
          )}
          {presentDifficulties.length > 1 && (
            <FilterDropdown
              label="Difficulty"
              value={selectedDifficulty}
              options={presentDifficulties}
              onChange={setSelectedDifficulty}
              inverted={isInverted}
            />
          )}

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}>
              Clear
            </button>
          )}
        </div>
      )}

      {otherTags.length > 0 && (
        <div className={`${styles.tagsFilter} ${tagsFilterClassName ?? ""}`}>
          <div className={styles.tagsFilterContent}>
            {otherTags
              .filter((_, idx) => allTagsShown || idx < 8)
              .map(([tag]) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTagToggle(tag);
                  }}
                  className={`${styles.tagFilterBtn} ${selectedTags.includes(tag) ? styles.tagFilterBtnActive : ""}`}>
                  {tag}
                </button>
              ))}
            {!allTagsShown && otherTags.length > 8 && (
              <button
                className={`${styles.tagFilterBtn} ${styles.showAllBtn}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setAllTagsShown(true);
                }}>
                … show all tags
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingText}>Loading recipes...</div>
      ) : (
        <div
          className={hideDeleteButton ? styles.hideDelete : undefined}
          onClick={(e) => e.stopPropagation()}>
          <RecipeList
            recipes={filteredRecipes}
            onRecipeSelect={onRecipeSelect}
            onRecipeDelete={onRecipeDelete ?? (async () => {})}
            viewMode={viewMode}
          />
        </div>
      )}
    </div>
  );
}
