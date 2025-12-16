import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getMovies, getGenres } from "@/modules/movies/actions";
import { MovieTable, MovieFilters } from "@/modules/movies/components";
import type { MovieFilters as MovieFiltersType, FilmStatus, FilmType, AgeLimit } from "@/modules/movies";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface MoviesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    country?: string;
    releaseYear?: string;
    genreId?: string;
    directorId?: string;
    actorId?: string;
    status?: string;
    type?: string;
    ageLimit?: string;
  }>;
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const params = await searchParams;
  
  // Parse filters from search params
  const filters: MovieFiltersType = {
    page: params.page ? parseInt(params.page) : 1,
    limit: 10,
    search: params.search,
    country: params.country,
    releaseYear: params.releaseYear ? parseInt(params.releaseYear) : undefined,
    genreId: params.genreId,
    directorId: params.directorId,
    actorId: params.actorId,
    status: params.status as FilmStatus,
    type: params.type as FilmType,
    ageLimit: params.ageLimit as AgeLimit,
  };

  // Fetch data in parallel
  const [moviesData, genres] = await Promise.all([
    getMovies(filters),
    getGenres(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý phim</h1>
          <p className="text-muted-foreground">
            Tổng cộng {moviesData.totalItems} phim
          </p>
        </div>
        <Link href="/movies/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm phim mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Suspense fallback={<Spinner />}>
        <MovieFilters genres={genres} />
      </Suspense>

      {/* Table */}
      <Suspense fallback={<Spinner />}>
        <MovieTable data={moviesData} />
      </Suspense>
    </div>
  );
}
