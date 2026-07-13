import type { NextRequest } from "next/server";
import axios from "axios";
import { fetchInstagramOgImage } from "@/lib/recipeExtractor";

// Instagram's image urls are signed and expire after ~4 days, so they can't be
// stored. We resolve one per request and serve the bytes from our own origin,
// leaning on the CDN cache so a given post is only fetched from Instagram once
// a day. Serving it ourselves also sidesteps the CDN's
// cross-origin-resource-policy, which browsers enforce but servers don't.
const CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

/**
 * The post's cover frame. Unlike og:image this has no play-button overlay
 * composited into it, and it needs no page scrape — it's a plain redirect to
 * the CDN. Accepts the /p/ path for reel and tv shortcodes too.
 */
async function fetchCoverFrame(shortcode: string) {
  const res = await axios.get<ArrayBuffer>(
    `https://www.instagram.com/p/${shortcode}/media/?size=l`,
    { responseType: "arraybuffer", timeout: 15000, maxRedirects: 5 },
  );
  const contentType = String(res.headers["content-type"] ?? "");
  if (!contentType.startsWith("image/")) {
    throw new Error(`Expected an image, got ${contentType}`);
  }
  return { data: res.data, contentType };
}

/**
 * og:image is the same frame with a play-button composited on top. It's the
 * only variant reachable without /media/, so keep it as a fallback: an ugly
 * thumbnail beats a missing one.
 */
async function fetchOgImageFrame(shortcode: string) {
  const ogImage = await fetchInstagramOgImage(shortcode);
  if (!ogImage) return null;

  const res = await axios.get<ArrayBuffer>(ogImage, {
    responseType: "arraybuffer",
    timeout: 15000,
  });
  return {
    data: res.data,
    contentType: String(res.headers["content-type"] ?? "image/jpeg"),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shortcode: string }> },
) {
  const { shortcode } = await params;

  // Guard the path segment before it reaches an outbound url.
  if (!/^[\w-]{1,32}$/.test(shortcode)) {
    return new Response("Invalid shortcode", { status: 400 });
  }

  let image: { data: ArrayBuffer; contentType: string } | null = null;
  try {
    image = await fetchCoverFrame(shortcode);
  } catch {
    try {
      image = await fetchOgImageFrame(shortcode);
    } catch (error) {
      console.error(`Error proxying Instagram thumbnail ${shortcode}:`, error);
      return new Response("Failed to load thumbnail", { status: 502 });
    }
  }

  if (!image) {
    return new Response("Thumbnail not found", { status: 404 });
  }

  return new Response(image.data, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
