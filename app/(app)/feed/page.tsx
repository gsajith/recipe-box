"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FeedRecipeCard } from "@/components/FeedRecipeCard";
import type { FeedRecipe } from "@/lib/types";
import styles from "./page.module.css";

export default function FeedPage() {
  const [recipes, setRecipes] = useState<FeedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: implement paginated loading (e.g. cursor-based) so the feed doesn't
  // load all followed-user recipes at once — fetch a page at a time and append
  // as the user scrolls or clicks "load more". The notification panel fetches
  // from the same /api/feed endpoint and will need the same treatment.
  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRecipes(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading feed…</div>;
  }

  if (recipes.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Nothing here yet!</p>
        <p className={styles.emptySubtitle}>
          Follow some people to see their saved recipes here.
        </p>
        <Link href="/" className={styles.homeLink}>
          Go to my recipes
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Following</h2>
      <div className={styles.grid}>
        {recipes.map((recipe) => (
          <FeedRecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
