"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { RecipeList } from "@/components/RecipeList";
import { isInstagramUrl, isYouTubeUrl } from "@/lib/recipeExtractor";
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
  const [selectedSource, setSelectedSource] = useState<SourceType | "All">("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [allTagsShown, setAllTagsShown] = useState(false);

  const presentSources = useMemo(
    () => SOURCE_ORDER.filter((s) => recipes.some((r) => getSourceType(r.url) === s)),
    [recipes],
  );
  const sourceOptions = ["All", ...presentSources] as const;

  // Re-filter whenever recipes, tags, or source selection change
  useEffect(() => {
    filterRecipes(recipes, searchQuery);
  }, [recipes, selectedTags, selectedSource]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (selectedSource !== "All") {
      filtered = filtered.filter((r) => getSourceType(r.url) === selectedSource);
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

  function getAvailableTags(): Array<[string, number]> {
    const map: Record<string, number> = {};
    filteredRecipes.forEach((r) =>
      r.tags?.forEach((t) => {
        map[t] = (map[t] || 0) + 1;
      }),
    );
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }

  const availableTags = getAvailableTags();
  const isInverted = theme === "inverted";

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

      {presentSources.length > 1 && (
        <div className={styles.sourceFilter}>
          <div
            className={styles.sourceFilterTrack}
            style={{ "--source-count": sourceOptions.length } as React.CSSProperties}>
            <div
              className={styles.sourceFilterPill}
              style={{
                left: `calc(${sourceOptions.indexOf(selectedSource)} * 100% / ${sourceOptions.length})`,
                width: `calc(100% / ${sourceOptions.length})`,
              }}
            />
            {sourceOptions.map((source) => (
              <button
                key={source}
                className={`${styles.sourceFilterOption} ${selectedSource === source ? styles.sourceFilterOptionActive : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSource(source as SourceType | "All");
                }}>
                {source}
              </button>
            ))}
          </div>
        </div>
      )}

      {availableTags.length > 0 && (
        <div className={`${styles.tagsFilter} ${tagsFilterClassName ?? ""}`}>
          <div className={styles.tagsFilterContent}>
            {availableTags
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
            {!allTagsShown && availableTags.length > 8 && (
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
