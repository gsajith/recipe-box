import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer as supabase } from "@/lib/supabase";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await params;

    // Look up shared recipe
    const { data: recipe, error } = await supabase
      .from("recipes")
      .select("id, title, url, thumbnail_url, cook_time, servings")
      .eq("share_token", token)
      .single();

    if (error || !recipe) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 });
    }

    // Check if user already has this URL saved
    const { data: existing } = await supabase
      .from("recipes")
      .select("id")
      .eq("user_id", userId)
      .eq("url", recipe.url)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You already have this recipe saved" },
        { status: 400 },
      );
    }

    // Save to user's collection
    const { data: newRecipe, error: insertError } = await supabase
      .from("recipes")
      .insert({
        user_id: userId,
        url: recipe.url,
        title: recipe.title,
        thumbnail_url: recipe.thumbnail_url,
        cook_time: recipe.cook_time,
        servings: recipe.servings,
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

    return NextResponse.json(newRecipe, { status: 201 });
  } catch (error) {
    console.error("Error saving shared recipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
