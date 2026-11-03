import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase";

// Daily Vercel cron (see vercel.json). Supabase pauses free projects that see
// too little database activity in a week, so this runs one real query a day.
// Vercel attaches `Authorization: Bearer <CRON_SECRET>` to cron requests.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { error } = await supabase
    .from("user_profiles")
    .select("clerk_user_id", { count: "exact", head: true });

  if (error) {
    console.error("keepalive query failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
