-- Saved rockets. `parts` is the builder's PlacedPart[] as JSON.
-- Anyone signed in who has a blueprint's id (its share link) can view it;
-- only the owner can edit it.
CREATE TABLE IF NOT EXISTS public.blueprints (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   uuid NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  name       text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  parts      jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(parts) = 'array'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blueprints_owner_updated_idx
  ON public.blueprints (owner_id, updated_at DESC);
