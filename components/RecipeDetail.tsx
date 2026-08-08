"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  ArrowLeft,
  Edit2,
  ExternalLink,
  Clock,
  Users,
  Share,
  Check,
  Trash2,
  Tag as TagIcon,
} from "lucide-react";
import { Recipe } from "@/lib/types";
import styles from "./RecipeDetail.module.css";
import RecipeThumbnail from "./RecipeThumbnail";
import { DIFFICULTY_TAGS, MEAL_TYPE_TAGS } from "@/lib/tags";
import { useModalDialog } from "@/lib/useModalDialog";

/** A saved URL can be malformed — never let hostname parsing break the render. */
function sourceHostname(rawUrl: string): string | null {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

interface RecipeDetailProps {
  recipe: Recipe;
  onTagsUpdate: (recipeId: string, tags: string[]) => Promise<void>;
  onMetadataUpdate?: (
    recipeId: string,
    title: string,
    url: string,
    thumbnailUrl: string | null,
    cookTime: string | null,
    servings: string | null,
    notes: string | null,
  ) => Promise<void>;
  onDelete?: (recipeId: string) => Promise<void>;
  onClose: () => void;
}

export function RecipeDetail({
  recipe,
  onTagsUpdate,
  onMetadataUpdate,
  onDelete,
  onClose,
}: RecipeDetailProps) {
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(recipe.tags || []);
  const [title, setTitle] = useState(recipe.title);
  const [url, setUrl] = useState(recipe.url);
  const [thumbnailUrl, setThumbnailUrl] = useState(recipe.thumbnail_url || "");
  const [cookTime, setCookTime] = useState(recipe.cook_time || "");
  const [servings, setServings] = useState(recipe.servings || "");
  const [notes, setNotes] = useState(recipe.notes || "");
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useModalDialog<HTMLDivElement>(onClose);
  const hostname = sourceHostname(recipe.url);

  const handleDelete = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      deleteTimeoutRef.current = setTimeout(
        () => setConfirmingDelete(false),
        3000,
      );
    } else {
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
      onDelete?.(recipe.id);
    }
  };

  // Sync all state when recipe changes
  useEffect(() => {
    setTitle(recipe.title);
    setUrl(recipe.url);
    setThumbnailUrl(recipe.thumbnail_url || "");
    setCookTime(recipe.cook_time || "");
    setServings(recipe.servings || "");
    setNotes(recipe.notes || "");
    setTags(recipe.tags || []);
  }, [
    recipe.id,
    recipe.title,
    recipe.url,
    recipe.thumbnail_url,
    recipe.cook_time,
    recipe.servings,
    recipe.notes,
  ]);

  const mealTypeTags = MEAL_TYPE_TAGS;
  const difficultyTags = DIFFICULTY_TAGS;

  const applyTagUpdate = async (updatedTags: string[]) => {
    setTags(updatedTags);
    setIsSaving(true);
    try {
      await onTagsUpdate(recipe.id, updatedTags);
    } finally {
      setIsSaving(false);
      tagInputRef.current?.focus();
    }
  };

  const handleAddTag = async () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTagInput("");
      await applyTagUpdate([...tags, newTag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    applyTagUpdate(tags.filter((tag) => tag !== tagToRemove));
  };

  // A suggestion chip is a toggle, not a one-way add: tapping a chip that
  // reads as already-applied used to be a dead no-op.
  const handleToggleSuggestedTag = (tag: string) => {
    applyTagUpdate(
      tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag],
    );
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleAddTag();
    }
  };

  const handleSaveMetadata = async () => {
    if (!onMetadataUpdate) return;
    setIsSaving(true);
    try {
      await onMetadataUpdate(
        recipe.id,
        title,
        url,
        thumbnailUrl || null,
        cookTime || null,
        servings || null,
        notes || null,
      );
      setIsEditingMetadata(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const res = await fetch(`/api/recipes/${recipe.id}/share`, {
      method: "POST",
    });
    if (!res.ok) return;
    const { shareToken } = await res.json();
    const url = `${window.location.origin}/share/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        // Not aria-labelledby: the heading it would point at unmounts in
        // metadata-edit mode, which would leave the dialog with no name.
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}>
        {/* Nav bar — absolutely positioned on desktop (floats over image),
            sticky on mobile so it stays visible while scrolling */}
        <div className={styles.navBar}>
          <button className={styles.backBtn} onClick={onClose}>
            <ArrowLeft size={17} />
            Back
          </button>
          <div className={styles.topRight}>
            {shareCopied && (
              <span className={styles.copiedLabel}>Link copied!</span>
            )}
            <button
              type="button"
              className={`${styles.shareBtn} ${shareCopied ? styles.shareBtnCopied : ""}`}
              onClick={handleShare}
              aria-label={shareCopied ? "Link copied" : "Copy share link"}
              title={shareCopied ? "Link copied!" : "Share recipe"}>
              {shareCopied ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                <Share size={16} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className={`${styles.deleteBtn} ${confirmingDelete ? styles.deleteBtnConfirming : ""}`}
              onClick={handleDelete}
              aria-label={
                confirmingDelete
                  ? `Confirm delete of ${title}`
                  : `Delete ${title}`
              }
              title={
                confirmingDelete ? "Tap again to delete" : "Delete recipe"
              }>
              <Trash2 size={16} aria-hidden="true" />
              {confirmingDelete && <span>Delete?</span>}
            </button>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close recipe"
              title="Close">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className={styles.header}>
          {recipe.thumbnail_url && (
            <RecipeThumbnail
              src={recipe.thumbnail_url}
              alt={recipe.title}
              className={styles.headerImage}
            />
          )}
        </div>

        <div className={styles.content}>
          {isEditingMetadata ? (
            <div className={styles.editSection}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Recipe URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={styles.input}
                  placeholder="https://..."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Thumbnail URL</label>
                <div className={styles.thumbnailInputRow}>
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className={styles.input}
                    placeholder="Leave empty for no thumbnail"
                  />
                  {thumbnailUrl && (
                    <div className={styles.thumbnailPreview}>
                      <img src={thumbnailUrl} alt="Thumbnail preview" />
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.formRowTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Cook Time</label>
                  <input
                    type="text"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    className={styles.input}
                    placeholder="e.g. 30 min"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Servings</label>
                  <input
                    type="text"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className={styles.input}
                    placeholder="e.g. 4–6"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={styles.input}
                  placeholder="Adjustments, substitutions, personal notes…"
                  rows={3}
                />
              </div>
              <div className={styles.buttonGroup}>
                <button
                  onClick={handleSaveMetadata}
                  className={styles.saveBtn}
                  disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsEditingMetadata(false);
                    setTitle(recipe.title);
                    setUrl(recipe.url);
                    setThumbnailUrl(recipe.thumbnail_url || "");
                    setCookTime(recipe.cook_time || "");
                    setServings(recipe.servings || "");
                    setNotes(recipe.notes || "");
                  }}
                  className={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.titleRow}>
                <h2>{title}</h2>
                <button
                  type="button"
                  onClick={() => setIsEditingMetadata(true)}
                  className={styles.editBtn}
                  aria-label="Edit recipe details"
                  title="Edit recipe">
                  <Edit2 size={16} aria-hidden="true" />
                </button>
              </div>
              {(cookTime || servings) && (
                <div className={styles.metaRow}>
                  {cookTime && (
                    <span className={styles.metaItem}>
                      <Clock size={12} />
                      {cookTime}
                    </span>
                  )}
                  {cookTime && servings && (
                    <span className={styles.metaDot}>·</span>
                  )}
                  {servings && (
                    <span className={styles.metaItem}>
                      <Users size={12} />
                      {servings}
                    </span>
                  )}
                </div>
              )}
              {/* The one door. This is the kitchen surface, and the whole
                  point of opening a recipe is to go cook from it. */}
              <a
                href={recipe.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.openRecipeBtn}>
                <ExternalLink size={16} aria-hidden="true" />
                Open recipe
                {hostname && (
                  <span className={styles.openRecipeHost}>{hostname}</span>
                )}
              </a>
            </>
          )}

          {notes && !isEditingMetadata && (
            <div className={styles.notesSection}>
              <span className={styles.notesLabel}>Notes</span>
              <p className={styles.notesText}>{notes}</p>
            </div>
          )}

          {/* Tags are a filing job, not a cooking job. At rest this is a
              read-only row; the editor is one tap away for when you're
              actually filing. */}
          <div className={styles.tagsSection}>
            <div className={styles.tagsHeader}>
              <span className={styles.notesLabel}>Tags</span>
              <button
                type="button"
                className={styles.tagsToggleBtn}
                onClick={() => setIsEditingTags((v) => !v)}
                aria-expanded={isEditingTags}>
                <TagIcon size={13} aria-hidden="true" />
                {isEditingTags ? "Done" : tags.length ? "Edit" : "Add tags"}
              </button>
            </div>

            {!isEditingTags &&
              (tags.length > 0 ? (
                <div className={styles.tagsList}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.tagReadonly}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles.tagsEmpty}>
                  No tags yet — tags are how you find this again.
                </p>
              ))}

            {isEditingTags && (
              <>
                <div className={styles.suggestionsSection}>
                  <div className={styles.suggestionGroup}>
                    <p className={styles.suggestionLabel}>Meal Type</p>
                    <div className={styles.suggestionsRow}>
                      {mealTypeTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleSuggestedTag(tag)}
                          className={`${styles.suggestionBtn} ${
                            tags.includes(tag) ? styles.suggestionBtnActive : ""
                          }`}
                          aria-pressed={tags.includes(tag)}
                          disabled={isSaving}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.suggestionGroup}>
                    <p className={styles.suggestionLabel}>Difficulty</p>
                    <div className={styles.suggestionsRow}>
                      {difficultyTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleSuggestedTag(tag)}
                          className={`${styles.suggestionBtn} ${
                            tags.includes(tag) ? styles.suggestionBtnActive : ""
                          }`}
                          aria-pressed={tags.includes(tag)}
                          disabled={isSaving}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.tagsInput}>
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag..."
                    aria-label="Add a tag"
                    className={styles.input}
                    disabled={isSaving}
                  />
                </div>

                <div className={styles.tagsList}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className={styles.removeTagBtn}
                        aria-label={`Remove tag ${tag}`}
                        title="Remove tag"
                        disabled={isSaving}>
                        <X size={14} aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
