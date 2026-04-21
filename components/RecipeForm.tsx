"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import styles from "./RecipeForm.module.css";

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
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <h2>Add Recipe</h2>
              <button
                className={styles.closeBtn}
                onClick={handleClose}
                title="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="url" className={styles.label}>
                  Recipe or Video URL
                </label>
                <input
                  id="url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/recipe..."
                  className={styles.input}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleClose}>
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
      )}
    </>
  );
}
