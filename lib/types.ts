export interface Recipe {
  id: string;
  user_id: string;
  url: string;
  title: string;
  thumbnail_url: string | null;
  cook_time: string | null;
  servings: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface FeedRecipe extends Recipe {
  attribution_username: string | null;
}

export interface FeedRecipeItem extends FeedRecipe {
  type: "recipe";
}

export interface FollowNotification {
  type: "follow";
  id: string;
  actor_username: string;
  is_following_back: boolean;
  created_at: string;
}

export type FeedItem = FeedRecipeItem | FollowNotification;

export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}
