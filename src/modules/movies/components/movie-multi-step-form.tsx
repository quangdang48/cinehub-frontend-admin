"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Steps } from "@/components/ui/steps";
import { MovieFormStep1, type MovieFormStep1Data } from "./movie-form-step1";
import { MovieFormStep2 } from "./movie-form-step2";
import { MovieFormStep3Series } from "./movie-form-step3-series";
import { MovieFormStep4 } from "./movie-form-step4";
import { createMovie, updateMovie } from "../actions";
import { toast } from "sonner";
import type { Movie, Genre, Director, Actor } from "../types";
import { FilmType } from "../types";

interface MovieMultiStepFormProps {
  movie?: Movie;
  genres: Genre[];
  directors: Director[];
  actors: Actor[];
}

export function MovieMultiStepForm({
  movie,
  genres,
  directors,
  actors,
}: MovieMultiStepFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [createdFilmId, setCreatedFilmId] = useState<string | null>(movie?.id || null);
  const [filmType, setFilmType] = useState<FilmType>(movie?.type || FilmType.MOVIE);

  const steps = useMemo(() => {
    const baseSteps = [
      { title: "Thông tin cơ bản", description: "Nhập thông tin phim" },
      { title: "Hình ảnh", description: "Upload poster và ảnh" },
    ];

    if (filmType === FilmType.SERIES) {
      baseSteps.push({ title: "Mùa & Tập", description: "Cấu hình mùa và tập phim" });
    }

    baseSteps.push({ title: "Video", description: "Upload video phim" });

    return baseSteps;
  }, [filmType]);

  const handleStep1Submit = async (data: MovieFormStep1Data) => {
    setIsLoading(true);
    try {
      if (movie) {
        // Update existing movie
        const result = await updateMovie(movie.id, data);
        if (result.success) {
          toast.success("Cập nhật thông tin phim thành công");
          setFilmType(data.type);
          setCurrentStep(2);
        } else {
          toast.error(result.error || "Lỗi khi cập nhật phim");
        }
      } else {
        // Create new movie
        const result = await createMovie(data);
        if (result.success && result.data) {
          toast.success("Tạo phim thành công");
          setCreatedFilmId(result.data.id);
          setFilmType(data.type);
          setCurrentStep(2);
        } else {
          toast.error(result.error || "Lỗi khi tạo phim");
        }
      }
    } catch (error) {
      console.error("Error submitting step 1:", error);
      toast.error("Đã xảy ra lỗi không mong muốn");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Next = () => {
    setCurrentStep(3);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleStep3Next = () => {
    // For SERIES, step 3 is seasons/episodes, step 4 is video
    // For MOVIE, step 3 is video
    if (filmType === FilmType.SERIES) {
      setCurrentStep(4);
    }
  };

  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  const handleStep4Complete = () => {
    toast.success(movie ? "Cập nhật phim thành công" : "Tạo phim mới thành công");
    router.push("/movies");
  };

  const handleStep4Back = () => {
    if (filmType === FilmType.SERIES) {
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  };

  return (
    <div className="space-y-8">
      <Steps currentStep={currentStep} steps={steps} />

      {currentStep === 1 && (
        <MovieFormStep1
          initialData={
            movie
              ? {
                  title: movie.title,
                  originalTitle: movie.originalTitle,
                  englishTitle: movie.englishTitle,
                  description: movie.description,
                  ageLimit: movie.ageLimit,
                  country: movie.country,
                  releaseDate: movie.releaseDate.split("T")[0],
                  status: movie.status,
                  type: movie.type,
                  imdbRating: movie.imdbRating,
                  directors: movie.directors.map((d) => d.id),
                  genres: movie.genres.map((g) => g.id),
                  casts: movie.casts.map((c) => ({
                    actorId: c.actor.id,
                    character: c.character,
                  })),
                }
              : undefined
          }
          genres={genres}
          directors={directors}
          actors={actors}
          onNext={handleStep1Submit}
          isLoading={isLoading}
        />
      )}

      {currentStep === 2 && createdFilmId && (
        <MovieFormStep2
          filmId={createdFilmId}
          existingPosters={movie?.posters}
          onNext={handleStep2Next}
          onBack={handleStep2Back}
        />
      )}

      {currentStep === 3 && createdFilmId && filmType === FilmType.SERIES && (
        <MovieFormStep3Series
          filmId={createdFilmId}
          onNext={handleStep3Next}
          onBack={handleStep3Back}
        />
      )}

      {((currentStep === 3 && filmType === FilmType.MOVIE) ||
        (currentStep === 4 && filmType === FilmType.SERIES)) &&
        createdFilmId && (
          <MovieFormStep4
            filmId={createdFilmId}
            filmType={filmType}
            onComplete={handleStep4Complete}
            onBack={handleStep4Back}
          />
        )}
    </div>
  );
}
