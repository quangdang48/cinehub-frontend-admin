export interface Movie extends Record<string, unknown> {
  id: string;
  title: string;
  originalTitle: string;
  englishTitle: string;
  description?: string;
  views: number;
  userRating: number;
  ageLimit: AgeLimit;
  country: string;
  imdbRating: number;
  releaseDate: string;
  status: FilmStatus;
  type: FilmType;
  genres: Genre[];
  directors: Director[];
  casts: Cast[];
  posters: Poster[];
  seasons: Season[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  trailerUrl?: string;
}

export enum AgeLimit {
  ALL = "ALL",
  P = "P",
  K = "K",
  T13 = "T13",
  T16 = "T16",
  T18 = "T18",
}

export enum FilmStatus {
  UPCOMING = "UPCOMING",
  RELEASING = "RELEASING",
  ENDED = "ENDED",
}

export enum FilmType {
  MOVIE = "MOVIE",
  SERIES = "SERIES",
}

export interface Genre {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Director {
  id: string;
  name: string;
  gender?: string;
  bio?: string;
  birthDate?: string;
  nationality?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Actor {
  id: string;
  name: string;
  gender?: string;
  bio?: string;
  birthDate?: string;
  nationality?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cast {
  id: string;
  character: string;
  actor: Actor;
  createdAt: string;
  updatedAt: string;
}

export interface Poster {
  id: string;
  url: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  description?: string;
  releaseDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCastDto {
  character: string;
  actorId: string;
}

export interface CreateMovieDto {
  title: string;
  originalTitle: string;
  englishTitle: string;
  description?: string;
  ageLimit: AgeLimit;
  country: string;
  releaseDate: string;
  status: FilmStatus;
  type: FilmType;
  directors?: string[];
  casts?: UpdateCastDto[];
  genres?: string[];
}

export interface UpdateMovieDto extends Partial<CreateMovieDto> {}

export interface MovieFilters {
  search?: string;
  country?: string;
  releaseYear?: number;
  genreId?: string;
  directorId?: string;
  actorId?: string;
  status?: FilmStatus;
  type?: FilmType;
  ageLimit?: AgeLimit;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface MoviesResponse {
  data: Movie[];
  totalItems: number;
  totalPages: number;
  itemsPerPage: number;
  currentPage: number;
}
