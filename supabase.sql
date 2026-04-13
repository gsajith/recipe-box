-- Create recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_url UNIQUE(user_id, url)
);

-- Create recipe_tags table
CREATE TABLE recipe_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_recipe_tag UNIQUE(recipe_id, tag)
);

-- Create indexes for better query performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX idx_recipe_tags_tag ON recipe_tags(tag);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for recipes
CREATE POLICY "Users can view their own recipes"
  ON recipes FOR SELECT
  USING (user_id = current_user_id());

CREATE POLICY "Users can insert their own recipes"
  ON recipes FOR INSERT
  WITH CHECK (user_id = current_user_id());

CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());

CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (user_id = current_user_id());

-- Helper function to get current user ID from request context
CREATE OR REPLACE FUNCTION current_user_id() RETURNS text AS $$
BEGIN
  RETURN coalesce(
    current_setting('app.current_user_id', true),
    current_setting('request.headers.x-user-id', true)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Create policies for recipe_tags
CREATE POLICY "Users can view tags for their recipes"
  ON recipe_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_tags.recipe_id
      AND recipes.user_id = current_user_id()
    )
  );

CREATE POLICY "Users can insert tags for their recipes"
  ON recipe_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_tags.recipe_id
      AND recipes.user_id = current_user_id()
    )
  );

CREATE POLICY "Users can delete tags from their recipes"
  ON recipe_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_tags.recipe_id
      AND recipes.user_id = auth.uid()::text
    )
  );
