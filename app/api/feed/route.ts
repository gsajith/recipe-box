import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer as supabase } from "@/lib/supabase";
import type { FeedItem, FeedRecipeItem, FollowNotification } from "@/lib/types";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Recipe feed: recipes from people I follow ---
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  const followingIds = follows?.map((f) => f.following_id) ?? [];

  let feedRecipes: FeedRecipeItem[] = [];
  if (followingIds.length > 0) {
    const { data: recipes } = await supabase
      .from("recipes")
      .select("*, recipe_tags(tag)")
      .in("user_id", followingIds)
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("clerk_user_id, username")
      .in("clerk_user_id", followingIds);

    const usernameMap = Object.fromEntries(
      (profiles ?? []).map((p) => [p.clerk_user_id, p.username]),
    );

    feedRecipes = (recipes ?? []).map((r) => ({
      ...r,
      type: "recipe" as const,
      tags: (r.recipe_tags as { tag: string }[] | null)?.map((t) => t.tag) ?? [],
      attribution_username: usernameMap[r.user_id] ?? null,
    }));
  }

  // --- Follow notifications: people who followed me ---
  const { data: followers } = await supabase
    .from("follows")
    .select("id, follower_id, created_at")
    .eq("following_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  let followNotifs: FollowNotification[] = [];
  const followerIds = (followers ?? []).map((f) => f.follower_id);

  if (followerIds.length > 0) {
    const [{ data: followerProfiles }, { data: myFollows }] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("clerk_user_id, username")
        .in("clerk_user_id", followerIds),
      supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId)
        .in("following_id", followerIds),
    ]);

    const followerUsernameMap = Object.fromEntries(
      (followerProfiles ?? []).map((p) => [p.clerk_user_id, p.username]),
    );
    const iFollowSet = new Set((myFollows ?? []).map((f) => f.following_id));

    followNotifs = (followers ?? [])
      .map((f) => ({
        type: "follow" as const,
        id: f.id,
        actor_username: followerUsernameMap[f.follower_id],
        is_following_back: iFollowSet.has(f.follower_id),
        created_at: f.created_at,
      }))
      .filter((n) => n.actor_username);
  }

  // Merge and sort by created_at desc, cap at 50
  const allItems: FeedItem[] = [...feedRecipes, ...followNotifs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 50);

  return NextResponse.json(allItems);
}
