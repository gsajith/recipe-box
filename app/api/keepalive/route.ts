import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase";

// Daily Vercel cron (see vercel.json). Supabase pauses free projects that see
// too little database activity in a week, so this runs one real query a day.
// Vercel attaches `Authorization: Bearer <CRON_SECRET>` to cron requests.
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { count, error } = await supabase
    .from("user_profiles")
    .select("clerk_user_id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, users: count });
}
