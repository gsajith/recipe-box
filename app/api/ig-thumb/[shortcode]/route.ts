import type { NextRequest } from "next/server";
import axios from "axios";
import { fetchInstagramOgImage } from "@/lib/recipeExtractor";

// Instagram's og:image url expires after ~4 days, so it can't be stored. We
// re-resolve it per request and serve the bytes from our own origin, leaning on
// the CDN cache so a given post is only fetched from Instagram once a day.
const CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shortcode: string }> },
) {
  const { shortcode } = await params;

  // Guard the path segment before it reaches an outbound url.
  if (!/^[\w-]{1,32}$/.test(shortcode)) {
    return new Response("Invalid shortcode", { status: 400 });
  }

  try {
    const ogImage = await fetchInstagramOgImage(shortcode);
    if (!ogImage) {
      return new Response("Thumbnail not found", { status: 404 });
    }

    const { data, headers } = await axios.get<ArrayBuffer>(ogImage, {
      responseType: "arraybuffer",
      timeout: 15000,
    });

    return new Response(data, {
      headers: {
        "Content-Type": headers["content-type"] ?? "image/jpeg",
        "Cache-Control": CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error(`Error proxying Instagram thumbnail ${shortcode}:`, error);
    return new Response("Failed to load thumbnail", { status: 502 });
  }
}
