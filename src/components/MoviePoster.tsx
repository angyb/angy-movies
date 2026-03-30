import { usePoster } from "@/hooks/use-poster";
import { Skeleton } from "@/components/ui/skeleton";
import { Film } from "lucide-react";

interface MoviePosterProps {
  title: string;
  year: number;
}

const MoviePoster = ({ title, year }: MoviePosterProps) => {
  const { data: posterUrl, isLoading } = usePoster(title, year);

  if (isLoading) {
    return <Skeleton className="h-[60px] w-[40px] rounded" />;
  }

  if (!posterUrl) {
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
    />
  );
};

export default MoviePoster;
