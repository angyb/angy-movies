
CREATE TABLE public.movies (
  id SERIAL PRIMARY KEY,
  rank INTEGER NOT NULL,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  rating NUMERIC(3,1) NOT NULL,
  genre TEXT NOT NULL,
  certificate TEXT,
  run_time TEXT,
  tagline TEXT,
  budget BIGINT,
  box_office BIGINT,
  casts TEXT,
  directors TEXT,
  writers TEXT
);

ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Movies are viewable by everyone"
ON public.movies
FOR SELECT
TO anon, authenticated
USING (true);
