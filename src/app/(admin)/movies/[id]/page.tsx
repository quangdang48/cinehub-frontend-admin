import { notFound } from "next/navigation";
import { getMovieById, getGenres, getDirectors, getActors } from "@/modules/movies/actions";
import { MovieForm } from "@/modules/movies/components";

interface EditMoviePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMoviePage({ params }: EditMoviePageProps) {
  const { id } = await params;

  // Fetch movie and form data in parallel
  const [movie, genres, directors, actors] = await Promise.all([
    getMovieById(id),
    getGenres(),
    getDirectors(),
    getActors(),
  ]);

  // Show 404 if movie not found
  if (!movie) {
    notFound();
  }

  return (
    <div>
      <MovieForm movie={movie} genres={genres} directors={directors} actors={actors} />
    </div>
  );
}
