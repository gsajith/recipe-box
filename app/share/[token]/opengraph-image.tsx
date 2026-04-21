import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { supabaseServer as supabase } from "@/lib/supabase";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [playfairRegular, { data: recipe }] = await Promise.all([
    readFile(join(process.cwd(), "assets/PlayfairDisplay-ExtraBold.ttf")),
    supabase
      .from("recipes")
      .select("title, thumbnail_url, cook_time, servings")
      .eq("share_token", token)
      .single(),
  ]);

  const title = recipe?.title ?? "A shared recipe";
  const thumbnail = recipe?.thumbnail_url ?? null;
  const cookTime = recipe?.cook_time ?? null;
  const servings = recipe?.servings ?? null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#234b39",
        position: "relative",
        overflow: "hidden",
      }}>
      {/* Dot grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage:
            "radial-gradient(circle, rgba(250,247,239,0.07) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Left: thumbnail */}
      {thumbnail ? (
        <div
          style={{
            width: 480,
            height: "100%",
            flexShrink: 0,
            position: "relative",
            display: "flex",
            overflow: "hidden",
          }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Right-edge fade into the dark background */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: 80,
              display: "flex",
              background:
                "linear-gradient(to right, transparent, #234b39)",
            }}
          />
        </div>
      ) : null}

      {/* Right: text content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: thumbnail ? "48px 56px 48px 40px" : "48px 64px",
          position: "relative",
          zIndex: 1,
        }}>
        {/* Brand */}
        <span
          style={{
            fontFamily: "Playfair Display",
            fontSize: 30,
            fontWeight: 800,
            color: "rgba(250,247,239,0.55)",
            letterSpacing: "-0.01em",
          }}>
          RecipeBox
        </span>

        {/* Recipe title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}>
          <span
            style={{
              fontFamily: "Playfair Display",
              fontSize: title.length > 40 ? 44 : 56,
              fontWeight: 800,
              color: "#FAF7EF",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}>
            {title}
          </span>

          {(cookTime || servings) && (
            <div
              style={{
                display: "flex",
                gap: 20,
                color: "rgba(250,247,239,0.65)",
                fontSize: 26,
                fontFamily: "Playfair Display",
                fontWeight: 800,
              }}>
              {cookTime && <span>{cookTime}</span>}
              {cookTime && servings && (
                <span style={{ opacity: 0.4 }}>·</span>
              )}
              {servings && <span>{servings}</span>}
            </div>
          )}
        </div>

        {/* Footer label */}
        <span
          style={{
            fontSize: 22,
            fontFamily: "Playfair Display",
            fontWeight: 800,
            color: "#F5C73A",
            letterSpacing: "-0.01em",
          }}>
          Shared via RecipeBox
        </span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Playfair Display",
          data: playfairRegular,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
