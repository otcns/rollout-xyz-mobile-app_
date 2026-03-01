-- Allow public to view artists with public agenda
CREATE POLICY "Public can view artist with public agenda"
ON public.artists FOR SELECT
USING (agenda_is_public = true);

-- Allow public to view tasks for artists with public agenda
CREATE POLICY "Public can view tasks for public agenda"
ON public.tasks FOR SELECT
USING (
  artist_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.artists a
    WHERE a.id = tasks.artist_id AND a.agenda_is_public = true
  )
);

-- Allow public to view budgets for artists with public agenda
CREATE POLICY "Public can view budgets for public agenda"
ON public.budgets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.artists a
    WHERE a.id = budgets.artist_id AND a.agenda_is_public = true
  )
);

-- Allow public to view transactions for artists with public agenda
CREATE POLICY "Public can view transactions for public agenda"
ON public.transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.artists a
    WHERE a.id = transactions.artist_id AND a.agenda_is_public = true
  )
);

-- Allow public to view initiatives for artists with public agenda
CREATE POLICY "Public can view initiatives for public agenda"
ON public.initiatives FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.artists a
    WHERE a.id = initiatives.artist_id AND a.agenda_is_public = true
  )
);