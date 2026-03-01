
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS team_size text,
  ADD COLUMN IF NOT EXISTS monthly_revenue text,
  ADD COLUMN IF NOT EXISTS artist_count text;
