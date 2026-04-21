"use client";

import Link from "next/link";
import { Clock, Users } from "lucide-react";
import type { FeedRecipe } from "@/lib/types";
import { isInstagramUrl, isYouTubeUrl } from "@/lib/recipeExtractor";
import cardStyles from "./RecipeList.module.css";
import styles from "./FeedRecipeCard.module.css";

interface FeedRecipeCardProps {
  recipe: FeedRecipe;
}

export function FeedRecipeCard({ recipe }: FeedRecipeCardProps) {
  const getSourceBadge = () => {
    try {
      const url = new URL(recipe.url);
      if (isYouTubeUrl(url)) return "YouTube";
      if (isInstagramUrl(url)) return "Instagram";
      return "Blog";
    } catch {
      return "Blog";
    }
  };

  return (
    <div
      className={`${cardStyles.recipeCard} ${styles.feedCard}`}
      onClick={() => window.open(recipe.url, "_blank", "noopener,noreferrer")}
      style={{ cursor: "pointer" }}>
      {recipe.thumbnail_url && (
        <div className={cardStyles.thumbnailWrapper}>
          <img
            src={recipe.thumbnail_url}
            alt={recipe.title}
            className={cardStyles.thumbnail}
          />
          <span className={cardStyles.sourceBadge}>{getSourceBadge()}</span>
        </div>
      )}

      <div className={cardStyles.content}>
        <h3 className={cardStyles.title}>{recipe.title}</h3>

        {(recipe.cook_time || recipe.servings) && (
          <div className={cardStyles.meta}>
            {recipe.cook_time && (
              <span className={cardStyles.metaItem}>
                <Clock size={11} />
                {recipe.cook_time}
              </span>
            )}
            {recipe.cook_time && recipe.servings && (
              <span className={cardStyles.metaDot}>·</span>
            )}
            {recipe.servings && (
              <span className={cardStyles.metaItem}>
                <Users size={11} />
                {recipe.servings}
              </span>
            )}
          </div>
        )}

        {recipe.tags && recipe.tags.length > 0 && (
          <div className={cardStyles.tags}>
            {recipe.tags.slice(0, 2).map((tag) => (
              <span key={tag} className={cardStyles.tag}>
                {tag}
              </span>
            ))}
            {recipe.tags.length > 2 && (
              <span className={cardStyles.tag}>+{recipe.tags.length - 2} more</span>
            )}
          </div>
        )}

        {recipe.attribution_username && (
          <div className={styles.attribution}>
            Saved by{" "}
            <Link
              href={`/user/${recipe.attribution_username}`}
              className={styles.attributionLink}
              onClick={(e) => e.stopPropagation()}>
              @{recipe.attribution_username}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
