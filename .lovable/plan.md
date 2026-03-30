

## Plan: Fetch OMDB Posters for Movies

### Overview
Create an edge function that proxies requests to the OMDB API (using the already-configured `OMDB_API_KEY` secret), then update the frontend to display movie posters in the table.

### Steps

**1. Create edge function `supabase/functions/omdb-poster/index.ts`**
- Accepts a movie title and year as query parameters
- Calls `https://www.omdbapi.com/?t={title}&y={year}&apikey={OMDB_API_KEY}`
- Returns the poster URL from the response
- Includes CORS headers and input validation

**2. Update `src/pages/Index.tsx`**
- Add a new "Poster" column to the table (between # and Title)
- For each visible movie row, fetch the poster URL via the edge function
- Use React Query to batch/cache poster fetches per movie (keyed by name+year)
- Display a small thumbnail (e.g. 40x60px) with a fallback placeholder
- Add a skeleton loader for posters while loading

### Technical Details
- The OMDB API key (`OMDB_API_KEY`) is already stored as a runtime secret
- Edge function will be called from the client via `supabase.functions.invoke('omdb-poster', { body: { title, year } })`
- Poster requests will only fire for the current page's movies (15 at a time) to minimize API calls
- Each poster query is cached by React Query so revisiting pages won't re-fetch

