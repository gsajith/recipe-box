"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

type Status = "saving" | "saved" | "duplicate" | "error" | "no-url";

function extractUrl(
  urlParam: string | null,
  textParam: string | null,
  titleParam: string | null,
): string | null {
  // Prefer the explicit url param
  if (urlParam) return urlParam;

  // Instagram and some apps put the URL inside the text field
  if (textParam) {
    const match = textParam.match(/https?:\/\/\S+/);
    if (match) return match[0];
  }

  if (titleParam) {
    const match = titleParam.match(/https?:\/\/\S+/);
    if (match) return match[0];
  }

  return null;
}

export default function ShareTargetPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.card}>
            <p className={styles.statusText}>Loading...</p>
          </div>
        </div>
      }>
      <ShareTargetContent />
    </Suspense>
  );
}

function ShareTargetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  const urlParam = searchParams.get("url");
  const textParam = searchParams.get("text");
  const titleParam = searchParams.get("title");
  const sharedUrl = extractUrl(urlParam, textParam, titleParam);

  const [status, setStatus] = useState<Status>(sharedUrl ? "saving" : "no-url");
  const hasSaved = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !sharedUrl || hasSaved.current) return;

    hasSaved.current = true;

    save();
  }, [isLoaded, isSignedIn, sharedUrl, router]);

  async function save(allowFallback = false) {
    setStatus("saving");
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sharedUrl, allowFallback }),
      });

      if (res.status === 409) {
        setStatus("duplicate");
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save recipe");
      }

      setStatus("saved");
      // Give the user a moment to see the success state, then go home
      setTimeout(() => router.replace("/"), 1500);
    } catch (err) {
      // Keep the server's wording for the console; the user gets plain language.
      console.error("Share-target save failed:", err);
      setStatus("error");
    }
  }

  if (!isLoaded) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p className={styles.statusText}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    const returnUrl = `/share-target?${searchParams.toString()}`;
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Save to RecipeBox</h1>
          {sharedUrl && (
            <p className={styles.urlPreview}>
              <ExternalLink size={13} />
              <span>{sharedUrl}</span>
            </p>
          )}
          <p className={styles.statusText}>
            Sign in to save this recipe to your collection.
          </p>
          <a
            href={`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`}
            className={styles.primaryBtn}>
            Sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Save to RecipeBox</h1>

        {sharedUrl && (
          <p className={styles.urlPreview}>
            <ExternalLink size={13} />
            <span>{sharedUrl}</span>
          </p>
        )}

        {status === "no-url" && (
          <p className={styles.statusText}>No URL found to save.</p>
        )}

        {status === "saving" && (
          <p className={styles.statusText}>Saving recipe...</p>
        )}

        {status === "saved" && (
          <p className={`${styles.statusText} ${styles.success}`}>
            Recipe saved! Taking you to your collection...
          </p>
        )}

        {status === "duplicate" && (
          <>
            <p className={`${styles.statusText} ${styles.muted}`}>
              You&apos;ve already saved this recipe.
            </p>
            <Link href="/" className={styles.primaryBtn}>
              Go to RecipeBox
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            {/* Never throw the link away. Extraction failing is routine; the
                user's intent to save was not. */}
            <p className={`${styles.statusText} ${styles.error}`}>
              We couldn&apos;t read the recipe details from that page.
            </p>
            {/* The server's own wording is for the log, not for the person
                standing in their kitchen holding a link. */}
            <p className={styles.errorDetail}>
              You can still save the link and fill in the details yourself.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => save(true)}>
              Save the link anyway
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => save(false)}>
              Try again
            </button>
            <Link href="/" className={styles.textBtn}>
              Go to RecipeBox
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
