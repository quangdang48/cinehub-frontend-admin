"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ageLimitOptions, statusOptions, typeOptions } from "../const";
import type { CreateMovieDto, AgeLimit, FilmStatus, FilmType, Genre, Director, Actor, UpdateCastDto } from "../types";
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MovieFormStep1Data {
  title: string;
  originalTitle: string;
  englishTitle: string;
  description?: string;
  ageLimit: AgeLimit;
  country: string;
  releaseDate: string;
  status: FilmStatus;
  type: FilmType;
  imdbRating?: number;
  directors?: string[];
  genres?: string[];
  casts?: UpdateCastDto[];
}

interface MovieFormStep1Props {
  initialData?: Partial<MovieFormStep1Data>;
  genres: Genre[];
  directors: Director[];
  actors: Actor[];
  onNext: (data: MovieFormStep1Data) => void;
  isLoading?: boolean;
}

export function MovieFormStep1({
  initialData,
  genres,
  directors,
  actors,
  onNext,
  isLoading,
}: MovieFormStep1Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MovieFormStep1Data>({
    defaultValues: initialData || {
      ageLimit: "ALL" as AgeLimit,
      status: "UPCOMING" as FilmStatus,
      type: "MOVIE" as FilmType,
      directors: [],
      genres: [],
      casts: [],
    },
  });

  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialData?.genres || []);
  const [selectedDirectors, setSelectedDirectors] = useState<string[]>(initialData?.directors || []);
  const [selectedCasts, setSelectedCasts] = useState<UpdateCastDto[]>(initialData?.casts || []);
  const [newCast, setNewCast] = useState({ actorId: "", character: "" });

  const handleAddGenre = (genreId: string) => {
    if (genreId && !selectedGenres.includes(genreId)) {
      const updatedGenres = [...selectedGenres, genreId];
      setSelectedGenres(updatedGenres);
      setValue("genres", updatedGenres);
    }
  };

  const handleRemoveGenre = (genreId: string) => {
    const updatedGenres = selectedGenres.filter((g) => g !== genreId);
    setSelectedGenres(updatedGenres);
    setValue("genres", updatedGenres);
  };

  const handleAddDirector = (directorId: string) => {
    if (directorId && !selectedDirectors.includes(directorId)) {
      const updatedDirectors = [...selectedDirectors, directorId];
      setSelectedDirectors(updatedDirectors);
      setValue("directors", updatedDirectors);
    }
  };

  const handleRemoveDirector = (directorId: string) => {
    const updatedDirectors = selectedDirectors.filter((d) => d !== directorId);
    setSelectedDirectors(updatedDirectors);
    setValue("directors", updatedDirectors);
  };

  const handleAddCast = () => {
    if (newCast.actorId && newCast.character) {
      const updatedCasts = [...selectedCasts, newCast];
      setSelectedCasts(updatedCasts);
      setValue("casts", updatedCasts);
      setNewCast({ actorId: "", character: "" });
    }
  };

  const handleRemoveCast = (index: number) => {
    const updatedCasts = selectedCasts.filter((_, i) => i !== index);
    setSelectedCasts(updatedCasts);
    setValue("casts", updatedCasts);
  };

  const onSubmit = (data: MovieFormStep1Data) => {
    onNext({
      ...data,
      genres: selectedGenres,
      directors: selectedDirectors,
      casts: selectedCasts,
    });
  };

  const selectedType = watch("type");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>Nhập thông tin cơ bản về phim</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu đề <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register("title", { required: "Tiêu đề là bắt buộc" })}
                placeholder="Nhập tiêu đề phim"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalTitle">
                Tiêu đề gốc <span className="text-destructive">*</span>
              </Label>
              <Input
                id="originalTitle"
                {...register("originalTitle", { required: "Tiêu đề gốc là bắt buộc" })}
                placeholder="Nhập tiêu đề gốc"
              />
              {errors.originalTitle && (
                <p className="text-sm text-destructive">{errors.originalTitle.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="englishTitle">
                Tiêu đề tiếng Anh <span className="text-destructive">*</span>
              </Label>
              <Input
                id="englishTitle"
                {...register("englishTitle", { required: "Tiêu đề tiếng Anh là bắt buộc" })}
                placeholder="Nhập tiêu đề tiếng Anh"
              />
              {errors.englishTitle && (
                <p className="text-sm text-destructive">{errors.englishTitle.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Quốc gia <span className="text-destructive">*</span>
              </Label>
              <Input
                id="country"
                {...register("country", { required: "Quốc gia là bắt buộc" })}
                placeholder="Ví dụ: USA, Vietnam"
              />
              {errors.country && (
                <p className="text-sm text-destructive">{errors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseDate">
                Ngày phát hành <span className="text-destructive">*</span>
              </Label>
              <Input
                id="releaseDate"
                type="date"
                {...register("releaseDate", { required: "Ngày phát hành là bắt buộc" })}
              />
              {errors.releaseDate && (
                <p className="text-sm text-destructive">{errors.releaseDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imdbRating">Đánh giá IMDb</Label>
              <Input
                id="imdbRating"
                type="number"
                step="0.1"
                min="0"
                max="10"
                {...register("imdbRating", {
                  valueAsNumber: true,
                  min: 0,
                  max: 10,
                })}
                placeholder="Ví dụ: 8.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Loại phim <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value as FilmType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại phim" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Trạng thái <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as FilmStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageLimit">
                Giới hạn độ tuổi <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("ageLimit")}
                onValueChange={(value) => setValue("ageLimit", value as AgeLimit)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới hạn độ tuổi" />
                </SelectTrigger>
                <SelectContent>
                  {ageLimitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Nhập mô tả về phim"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thể loại</CardTitle>
          <CardDescription>Chọn các thể loại cho phim</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select onValueChange={handleAddGenre}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Chọn thể loại" />
              </SelectTrigger>
              <SelectContent>
                {genres
                  .filter((genre) => !selectedGenres.includes(genre.id))
                  .map((genre) => (
                    <SelectItem key={genre.id} value={genre.id}>
                      {genre.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedGenres.map((genreId) => {
              const genre = genres.find((g) => g.id === genreId);
              return genre ? (
                <Badge key={genreId} variant="secondary">
                  {genre.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveGenre(genreId)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đạo diễn</CardTitle>
          <CardDescription>Chọn các đạo diễn cho phim</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select onValueChange={handleAddDirector}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Chọn đạo diễn" />
              </SelectTrigger>
              <SelectContent>
                {directors
                  .filter((director) => !selectedDirectors.includes(director.id))
                  .map((director) => (
                    <SelectItem key={director.id} value={director.id}>
                      {director.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedDirectors.map((directorId) => {
              const director = directors.find((d) => d.id === directorId);
              return director ? (
                <Badge key={directorId} variant="secondary">
                  {director.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveDirector(directorId)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diễn viên</CardTitle>
          <CardDescription>Thêm diễn viên và vai diễn của họ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select
              value={newCast.actorId}
              onValueChange={(value) => setNewCast({ ...newCast, actorId: value })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Chọn diễn viên" />
              </SelectTrigger>
              <SelectContent>
                {actors.map((actor) => (
                  <SelectItem key={actor.id} value={actor.id}>
                    {actor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Vai diễn"
              value={newCast.character}
              onChange={(e) => setNewCast({ ...newCast, character: e.target.value })}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddCast}
              disabled={!newCast.actorId || !newCast.character}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {selectedCasts.map((cast, index) => {
              const actor = actors.find((a) => a.id === cast.actorId);
              return actor ? (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{actor.name}</p>
                    <p className="text-sm text-muted-foreground">{cast.character}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCast(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Tiếp theo"}
        </Button>
      </div>
    </form>
  );
}
