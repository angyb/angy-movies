import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const omdbKey = Deno.env.get('OMDB_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  if (!omdbKey) {
    return new Response(JSON.stringify({ error: 'OMDB_API_KEY not set' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Fetch all movies
  const { data: movies, error: dbError } = await supabase
    .from('movies')
    .select('id, name, year')
    .order('rank', { ascending: true });

  if (dbError) {
    return new Response(JSON.stringify({ error: dbError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const results: { id: number; name: string; status: string }[] = [];

  for (const movie of movies) {
    const fileName = `${movie.id}.jpg`;

    // Check if already uploaded
    const { data: existing } = await supabase.storage
      .from('movie-posters')
      .list('', { search: fileName });

    if (existing && existing.some(f => f.name === fileName)) {
      results.push({ id: movie.id, name: movie.name, status: 'skipped (exists)' });
      continue;
    }

    try {
      // Fetch poster URL from OMDB
      const params = new URLSearchParams({ t: movie.name, y: String(movie.year), apikey: omdbKey });
      const omdbRes = await fetch(`https://www.omdbapi.com/?${params}`);
      const omdbData = await omdbRes.json();

      if (omdbData.Response !== 'True' || !omdbData.Poster || omdbData.Poster === 'N/A') {
        results.push({ id: movie.id, name: movie.name, status: 'no poster found' });
        continue;
      }

      // Download the poster image
      const imgRes = await fetch(omdbData.Poster);
      if (!imgRes.ok) {
        results.push({ id: movie.id, name: movie.name, status: 'image download failed' });
        continue;
      }
      const imgBlob = await imgRes.blob();
      const imgBuffer = new Uint8Array(await imgBlob.arrayBuffer());

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('movie-posters')
        .upload(fileName, imgBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        results.push({ id: movie.id, name: movie.name, status: `upload error: ${uploadError.message}` });
      } else {
        results.push({ id: movie.id, name: movie.name, status: 'uploaded' });
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 250));
    } catch (e) {
      results.push({ id: movie.id, name: movie.name, status: `error: ${e.message}` });
    }
  }

  const uploaded = results.filter(r => r.status === 'uploaded').length;
  const skipped = results.filter(r => r.status.startsWith('skipped')).length;
  const failed = results.length - uploaded - skipped;

  return new Response(JSON.stringify({ 
    summary: { total: results.length, uploaded, skipped, failed },
    details: results 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
