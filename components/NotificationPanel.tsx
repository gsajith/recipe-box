"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { FeedRecipe } from "@/lib/types";
import styles from "./NotificationPanel.module.css";

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

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [recipes, setRecipes] = useState<FeedRecipe[]>([]);
  // lastSeenAt: the timestamp from before the panel was opened (used to mark new rows)
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRecipes(data);
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
    }, 200);
  };

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Read the persisted timestamp once on mount for badge counting
  const [lastOpenedAt, setLastOpenedAt] = useState<string | null>(null);
  useEffect(() => {
    setLastOpenedAt(localStorage.getItem(LS_KEY));
  }, []);

  const unreadCount = recipes.filter((r) =>
    lastOpenedAt ? r.created_at > lastOpenedAt : true,
  ).length;

  const isNew = (recipe: FeedRecipe) =>
    lastSeenAt ? recipe.created_at > lastSeenAt : true;

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
          <div
            className={`${styles.panel} ${closing ? styles.panelClosing : ""}`}
            ref={panelRef}>
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
              {recipes.length === 0 ? (
                <div className={styles.empty}>
                  <p>Nothing here yet.</p>
                  <p>Follow people to see their saved recipes.</p>
                </div>
              ) : (
                recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className={`${styles.row} ${isNew(recipe) ? styles.rowNew : ""}`}
                    onClick={() =>
                      window.open(recipe.url, "_blank", "noopener,noreferrer")
                    }>
                    {recipe.thumbnail_url ? (
                      <img
                        src={recipe.thumbnail_url}
                        alt={recipe.title}
                        className={styles.thumb}
                      />
                    ) : (
                      <div className={styles.thumbPlaceholder} />
                    )}
                    <div className={styles.rowContent}>
                      <div className={styles.rowTitle}>{recipe.title}</div>
                      <div className={styles.rowMeta}>
                        <a
                          href={recipe.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.sourceLink}
                          onClick={(e) => e.stopPropagation()}>
                          <ExternalLink size={11} />
                          {getHostname(recipe.url)}
                        </a>
                        {recipe.attribution_username && (
                          <>
                            <span className={styles.dot}>•</span>
                            <Link
                              href={`/user/${recipe.attribution_username}`}
                              className={styles.attrLink}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClose();
                              }}>
                              @{recipe.attribution_username}
                            </Link>
                          </>
                        )}
                        <span className={styles.dot}>•</span>
                        <span className={styles.timeAgo}>
                          {timeAgo(recipe.created_at)}
                        </span>
                      </div>
                    </div>
                    {isNew(recipe) && <span className={styles.newDot} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
