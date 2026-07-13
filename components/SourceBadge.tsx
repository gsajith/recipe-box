"use client";

import { useId } from "react";
import { isInstagramUrl, isYouTubeUrl } from "@/lib/recipeExtractor";
import styles from "./SourceBadge.module.css";

interface SourceBadgeProps {
  url: string;
  /** Placement from the call site — absolute corner on cards, inline in list rows. */
  className?: string;
}

function InstagramIcon() {
  // Several badges share a page, and duplicate gradient ids would make every
  // icon after the first render with the wrong fill.
  const id = useId();
  const warm = `${id}-warm`;
  const cool = `${id}-cool`;

  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Instagram">
      <defs>
        {/* Instagram's mark is two stacked radials, not a single linear ramp:
            a warm one anchored bottom-left, with a blue bloom top-left over it.
            gradientUnits must be userSpaceOnUse — the default is a 0–1 bounding
            box, which would clamp these viewBox coordinates to a flat color. */}
        <radialGradient
          id={warm}
          gradientUnits="userSpaceOnUse"
          cx="7"
          cy="23"
          r="27">
          <stop offset="0" stopColor="#FFDD55" />
          <stop offset="0.1" stopColor="#FFDD55" />
          <stop offset="0.5" stopColor="#FF543E" />
          <stop offset="1" stopColor="#C837AB" />
        </radialGradient>
        <radialGradient
          id={cool}
          gradientUnits="userSpaceOnUse"
          cx="2"
          cy="1"
          r="20">
          <stop offset="0" stopColor="#3771C8" />
          <stop offset="0.35" stopColor="#3771C8" stopOpacity="0.55" />
          <stop offset="0.7" stopColor="#6600FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill={`url(#${warm})`} />
      <rect width="24" height="24" rx="6" fill={`url(#${cool})`} />
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="4.2"
        fill="none"
        stroke="#fff"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="16.7" cy="7.3" r="1.15" fill="#fff" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      role="img"
      aria-label="YouTube">
      {/* Taller than the true wordmark tile so it carries the same optical
          weight as Instagram's square beside it. */}
      <rect x="0" y="2.5" width="24" height="19" rx="5.5" fill="#FF0000" />
      <path d="M9.75 7.75 17 12 9.75 16.25Z" fill="#fff" />
    </svg>
  );
}

export default function SourceBadge({ url, className }: SourceBadgeProps) {
  let source: "instagram" | "youtube" | "blog" = "blog";
  try {
    const parsed = new URL(url);
    if (isYouTubeUrl(parsed)) source = "youtube";
    else if (isInstagramUrl(parsed)) source = "instagram";
  } catch {
    // malformed url — fall through to the generic label
  }

  // A recognizable logo carries the platform on its own; anything else still
  // needs the word.
  if (source === "blog") {
    return <span className={`${styles.textPill} ${className ?? ""}`}>Blog</span>;
  }

  return (
    <span className={`${styles.iconBadge} ${className ?? ""}`}>
      {source === "instagram" ? <InstagramIcon /> : <YouTubeIcon />}
    </span>
  );
}
