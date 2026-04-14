import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  // Resolve username → clerk_user_id
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("clerk_user_id")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*, recipe_tags(tag)")
    .eq("user_id", profile.clerk_user_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }

  const recipesWithTags = (recipes ?? []).map((r) => ({
    ...r,
    tags: (r.recipe_tags ?? []).map((t: { tag: string }) => t.tag),
    recipe_tags: undefined,
  }));

  return NextResponse.json(recipesWithTags);
}
