import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer as supabase } from "@/lib/supabase";
import { extractRecipeMetadata } from "@/lib/recipeExtractor";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, url")
    .eq("user_id", userId)
    .ilike("url", "%instagram.com%");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let refreshed = 0;
  let failed = 0;

  for (const recipe of recipes ?? []) {
    try {
      const { thumbnailUrl } = await extractRecipeMetadata(recipe.url);
      if (!thumbnailUrl) { failed++; continue; }

      const { error: updateError } = await supabase
        .from("recipes")
        .update({ thumbnail_url: thumbnailUrl, updated_at: new Date().toISOString() })
        .eq("id", recipe.id);

      updateError ? failed++ : refreshed++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ refreshed, failed, total: recipes?.length ?? 0 });
}
