import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { extractRecipeMetadata } from "@/lib/recipeExtractor";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const { title, thumbnailUrl, pageKind } = await extractRecipeMetadata(url);
    // pageKind lets the clipboard banner decline to interrupt over a page that
    // declares itself to be something other than a recipe. Advisory only — the
    // save endpoint does not consult it, so an explicit paste still works.
    return NextResponse.json({ title, thumbnailUrl, pageKind });
  } catch {
    return NextResponse.json({ error: "Failed to fetch preview" }, { status: 500 });
  }
}
