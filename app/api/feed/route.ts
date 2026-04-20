import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer as supabase } from "@/lib/supabase";
import type { FeedRecipe } from "@/lib/types";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Step 1: who does the current user follow?
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  const followingIds = follows?.map((f) => f.following_id) ?? [];
  if (followingIds.length === 0) {
    return NextResponse.json([]);
  }

  // Step 2: their recipes + tags
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*, recipe_tags(tag)")
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }

  // Step 3: resolve usernames
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("clerk_user_id, username")
    .in("clerk_user_id", followingIds);

  const usernameMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.clerk_user_id, p.username]),
  );

  const feedRecipes: FeedRecipe[] = (recipes ?? []).map((r) => ({
    ...r,
    tags: (r.recipe_tags as { tag: string }[] | null)?.map((t) => t.tag) ?? [],
    attribution_username: usernameMap[r.user_id] ?? null,
  }));

  return NextResponse.json(feedRecipes);
}
