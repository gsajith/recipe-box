"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { FollowButton } from "@/components/FollowButton";
import RecipeThumbnail from "@/components/RecipeThumbnail";
import styles from "./page.module.css";

interface UserData {
  clerk_user_id: string;
  username: string;
  display_name: string | null;
  image_url: string | null;
  follower_count: number;
  following_count: number;
  recipe_count: number;
  recent_recipes: { title: string; thumbnail_url: string }[];
  is_followed_by_me: boolean;
  follows_me: boolean;
}

export default function UsersPage() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className={styles.pageTitle}>People</h1>
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
            const displayName = u.display_name || u.username || "User";
            const initial = displayName[0].toUpperCase();
            const covers = u.recent_recipes ?? [];

            return (
              <li key={u.clerk_user_id} className={styles.card}>
                {u.username && (
                  <button
                    type="button"
                    className={styles.cardOpenBtn}
                    onClick={() => router.push(`/user/${u.username}`)}
                    aria-label={`View ${displayName}'s profile`}
                  />
                )}
                <div className={styles.identity}>
                  <div className={styles.avatar}>
                    {u.image_url ? (
                      <img
                        src={u.image_url}
                        alt=""
                        className={styles.avatarImg}
                        loading="lazy"
                      />
                    ) : (
                      <span className={styles.avatarInitial} aria-hidden="true">
                        {initial}
                      </span>
                    )}
                  </div>
                  <div className={styles.info}>
                    <div className={styles.displayName}>{displayName}</div>
                    {u.username && (
                      <div className={styles.username}>@{u.username}</div>
                    )}
                    {/* One number, not three. "How many recipes" is the only
                        count that answers "should I follow this person?" —
                        a following count answers nothing, and a row of zeroes
                        was the loudest thing on the page. */}
                    <div className={styles.stats}>
                      {u.recipe_count > 0
                        ? `${u.recipe_count} ${u.recipe_count === 1 ? "recipe" : "recipes"}`
                        : "No recipes yet"}
                      {u.follower_count > 0 && (
                        <>
                          <span className={styles.statDot} aria-hidden="true">
                            ·
                          </span>
                          {u.follower_count}{" "}
                          {u.follower_count === 1 ? "follower" : "followers"}
                        </>
                      )}
                    </div>
                  </div>
                  {isMe ? (
                    // You were listed unmarked between strangers, with no
                    // indication the row was your own.
                    <span className={styles.youBadge}>You</span>
                  ) : (
                    <div
                      className={styles.actions}
                      onClick={(e) => e.stopPropagation()}>
                      <FollowButton
                        username={u.username}
                        initialIsFollowing={u.is_followed_by_me}
                        variant="onLight"
                        followLabel={u.follows_me ? "Follow back" : "Follow"}
                      />
                    </div>
                  )}
                </div>

                {/* The actual answer to "should I follow this person?" is what
                    they cook, so the card shows it. */}
                {covers.length > 0 && (
                  <div className={styles.covers} aria-hidden="true">
                    {covers.map((r) => (
                      <RecipeThumbnail
                        key={r.thumbnail_url}
                        src={r.thumbnail_url}
                        alt=""
                        className={styles.cover}
                      />
                    ))}
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
