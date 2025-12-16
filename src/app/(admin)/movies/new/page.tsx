import { getGenres, getDirectors, getActors } from "@/modules/movies/actions";
import { MovieForm } from "@/modules/movies/components";

export default async function NewMoviePage() {
  // Fetch genres, directors, and actors for form selects
  const [genres, directors, actors] = await Promise.all([
    getGenres(),
    getDirectors(),
    getActors(),
  ]);

  return (
    <div>
      <MovieForm genres={genres} directors={directors} actors={actors} />
    </div>
  );
}
