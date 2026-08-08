"use client";

import { useState } from "react";
import styles from "./FollowButton.module.css";

interface FollowButtonProps {
  username: string;
  initialIsFollowing: boolean;
  /**
   * Where the button sits. The profile header is a green ground, so the
   * following state inverts into white-alpha there (The Inversion Rule); on a
   * white card it needs the ordinary ghost pill instead.
   */
  variant?: "onDark" | "onLight";
  /** "Follow back" when they already follow you. */
  followLabel?: string;
  onChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  username,
  initialIsFollowing,
  variant = "onDark",
  followLabel = "Follow",
  onChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${username}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });
      // A follow that already exists (409) or a delete of one that doesn't is
      // the state we were trying to reach, not a failure.
      if (res.ok || res.status === 409 || res.status === 404) {
        const next = !isFollowing;
        setIsFollowing(next);
        onChange?.(next);
      } else if (res.status === 401) {
        window.location.href = "/sign-in";
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onLight = variant === "onLight";
  const stateClass = isFollowing
    ? onLight
      ? styles.unfollowLight
      : styles.unfollow
    : onLight
      ? styles.followLight
      : styles.follow;

  return (
    <button
      type="button"
      className={`${styles.btn} ${stateClass}`}
      onClick={toggle}
      disabled={loading}
      aria-label={
        isFollowing ? `Unfollow @${username}` : `Follow @${username}`
      }>
      {loading ? "…" : isFollowing ? "Unfollow" : followLabel}
    </button>
  );
}
