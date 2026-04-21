"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import styles from "./page.module.css";

interface UserData {
  clerk_user_id: string;
  username: string;
  display_name: string | null;
  image_url: string | null;
  follower_count: number;
  following_count: number;
  recipe_count: number;
  is_followed_by_me: boolean;
  follows_me: boolean;
}

export default function UsersPage() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [followedSet, setFollowedSet] = useState<Set<string>>(new Set());
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isFollowing = (u: UserData) =>
    followedSet.has(u.username) || u.is_followed_by_me;

  const handleFollow = async (e: React.MouseEvent, u: UserData) => {
    e.stopPropagation();
    setLoadingFollow(u.username);
    try {
      const res = await fetch(`/api/users/${u.username}/follow`, {
        method: "POST",
      });
      if (res.ok || res.status === 409) {
        setFollowedSet((prev) => new Set([...prev, u.username]));
      } else if (res.status === 401) {
        window.location.href = "/sign-in";
      }
    } catch {
      // ignore
    } finally {
      setLoadingFollow(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        (u.display_name?.toLowerCase().includes(q) ?? false),
    );
  }, [users, search]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1></h1>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search by name or username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          {search ? "No users match your search." : "No users found."}
        </div>
      ) : (
        <ul className={styles.grid}>
          {filtered.map((u) => {
            const isMe = u.clerk_user_id === user?.id;
            const following = isFollowing(u);
            const displayName = u.display_name || u.username || "User";
            const initial = displayName[0].toUpperCase();

            return (
              <li
                key={u.clerk_user_id}
                className={styles.card}
                onClick={() =>
                  u.username ? router.push(`/user/${u.username}`) : undefined
                }>
                <div className={styles.avatar}>
                  {u.image_url ? (
                    <img
                      src={u.image_url}
                      alt={displayName}
                      className={styles.avatarImg}
                    />
                  ) : (
                    <span className={styles.avatarInitial}>{initial}</span>
                  )}
                </div>
                <div className={styles.info}>
                  <div className={styles.displayName}>{displayName}</div>
                  {u.username && (
                    <div className={styles.username}>@{u.username}</div>
                  )}
                  <div className={styles.stats}>
                    <span>
                      <strong>{u.follower_count}</strong>{" "}
                      {u.follower_count === 1 ? "follower" : "followers"}
                    </span>
                    <span className={styles.statDot}>·</span>
                    <span>
                      <strong>{u.following_count}</strong> following
                    </span>
                    <span className={styles.statDot}>·</span>
                    <span>
                      <strong>{u.recipe_count}</strong>{" "}
                      {u.recipe_count === 1 ? "recipe" : "recipes"}
                    </span>
                  </div>
                </div>
                {!isMe && (
                  <div
                    className={styles.actions}
                    onClick={(e) => e.stopPropagation()}>
                    {following ? (
                      <span className={styles.followingBadge}>Following</span>
                    ) : (
                      <button
                        className={styles.followBtn}
                        disabled={loadingFollow === u.username}
                        onClick={(e) => handleFollow(e, u)}>
                        {loadingFollow === u.username
                          ? "…"
                          : u.follows_me
                            ? "Follow back"
                            : "Follow"}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
