import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase";
import { isValidUsername } from "@/lib/username";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "username param required" }, { status: 400 });
  }

  if (!isValidUsername(username)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const { data } = await supabase
    .from("user_profiles")
    .select("clerk_user_id")
    .eq("username", username)
    .single();

  return NextResponse.json({ available: !data });
}
