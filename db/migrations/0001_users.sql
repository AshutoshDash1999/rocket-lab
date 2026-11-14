-- App-level user record created during onboarding.
-- Identity (Google account, sessions) lives in Neon Auth's neon_auth schema.
CREATE TABLE IF NOT EXISTS public.users (
  user_id    uuid PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  email      text NOT NULL,
  username   text NOT NULL CHECK (username ~ '^[a-z0-9_]{3,20}$'),
  age        integer NOT NULL CHECK (age BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_key ON public.users (lower(username));
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON public.users (lower(email));
