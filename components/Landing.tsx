"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShowcaseCard, type ShowcaseRecipe } from "./ShowcaseCard";
import SourceBadge from "./SourceBadge";
import styles from "./Landing.module.css";

/** Whose collection the page demonstrates with. */
const SHOWCASE_USER =
  process.env.NEXT_PUBLIC_SHOWCASE_USERNAME?.trim() || "gautham";

function shortenUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname.replace(/\/$/, "");
    const tail = path.length > 22 ? `${path.slice(0, 22)}…` : path;
    return host + tail;
  } catch {
    return raw;
  }
}

export function Landing() {
  const [recipes, setRecipes] = useState<ShowcaseRecipe[]>([]);

  useEffect(() => {
    let cancelled = false;

    /** A cover that 404s (an expired Instagram og:image, a missing YouTube
     *  maxres) leaves a blank card — which on this page argues the opposite
     *  of the pitch. Only show recipes whose image genuinely loads. */
    const loads = (src: string) =>
      new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.naturalWidth > 0);
        img.onerror = () => resolve(false);
        img.src = src;
      });

    fetch(`/api/users/${SHOWCASE_USER}/recipes`)
      .then((r) => (r.ok ? r.json() : []))
      .then(async (data: ShowcaseRecipe[]) => {
        if (!Array.isArray(data)) return;
        const candidates = data.filter((r) => r.thumbnail_url).slice(0, 16);
        const ok = await Promise.all(
          candidates.map((r) => loads(r.thumbnail_url as string)),
        );
        if (cancelled) return;
        setRecipes(candidates.filter((_, i) => ok[i]).slice(0, 7));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  // The headline talks about a reel, so lead with one when the collection has
  // it; otherwise the nearest video source, otherwise whatever is first.
  const heroIndex = Math.max(
    0,
    (() => {
      const ig = recipes.findIndex((r) => /instagram\.com/.test(r.url));
      if (ig !== -1) return ig;
      return recipes.findIndex((r) => /youtu\.?be/.test(r.url));
    })(),
  );
  const hero = recipes[heroIndex];
  const rest = recipes.filter((_, i) => i !== heroIndex);

  return (
    <div className={styles.page}>
      <nav className={styles.nav} aria-label="Main">
        <Link href="/" className={styles.wordmark}>
          <em>
            Recipe<b>Box</b>
          </em>
        </Link>
        <Link href="/sign-in" className={styles.navSignIn}>
          Sign in
        </Link>
      </nav>

      <header className={styles.hero}>
        {/* Without a showcase collection to draw on there is nothing to prove
            with, so the hero becomes a single column rather than reserving an
            empty half. */}
        <div
          className={`${styles.heroInner} ${hero ? "" : styles.heroInnerSolo}`}>
          <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>
              Found it on a reel.
              <br />
              <em>Saved it in a tap.</em>
            </h1>
            <p className={styles.heroSubtitle}>
              Share any link from Instagram, YouTube, or a recipe site straight
              to RecipeBox. The title, the photo, the cook time and where it
              came from are already filled in by the time you&apos;re back to
              scrolling.
            </p>
            <Link href="/sign-in" className={styles.ctaButton}>
              Start saving recipes
            </Link>
            <p className={styles.ctaNote}>Free to use. Sign in with Google.</p>
          </div>

          {/* The pitch is the transformation, so the page performs it: a link
              on one side, the real card it becomes on the other. */}
          {hero && (
            <div className={styles.heroProof}>
              <>
                <div className={styles.sourceChip}>
                  <SourceBadge url={hero.url} className={styles.sourceMark} />
                  <span className={styles.sourceUrl}>
                    {shortenUrl(hero.url)}
                  </span>
                </div>
                <div className={styles.proofArrow} aria-hidden="true">
                  <svg viewBox="0 0 24 40" width="20" height="34" fill="none">
                    <path
                      d="M12 2v30M4 25l8 9 8-9"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className={styles.proofCard}>
                  <ShowcaseCard recipe={hero} />
                </div>
              </>
            </div>
          )}
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>
            A collection that looks like your cooking.
          </h2>
          <p className={styles.sectionBody}>
            Every save arrives complete — cover photo, source, cook time — so
            your collection reads like a cookbook instead of a folder of links.
            Tag them however you think about food, then filter down to what
            you&apos;re actually in the mood for.
          </p>
        </div>

        {rest.length > 0 && (
          <div className={styles.showcase}>
            <ul className={styles.showcaseRow}>
              {rest.map((recipe) => (
                <li key={recipe.id} className={styles.showcaseItem}>
                  <ShowcaseCard recipe={recipe} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>
            And what your friends are cooking.
          </h2>
          <p className={styles.sectionBody}>
            Follow the people whose taste you trust and their saves show up
            alongside yours. Send any recipe as a link — whoever opens it can
            keep it in their own collection, with credit back to you.
          </p>
        </div>
      </section>

      <section className={styles.close}>
        <h2 className={styles.closeTitle}>
          Your collection starts with <em>one link.</em>
        </h2>
        <Link href="/sign-in" className={styles.ctaButton}>
          Start saving recipes
        </Link>
        <p className={styles.ctaNote}>Free to use. Sign in with Google.</p>
      </section>
    </div>
  );
}
