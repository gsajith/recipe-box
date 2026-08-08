import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer as supabase } from "@/lib/supabase";
import { extractRecipeMetadata } from "@/lib/recipeExtractor";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, allowFallback } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Extract metadata from URL. With allowFallback the caller has already been
    // told extraction failed and chose to save the bare link anyway — a link
    // with a hostname title beats losing it (see PRODUCT.md, principle 4).
    let title: string;
    let thumbnailUrl: string | null = null;
    let cookTime: string | null = null;
    let servings: string | null = null;
    try {
      ({ title, thumbnailUrl, cookTime, servings } =
        await extractRecipeMetadata(url));
    } catch (extractionError) {
      if (!allowFallback) throw extractionError;
      try {
        title = new URL(url).hostname.replace(/^www\./, "");
      } catch {
        title = "Saved link";
      }
    }

    // Save recipe to Supabase
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        user_id: userId,
        url,
        title,
        thumbnail_url: thumbnailUrl,
        cook_time: cookTime,
        servings,
        share_token: randomUUID().replace(/-/g, ""),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      // TODO: Open the recipe after error
      // Check for unique constraint violation
      // 409 Conflict — the share target already checks for this status, and a
      // duplicate is not the same failure as a save that broke.
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You have already saved this recipe" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "Failed to save recipe" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function GET(_req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*, recipe_tags(tag)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch recipes" },
        { status: 500 },
      );
    }

    const recipesWithTags = (recipes ?? []).map((r) => ({
      ...r,
      tags: (r.recipe_tags ?? []).map((t: { tag: string }) => t.tag),
      recipe_tags: undefined,
    }));

    return NextResponse.json(recipesWithTags);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
