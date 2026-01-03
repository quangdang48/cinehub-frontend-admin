"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Loader2, X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Movie,
  Genre,
  Director,
  Actor,
  AgeLimit,
  FilmStatus,
  FilmType,
  UpdateCastDto,
} from "../types";
import { statusOptions, typeOptions, ageLimitOptions } from "../const";
import { searchGenres, searchDirectors, searchActors } from "../actions";
import { useDebounce } from "@/hooks/use-debounce";

// Schema validation
const movieFormSchema = z.object({
  title: z.string().min(1, "Tên phim là bắt buộc"),
  originalTitle: z.string().min(1, "Tên gốc là bắt buộc"),
  englishTitle: z.string().min(1, "Tên tiếng Anh là bắt buộc"),
  description: z.string().optional(),
  releaseDate: z.string().min(1, "Ngày phát hành là bắt buộc"),
  country: z.string().min(1, "Quốc gia là bắt buộc"),
  ageLimit: z.enum(AgeLimit),
  status: z.enum(FilmStatus),
  type: z.enum(FilmType),
  imdbRating: z.coerce.number().min(0).max(10).optional(),
  genres: z.array(z.string()).min(0),
  directors: z.array(z.string()).min(0),
  casts: z.array(z.object({
    actorId: z.string(),
    character: z.string().min(1, "Tên nhân vật là bắt buộc"),
  })).min(0),
});

export type MovieFormStep1Data = z.infer<typeof movieFormSchema>;

interface MovieFormStep1Props {
  initialData?: MovieFormStep1Data;
  genres: Genre[];
  directors: Director[];
  actors: Actor[];
  onNext: (data: MovieFormStep1Data) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

export function MovieFormStep1({
  initialData,
  genres: initialGenres,
  directors: initialDirectors,
  actors: initialActors,
  onNext,
  onCancel,
  isLoading,
  isEditing,
}: MovieFormStep1Props) {
  // Search states
  const [genreSearch, setGenreSearch] = useState("");
  const [directorSearch, setDirectorSearch] = useState("");
  const [actorSearch, setActorSearch] = useState("");

  // Debounced search values
  const debouncedGenreSearch = useDebounce(genreSearch, 300);
  const debouncedDirectorSearch = useDebounce(directorSearch, 300);
  const debouncedActorSearch = useDebounce(actorSearch, 300);

  // Search results
  const [genres, setGenres] = useState<Genre[]>(initialGenres);
  const [directors, setDirectors] = useState<Director[]>(initialDirectors);
  const [actors, setActors] = useState<Actor[]>(initialActors);

  // Loading states
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [isLoadingDirectors, setIsLoadingDirectors] = useState(false);
  const [isLoadingActors, setIsLoadingActors] = useState(false);

  // Popover open states
  const [genreOpen, setGenreOpen] = useState(false);
  const [directorOpen, setDirectorOpen] = useState(false);
  const [actorOpen, setActorOpen] = useState(false);

  // Character input for cast
  const [characterInputs, setCharacterInputs] = useState<Record<string, string>>({});

  // Fetch genres when search changes
  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoadingGenres(true);
      try {
        const result = await searchGenres(debouncedGenreSearch);
        setGenres(result);
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setIsLoadingGenres(false);
      }
    };

    if (debouncedGenreSearch) {
      fetchGenres();
    } else {
      setGenres(initialGenres);
    }
  }, [debouncedGenreSearch, initialGenres]);

  // Fetch directors when search changes
  useEffect(() => {
    const fetchDirectors = async () => {
      setIsLoadingDirectors(true);
      try {
        const result = await searchDirectors(debouncedDirectorSearch);
        setDirectors(result);
      } catch (error) {
        console.error("Error fetching directors:", error);
      } finally {
        setIsLoadingDirectors(false);
      }
    };

    if (debouncedDirectorSearch) {
      fetchDirectors();
    } else {
      setDirectors(initialDirectors);
    }
  }, [debouncedDirectorSearch, initialDirectors]);

  // Fetch actors when search changes
  useEffect(() => {
    const fetchActors = async () => {
      setIsLoadingActors(true);
      try {
        const result = await searchActors(debouncedActorSearch);
        setActors(result);
      } catch (error) {
        console.error("Error fetching actors:", error);
      } finally {
        setIsLoadingActors(false);
      }
    };

    if (debouncedActorSearch) {
      fetchActors();
    } else {
      setActors(initialActors);
    }
  }, [debouncedActorSearch, initialActors]);

  // Initialize character inputs from initialData
  useEffect(() => {
    if (initialData?.casts) {
      const inputs: Record<string, string> = {};
      initialData.casts.forEach((cast) => {
        inputs[cast.actorId] = cast.character;
      });
      setCharacterInputs(inputs);
    }
  }, [initialData]);

  const form = useForm<MovieFormStep1Data>({
    resolver: zodResolver(movieFormSchema) as any,
    defaultValues: initialData || {
      title: "",
      originalTitle: "",
      englishTitle: "",
      description: "",
      releaseDate: "",
      country: "",
      ageLimit: AgeLimit.ALL,
      status: FilmStatus.UPCOMING,
      type: FilmType.MOVIE,
      imdbRating: undefined,
      genres: [],
      directors: [],
      casts: [],
    },
  });

  const handleSubmit = async (values: MovieFormStep1Data) => {
    await onNext(values);
  };

  // Helper to get name by id
  const getGenreName = (id: string) => {
    const genre =
      genres.find((g) => g.id === id) ||
      initialGenres.find((g) => g.id === id);
    return genre?.name || id;
  };

  const getDirectorName = (id: string) => {
    const director =
      directors.find((d) => d.id === id) ||
      initialDirectors.find((d) => d.id === id);
    return director?.name || id;
  };

  const getActorName = (id: string) => {
    const actor =
      actors.find((a) => a.id === id) ||
      initialActors.find((a) => a.id === id);
    return actor?.name || id;
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Title */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tên phim *</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Nhập tên phim"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Original Title */}
            <Controller
              name="originalTitle"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tên gốc *</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Nhập tên gốc"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* English Title */}
            <Controller
              name="englishTitle"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tên tiếng Anh *</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Nhập tên tiếng Anh"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Description */}
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Mô tả</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Nhập mô tả phim"
                  className="min-h-25"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Country */}
            <Controller
              name="country"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Quốc gia *</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Nhập quốc gia"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Release Date */}
            <Controller
              name="releaseDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Ngày phát hành *</FieldLabel>
                  <Input
                    {...field}
                    type="date"
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* IMDB Rating */}
            <Controller
              name="imdbRating"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Điểm IMDB</FieldLabel>
                  <Input
                    {...field}
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    id={field.name}
                    placeholder="0.0 - 10.0"
                    aria-invalid={fieldState.invalid}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Age Limit */}
            <Controller
              name="ageLimit"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Giới hạn tuổi *</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Chọn giới hạn tuổi" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageLimitOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type */}
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Loại phim *</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Status */}
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Trạng thái *</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Genre Selection - Combobox Multi-select */}
          <Controller
            name="genres"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Thể loại *</FieldLabel>
                <Popover open={genreOpen} onOpenChange={setGenreOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={genreOpen}
                      className={cn(
                        "w-full justify-between min-h-10 h-auto",
                        !field.value?.length && "text-muted-foreground"
                      )}
                    >
                      <div className="flex flex-wrap gap-1">
                        {field.value?.length > 0 ? (
                          field.value.map((id: string) => (
                            <Badge key={id} variant="secondary" className="mr-1">
                              {getGenreName(id)}
                              <div
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  field.onChange(
                                    field.value?.filter((v: string) => v !== id)
                                  );
                                }}
                              >
                                <X className="h-3 w-3" />
                              </div>
                            </Badge>
                          ))
                        ) : (
                          <span>Chọn thể loại...</span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Tìm thể loại..."
                        value={genreSearch}
                        onValueChange={setGenreSearch}
                      />
                      <CommandList>
                        {isLoadingGenres ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Đang tìm kiếm...</span>
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>Không tìm thấy thể loại.</CommandEmpty>
                            <CommandGroup>
                              {genres.map((genre) => (
                                <CommandItem
                                  key={genre.id}
                                  value={genre.id}
                                  onSelect={() => {
                                    const current = field.value || [];
                                    if (current.includes(genre.id)) {
                                      field.onChange(
                                        current.filter((v: string) => v !== genre.id)
                                      );
                                    } else {
                                      field.onChange([...current, genre.id]);
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.includes(genre.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {genre.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Director Selection - Combobox Multi-select */}
          <Controller
            name="directors"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Đạo diễn *</FieldLabel>
                <Popover open={directorOpen} onOpenChange={setDirectorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={directorOpen}
                      className={cn(
                        "w-full justify-between min-h-10 h-auto",
                        !field.value?.length && "text-muted-foreground"
                      )}
                    >
                      <div className="flex flex-wrap gap-1">
                        {field.value?.length > 0 ? (
                          field.value.map((id: string) => (
                            <Badge key={id} variant="secondary" className="mr-1">
                              {getDirectorName(id)}
                              <div
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  field.onChange(
                                    field.value?.filter((v: string) => v !== id)
                                  );
                                }}
                              >
                                <X className="h-3 w-3" />
                              </div>
                            </Badge>
                          ))
                        ) : (
                          <span>Chọn đạo diễn...</span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Tìm đạo diễn..."
                        value={directorSearch}
                        onValueChange={setDirectorSearch}
                      />
                      <CommandList>
                        {isLoadingDirectors ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Đang tìm kiếm...</span>
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>
                              Không tìm thấy đạo diễn.
                            </CommandEmpty>
                            <CommandGroup>
                              {directors.map((director) => (
                                <CommandItem
                                  key={director.id}
                                  value={director.id}
                                  onSelect={() => {
                                    const current = field.value || [];
                                    if (current.includes(director.id)) {
                                      field.onChange(
                                        current.filter(
                                          (v: string) => v !== director.id
                                        )
                                      );
                                    } else {
                                      field.onChange([...current, director.id]);
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.includes(director.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {director.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Actor/Cast Selection - Combobox Multi-select with Character Input */}
          <Controller
            name="casts"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Diễn viên *</FieldLabel>
                <FieldDescription>
                  Chọn diễn viên và nhập tên vai diễn cho mỗi người
                </FieldDescription>
                <Popover open={actorOpen} onOpenChange={setActorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={actorOpen}
                      className={cn(
                        "w-full justify-between min-h-10 h-auto",
                        !field.value?.length && "text-muted-foreground"
                      )}
                    >
                      <div className="flex flex-wrap gap-1">
                        {field.value?.length > 0 ? (
                          <span>
                            Đã chọn {field.value.length} diễn viên
                          </span>
                        ) : (
                          <span>Chọn diễn viên...</span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Tìm diễn viên..."
                        value={actorSearch}
                        onValueChange={setActorSearch}
                      />
                      <CommandList>
                        {isLoadingActors ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Đang tìm kiếm...</span>
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>
                              Không tìm thấy diễn viên.
                            </CommandEmpty>
                            <CommandGroup>
                              {actors.map((actor) => {
                                const isSelected = field.value?.some(
                                  (c: UpdateCastDto) => c.actorId === actor.id
                                );
                                return (
                                  <CommandItem
                                    key={actor.id}
                                    value={actor.id}
                                    onSelect={() => {
                                      const current = field.value || [];
                                      if (isSelected) {
                                        field.onChange(
                                          current.filter(
                                            (c: UpdateCastDto) =>
                                              c.actorId !== actor.id
                                          )
                                        );
                                        const newInputs = { ...characterInputs };
                                        delete newInputs[actor.id];
                                        setCharacterInputs(newInputs);
                                      } else {
                                        field.onChange([
                                          ...current,
                                          {
                                            actorId: actor.id,
                                            character:
                                              characterInputs[actor.id] || "",
                                          },
                                        ]);
                                      }
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        isSelected ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {actor.name}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Selected Actors with Character Input */}
                {field.value?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {field.value.map((cast: UpdateCastDto) => (
                      <div
                        key={cast.actorId}
                        className="flex items-center gap-2 p-2 border rounded-lg"
                      >
                        <Badge variant="secondary" className="shrink-0">
                          {getActorName(cast.actorId)}
                        </Badge>
                        <Input
                          placeholder="Tên vai diễn..."
                          value={characterInputs[cast.actorId] || cast.character}
                          onChange={(e) => {
                            const newInputs = {
                              ...characterInputs,
                              [cast.actorId]: e.target.value,
                            };
                            setCharacterInputs(newInputs);
                            // Update form value
                            const updated = field.value.map((c: UpdateCastDto) =>
                              c.actorId === cast.actorId
                                ? { ...c, character: e.target.value }
                                : c
                            );
                            field.onChange(updated);
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            field.onChange(
                              field.value.filter(
                                (c: UpdateCastDto) => c.actorId !== cast.actorId
                              )
                            );
                            const newInputs = { ...characterInputs };
                            delete newInputs[cast.actorId];
                            setCharacterInputs(newInputs);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : isEditing ? (
            "Cập nhật & Tiếp tục"
          ) : (
            "Tạo phim & Tiếp tục"
          )}
        </Button>
      </div>
    </form>
  );
}
