import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("username, display_name, clerk_user_id")
    .eq("username", username)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [{ count: followerCount }, { count: followingCount }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile.clerk_user_id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile.clerk_user_id),
    ]);

  return NextResponse.json({
    username: profile.username,
    display_name: profile.display_name,
    follower_count: followerCount ?? 0,
    following_count: followingCount ?? 0,
  });
}
