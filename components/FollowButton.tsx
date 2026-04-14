"use client";

import { useState } from "react";
import styles from "./FollowButton.module.css";

interface FollowButtonProps {
  username: string;
  initialIsFollowing: boolean;
}

export function FollowButton({ username, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${username}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });
      if (res.ok) {
        setIsFollowing((f) => !f);
      } else if (res.status === 401) {
        window.location.href = "/sign-in";
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`${styles.btn} ${isFollowing ? styles.following : styles.follow}`}
      onClick={toggle}
      disabled={loading}>
      {loading ? "…" : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
