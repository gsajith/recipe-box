"use client";

import { Trash2, Clock, Users } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
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
}

export function RecipeItemContent({
  recipe,
  onSelect,
  onDelete,
  deletingId,
  viewMode,
}: RecipeItemContentProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        <h3
          className={`${styles.title} ${
            viewMode === "list" ? styles.titleList : ""
          }`}>
          {recipe.title}

          {viewMode === "list" && (
            <SourceBadge url={recipe.url} className={styles.sourceBadgeList} />
          )}
        </h3>
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
            {recipe.tags
              .filter((tag, index) => viewMode === "list" || index < 2)
              .map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            {recipe.tags.length > 2 && viewMode !== "list" && (
              <span className={styles.tag}>+{recipe.tags.length - 2} more</span>
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
