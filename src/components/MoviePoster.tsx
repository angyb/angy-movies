import { Film } from "lucide-react";
import { useState } from "react";

interface MoviePosterProps {
  movieId: number;
  title: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const MoviePoster = ({ movieId, title }: MoviePosterProps) => {
  const [error, setError] = useState(false);
  const posterUrl = `${SUPABASE_URL}/storage/v1/object/public/movie-posters/${movieId}.jpg`;

  if (error) {
    return (
      <div className="flex h-[60px] w-[40px] items-center justify-center rounded bg-muted">
        <Film className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={posterUrl}
      alt={`${title} poster`}
      className="h-[60px] w-[40px] rounded object-cover"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
};

export default MoviePoster;
