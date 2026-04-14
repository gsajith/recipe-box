import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer as supabase } from "@/lib/supabase";
import { isValidUsername } from "@/lib/username";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }

  return NextResponse.json(data ?? null);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { username, display_name } = body;

  if (username !== undefined) {
    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: "Username is invalid or reserved" },
        { status: 400 },
      );
    }

    // Check uniqueness (excluding current user)
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("clerk_user_id")
      .eq("username", username)
      .single();

    if (existing && existing.clerk_user_id !== userId) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 },
      );
    }
  }

  const upsertData: Record<string, string> = {
    clerk_user_id: userId,
    updated_at: new Date().toISOString(),
  };
  if (username !== undefined) upsertData.username = username;
  if (display_name !== undefined) upsertData.display_name = display_name;

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(upsertData, { onConflict: "clerk_user_id" })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 },
      );
    }
    console.error("Supabase error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }

  return NextResponse.json(data);
}
