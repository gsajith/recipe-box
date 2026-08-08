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
}

export function FollowButton({
  username,
  initialIsFollowing,
  variant = "onDark",
  followLabel = "Follow",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const unfollowing = isFollowing;
      const res = await fetch(`/api/users/${username}/follow`, {
        method: unfollowing ? "DELETE" : "POST",
      });
      // Already in the state we were reaching for is not a failure — but scope
      // it by direction. A blanket 404 would flip an unfollow to "following"
      // when the username simply doesn't exist.
      const alreadyThere = unfollowing
        ? res.status === 404
        : res.status === 409;
      if (res.ok || alreadyThere) {
        setIsFollowing(!unfollowing);
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
