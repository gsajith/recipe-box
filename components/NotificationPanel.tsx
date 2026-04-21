"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { FeedItem } from "@/lib/types";
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
  const [items, setItems] = useState<FeedItem[]>([]);
  // lastSeenAt: the timestamp from before the panel was opened (used to mark new rows)
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
                        className={`${styles.row} ${isNew(item) ? styles.rowNew : ""}`}
                        onClick={() => {
                          handleClose();
                          window.location.href = `/user/${item.actor_username}`;
                        }}>
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
                                  : "Follow"}
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
                      className={`${styles.row} ${isNew(item) ? styles.rowNew : ""}`}
                      onClick={() =>
                        window.open(item.url, "_blank", "noopener,noreferrer")
                      }>
                      {item.thumbnail_url ? (
                        <img
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
                      {isNew(item) && <span className={styles.newDot} />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
