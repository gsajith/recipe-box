import type { Recipe } from "./types";

/**
 * One save path for every capture surface.
 *
 * Extraction failing is routine (PRODUCT.md principle 4) — some sites block
 * scraping and always will. What is not routine is losing the user's link
 * because of it. Before this existed, `/share-target` handled that well and the
 * other two surfaces printed the server's own error string and gave up, so the
 * same failure was a recoverable event or a dead end depending on which door
 * you came in. The copy and the recovery live here so they cannot diverge again.
 */

export type SaveFailureCode = "duplicate" | "extraction_failed" | "unknown";

export interface SaveFailure extends Error {
  status?: number;
  code: SaveFailureCode;
}

/** Human wording for each failure. The server's message is for the log. */
export const SAVE_FAILURE_COPY: Record<
  SaveFailureCode,
  { message: string; detail?: string }
> = {
  duplicate: {
    message: "You've already saved this recipe.",
  },
  extraction_failed: {
    message: "We couldn't read the recipe details from that page.",
    detail: "You can still save the link and fill in the details yourself.",
  },
  unknown: {
    message: "Something went wrong saving that link.",
  },
};

function classify(status: number, code?: string): SaveFailureCode {
  if (status === 409) return "duplicate";
  if (code === "extraction_failed" || status === 422) return "extraction_failed";
  return "unknown";
}

function failure(code: SaveFailureCode, status: number): SaveFailure {
  const error = new Error(SAVE_FAILURE_COPY[code].message) as SaveFailure;
  error.code = code;
  error.status = status;
  return error;
}

/** True when the user can still keep the link with a hostname title. */
export function canSaveAnyway(error: unknown): boolean {
  return (error as SaveFailure)?.code === "extraction_failed";
}

/** A save rejected because the recipe is already in the collection. */
export function isDuplicate(error: unknown): boolean {
  return (error as SaveFailure)?.code === "duplicate";
}

export function failureCopy(error: unknown): { message: string; detail?: string } {
  const code = (error as SaveFailure)?.code;
  return SAVE_FAILURE_COPY[code] ?? SAVE_FAILURE_COPY.unknown;
}

/**
 * POST a URL to the recipes API. Throws a {@link SaveFailure} carrying a code
 * the UI can branch on — never the server's raw message.
 */
export async function saveRecipe(
  url: string,
  { allowFallback = false }: { allowFallback?: boolean } = {},
): Promise<Recipe> {
  const response = await fetch("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, allowFallback }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // Log the server's wording; show the person the one written for them.
    console.error("Save failed:", response.status, body?.error);
    throw failure(classify(response.status, body?.code), response.status);
  }

  return response.json();
}
