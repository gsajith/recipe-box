import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer as supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

/**
 * Copy someone else's saved recipe into your own collection.
 *
 * The share flow already did this, but only for a link somebody deliberately
 * minted a token for. Everywhere you can *see* another person's recipes — the
 * following feed, a profile — the only thing you could do was leave for the
 * source site. Same copy, addressed by recipe id.
 *
 * Authorisation is by visibility: profiles and their recipes are already public
 * (`GET /api/users/[username]/recipes` serves them without a session), so
 * anything readable there is copyable here. The metadata comes from the stored
 * row rather than a re-extraction — it is already correct, and re-scraping a
 * site that has since started blocking us would lose a save for no reason.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: source, error } = await supabase
      .from("recipes")
      .select("id, user_id, title, url, thumbnail_url, cook_time, servings")
      .eq("id", id)
      .single();

    if (error || !source) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (source.user_id === userId) {
      return NextResponse.json(
        { error: "This recipe is already yours" },
        { status: 409 },
      );
    }

    const { data: existing } = await supabase
      .from("recipes")
      .select("id")
      .eq("user_id", userId)
      .eq("url", source.url)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You already have this recipe saved" },
        { status: 409 },
      );
    }

    const { data: tags } = await supabase
      .from("recipe_tags")
      .select("tag")
      .eq("recipe_id", source.id);

    const { data: saved, error: insertError } = await supabase
      .from("recipes")
      .insert({
        user_id: userId,
        url: source.url,
        title: source.title,
        thumbnail_url: source.thumbnail_url,
        cook_time: source.cook_time,
        servings: source.servings,
        // Their notes are theirs. Everything else describes the recipe.
        notes: null,
        share_token: randomUUID().replace(/-/g, ""),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase error:", insertError);
      return NextResponse.json(
        { error: "Failed to save recipe" },
        { status: 500 },
      );
    }

    if (tags?.length) {
      await supabase
        .from("recipe_tags")
        .insert(tags.map(({ tag }) => ({ recipe_id: saved.id, tag })));
    }

    return NextResponse.json(
      { ...saved, tags: tags?.map((t) => t.tag) ?? [] },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error copying recipe:", error);
    return NextResponse.json(
      { error: "Failed to save recipe" },
      { status: 500 },
    );
  }
}
