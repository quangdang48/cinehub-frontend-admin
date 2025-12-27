import { notFound } from "next/navigation";
import {
  getMovieById,
  getGenres,
  getDirectors,
  getActors,
} from "@/modules/movies/actions";
import { MovieMultiStepForm } from "@/modules/movies/components/movie-multi-step-form";

interface EditMoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMoviePage({ params }: EditMoviePageProps) {
  const { id } = await params;
  const [movie, genres, directors, actors] = await Promise.all([
    getMovieById(id),
    getGenres(),
    getDirectors(),
    getActors(),
  ]);

  if (!movie) {
    notFound();
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Chỉnh sửa phim</h1>
        <p className="text-muted-foreground mt-2">
          Cập nhật thông tin phim: {movie.title}
        </p>
      </div>

      <MovieMultiStepForm
        movie={movie}
        genres={genres}
        directors={directors}
        actors={actors}
      />
    </div>
  );
}
