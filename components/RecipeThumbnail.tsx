"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./RecipeThumbnail.module.css";

interface RecipeThumbnailProps {
  src: string;
  alt: string;
  /** The call site's own sizing/shape class — layout stays where it was. */
  className?: string;
}

/**
 * Recipe thumbnail with a loading shimmer.
 *
 * Instagram thumbnails come through /api/ig-thumb, which resolves a fresh image
 * from Instagram on a cache miss, so the first view of a post can take a second
 * or two. The skeleton is drawn as the <img>'s own background rather than an
 * overlay element: an <img> paints its background until its bitmap arrives, so
 * this needs no wrapper and can't disturb the five different containers these
 * thumbnails live in.
 */
export default function RecipeThumbnail({
  src,
  alt,
  className,
}: RecipeThumbnailProps) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setState("loading");

    // A cached image can finish decoding before React attaches onLoad, which
    // would leave the shimmer running forever over a perfectly good image.
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setState("loaded");
    }
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      data-state={state}
      className={`${styles.thumbnail} ${className ?? ""}`}
      onLoad={() => setState("loaded")}
      onError={() => setState("error")}
    />
  );
}
