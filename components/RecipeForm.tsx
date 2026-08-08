"use client";

import { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import styles from "./RecipeForm.module.css";
import { useModalDialog } from "@/lib/useModalDialog";

interface RecipeFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading?: boolean;
}

export function RecipeForm({ onSubmit, isLoading = false }: RecipeFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    try {
      await onSubmit(url);
      setUrl("");
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save recipe");
    }
  };

  const handleClose = () => {
    setUrl("");
    setError("");
    setIsOpen(false);
  };


  return (
    <>
      <button className={styles.addButton} onClick={() => setIsOpen(true)}>
        <Plus size={20} />
        <span>Add Recipe</span>
      </button>

      {isOpen && (
        <AddRecipeDialog
          url={url}
          error={error}
          isLoading={isLoading}
          onUrlChange={setUrl}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )}
    </>
  );
}

/** Split out so the dialog hook mounts and unmounts with the dialog itself. */
function AddRecipeDialog({
  url,
  error,
  isLoading,
  onUrlChange,
  onSubmit,
  onClose,
}: {
  url: string;
  error: string;
  isLoading: boolean;
  onUrlChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  const dialogRef = useModalDialog<HTMLDivElement>(onClose);
  const titleId = useId();
  const errorId = useId();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 id={titleId}>Add Recipe</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
            title="Close">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="url" className={styles.label}>
              Recipe or Video URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://example.com/recipe..."
              className={styles.input}
              disabled={isLoading}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              autoFocus
            />
          </div>

          {error && (
            <p id={errorId} className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.buttonGroup}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}>
              {isLoading ? "Adding Recipe..." : "Add Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
