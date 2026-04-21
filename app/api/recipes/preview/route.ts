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
    const { title, thumbnailUrl } = await extractRecipeMetadata(url);
    return NextResponse.json({ title, thumbnailUrl });
  } catch {
    return NextResponse.json({ error: "Failed to fetch preview" }, { status: 500 });
  }
}
