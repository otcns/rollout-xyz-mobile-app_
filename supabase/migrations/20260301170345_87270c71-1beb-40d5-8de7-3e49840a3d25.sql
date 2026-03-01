-- Add agenda sharing fields to artists table
ALTER TABLE public.artists
  ADD COLUMN IF NOT EXISTS agenda_public_token text DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text),
  ADD COLUMN IF NOT EXISTS agenda_is_public boolean NOT NULL DEFAULT false;