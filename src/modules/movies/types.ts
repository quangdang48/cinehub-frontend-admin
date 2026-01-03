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

export enum SeasonStatus {
  UPCOMING = "UPCOMING",
  RELEASING = "RELEASING",
  ENDED = "ENDED",
}

export enum VideoStatus {
  PROCESSING = "PROCESSING",
  READY = "READY",
  FAILED = "FAILED",
}

export interface Video {
  id: string;
  filmId: string;
  key: string;
  url: string;
  status: VideoStatus;
  maxResolution?: number;
  episode?: Episode;
  createdAt: string;
  updatedAt: string;
}

export interface Episode {
  id: string;
  number: number;
  releaseDate?: string;
  video?: Video;
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  id: string;
  number: number;
  releaseDate?: string;
  endDate?: string;
  status: SeasonStatus;
  episodes: Episode[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSeasonDto {
  releaseDate?: string;
  endDate?: string;
  status?: SeasonStatus;
}

export interface UpdateSeasonDto {
  releaseDate?: string;
  endDate?: string;
  status?: SeasonStatus;
}

export interface CreateEpisodeDto {
  releaseDate?: string;
}

export interface UpdateEpisodeDto {
  releaseDate?: string;
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
  imdbRating?: number;
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
  sort?: string;
}

export interface VideoStatusResponse {
  hasVideo: boolean;
  video?: Video;
}