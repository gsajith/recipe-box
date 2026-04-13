import axios from "axios";
import * as cheerio from "cheerio";

interface RecipeMetadata {
  title: string;
  thumbnailUrl: string | null;
}

/**
 * Extract recipe metadata from a URL
 * Supports recipe websites and YouTube videos
 */
export async function extractRecipeMetadata(
  url: string,
): Promise<RecipeMetadata> {
  try {
    // Validate URL format
    const urlObj = new URL(url);

    // Check if it's a YouTube video
    if (isYouTubeUrl(urlObj)) {
      return await extractYouTubeMetaWithTitle(urlObj);
    }

    // For recipe websites, use Open Graph meta tags
    return await extractOpenGraphMeta(url);
  } catch (error) {
    console.error("Error extracting recipe metadata:", error);
    throw new Error("Failed to extract recipe metadata from URL");
  }
}

async function extractYouTubeMetaWithTitle(url: URL): Promise<RecipeMetadata> {
  let videoId: string | null = null;

  if (url.hostname.includes("youtu.be")) {
    videoId = url.pathname.slice(1);
  } else {
    videoId = url.searchParams.get("v");
  }

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  // Fetch the title from YouTube page
  const title = await extractYouTubeTitle(videoId);

  // Use YouTube's standard thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return {
    title,
    thumbnailUrl,
  };
}

function isYouTubeUrl(url: URL): boolean {
  return (
    url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")
  );
}

function extractYouTubeMeta(url: URL): RecipeMetadata {
  let videoId: string | null = null;

  if (url.hostname.includes("youtu.be")) {
    videoId = url.pathname.slice(1);
  } else {
    videoId = url.searchParams.get("v");
  }

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  // Try to extract title from the URL query parameters if available
  // YouTube doesn't provide title in URL by default, so we'll need to fetch it
  let title = "YouTube Recipe Video";

  // Use YouTube's standard thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return {
    title,
    thumbnailUrl,
  };
}

async function extractYouTubeTitle(videoId: string): Promise<string> {
  try {
    // Fetch the YouTube watch page to extract the title from meta tags
    const { data } = await axios.get(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          DNT: "1",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Cache-Control": "max-age=0",
        },
        timeout: 15000,
      },
    );

    const $ = cheerio.load(data);

    // Try Open Graph title first
    let title = $('meta[property="og:title"]').attr("content");

    // Fallback to meta description
    if (!title) {
      title = $('meta[name="title"]').attr("content");
    }

    // Fallback to title tag
    if (!title) {
      title = $("title").text();
      // YouTube title tag includes " - YouTube" at the end, so remove it
      if (title.includes(" - YouTube")) {
        title = title.replace(" - YouTube", "");
      }
    }

    return title || "YouTube Video";
  } catch (error) {
    console.error("Error extracting YouTube title:", error);
    return "YouTube Video";
  }
}

async function extractOpenGraphMeta(url: string): Promise<RecipeMetadata> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const $ = cheerio.load(data);

    // Try Open Graph meta tags first
    let title = $('meta[property="og:title"]').attr("content");
    let thumbnailUrl = $('meta[property="og:image"]').attr("content");

    // Fallback to Twitter meta tags
    if (!title) {
      title = $('meta[name="twitter:title"]').attr("content");
    }
    if (!thumbnailUrl) {
      thumbnailUrl = $('meta[name="twitter:image"]').attr("content");
    }

    // Fallback to regular title tag
    if (!title) {
      title = $("title").text();
    }

    // Fallback to finding recipe images more intelligently
    if (!thumbnailUrl) {
      // Look for images with recipe-related alt text or class names
      const recipeImg =
        $("img[alt*='recipe']").attr("src") ||
        $("img[alt*='food']").attr("src") ||
        $("img[alt*='dish']").attr("src") ||
        $("img.recipe-image").attr("src") ||
        $("img.recipe-photo").attr("src") ||
        $("img[class*='recipe']").attr("src") ||
        $("img[class*='food']").attr("src") ||
        $(".recipe img").first().attr("src") ||
        $(".post-image img").attr("src") ||
        $(".featured-image img").attr("src") ||
        $("article img").first().attr("src");

      if (recipeImg) {
        thumbnailUrl = recipeImg;
      }
    }

    // Make relative URLs absolute
    if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
      const baseUrl = new URL(url);
      thumbnailUrl = new URL(thumbnailUrl, baseUrl).href;
    }

    // Reject SVG data URIs (lazy-loading placeholders)
    if (thumbnailUrl && thumbnailUrl.startsWith("data:image/svg")) {
      thumbnailUrl = undefined;
    }

    return {
      title: title || "Untitled Recipe",
      thumbnailUrl: thumbnailUrl || null,
    };
  } catch (error) {
    console.error("Error fetching or parsing URL:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
      });

      // If the site blocks us (403, 503, etc.), provide a fallback
      if (
        error.response?.status &&
        (error.response.status === 403 ||
          error.response.status === 503 ||
          error.response.status >= 500)
      ) {
        console.log(
          "Site appears to block automated requests, using fallback extraction",
        );
        return {
          title: "Untitled Recipe",
          thumbnailUrl: null,
        };
      }
    }
    throw new Error("Failed to fetch recipe data from URL");
  }
}
