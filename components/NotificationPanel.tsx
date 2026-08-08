"use client";

import { useState, useEffect } from "react";
import { Bell, X, ExternalLink, Plus, Check } from "lucide-react";
import Link from "next/link";
import type { FeedItem, FeedRecipeItem } from "@/lib/types";
import { useModalDialog } from "@/lib/useModalDialog";
import styles from "./NotificationPanel.module.css";
import RecipeThumbnail from "./RecipeThumbnail";
import { RecipeDetail } from "./RecipeDetail";

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function timeAgo(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const LS_KEY = "notificationPanel_lastOpenedAt";

/** Matches the panel's slide-out transition in NotificationPanel.module.css. */
const CLOSE_MS = 200;

/**
 * The feed is a full-screen sheet on a phone, so it owes the same debt every
 * other overlay in the app pays: a real dialog role, focus that moves in and
 * stays in, the page behind scroll-locked and hidden from assistive tech.
 * It was the one overlay that never adopted the hook.
 *
 * Split into its own component so the hook mounts and unmounts with the sheet.
 * The outside-click listener lives here too: the hook marks siblings `inert`,
 * which includes the backdrop, so the backdrop's own onClick would never fire.
 */
function FeedSheet({
  className,
  onClose,
  children,
}: {
  className: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useModalDialog<HTMLDivElement>(onClose);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const node = dialogRef.current;
      if (node && !node.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [dialogRef, onClose]);

  return (
    <div
      ref={dialogRef}
      className={className}
      role="dialog"
      aria-modal="true"
      aria-label="Following feed"
      tabIndex={-1}>
      {children}
    </div>
  );
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [items, setItems] = useState<FeedItem[]>([]);
  // lastSeenAt: the timestamp from before the panel was opened (used to mark new rows)
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [openRecipe, setOpenRecipe] = useState<FeedRecipeItem | null>(null);

  /** The feed already knows; the 409 is only the race-condition backstop. */
  const isSaved = (item: FeedRecipeItem) =>
    item.already_saved || savedIds.has(item.id);

  /** Opening a recipe closes the sheet first — one overlay at a time. */
  const handleOpenRecipe = (item: FeedRecipeItem) => {
    closeThen(() => setOpenRecipe(item));
  };

  const handleSaveRecipe = async (recipeId: string) => {
    setSavingId(recipeId);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/save`, {
        method: "POST",
      });
      // 409 means it is already in the collection — which is the state the tap
      // was asking for, so it reads as saved rather than as an error.
      if (res.ok || res.status === 409) {
        setSavedIds((prev) => new Set([...prev, recipeId]));
      } else if (res.status === 401) {
        window.location.href = "/sign-in";
      }
    } catch {
      // Leave the button as it was; the row is still openable.
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {});
  }, []);

  const handleOpen = () => {
    // Capture the previous timestamp (for highlighting new rows inside the panel)
    const prev = localStorage.getItem(LS_KEY);
    setLastSeenAt(prev);
    // Stamp now so the badge clears and future opens count from this moment
    const now = new Date().toISOString();
    localStorage.setItem(LS_KEY, now);
    setLastOpenedAt(now);
    setOpen(true);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, CLOSE_MS);
  };

  /**
   * Close the sheet, then do the thing. Mounting the recipe modal while the
   * sheet was still animating out left two dialogs overlapping for 200ms and
   * fighting over focus — the sheet's unmount restores focus to the bell, which
   * by then is inert, so focus fell to <body> and the modal captured nothing.
   * One overlay at a time, in sequence.
   */
  const closeThen = (after: () => void) => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      // A separate tick, so the sheet's unmount and its focus restore finish in
      // their own commit. Batched into one, the new dialog focuses itself and
      // the old one's cleanup then hands focus back to a bell the new dialog
      // has just marked inert — which lands it on <body>.
      setTimeout(after, 0);
    }, CLOSE_MS);
  };

  // Read the persisted timestamp once on mount for badge counting
  const [lastOpenedAt, setLastOpenedAt] = useState<string | null>(null);
  useEffect(() => {
    setLastOpenedAt(localStorage.getItem(LS_KEY));
  }, []);

  const unreadCount = items.filter((item) =>
    lastOpenedAt ? item.created_at > lastOpenedAt : true,
  ).length;

  const isNew = (item: FeedItem) =>
    lastSeenAt ? item.created_at > lastSeenAt : true;

  const handleFollowBack = async (username: string) => {
    setLoadingFollow(username);
    try {
      const res = await fetch(`/api/users/${username}/follow`, {
        method: "POST",
      });
      if (res.ok || res.status === 409) {
        setFollowedBack((prev) => new Set([...prev, username]));
      } else if (res.status === 401) {
        window.location.href = "/sign-in";
      }
    } catch {
      // ignore
    } finally {
      setLoadingFollow(null);
    }
  };

  return (
    <>
      <button
        className={`${styles.bell} ${open ? styles.bellActive : ""}`}
        onClick={() => (open ? handleClose() : handleOpen())}
        aria-label="Following feed">
        <Bell size={17} />
        {unreadCount > 0 && !open && (
          <span className={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className={`${styles.overlay} ${closing ? styles.overlayClosing : ""}`}
            onClick={handleClose}
          />
          <FeedSheet
            className={`${styles.panel} ${closing ? styles.panelClosing : ""}`}
            onClose={handleClose}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Following</span>
              <button
                className={styles.closeBtn}
                onClick={handleClose}
                aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <div className={styles.panelBody}>
              {items.length === 0 ? (
                <div className={styles.empty}>
                  <p>Nothing here yet.</p>
                  <p>Follow people to see their saved recipes.</p>
                </div>
              ) : (
                items.map((item) => {
                  if (item.type === "follow") {
                    const isFollowingBack =
                      item.is_following_back ||
                      followedBack.has(item.actor_username);
                    return (
                      <div
                        key={item.id}
                        className={`${styles.row} ${isNew(item) ? styles.rowNew : ""}`}>
                        {/* A real link rather than a div onClick: reachable by
                            keyboard, and a client route instead of a reload. */}
                        <Link
                          href={`/user/${item.actor_username}`}
                          className={styles.rowOpenLink}
                          aria-label={`View @${item.actor_username}'s profile`}
                          onClick={handleClose}
                        />
                        <div className={styles.followAvatar}>
                          {item.actor_username[0].toUpperCase()}
                        </div>
                        <div className={styles.rowContent}>
                          <div className={styles.rowTitle}>
                            <span className={styles.attrLink}>
                              @{item.actor_username}
                            </span>{" "}
                            started following you!
                          </div>
                          <div className={styles.rowMeta}>
                            <span className={styles.timeAgo}>
                              {timeAgo(item.created_at)}
                            </span>
                            {!isFollowingBack && (
                              <button
                                className={styles.followBackBtn}
                                disabled={loadingFollow === item.actor_username}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFollowBack(item.actor_username);
                                }}>
                                {loadingFollow === item.actor_username
                                  ? "…"
                                  : "Follow back"}
                              </button>
                            )}
                          </div>
                        </div>
                        {isNew(item) && <span className={styles.newDot} />}
                      </div>
                    );
                  }

                  // type === "recipe"
                  return (
                    <div
                      key={item.id}
                      className={`${styles.row} ${isNew(item) ? styles.rowNew : ""}`}>
                      {/* The row used to leave the app for the source site,
                          so one recipe object behaved three ways depending on
                          where you met it. It opens the same read-only modal a
                          profile does; the hostname link below still goes to
                          the source for anyone who wants it. */}
                      <button
                        type="button"
                        className={styles.rowOpenLink}
                        onClick={() => handleOpenRecipe(item)}
                        aria-label={`Open ${item.title}`}
                      />
                      {item.thumbnail_url ? (
                        <RecipeThumbnail
                          src={item.thumbnail_url}
                          alt={item.title}
                          className={styles.thumb}
                        />
                      ) : (
                        <div className={styles.thumbPlaceholder} />
                      )}
                      <div className={styles.rowContent}>
                        <div className={styles.rowTitle}>{item.title}</div>
                        <div className={styles.rowMeta}>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.sourceLink}
                            onClick={(e) => e.stopPropagation()}>
                            <ExternalLink size={11} />
                            {getHostname(item.url)}
                          </a>
                          {item.attribution_username && (
                            <>
                              <span className={styles.dot}>•</span>
                              <Link
                                href={`/user/${item.attribution_username}`}
                                className={styles.attrLink}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClose();
                                }}>
                                @{item.attribution_username}
                              </Link>
                            </>
                          )}
                          <span className={styles.dot}>•</span>
                          <span className={styles.timeAgo}>
                            {timeAgo(item.created_at)}
                          </span>
                        </div>
                      </div>
                      {/* The feed showed you what people you follow are cooking
                          and gave you no way to keep any of it — every action
                          on the row led off-site. */}
                      <button
                        type="button"
                        className={`${styles.saveBtn} ${isSaved(item) ? styles.saveBtnDone : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveRecipe(item.id);
                        }}
                        disabled={
                          savingId === item.id || isSaved(item)
                        }
                        aria-label={
                          isSaved(item)
                            ? `${item.title} is in your collection`
                            : `Save ${item.title} to your collection`
                        }>
                        {isSaved(item) ? (
                          <Check size={14} aria-hidden="true" />
                        ) : (
                          <Plus size={14} aria-hidden="true" />
                        )}
                        <span>
                          {isSaved(item)
                            ? "Saved"
                            : savingId === item.id
                              ? "Saving…"
                              : "Save"}
                        </span>
                      </button>
                      {isNew(item) && <span className={styles.newDot} />}
                    </div>
                  );
                })
              )}
            </div>
          </FeedSheet>
        </>
      )}

      {openRecipe && (
        <RecipeDetail
          recipe={openRecipe}
          readOnly
          alreadySaved={isSaved(openRecipe)}
          onSaved={() =>
            setSavedIds((prev) => new Set([...prev, openRecipe.id]))
          }
          onClose={() => setOpenRecipe(null)}
        />
      )}
    </>
  );
}
