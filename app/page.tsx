"use client";

import { useEffect, useRef, useState } from "react";
import { Clipboard, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Landing } from "@/components/Landing";
import { RecipeForm } from "@/components/RecipeForm";
import { AppHeader } from "@/components/AppHeader";
import { RecipeDetail } from "@/components/RecipeDetail";
import { RecipeFilterPanel } from "@/components/RecipeFilterPanel";
import { Recipe } from "@/lib/types";
import {
  canSaveAnyway,
  failureCopy,
  isDuplicate,
  saveRecipe,
  type SaveFailure,
} from "@/lib/saveRecipe";
import styles from "./page.module.css";

function saveError(message: string, status: number): SaveFailure {
  const error = new Error(message) as SaveFailure;
  error.status = status;
  error.code = status === 409 ? "duplicate" : "unknown";
  return error;
}

function getShareToken(url: string): string | null {
  try {
    const u = new URL(url);
    const isRecipeBox =
      (typeof window !== "undefined" && u.origin === window.location.origin) ||
      (u.hostname === "localhost" && u.port === "3000") ||
      u.hostname === "recipe-box-gs.vercel.app";
    if (!isRecipeBox) return null;
    const match = u.pathname.match(/^\/share\/([a-zA-Z0-9]+)$/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * The banner is the product's headline mechanic, so a junk offer is expensive —
 * two of them and the user stops reading it. It has no way to know whether a
 * page is a recipe, but it can refuse the two things that are definitely not
 * one: RecipeBox's own pages (a share link excepted, which is the whole point)
 * and a bare site root. It once offered to save this app's own homepage.
 */
function isOfferable(url: string): boolean {
  try {
    const u = new URL(url);
    if (typeof window !== "undefined" && u.origin === window.location.origin) {
      return getShareToken(url) !== null;
    }
    return u.pathname !== "/" || u.search.length > 0;
  } catch {
    return false;
  }
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function Home() {
  const { user, isLoaded } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const [clipboardError, setClipboardError] = useState<{
    message: string;
    recoverable: boolean;
  } | null>(null);
  const [clipboardPreview, setClipboardPreview] = useState<{
    title: string | null;
    thumbnailUrl: string | null;
    sharerUsername?: string | null;
    originalUrl?: string;
  } | null>(null);
  /** The preview couldn't be read. A state, not a spinner that never lands. */
  const [previewFailed, setPreviewFailed] = useState(false);
  const lastOfferedUrl = useRef<string | null>(null);
  const recipesRef = useRef(recipes);
  useEffect(() => {
    recipesRef.current = recipes;
  }, [recipes]);

  // Check clipboard for a URL when the app comes to the foreground
  useEffect(() => {
    if (!user) return;

    async function checkClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        const trimmed = text?.trim();
        if (!trimmed?.match(/^https?:\/\//)) return;
        if (!isOfferable(trimmed)) return;
        if (trimmed === lastOfferedUrl.current) return;
        if (recipesRef.current.some((r) => r.url === trimmed)) {
          lastOfferedUrl.current = trimmed;
          return;
        }
        setClipboardUrl(trimmed);
      } catch {
        // Clipboard access denied or unavailable — ignore silently
      }
    }

    checkClipboard();

    // visibilitychange fires before the document has focus (clipboard reads
    // fail on Chrome until focus settles). window.focus fires after focus is
    // established. Use both and deduplicate with a short debounce.
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const trigger = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(checkClipboard, 50);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") trigger();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", trigger);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", trigger);
      if (debounce) clearTimeout(debounce);
    };
  }, [user]);

  // Dismiss the banner when the URL is already saved
  useEffect(() => {
    if (clipboardUrl && recipes.some((r) => r.url === clipboardUrl)) {
      setClipboardUrl(null);
      lastOfferedUrl.current = clipboardUrl;
    }
  }, [recipes, clipboardUrl]);

  // Fetch preview metadata whenever a new clipboard URL is detected
  useEffect(() => {
    if (!clipboardUrl) {
      setClipboardPreview(null);
      setPreviewFailed(false);
      return;
    }
    setClipboardPreview(null);
    setPreviewFailed(false);

    // A preview that never resolves used to leave the title skeleton pulsing
    // indefinitely — the banner looked like it was still thinking, forever.
    // Every path below lands somewhere, including the one where nothing answers.
    let settled = false;
    const land = (preview: typeof clipboardPreview) => {
      if (settled) return;
      settled = true;
      if (preview) setClipboardPreview(preview);
      else setPreviewFailed(true);
    };
    const timeout = setTimeout(() => land(null), 8000);

    const shareToken = getShareToken(clipboardUrl);
    if (shareToken) {
      fetch(`/api/share/${shareToken}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return land(null);
          if (data.is_own) {
            settled = true;
            setClipboardUrl(null);
            lastOfferedUrl.current = clipboardUrl;
            return;
          }
          land({
            title: data.title,
            thumbnailUrl: data.thumbnail_url,
            sharerUsername: data.sharer_username,
            originalUrl: data.url,
          });
        })
        .catch(() => land(null));
    } else {
      fetch(`/api/recipes/preview?url=${encodeURIComponent(clipboardUrl)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) =>
          land(
            data ? { title: data.title, thumbnailUrl: data.thumbnailUrl } : null,
          ),
        )
        .catch(() => land(null));
    }

    return () => clearTimeout(timeout);
  }, [clipboardUrl]);

  const handleSaveFromClipboard = async (allowFallback = false) => {
    if (!clipboardUrl) return;
    const url = clipboardUrl;
    const shareToken = getShareToken(url);
    setClipboardError(null);
    try {
      if (shareToken) {
        await handleSaveFromShare(shareToken);
      } else {
        await handleAddRecipe(url, { allowFallback });
      }
      // Only dismiss once the save actually succeeded — this used to clear
      // first, so a failed save looked identical to a successful one.
      lastOfferedUrl.current = url;
      setClipboardUrl(null);
    } catch (error) {
      // Already saved isn't a failure the user can retry out of — it means the
      // local list is behind the server. Dismiss and resync instead of
      // offering a "Try again" that will reject identically forever.
      if (isDuplicate(error)) {
        lastOfferedUrl.current = url;
        setClipboardUrl(null);
        fetchRecipes();
        return;
      }
      // Extraction failing is recoverable: the link is still worth keeping.
      // The banner says so and its button becomes the recovery.
      const copy = failureCopy(error);
      setClipboardError({
        message: copy.message,
        recoverable: canSaveAnyway(error),
      });
    }
  };

  const handleSaveFromShare = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/share/${token}/save`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw saveError(
          error.error || "Failed to save recipe",
          response.status,
        );
      }
      const newRecipe = await response.json();
      setRecipes((prev) => [newRecipe, ...prev]);
      setSelectedRecipe(newRecipe);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissClipboard = () => {
    lastOfferedUrl.current = clipboardUrl;
    setClipboardUrl(null);
    setClipboardError(null);
  };

  // Fetch recipes when user is loaded
  useEffect(() => {
    if (user?.id) {
      fetchRecipes();
    }
  }, [isLoaded, user?.id]);

  // TODO: implement paginated loading (e.g. cursor-based) so large recipe
  // collections don't load all at once — fetch a page at a time and append
  // results as the user scrolls or clicks "load more".
  const fetchRecipes = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/recipes");
      if (!response.ok) throw new Error("Failed to fetch recipes");
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddRecipe = async (
    url: string,
    options?: { allowFallback?: boolean },
  ) => {
    setIsLoading(true);
    try {
      const newRecipe = await saveRecipe(url, options);
      setRecipes((prev) => [newRecipe, ...prev]);
      setSelectedRecipe(newRecipe);
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

      setSelectedRecipe((prev) => (prev ? { ...prev, tags } : null));
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipeId ? { ...r, tags } : r)),
      );
    } catch (error) {
      console.error("Error updating tags:", error);
      throw error;
    }
  };

  const handleUpdateMetadata = async (
    recipeId: string,
    title: string,
    url: string,
    thumbnailUrl: string | null,
    cookTime: string | null,
    servings: string | null,
    notes: string | null,
  ) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          url,
          thumbnail_url: thumbnailUrl,
          cook_time: cookTime,
          servings,
          notes,
        }),
      });

      if (!response.ok) throw new Error("Failed to update recipe");

      const updatedRecipe = await response.json();
      setSelectedRecipe(updatedRecipe);
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

      setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
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
    return <Landing />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <AppHeader />

        <main>
          <h1 className="srOnly">Your recipes</h1>
          <RecipeFilterPanel
            recipes={recipes}
            onRecipeSelect={setSelectedRecipe}
            onRecipeDelete={handleDeleteRecipe}
            loading={isFetching}
            extraControls={
              <RecipeForm onSubmit={handleAddRecipe} isLoading={isLoading} />
            }
          />
        </main>
      </div>

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onTagsUpdate={handleUpdateTags}
          onMetadataUpdate={handleUpdateMetadata}
          onDelete={handleDeleteRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {clipboardUrl &&
        !isFetching &&
        !recipes.some((r) => r.url === (clipboardPreview?.originalUrl ?? clipboardUrl)) &&
        (!getShareToken(clipboardUrl) || clipboardPreview) && (
          <div className={styles.clipboardBanner}>
            <div className={styles.clipboardThumb}>
              {clipboardPreview?.thumbnailUrl ? (
                <img src={clipboardPreview.thumbnailUrl} alt="" />
              ) : (
                <Clipboard size={16} className={styles.clipboardIcon} />
              )}
            </div>
            <div className={styles.clipboardText}>
              <span className={styles.clipboardTitle}>
                {clipboardPreview?.title ??
                  (previewFailed ? (
                    hostnameOf(clipboardUrl)
                  ) : (
                    <span className={styles.clipboardTitleLoading} />
                  ))}
              </span>
              {clipboardPreview && "sharerUsername" in clipboardPreview ? (
                <span className={styles.clipboardAttribution}>
                  {clipboardPreview.sharerUsername ? (
                    <>
                      <span>
                        <a
                          href={`/user/${clipboardPreview.sharerUsername}`}
                          className={styles.clipboardAttributionLink}>
                          @{clipboardPreview.sharerUsername}
                        </a>
                        {" shared this with you!"}
                      </span>
                    </>
                  ) : (
                    "A RecipeBox user shared this with you!"
                  )}
                </span>
              ) : clipboardError ? (
                <span className={styles.clipboardErrorText} role="alert">
                  {clipboardError.message}
                </span>
              ) : (
                <span className={styles.clipboardUrl}>{clipboardUrl}</span>
              )}
            </div>
            {/* Wrapped rather than passed directly: the handler's first
                parameter is allowFallback, and a click event is truthy. */}
            <button
              className={styles.clipboardSaveBtn}
              onClick={() =>
                handleSaveFromClipboard(clipboardError?.recoverable ?? false)
              }
              disabled={isLoading}>
              {isLoading
                ? "Saving…"
                : clipboardError?.recoverable
                  ? "Save anyway"
                  : clipboardError
                    ? "Try again"
                    : "Save"}
            </button>
            <button
              className={styles.clipboardDismissBtn}
              onClick={handleDismissClipboard}
              aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        )}
    </div>
  );
}
