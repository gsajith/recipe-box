import type { Metadata } from "next";
import { clerkClient } from "@clerk/nextjs/server";
import { supabaseServer as supabase } from "@/lib/supabase";

async function getProfileMeta(username: string) {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("clerk_user_id, username")
      .eq("username", username)
      .single();

    if (profileError || !profile) return null;

    const [followerResult, followingResult, recipeResult, clerkResult] =
      await Promise.allSettled([
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", profile.clerk_user_id),
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", profile.clerk_user_id),
        supabase
          .from("recipes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile.clerk_user_id),
        clerkClient()
          .then((c) => c.users.getUser(profile.clerk_user_id))
          .catch(() => null),
      ]);

    const followerCount =
      followerResult.status === "fulfilled"
        ? (followerResult.value.count ?? 0)
        : 0;
    const followingCount =
      followingResult.status === "fulfilled"
        ? (followingResult.value.count ?? 0)
        : 0;
    const recipeCount =
      recipeResult.status === "fulfilled" ? (recipeResult.value.count ?? 0) : 0;
    const clerkUser =
      clerkResult.status === "fulfilled" ? clerkResult.value : null;

    return {
      username: profile.username,
      display_name:
        clerkUser?.fullName || clerkUser?.firstName || profile.username,
      image_url: clerkUser?.imageUrl ?? null,
      follower_count: followerCount,
      following_count: followingCount,
      recipe_count: recipeCount,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id?: string[] }>;
}): Promise<Metadata> {
  const { id } = await params;
  const username = id?.[0];

  const suffix = "— a RecipeBox user";

  if (!username) {
    return { title: `My Profile ${suffix}` };
  }

  const profile = await getProfileMeta(username);

  if (!profile) {
    return {
      title: `@${username} ${suffix}`,
      openGraph: {
        title: `@${username} ${suffix}`,
        siteName: "RecipeBox",
        url: `/user/${username}`,
        type: "profile",
      },
      twitter: {
        card: "summary",
        title: `@${username} ${suffix}`,
      },
    };
  }

  const displayName = profile.display_name || username;
  const title = `${displayName} (@${username}) ${suffix}`;
  const description = `${profile.recipe_count} recipe${profile.recipe_count !== 1 ? "s" : ""} saved · ${profile.follower_count} follower${profile.follower_count !== 1 ? "s" : ""} · ${profile.following_count} following`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/user/${username}`,
      siteName: "RecipeBox",
      images: profile.image_url
        ? [{ url: profile.image_url, alt: displayName, width: 400, height: 400 }]
        : [],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: profile.image_url ? [profile.image_url] : [],
    },
  };
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
