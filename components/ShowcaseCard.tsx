"use client";

import { Clock, Users } from "lucide-react";
import RecipeThumbnail from "./RecipeThumbnail";
import SourceBadge from "./SourceBadge";
import styles from "./ShowcaseCard.module.css";

export interface ShowcaseRecipe {
  id: string;
  url: string;
  title: string;
  thumbnail_url: string | null;
  cook_time: string | null;
  servings: string | null;
  tags?: string[];
}

/**
 * A recipe card for the marketing page: the same anatomy the app renders —
 * cover, platform mark, Playfair title, meta, outlined tags — with none of the
 * interaction. It reuses RecipeThumbnail and SourceBadge so what a visitor sees
 * is genuinely what the product produces, proxied Instagram covers and all.
 */
export function ShowcaseCard({
  recipe,
  tagLimit = 2,
}: {
  recipe: ShowcaseRecipe;
  tagLimit?: number;
}) {
  const tags = recipe.tags ?? [];
  const shown = tags.slice(0, tagLimit);

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {recipe.thumbnail_url ? (
          <RecipeThumbnail
            src={recipe.thumbnail_url}
            alt=""
            className={styles.thumb}
          />
        ) : (
          <div className={styles.thumbEmpty} />
        )}
        <SourceBadge url={recipe.url} className={styles.badge} />
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{recipe.title}</h3>

        {(recipe.cook_time || recipe.servings) && (
          <div className={styles.meta}>
            {recipe.cook_time && (
              <span className={styles.metaItem}>
                <Clock size={11} aria-hidden="true" />
                {recipe.cook_time}
              </span>
            )}
            {recipe.cook_time && recipe.servings && (
              <span className={styles.metaDot} aria-hidden="true">
                ·
              </span>
            )}
            {recipe.servings && (
              <span className={styles.metaItem}>
                <Users size={11} aria-hidden="true" />
                {recipe.servings}
              </span>
            )}
          </div>
        )}

        {shown.length > 0 && (
          <div className={styles.tags}>
            {shown.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
            {tags.length > shown.length && (
              <span className={styles.tag}>+{tags.length - shown.length}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
