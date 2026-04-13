export interface Recipe {
  id: string;
  user_id: string;
  url: string;
  title: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeTag {
  id: string;
  recipe_id: string;
  tag: string;
  created_at: string;
}

export interface RecipeWithTags extends Recipe {
  tags: string[];
}
