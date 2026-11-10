import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase";

// Tables the app reads in normal use.
const TABLES = ["user_profiles", "recipes", "follows"] as const;

// Vercel cron, three times a day (see vercel.json). Supabase pauses free
// projects without "a few user requests to the database each day", and one
// count-only request a day still drew a pause warning. So each run reads a
// row from several tables, and the Hobby plan's once-a-day limit per cron is
// why vercel.json lists three entries.
// Vercel attaches `Authorization: Bearer <CRON_SECRET>` to cron requests.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const results = await Promise.all(
    TABLES.map((table) => supabase.from(table).select("*").limit(1)),
  );

  const errors = results.flatMap((result) => result.error ?? []);
  if (errors.length > 0) {
    console.error("keepalive query failed", errors);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
