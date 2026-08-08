"use client";

import { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import styles from "./RecipeForm.module.css";
import { useModalDialog } from "@/lib/useModalDialog";
import { canSaveAnyway, failureCopy } from "@/lib/saveRecipe";

interface RecipeFormProps {
  onSubmit: (
    url: string,
    options?: { allowFallback?: boolean },
  ) => Promise<void>;
  isLoading?: boolean;
}

/** A failure the user can act on, not a string thrown over the wall. */
interface FormError {
  message: string;
  detail?: string;
  recoverable?: boolean;
}

export function RecipeForm({ onSubmit, isLoading = false }: RecipeFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<FormError | null>(null);

  const submit = async (allowFallback: boolean) => {
    setError(null);

    if (!url.trim()) {
      setError({ message: "Please enter a URL" });
      return;
    }

    try {
      new URL(url);
    } catch {
      setError({ message: "Please enter a valid URL" });
      return;
    }

    try {
      await onSubmit(url, { allowFallback });
      setUrl("");
      setIsOpen(false);
    } catch (err) {
      const copy = failureCopy(err);
      setError({ ...copy, recoverable: canSaveAnyway(err) });
    }
  };

  const handleClose = () => {
    setUrl("");
    setError(null);
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
          onSubmit={(e) => {
            e.preventDefault();
            submit(false);
          }}
          onSaveAnyway={() => submit(true)}
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
  onSaveAnyway,
  onClose,
}: {
  url: string;
  error: FormError | null;
  isLoading: boolean;
  onUrlChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSaveAnyway: () => void;
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
            {/* The whole flow is pasting a link on a phone; autoFocus opened
                the keyboard but the alphabetic one. */}
            <input
              id="url"
              type="text"
              inputMode="url"
              autoComplete="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
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
            <div id={errorId} className={styles.error} role="alert">
              <p className={styles.errorMessage}>{error.message}</p>
              {error.detail && (
                <p className={styles.errorDetail}>{error.detail}</p>
              )}
            </div>
          )}

          {/* Extraction failing is routine; throwing the link away is not.
              The recovery leads, and the retry keeps its place below. */}
          {error?.recoverable && (
            <button
              type="button"
              className={styles.saveAnywayBtn}
              onClick={onSaveAnyway}
              disabled={isLoading}>
              {isLoading ? "Saving…" : "Save the link anyway"}
            </button>
          )}

          <div className={styles.buttonGroup}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={
                error?.recoverable ? styles.retryBtn : styles.submitBtn
              }
              disabled={isLoading}>
              {isLoading
                ? "Adding Recipe..."
                : error?.recoverable
                  ? "Try again"
                  : "Add Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
