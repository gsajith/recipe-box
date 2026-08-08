"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Recipe } from "@/lib/types";
import { RecipeCardView } from "./RecipeCardView";
import { RecipeListView } from "./RecipeListView";
import styles from "./RecipeList.module.css";

/**
 * How many recipes render before the list asks for more.
 *
 * The collection is fetched whole — search, the four filters and the tag
 * frequency map all reason over every recipe, and paging the *fetch* would mean
 * filtering only what happened to be loaded. What was actually expensive was
 * rendering it: 84 recipes built 2,710 DOM nodes and 30,181px of scroll, about
 * 36 phone screens, every one of them mounted whether or not you ever reached
 * it. So the fetch stays whole and the render pages.
 */
const PAGE_SIZE = 24;

interface RecipeListProps {
  /** Pages already revealed, so the count can live in the URL with the filters. */
  page?: number;
  onPageChange?: (page: number) => void;
  recipes: Recipe[];
  onRecipeSelect: (recipe: Recipe) => void;
  onRecipeDelete: (recipeId: string) => Promise<void>;
  viewMode?: "grid" | "list";
  /** True when a search or filter is narrowing the list — changes the empty state. */
  isFiltered?: boolean;
  onClearFilters?: () => void;
  /** How many recipes carry each tag, for ranking card chips. */
  tagCounts?: Record<string, number>;
  /** Changes when the filters change, so paging restarts on a new result set. */
  resetKey?: string;
}

export function RecipeList({
  recipes,
  onRecipeSelect,
  onRecipeDelete,
  viewMode = "grid",
  isFiltered = false,
  onClearFilters,
  tagCounts,
  resetKey,
  page,
  onPageChange,
}: RecipeListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [internalPage, setInternalPage] = useState(1);
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  /** Set when the user asked for more, so focus follows what they revealed. */
  const pendingFocus = useRef(false);

  // The caller owns the page number when it wants it in the URL; otherwise the
  // list keeps its own. Either way the arithmetic below is the same.
  const currentPage = page ?? internalPage;
  const setPage = (next: number) => {
    if (onPageChange) onPageChange(next);
    else setInternalPage(next);
  };
  const visibleCount = currentPage * PAGE_SIZE;

  const handleDelete = async (recipeId: string) => {
    setDeletingId(recipeId);
    try {
      await onRecipeDelete(recipeId);
    } finally {
      setDeletingId(null);
    }
  };

  // Narrowing the list has to start it over — otherwise filtering down to six
  // results would still be holding a page count from a browse of eighty.
  //
  // Keyed on the filters rather than on the array, because those are different
  // events that look identical from here: deleting a recipe also shortens the
  // list, and collapsing someone back to the first 24 after they deleted
  // something eighty deep would be its own small betrayal.
  //
  // Skipping the first run matters: on mount this would otherwise fire and
  // reset a page number the URL had just restored, so `?page=3` would render
  // 24 recipes and then rewrite the address to drop the cursor it came with.
  const prevResetKey = useRef(resetKey);
  useEffect(() => {
    if (prevResetKey.current === resetKey) return;
    prevResetKey.current = resetKey;
    setPage(1);
    // setPage only forwards to a setter; including it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const visible = useMemo(
    () => recipes.slice(0, visibleCount),
    [recipes, visibleCount],
  );
  const remaining = recipes.length - visible.length;

  /**
   * "Show more" used to unmount its own button on the last page, dropping focus
   * to <body> — the control whose whole job is "continue where I am" sent a
   * keyboard user back to the top of the tab order. Move focus onto the first
   * card that just appeared instead. Only when the button was pressed: the
   * observer fires on scroll, and stealing focus mid-scroll would be worse.
   */
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const cards = listRef.current?.querySelectorAll<HTMLElement>(
      "[data-recipe-card]",
    );
    const firstNew = cards?.[visibleCount - PAGE_SIZE];
    firstNew?.focus();
  }, [visibleCount]);

  // Reaching the button is the request. It stays a real button so the list
  // still finishes without IntersectionObserver, and so reaching the end by
  // keyboard gives you something to press rather than a scroll position.
  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || remaining <= 0) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPage(currentPage + 1);
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, currentPage]);

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

  return (
    <>
      <div ref={listRef}>
        {viewMode === "list" ? (
        <RecipeListView
          recipes={visible}
          onRecipeSelect={onRecipeSelect}
          onDelete={handleDelete}
          deletingId={deletingId}
          tagCounts={tagCounts}
        />
      ) : (
        <RecipeCardView
          recipes={visible}
          onRecipeSelect={onRecipeSelect}
          onDelete={handleDelete}
          deletingId={deletingId}
          tagCounts={tagCounts}
          />
        )}
      </div>

      {/* Announced politely so a screen reader learns the list grew without
          having the growth interrupt whatever it was reading. */}
      <p className={styles.listStatus} role="status" aria-live="polite">
        {remaining > 0
          ? `Showing ${visible.length} of ${recipes.length} recipes`
          : recipes.length > PAGE_SIZE
            ? `All ${recipes.length} recipes`
            : ""}
      </p>

      {remaining > 0 && (
        <div className={styles.loadMoreWrap}>
          <button
            ref={loadMoreRef}
            type="button"
            className={styles.loadMoreBtn}
            onClick={() => {
              pendingFocus.current = true;
              setPage(currentPage + 1);
            }}>
            Show {Math.min(remaining, PAGE_SIZE)} more
          </button>
        </div>
      )}
    </>
  );
}
