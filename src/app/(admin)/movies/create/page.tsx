import { getGenres, getDirectors, getActors } from "@/modules/movies/actions";
import { MovieMultiStepForm } from "@/modules/movies/components/movie-multi-step-form";

export default async function CreateMoviePage() {
  const [genres, directors, actors] = await Promise.all([
    getGenres(),
    getDirectors(),
    getActors(),
  ]);

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tạo phim mới</h1>
        <p className="text-muted-foreground mt-2">
          Điền thông tin để tạo phim mới trong hệ thống
        </p>
      </div>

      <MovieMultiStepForm genres={genres} directors={directors} actors={actors} />
    </div>
  );
}
