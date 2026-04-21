import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseServer as supabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("clerk_user_id, username, display_name")
    .order("created_at", { ascending: false });

  if (!profiles?.length) return NextResponse.json([]);

  const allIds = profiles.map((p) => p.clerk_user_id);

  const [
    { data: allFollows },
    { data: allRecipes },
    { data: myFollows },
    clerkUsers,
  ] = await Promise.all([
    supabase.from("follows").select("follower_id, following_id"),
    supabase.from("recipes").select("user_id"),
    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId),
    (await clerkClient()).users.getUserList({ userId: allIds, limit: 500 }),
  ]);

  const followerCountMap: Record<string, number> = {};
  const followingCountMap: Record<string, number> = {};
  for (const f of allFollows ?? []) {
    followerCountMap[f.following_id] = (followerCountMap[f.following_id] ?? 0) + 1;
    followingCountMap[f.follower_id] = (followingCountMap[f.follower_id] ?? 0) + 1;
  }

  const recipeCountMap: Record<string, number> = {};
  for (const r of allRecipes ?? []) {
    recipeCountMap[r.user_id] = (recipeCountMap[r.user_id] ?? 0) + 1;
  }

  const iFollowSet = new Set((myFollows ?? []).map((f) => f.following_id));
  const followsMeSet = new Set(
    (allFollows ?? [])
      .filter((f) => f.following_id === userId)
      .map((f) => f.follower_id),
  );

  const imageUrlMap = Object.fromEntries(
    (clerkUsers?.data ?? []).map((u) => [u.id, u.imageUrl]),
  );

  const users = profiles.filter((p) => p.username).map((p) => ({
    clerk_user_id: p.clerk_user_id,
    username: p.username,
    display_name: p.display_name,
    image_url: imageUrlMap[p.clerk_user_id] ?? null,
    follower_count: followerCountMap[p.clerk_user_id] ?? 0,
    following_count: followingCountMap[p.clerk_user_id] ?? 0,
    recipe_count: recipeCountMap[p.clerk_user_id] ?? 0,
    is_followed_by_me: iFollowSet.has(p.clerk_user_id),
    follows_me: followsMeSet.has(p.clerk_user_id),
  }));

  return NextResponse.json(users);
}
