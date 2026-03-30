import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Film } from "lucide-react";
import MoviePoster from "@/components/MoviePoster";

const ITEMS_PER_PAGE = 15;

type SortField = "rating" | "year" | null;
type SortDir = "asc" | "desc";

const Index = () => {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("movies").select("*").order("rank", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genre.split(",").forEach((g) => set.add(g.trim())));
    return Array.from(set).sort();
  }, [movies]);

  const filtered = useMemo(() => {
    let result = movies;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }
    if (genreFilter && genreFilter !== "all") {
      result = result.filter((m) => m.genre.split(",").map((g) => g.trim()).includes(genreFilter));
    }
    if (sortField) {
      result = [...result].sort((a, b) => {
        const diff = (a[sortField] ?? 0) - (b[sortField] ?? 0);
        return sortDir === "asc" ? diff : -diff;
      });
    }
    return result;
  }, [movies, search, genreFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />;
    return sortDir === "asc" ? <ArrowUp className="ml-1 h-3.5 w-3.5" /> : <ArrowDown className="ml-1 h-3.5 w-3.5" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Film className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">IMDB Top 250 Movies</h1>
          </div>
          <p className="text-muted-foreground">Browse, search, and filter the top-rated movies of all time.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={genreFilter} onValueChange={(v) => { setGenreFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {filtered.length} movie{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead className="w-16">Poster</TableHead>
                <TableHead>Title</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("year")}
                >
                  <span className="inline-flex items-center">Year <SortIcon field="year" /></span>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("rating")}
                >
                  <span className="inline-flex items-center">Rating <SortIcon field="rating" /></span>
                </TableHead>
                <TableHead>Genre</TableHead>
                <TableHead className="hidden md:table-cell">Director</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No movies found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((movie) => (
                  <TableRow key={movie.id}>
                    <TableCell className="font-medium text-muted-foreground">{movie.rank}</TableCell>
                    <TableCell className="font-medium">{movie.name}</TableCell>
                    <TableCell>{movie.year}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        ★ {movie.rating}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {movie.genre.split(",").map((g) => (
                          <Badge key={g} variant="outline" className="text-xs">{g.trim()}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {movie.directors}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <span key={p} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-1 text-muted-foreground">…</span>
                    )}
                    <Button
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                      className="min-w-[36px]"
                    >
                      {p}
                    </Button>
                  </span>
                ))}
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
