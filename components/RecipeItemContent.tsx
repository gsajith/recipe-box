"use client";

import { Trash2, Clock, Users } from "lucide-react";
import { useMemo, useRef, useState, type MouseEvent } from "react";
import { Recipe } from "@/lib/types";
import styles from "./RecipeList.module.css";
import RecipeThumbnail from "./RecipeThumbnail";
import SourceBadge from "./SourceBadge";

interface RecipeItemContentProps {
  recipe: Recipe;
  onSelect: () => void;
  onDelete: (recipeId: string) => Promise<void>;
  deletingId: string | null;
  viewMode: "grid" | "list";
  /** How many recipes carry each tag, for ranking which two a card shows. */
  tagCounts?: Record<string, number>;
}

export function RecipeItemContent({
  recipe,
  onSelect,
  onDelete,
  deletingId,
  viewMode,
  tagCounts,
}: RecipeItemContentProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Showing the first tags by array order meant nearly every card read
  // "dinner · lunch" — the tags that say least, because almost everything
  // carries them. Rank by rarity instead, so the chips carry the word you'd
  // actually search your memory for. List rows are wider, so they show more,
  // but they were still dumping the raw array in storage order.
  const shownTags = useMemo(() => {
    const tags = recipe.tags ?? [];
    const limit = viewMode === "list" ? 4 : 2;
    if (!tagCounts) return tags.slice(0, limit);
    return [...tags]
      .sort((a, b) => (tagCounts[a] ?? 0) - (tagCounts[b] ?? 0))
      .slice(0, limit);
  }, [recipe.tags, viewMode, tagCounts]);

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      deleteTimeoutRef.current = setTimeout(
        () => setConfirmingDelete(false),
        3000,
      );
    } else {
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
      onDelete(recipe.id);
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.cardOpenBtn}
        onClick={onSelect}
        aria-label={`Open ${recipe.title}`}
      />

      {recipe.thumbnail_url && (
        <div
          className={
            viewMode === "list"
              ? styles.thumbnailListWrapper
              : styles.thumbnailWrapper
          }>
          <RecipeThumbnail
            src={recipe.thumbnail_url}
            alt={recipe.title}
            className={`${styles.thumbnail} ${styles.thumbnailList}`}
          />
          {viewMode !== "list" && (
            <SourceBadge url={recipe.url} className={styles.sourceBadge} />
          )}
        </div>
      )}

      <div
        className={`${styles.content} ${
          viewMode === "list" ? styles.contentList : ""
        }`}>
        {/* h2, not h3: the page's only other heading is the h1 above the list,
            so an h3 here skipped a level. */}
        <h2
          className={`${styles.title} ${
            viewMode === "list" ? styles.titleList : ""
          }`}>
          {recipe.title}

          {viewMode === "list" && (
            <SourceBadge url={recipe.url} className={styles.sourceBadgeList} />
          )}
        </h2>
        {(recipe.cook_time || recipe.servings) && (
          <div className={styles.meta}>
            {recipe.cook_time && (
              <span className={styles.metaItem}>
                <Clock size={11} />
                {recipe.cook_time}
              </span>
            )}
            {recipe.cook_time && recipe.servings && (
              <span className={styles.metaDot}>·</span>
            )}
            {recipe.servings && (
              <span className={styles.metaItem}>
                <Users size={11} />
                {recipe.servings}
              </span>
            )}
          </div>
        )}
        {recipe.tags && recipe.tags.length > 0 && (
          <div
            className={`${styles.tags} ${
              viewMode === "list" ? styles.tagsList : ""
            }`}>
            {shownTags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
            {recipe.tags.length > shownTags.length && (
              <span className={styles.tag}>
                +{recipe.tags.length - shownTags.length} more
              </span>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className={`${styles.deleteBtn} ${confirmingDelete ? styles.deleteBtnConfirming : ""}`}
        onClick={handleDelete}
        aria-label={
          confirmingDelete
            ? `Confirm delete of ${recipe.title}`
            : `Delete ${recipe.title}`
        }
        title={confirmingDelete ? "Tap again to delete" : "Delete recipe"}>
        <Trash2 size={16} aria-hidden="true" />
        {confirmingDelete && <span>Delete?</span>}
      </button>
    </>
  );
}
