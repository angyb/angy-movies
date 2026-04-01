import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Film, Star, DollarSign, Users, Clapperboard, PenTool, Filter, X } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface Movie {
  id: number;
  name: string;
  year: number;
  budget: number | null;
  box_office: number | null;
  rating: number;
  genre: string;
  directors: string | null;
  writers: string | null;
  casts: string | null;
  certificate: string | null;
  run_time: string | null;
  tagline: string | null;
  rank: number;
}

interface BudgetTreemapProps {
  movies: Movie[];
}

const BudgetTreemap = ({ movies }: BudgetTreemapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredMovie, setHoveredMovie] = useState<Movie | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Extract unique genres
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();
    movies.forEach((m) => m.genre.split(",").forEach((g) => genreSet.add(g.trim())));
    return Array.from(genreSet).sort();
  }, [movies]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(500, width * 0.6) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const moviesWithBudget = useMemo(() => {
    const withBudget = movies.filter((m) => m.budget && m.budget > 0);
    if (selectedGenres.length === 0) return withBudget;
    return withBudget.filter((m) =>
      m.genre.split(",").some((g) => selectedGenres.includes(g.trim()))
    );
  }, [movies, selectedGenres]);

  const treemapData = d3
    .treemap<{ name: string; children: { name: string; value: number; movie: Movie }[] }>()
    .size([dimensions.width, dimensions.height])
    .padding(2)
    .round(true)(
    d3
      .hierarchy({
        name: "root",
        children: moviesWithBudget.map((m) => ({
          name: m.name,
          value: m.budget!,
          movie: m,
        })),
      })
      .sum((d: any) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
  );

  const leaves = treemapData.leaves();

  const handleMouseEnter = (movie: Movie, e: React.MouseEvent) => {
    setHoveredMovie(movie);
    updateTooltipPos(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    updateTooltipPos(e);
  };

  const updateTooltipPos = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left + 16;
    let y = e.clientY - rect.top + 16;
    // Keep tooltip on screen
    if (x + 340 > rect.width) x = e.clientX - rect.left - 356;
    if (y + 300 > rect.height) y = Math.max(0, e.clientY - rect.top - 300);
    setTooltipPos({ x, y });
  };

  if (dimensions.width === 0) {
    return <div ref={containerRef} className="w-full h-[500px]" />;
  }

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: dimensions.height }}>
      {/* Treemap tiles */}
      {leaves.map((leaf) => {
        const d = leaf.data as any;
        const movie: Movie = d.movie;
        const w = (leaf.x1 ?? 0) - (leaf.x0 ?? 0);
        const h = (leaf.y1 ?? 0) - (leaf.y0 ?? 0);
        const posterUrl = `${SUPABASE_URL}/storage/v1/object/public/movie-posters/${movie.id}.jpg`;
        const isHovered = hoveredMovie?.id === movie.id;

        return (
          <div
            key={movie.id}
            className="absolute overflow-hidden cursor-pointer transition-all duration-150"
            style={{
              left: leaf.x0,
              top: leaf.y0,
              width: w,
              height: h,
              zIndex: isHovered ? 10 : 1,
              outline: isHovered ? "2px solid hsl(var(--primary))" : "none",
              borderRadius: 4,
            }}
            onMouseEnter={(e) => handleMouseEnter(movie, e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredMovie(null)}
          >
            <img
              src={posterUrl}
              alt={movie.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Overlay with title for larger tiles */}
            {w > 60 && h > 40 && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                <p
                  className="text-white font-medium leading-tight"
                  style={{ fontSize: Math.max(9, Math.min(13, w / 12)) }}
                >
                  {movie.name}
                </p>
              </div>
            )}
            {/* Fallback for broken posters */}
            <div className="absolute inset-0 flex items-center justify-center bg-muted -z-10">
              <Film className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        );
      })}

      {/* Tooltip */}
      {hoveredMovie && (
        <div
          className="absolute z-50 pointer-events-none w-[340px] rounded-lg border border-border bg-card shadow-xl p-4"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex gap-3">
            <img
              src={`${SUPABASE_URL}/storage/v1/object/public/movie-posters/${hoveredMovie.id}.jpg`}
              alt={hoveredMovie.name}
              className="w-16 h-24 rounded object-cover flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="min-w-0">
              <h4 className="font-bold text-foreground text-sm leading-tight">{hoveredMovie.name}</h4>
              <p className="text-muted-foreground text-xs mt-0.5">
                {hoveredMovie.year} · {hoveredMovie.certificate || "NR"}
                {hoveredMovie.run_time ? ` · ${hoveredMovie.run_time}` : ""}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-foreground">{hoveredMovie.rating}</span>
                <span className="text-xs text-muted-foreground ml-1">#{hoveredMovie.rank} on IMDB</span>
              </div>
            </div>
          </div>

          {hoveredMovie.tagline && (
            <p className="text-xs italic text-muted-foreground mt-2 border-l-2 border-primary/40 pl-2">
              "{hoveredMovie.tagline}"
            </p>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            {hoveredMovie.genre.split(",").map((g) => (
              <Badge key={g.trim()} variant="secondary" className="text-[10px] px-1.5 py-0">
                {g.trim()}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-medium text-foreground">
                {hoveredMovie.budget ? `$${(hoveredMovie.budget / 1_000_000).toFixed(1)}M` : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="text-muted-foreground">Box Office:</span>
              <span className="font-medium text-foreground">
                {hoveredMovie.box_office ? `$${(hoveredMovie.box_office / 1_000_000).toFixed(1)}M` : "—"}
              </span>
            </div>
          </div>

          {hoveredMovie.directors && (
            <div className="flex items-start gap-1.5 mt-2 text-xs">
              <Clapperboard className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Director:</span>
              <span className="text-foreground">{hoveredMovie.directors}</span>
            </div>
          )}

          {hoveredMovie.casts && (
            <div className="flex items-start gap-1.5 mt-1 text-xs">
              <Users className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Cast:</span>
              <span className="text-foreground line-clamp-2">{hoveredMovie.casts}</span>
            </div>
          )}

          {hoveredMovie.writers && (
            <div className="flex items-start gap-1.5 mt-1 text-xs">
              <PenTool className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Writers:</span>
              <span className="text-foreground line-clamp-2">{hoveredMovie.writers}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetTreemap;
