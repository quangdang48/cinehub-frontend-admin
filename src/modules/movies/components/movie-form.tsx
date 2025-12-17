"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, X, Film } from "lucide-react";
import { ImageUpload, VideoUpload } from "@/components/upload";
import { movieSchema } from "../schemas";
import { createMovie, updateMovie } from "../actions";
import {
  FilmStatus,
  FilmType,
  AgeLimit,
  type Movie,
  type Genre,
  type Director,
  type Actor,
  CreateMovieDto,
} from "../types";
import { ageLimitOptions, statusOptions, typeOptions } from "../const";

interface MovieFormProps {
  movie?: Movie;
  genres: Genre[];
  directors: Director[];
  actors: Actor[];
}

export function MovieForm({ movie, genres, directors, actors }: MovieFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [posters, setPosters] = useState<string[]>(movie?.posters?.map(p => p.url) || []);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const isEditing = !!movie;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateMovieDto>({
    resolver: zodResolver(movieSchema as any),
    defaultValues: {
      title: movie?.title || "",
      originalTitle: movie?.originalTitle || "",
      englishTitle: movie?.englishTitle || "",
      description: movie?.description || "",
      ageLimit: movie?.ageLimit || AgeLimit.ALL,
      country: movie?.country || "",
      releaseDate: movie?.releaseDate || "",
      genres: movie?.genres?.map((g) => g.id) || [],
      directors: movie?.directors?.map((d) => d.id) || [],
      casts: movie?.casts?.map((c) => ({
        character: c.character,
        actorId: c.actor.id,
      })) || [],
      status: movie?.status || FilmStatus.UPCOMING,
      type: movie?.type || FilmType.MOVIE,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "casts",
  });

  const onSubmit = (data: CreateMovieDto) => {
    startTransition(async () => {
      // Add posters and video to data
      const submitData = {
        ...data,
        posters,
        videoUrl,
      };
      
      const result = isEditing
        ? await updateMovie(movie.id, submitData)
        : await createMovie(submitData);

      if (result.success) {
        toast.success(
          isEditing ? "Cập nhật phim thành công" : "Tạo phim thành công"
        );
        setTimeout(() => {
          router.push("/movies");
          router.refresh();
        }, 1000);
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Film className="h-8 w-8" />
              {isEditing ? "Chỉnh sửa phim" : "Thêm phim mới"}
            </h1>
            {isEditing && (
              <p className="text-sm text-muted-foreground mt-1">
                ID: {movie.id}
              </p>
            )}
          </div>
        </div>
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <>
              <Spinner className="mr-2" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu phim
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="people">Nhân sự</TabsTrigger>
          <TabsTrigger value="advanced">Nâng cao</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Tên phim <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Nhập tên phim"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Original Title */}
              <div className="space-y-2">
                <Label htmlFor="originalTitle">
                  Tên gốc <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="originalTitle"
                  {...register("originalTitle")}
                  placeholder="Nhập tên gốc"
                />
                {errors.originalTitle && (
                  <p className="text-sm text-red-500">{errors.originalTitle.message}</p>
                )}
              </div>

              {/* English Title */}
              <div className="space-y-2">
                <Label htmlFor="englishTitle">
                  Tên tiếng Anh <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="englishTitle"
                  {...register("englishTitle")}
                  placeholder="Nhập tên tiếng Anh"
                />
                {errors.englishTitle && (
                  <p className="text-sm text-red-500">{errors.englishTitle.message}</p>
                )}
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">
                  Loại phim <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">
                  Trạng thái <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>

              {/* Age Limit */}
              <div className="space-y-2">
                <Label htmlFor="ageLimit">
                  Giới hạn độ tuổi <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="ageLimit"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  )}
                />
                {errors.ageLimit && (
                  <p className="text-sm text-red-500">{errors.ageLimit.message}</p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">
                  Quốc gia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="country"
                  {...register("country")}
                  placeholder="Ví dụ: Việt Nam, Hàn Quốc"
                />
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country.message}</p>
                )}
              </div>

              {/* Release Date */}
              <div className="space-y-2">
                <Label htmlFor="releaseDate">
                  Ngày phát hành <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="releaseDate"
                  type="date"
                  {...register("releaseDate")}
                />
                {errors.releaseDate && (
                  <p className="text-sm text-red-500">{errors.releaseDate.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Nhập mô tả phim"
                rows={5}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          {/* Video Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Video phim</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoUpload
                value={videoUrl}
                onChange={setVideoUrl}
                label="Upload video"
                description="Hỗ trợ MP4, WebM, OGG (tối đa 500MB)"
                maxSize={500}
              />
            </CardContent>
          </Card>

          {/* Posters Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Poster & Ảnh</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={posters}
                onChange={(value) => setPosters(Array.isArray(value) ? value : [value])}
                multiple
                label="Upload posters"
                description="Hỗ trợ JPG, PNG, WebP (tối đa 5MB mỗi ảnh)"
                maxSize={5}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-6">
        {/* Genres */}
        <Card>
          <CardHeader>
            <CardTitle>Thể loại</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              control={control}
              name="genres"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => {
                    const isSelected = field.value?.includes(genre.id);
                    return (
                      <Badge
                        key={genre.id}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer text-sm py-2 px-3"
                        onClick={() => {
                          const current = field.value || [];
                          if (isSelected) {
                            field.onChange(current.filter((id) => id !== genre.id));
                          } else {
                            field.onChange([...current, genre.id]);
                          }
                        }}
                      >
                        {genre.name}
                      </Badge>
                    );
                  })}
                </div>
              )}
            />
            {errors.genres && (
              <p className="text-sm text-destructive">{errors.genres.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Directors */}
        <Card>
          <CardHeader>
            <CardTitle>Đạo diễn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              control={control}
              name="directors"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {directors.map((director) => {
                    const isSelected = field.value?.includes(director.id);
                    return (
                      <Badge
                        key={director.id}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer text-sm py-2 px-3"
                        onClick={() => {
                          const current = field.value || [];
                          if (isSelected) {
                            field.onChange(current.filter((id) => id !== director.id));
                          } else {
                            field.onChange([...current, director.id]);
                          }
                        }}
                      >
                        {director.name}
                      </Badge>
                    );
                  })}
                </div>
              )}
            />
            {errors.directors && (
              <p className="text-sm text-destructive">{errors.directors.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Cast */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Diễn viên</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ character: "", actorId: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm diễn viên
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">
                  Chưa có diễn viên nào. Nhấn &quot;Thêm diễn viên&quot; để thêm mới.
                </p>
              </div>
            )}
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`casts.${index}.character`}>Vai diễn</Label>
                    <Input
                      id={`casts.${index}.character`}
                      {...register(`casts.${index}.character`)}
                      placeholder="Ví dụ: Tony Stark"
                    />
                    {errors.casts?.[index]?.character && (
                      <p className="text-sm text-destructive">
                        {errors.casts[index]?.character?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`casts.${index}.actorId`}>Diễn viên</Label>
                    <Controller
                      control={control}
                      name={`casts.${index}.actorId`}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
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
                      )}
                    />
                    {errors.casts?.[index]?.actorId && (
                      <p className="text-sm text-destructive">
                        {errors.casts[index]?.actorId?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end pb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt nâng cao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Các tính năng nâng cao sẽ được bổ sung sau (SEO, metadata, v.v.)
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fixed Submit Button */}
      <div className="flex justify-end gap-4 sticky bottom-0 bg-background py-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <>
              <Spinner className="mr-2" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu phim
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
